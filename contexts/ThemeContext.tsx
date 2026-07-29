import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { DARK, LIGHT, type Palette } from '../lib/theme';
import { useAuth } from './AuthContext';
import { updateTheme as sauvegarderTheme } from '../lib/profileApi';

type NomTheme = 'clair' | 'sombre';

type ThemeContextValue = {
  themeName: NomTheme;
  couleurs: Palette;
  basculerTheme: () => Promise<void>;
  definirTheme: (theme: NomTheme) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [themeName, setThemeName] = useState<NomTheme>('clair');

  useEffect(() => {
    if (profile) setThemeName(profile.theme);
  }, [profile]);

  const definirTheme = useCallback(async (suivant: NomTheme) => {
    setThemeName(suivant);
    try {
      await sauvegarderTheme(suivant);
    } catch {
      // Pas de profil connecté ou hors-ligne : le thème reste appliqué localement.
    }
  }, []);

  const basculerTheme = useCallback(async () => {
    await definirTheme(themeName === 'clair' ? 'sombre' : 'clair');
  }, [themeName, definirTheme]);

  return (
    <ThemeContext.Provider
      value={{ themeName, couleurs: themeName === 'sombre' ? DARK : LIGHT, basculerTheme, definirTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé à l’intérieur d’un ThemeProvider.');
  return ctx;
}
