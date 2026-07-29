import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { emailFictifDepuisPseudo, slugifyPseudo, validerMotDePasse, validerPseudo } from '../lib/pseudoUtils';
import { assurerProfil, creerProfil, getProfile, pseudoDisponible, reserverPseudo } from '../lib/profileApi';
import type { Profile } from '../lib/types';

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  inscription: (pseudoAffichage: string, motDePasse: string) => Promise<void>;
  connexion: (pseudoAffichage: string, motDePasse: string) => Promise<void>;
  deconnexion: () => Promise<void>;
  rafraichirProfil: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const chargerProfil = useCallback(async () => {
    try {
      setProfile(await getProfile());
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const desabonner = onAuthStateChanged(auth, async (utilisateur) => {
      setUser(utilisateur);
      if (utilisateur) {
        await chargerProfil();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return desabonner;
  }, [chargerProfil]);

  const inscription = useCallback(
    async (pseudoAffichage: string, motDePasse: string) => {
      const erreurPseudo = validerPseudo(pseudoAffichage);
      if (erreurPseudo) throw new Error(erreurPseudo);
      const erreurMdp = validerMotDePasse(motDePasse);
      if (erreurMdp) throw new Error(erreurMdp);

      const slug = slugifyPseudo(pseudoAffichage);
      const disponible = await pseudoDisponible(slug);
      if (!disponible) throw new Error('Ce pseudo est déjà pris.');

      const email = emailFictifDepuisPseudo(pseudoAffichage);
      let identifiants;
      try {
        identifiants = await createUserWithEmailAndPassword(auth, email, motDePasse);
      } catch (e) {
        const code = (e as { code?: string }).code;
        if (code === 'auth/email-already-in-use') {
          // Filet de sécurité réel contre une race condition sur le même
          // pseudo (deux inscriptions concurrentes) : l'unicité native de
          // Firebase Auth sur l'email, pas le pré-check ci-dessus.
          throw new Error('Ce pseudo est déjà pris.');
        }
        throw new Error("L'inscription a échoué. Réessayez dans un instant.");
      }

      await updateProfile(identifiants.user, { displayName: pseudoAffichage.trim() });

      try {
        await reserverPseudo(identifiants.user.uid, slug);
        await creerProfil(identifiants.user.uid, pseudoAffichage.trim(), slug);
      } catch {
        // Le profil sera recréé au prochain assurerProfil() (ex. à la prochaine connexion).
      }

      await chargerProfil();
    },
    [chargerProfil]
  );

  const connexion = useCallback(
    async (pseudoAffichage: string, motDePasse: string) => {
      try {
        await signInWithEmailAndPassword(auth, emailFictifDepuisPseudo(pseudoAffichage), motDePasse);
      } catch {
        throw new Error('Pseudo ou mot de passe incorrect.');
      }

      // Filet de rattrapage : recrée le profil s'il manquait pour une raison
      // exceptionnelle (pas de trigger serveur possible sans Cloud Function).
      await assurerProfil();
      await chargerProfil();
    },
    [chargerProfil]
  );

  const deconnexion = useCallback(async () => {
    await signOut(auth);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, inscription, connexion, deconnexion, rafraichirProfil: chargerProfil }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l’intérieur d’un AuthProvider.');
  return ctx;
}
