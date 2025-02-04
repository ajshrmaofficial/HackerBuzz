import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Colors } from './colors';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThemeAndSetColors = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme as Theme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemeAndSetColors();

    const updateColors = () => {
      if (theme === 'system') {
        const colorScheme = Appearance.getColorScheme();
        setCurrentColors(colorScheme === 'dark' ? Colors.dark : Colors.light);
      } else {
        setCurrentColors(Colors[theme]);
      }
    };

    updateColors();
    const subscription = Appearance.addChangeListener(updateColors);
    return () => subscription.remove();
  }, [theme]);

  const toggleTheme = useCallback((selectedTheme?: Theme) => {
    if (selectedTheme) {
      setTheme(selectedTheme);
      AsyncStorage.setItem('theme', selectedTheme);
    } else {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      AsyncStorage.setItem('theme', newTheme);
    }
  }, [theme]);

  if (isLoading) return null;

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
