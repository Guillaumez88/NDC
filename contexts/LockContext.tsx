import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { deleteItem, getItem, setItem } from '../lib/secureStorage';
import { hasherPin } from '../lib/pin';

const CLE_PIN = 'ndc.pin.hash';

type LockContextValue = {
  verrouillageActif: boolean;
  pinConfigure: boolean;
  estVerrouille: boolean;
  definirPin: (pin: string) => Promise<void>;
  supprimerPin: () => Promise<void>;
  tenterDeverrouiller: (pin: string) => Promise<boolean>;
};

const LockContext = createContext<LockContextValue | undefined>(undefined);

export function LockProvider({ children }: { children: ReactNode }) {
  const { profile, user } = useAuth();
  const [pinConfigure, setPinConfigure] = useState(false);
  const [pinChargePourSession, setPinChargePourSession] = useState(false);
  // Verrouillé "à l'ouverture de l'application" uniquement : ce booléen ne
  // repasse jamais à true tout seul après un premier déverrouillage réussi
  // pour la session en cours.
  const [estVerrouille, setEstVerrouille] = useState(false);

  const verrouillageActif = Boolean(profile?.verrouillageActif);

  useEffect(() => {
    if (!user) {
      setPinChargePourSession(false);
      setEstVerrouille(false);
      return;
    }
    getItem(CLE_PIN).then((valeur) => {
      const configure = Boolean(valeur);
      setPinConfigure(configure);
      setEstVerrouille(verrouillageActif && configure);
      setPinChargePourSession(true);
    });
    // Volontairement limité à (user, verrouillageActif) : ne se redéclenche
    // pas à chaque re-render, seulement à la connexion ou au changement de préférence.
  }, [user, verrouillageActif]);

  const definirPin = useCallback(async (pin: string) => {
    const hash = await hasherPin(pin);
    await setItem(CLE_PIN, hash);
    setPinConfigure(true);
  }, []);

  const supprimerPin = useCallback(async () => {
    await deleteItem(CLE_PIN);
    setPinConfigure(false);
  }, []);

  const tenterDeverrouiller = useCallback(async (pin: string) => {
    const hashStocke = await getItem(CLE_PIN);
    if (!hashStocke) return false;
    const hash = await hasherPin(pin);
    const ok = hash === hashStocke;
    if (ok) setEstVerrouille(false);
    return ok;
  }, []);

  return (
    <LockContext.Provider
      value={{
        verrouillageActif,
        pinConfigure,
        estVerrouille: pinChargePourSession && estVerrouille,
        definirPin,
        supprimerPin,
        tenterDeverrouiller,
      }}
    >
      {children}
    </LockContext.Provider>
  );
}

export function useLock(): LockContextValue {
  const ctx = useContext(LockContext);
  if (!ctx) throw new Error('useLock doit être utilisé à l’intérieur d’un LockProvider.');
  return ctx;
}
