import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { getThemeStyles } from '../../frameworks/config/themeConfig';
import { ThemeType } from '../../domain/types/config/types';
import { PreferencesContextType } from '../../domain/types/application';

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    return savedTheme || 'default';
  });

  const [fontSize, setFontSize] = useState(() => {
    const savedSize = localStorage.getItem('fontSize');
    return savedSize ? parseInt(savedSize) : 16;
  });

  const styles = getThemeStyles(theme);

  const isFirstRender = useRef(true);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove('dark', 'light', 'default');
    document.documentElement.classList.add(theme);

    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      toast.success(`Theme changed to ${theme.charAt(0).toUpperCase() + theme.slice(1)}`);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize.toString());
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const resetPreferences = () => {
    setTheme('default');
    setFontSize(16);
  };

  return (
    <PreferencesContext.Provider value={{ theme, setTheme, fontSize, setFontSize, resetPreferences, styles }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};