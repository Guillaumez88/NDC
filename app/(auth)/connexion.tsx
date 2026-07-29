import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

type Mode = 'connexion' | 'inscription';

export default function Connexion() {
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const { couleurs } = useTheme();
  const { connexion, inscription } = useAuth();

  const [mode, setMode] = useState<Mode>(modeParam === 'inscription' ? 'inscription' : 'connexion');
  const [pseudo, setPseudo] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const estInscription = mode === 'inscription';

  const styles = useMemo(() => creerStyles(couleurs), [couleurs]);

  async function valider() {
    setErreur(null);

    if (!pseudo.trim() || !motDePasse) {
      setErreur('Renseignez votre pseudo et votre mot de passe.');
      return;
    }
    if (estInscription && motDePasse !== confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setEnCours(true);
    try {
      if (estInscription) {
        await inscription(pseudo, motDePasse);
      } else {
        await connexion(pseudo, motDePasse);
      }
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Une erreur est survenue.');
    } finally {
      setEnCours(false);
    }
  }

  return (
    <View style={styles.ecran}>
      <View style={styles.logo} />
      <Text style={styles.titre}>NDC</Text>
      <Text style={styles.sousTitre}>
        Votre suivi, pour vous seul. Pas d'e-mail, pas de nom, pas de partage.
      </Text>

      <View style={styles.segmented}>
        {(['connexion', 'inscription'] as const).map((m) => (
          <Pressable
            key={m}
            onPress={() => {
              setMode(m);
              setErreur(null);
            }}
            style={[styles.segmentBtn, mode === m && styles.segmentBtnActif]}
          >
            <Text style={[styles.segmentTexte, mode === m && styles.segmentTexteActif]}>
              {m === 'connexion' ? 'Connexion' : 'Inscription'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.champs}>
        <TextInput
          placeholder="Pseudonyme"
          placeholderTextColor={couleurs.ink3}
          value={pseudo}
          onChangeText={setPseudo}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <TextInput
          placeholder="Mot de passe"
          placeholderTextColor={couleurs.ink3}
          value={motDePasse}
          onChangeText={setMotDePasse}
          secureTextEntry
          style={styles.input}
        />
        {estInscription && (
          <TextInput
            placeholder="Confirmer le mot de passe"
            placeholderTextColor={couleurs.ink3}
            value={confirmation}
            onChangeText={setConfirmation}
            secureTextEntry
            style={styles.input}
          />
        )}
      </View>

      {estInscription && (
        <View style={styles.avertissement}>
          <Text style={styles.avertissementTexte}>
            Il n'y a pas d'adresse e-mail associée à votre compte : en cas de mot de passe
            oublié, il est impossible de le réinitialiser. Notez-le précieusement.
          </Text>
        </View>
      )}

      <View style={styles.confidentialite}>
        <Text style={styles.confidentialiteTexte}>
          Vos séances sont liées à votre pseudonyme, jamais à votre identité réelle. Rien
          n'est partagé ni revendu.
        </Text>
      </View>

      {erreur && <Text style={styles.erreur}>{erreur}</Text>}

      <View style={{ flex: 1 }} />

      <Pressable style={styles.bouton} onPress={valider} disabled={enCours}>
        {enCours ? (
          <ActivityIndicator color="#FFF8F2" />
        ) : (
          <Text style={styles.boutonTexte}>
            {estInscription ? 'Créer mon espace' : 'Entrer'}
          </Text>
        )}
      </Pressable>
      <Text style={styles.piedDePage}>
        Ajoutez NDC à votre écran d'accueil pour un accès discret
      </Text>
    </View>
  );
}

function creerStyles(c: ReturnType<typeof useTheme>['couleurs']) {
  return StyleSheet.create({
    ecran: {
      flex: 1,
      backgroundColor: c.bg,
      paddingTop: Platform.select({ web: 48, default: 76 }),
      paddingHorizontal: 26,
      paddingBottom: 34,
    },
    logo: {
      width: 66,
      height: 66,
      borderRadius: 33,
      backgroundColor: c.accent,
    },
    titre: {
      fontSize: 34,
      fontWeight: '700',
      color: c.ink,
      marginTop: 26,
      letterSpacing: -0.5,
    },
    sousTitre: {
      fontSize: 15,
      color: c.ink2,
      marginTop: 8,
      lineHeight: 22,
      maxWidth: 300,
    },
    segmented: {
      flexDirection: 'row',
      gap: 8,
      backgroundColor: c.card2,
      borderRadius: 22,
      padding: 5,
      marginTop: 30,
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: 17,
      alignItems: 'center',
    },
    segmentBtnActif: {
      backgroundColor: c.card,
    },
    segmentTexte: {
      fontSize: 14.5,
      fontWeight: '600',
      color: c.ink2,
    },
    segmentTexteActif: {
      color: c.accent,
    },
    champs: {
      marginTop: 18,
      gap: 11,
    },
    input: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: 22,
      paddingVertical: 18,
      paddingHorizontal: 20,
      fontSize: 15,
      color: c.ink,
    },
    avertissement: {
      marginTop: 14,
      backgroundColor: c.dangerBg,
      borderRadius: 20,
      padding: 14,
    },
    avertissementTexte: {
      fontSize: 12.5,
      color: c.danger,
      lineHeight: 18,
    },
    confidentialite: {
      marginTop: 14,
      backgroundColor: c.card2,
      borderRadius: 24,
      padding: 16,
    },
    confidentialiteTexte: {
      fontSize: 12.5,
      color: c.ink2,
      lineHeight: 19,
    },
    erreur: {
      marginTop: 14,
      fontSize: 13,
      color: c.danger,
    },
    bouton: {
      width: '100%',
      paddingVertical: 19,
      borderRadius: 26,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    boutonTexte: {
      fontSize: 16.5,
      fontWeight: '700',
      color: '#FFF8F2',
    },
    piedDePage: {
      textAlign: 'center',
      fontSize: 12,
      color: c.ink3,
      marginTop: 14,
    },
  });
}
