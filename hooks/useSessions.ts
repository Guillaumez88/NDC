import { useCallback, useEffect, useState } from 'react';
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

  useEffect(() => {
    recharger();
  }, [recharger]);

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
