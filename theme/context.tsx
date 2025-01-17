import React, { createContext, useContext, useState, useEffect } from 'react';
import { Colors } from './colors';
import { Appearance } from 'react-native';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (selectedTheme?: Theme) => void;
  colors: typeof Colors.light | typeof Colors.dark;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  colors: Colors.light,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('system');
  const [currentColors, setCurrentColors] = useState(Colors.light);

  useEffect(() => {
    const updateColors = () => {
      const colorScheme = Appearance.getColorScheme();
      if (theme === 'system') {
        setCurrentColors(colorScheme === 'dark' ? Colors.dark : Colors.light);
      } else {
        setCurrentColors(Colors[theme]);
      }
    };

    updateColors();

    const subscription = Appearance.addChangeListener(() => {
      if (theme === 'system') {
        updateColors();
      }
    });

    return () => subscription.remove();
  }, [theme]);

  const toggleTheme = (selectedTheme?: Theme) => {
    if (selectedTheme) {
      setTheme(selectedTheme);
    } else {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      colors: currentColors
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
