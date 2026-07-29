import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useLock } from '../contexts/LockContext';
import { useTheme } from '../contexts/ThemeContext';
import { ClavierPin } from './ClavierPin';

export function EcranVerrouillage() {
  const { couleurs: c } = useTheme();
  const { tenterDeverrouiller, supprimerPin } = useLock();
  const { deconnexion } = useAuth();
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [indice, setIndice] = useState('');

  async function onTouche(touche: string) {
    if (touche === 'del') {
      setPin((p) => p.slice(0, -1));
      setIndice('');
      return;
    }
    const suivant = (pin + touche).slice(0, 4);
    setPin(suivant);
    if (suivant.length === 4) {
      const ok = await tenterDeverrouiller(suivant);
      if (!ok) {
        setPin('');
        setIndice('Ce code ne correspond pas.');
      }
    }
  }

  async function utiliserMotDePasse() {
    await supprimerPin();
    await deconnexion();
    router.replace('/connexion');
  }

  const styles = creerStyles(c);

  return (
    <View style={styles.ecran}>
      <View style={styles.halo}>
        <View style={styles.glyphe} />
      </View>
      <Text style={styles.titre}>Bon retour</Text>
      <Text style={styles.sousTitre}>Entrez votre code pour retrouver votre suivi</Text>

      <View style={styles.points}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.point, i < pin.length && styles.pointRempli]} />
        ))}
      </View>
      <Text style={styles.indice}>{indice}</Text>

      <ClavierPin couleurs={c} onTouche={onTouche} />

      <View style={{ flex: 1 }} />
      <Text style={styles.lienMotDePasse} onPress={utiliserMotDePasse}>
        Utiliser mon mot de passe
      </Text>
    </View>
  );
}

function creerStyles(c: ReturnType<typeof useTheme>['couleurs']) {
  return StyleSheet.create({
    ecran: {
      flex: 1,
      backgroundColor: c.bg,
      alignItems: 'center',
      paddingTop: 96,
      paddingHorizontal: 30,
      paddingBottom: 40,
    },
    halo: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: c.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    glyphe: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: c.accent,
    },
    titre: {
      fontSize: 22,
      fontWeight: '700',
      color: c.ink,
      marginTop: 26,
    },
    sousTitre: {
      fontSize: 14,
      color: c.ink2,
      marginTop: 6,
      textAlign: 'center',
    },
    points: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 34,
    },
    point: {
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: c.accent,
      backgroundColor: 'transparent',
    },
    pointRempli: {
      backgroundColor: c.accent,
    },
    indice: {
      fontSize: 12.5,
      color: c.ink3,
      height: 20,
      marginTop: 14,
    },
    lienMotDePasse: {
      fontSize: 13.5,
      color: c.ink2,
      fontWeight: '600',
    },
  });
}
