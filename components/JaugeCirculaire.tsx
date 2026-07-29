import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { Palette } from '../lib/theme';

type Props = {
  pourcentage: number; // 0 à 100
  couleurs: Palette;
  taille?: number;
  epaisseur?: number;
  children?: ReactNode;
};

export function JaugeCirculaire({
  pourcentage,
  couleurs: c,
  taille = 214,
  epaisseur = 15,
  children,
}: Props) {
  const rayon = taille / 2 - epaisseur / 2 - 2;
  const centre = taille / 2;
  const circonference = 2 * Math.PI * rayon;
  const rempli = circonference * Math.min(1, Math.max(0, pourcentage / 100));

  return (
    <View style={{ width: taille, height: taille, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={taille}
        height={taille}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Circle cx={centre} cy={centre} r={rayon} stroke={c.accentSoft} strokeWidth={epaisseur} fill="none" />
        <Circle
          cx={centre}
          cy={centre}
          r={rayon}
          stroke={c.accent}
          strokeWidth={epaisseur}
          strokeLinecap="round"
          strokeDasharray={`${rempli} ${circonference}`}
          fill="none"
        />
      </Svg>
      {children}
    </View>
  );
}
