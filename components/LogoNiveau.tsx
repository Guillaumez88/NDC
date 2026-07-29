import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { Palette } from '../lib/theme';

// Porté du projet Claude Design "Série de logos évolutifs" (Logos Niveaux.dc.html) :
// un corps central (capsule) fixe, deux ronds inférieurs dont le diamètre
// grandit à chaque palier, se fissurant aux deux derniers niveaux.
const BASELINE = 1052;
const RAYONS = [114, 140, 166, 192, 218, 244];
const FISSURES: Record<number, number[][][]> = {
  4: [[[0, -1], [0.1, -0.66], [-0.08, -0.36], [0.08, -0.06]]],
  5: [
    [[0, -1], [0.14, -0.62], [-0.12, -0.24], [0.16, 0.18], [0.02, 0.62]],
    [[-0.1, -0.4], [-0.46, -0.6]],
    [[0.13, 0.02], [0.52, -0.06]],
  ],
};

function construireChemin(pts: number[][], cx: number, cy: number, r: number, signe: number): string {
  return (
    'M ' +
    pts.map(([x, y]) => `${(cx + signe * x * r).toFixed(1)} ${(cy + y * r).toFixed(1)}`).join(' L ')
  );
}

type Props = {
  niveau: number; // 0 à 5 : jours pleins écoulés depuis la dernière séance, plafonné à 5
  couleurs: Palette;
  taille?: number;
};

export function LogoNiveau({ niveau, couleurs: c, taille = 88 }: Props) {
  const i = Math.max(0, Math.min(RAYONS.length - 1, Math.round(niveau)));
  const r = RAYONS[i];
  const cy = BASELINE - r;
  const decalage = Math.max(248, 57 + 22 + r);
  const cxGauche = 605 - decalage;
  const cxDroite = 605 + decalage;
  const epaisseur = 34;
  const epaisseurFissure = i === 5 ? epaisseur * 0.85 : epaisseur * 0.5;

  const chemins: string[] = [];
  (FISSURES[i] ?? []).forEach((pts) => {
    chemins.push(construireChemin(pts, cxDroite, cy, r, 1));
    chemins.push(construireChemin(pts, cxGauche, cy, r, -1));
  });

  return (
    <Svg viewBox="0 0 1210 1120" width={taille} height={taille}>
      <Circle cx={cxGauche} cy={cy} r={r} fill={c.accentSoft} stroke={c.accent} strokeWidth={epaisseur} />
      <Circle cx={cxDroite} cy={cy} r={r} fill={c.accentSoft} stroke={c.accent} strokeWidth={epaisseur} />
      {chemins.map((d, idx) => (
        <Path
          key={idx}
          d={d}
          fill="none"
          stroke={c.accent}
          strokeWidth={epaisseurFissure}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      <Rect x={548} y={70} width={114} height={900} rx={57} fill={c.accentSoft} stroke={c.accent} strokeWidth={epaisseur} />
    </Svg>
  );
}
