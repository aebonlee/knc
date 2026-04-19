import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';
type ColorTheme = 'dark-blue' | 'blue' | 'teal' | 'purple' | 'red';

interface ThemeContextValue {
  theme: ThemeMode;
  colorTheme: ColorTheme;
  toggleTheme: () => void;
  setColorTheme: (color: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  colorTheme: 'dark-blue',
  toggleTheme: () => {},
  setColorTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

function getCookie(name: string, fallback: string): string {
  try {
    const match = document.cookie.match(new RegExp(`${name}=([^;]+)`));
    return match ? match[1] : fallback;
  } catch { return fallback; }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() => getCookie('themeMode', 'light') as ThemeMode);
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => getCookie('colorTheme', 'dark-blue') as ColorTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.cookie = `themeMode=${theme};path=/;max-age=31536000`;
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-color', colorTheme);
    document.cookie = `colorTheme=${colorTheme};path=/;max-age=31536000`;
  }, [colorTheme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const setColorTheme = (color: ColorTheme) => setColorThemeState(color);

  return (
    <ThemeContext.Provider value={{ theme, colorTheme, toggleTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
