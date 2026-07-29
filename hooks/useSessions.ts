import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import {
  ajouterSeance,
  listerSeancesRecentes,
  supprimerSeance,
  type NouvelleSeance,
} from '../lib/sessionsApi';
import type { Session } from '../lib/types';

export function useSessions() {
  const { user } = useAuth();
  const [seances, setSeances] = useState<Session[]>([]);
  const [chargement, setChargement] = useState(true);

  const recharger = useCallback(async () => {
    if (!user) {
      setSeances([]);
      setChargement(false);
      return;
    }
    setChargement(true);
    try {
      setSeances(await listerSeancesRecentes());
    } finally {
      setChargement(false);
    }
  }, [user]);

  // useFocusEffect (pas un simple useEffect) : chaque écran utilisant ce hook
  // maintient son propre état local, sans magasin partagé. Sans ça, revenir
  // sur un écran déjà monté (ex. après avoir ajouté une séance depuis la
  // modale) afficherait des données périmées jusqu'au prochain montage complet.
  useFocusEffect(
    useCallback(() => {
      recharger();
    }, [recharger])
  );

  const ajouter = useCallback(
    async (nouvelle: NouvelleSeance) => {
      await ajouterSeance(nouvelle);
      await recharger();
    },
    [recharger]
  );

  const supprimer = useCallback(
    async (id: string) => {
      await supprimerSeance(id);
      await recharger();
    },
    [recharger]
  );

  return { seances, chargement, recharger, ajouter, supprimer };
}
