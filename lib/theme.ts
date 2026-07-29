export type Palette = {
  bg: string;
  card: string;
  card2: string;
  line: string;
  ink: string;
  ink2: string;
  ink3: string;
  accent: string;
  accentSoft: string;
  glow: string;
  danger: string;
  dangerBg: string;
};

// Design tokens repris du prototype Claude Design "Application NDC de bien-être".
export const LIGHT: Palette = {
  bg: '#F7EFE6',
  card: '#FFFBF6',
  card2: '#F1E4D6',
  line: '#E6D5C4',
  ink: '#3B2C24',
  ink2: '#7C665A',
  ink3: '#A99083',
  accent: '#B85C3C',
  accentSoft: '#F0DACB',
  glow: '#E9A46F',
  danger: '#C2452F',
  dangerBg: '#FBEAE5',
};

export const DARK: Palette = {
  bg: '#201814',
  card: '#2B211C',
  card2: '#352A23',
  line: '#43342C',
  ink: '#F4E7DA',
  ink2: '#C4AC9B',
  ink3: '#9B8474',
  accent: '#E39B76',
  accentSoft: '#3E2E26',
  glow: '#E9A46F',
  danger: '#E37A63',
  dangerBg: '#33201C',
};

export const COULEURS_TYPE = {
  solo: '#B85C3C',
  duo: '#D9A05B',
  groupe: '#9C7E9B',
} as const;
