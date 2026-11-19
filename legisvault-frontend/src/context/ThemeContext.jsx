import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';

/**
 * @typedef {Object} ThemeContextType
 * @property {boolean} isHighContrast
 * @property {() => void} toggleHighContrast
 * @property {(enable: boolean) => void} setHighContrastMode
 */

export const ThemeContext = createContext(/** @type {ThemeContextType|null} */ (null));

export const ThemeProvider = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState(() => {
    try {
      const stored = localStorage.getItem('legisvault_high_contrast');
      if (stored !== null) {
        return stored === 'true';
      }
      // Check system high contrast preference
      return window.matchMedia('(forced-colors: active)').matches;
    } catch {
      return false;
    }
  });

  // Keep DOM class in sync
  useEffect(() => {
    const root = document.documentElement;
    if (isHighContrast) {
      root.classList.add('high-contrast');
      localStorage.setItem('legisvault_high_contrast', 'true');
    } else {
      root.classList.remove('high-contrast');
      localStorage.setItem('legisvault_high_contrast', 'false');
    }
  }, [isHighContrast]);

  const toggleHighContrast = useCallback(() => {
    setIsHighContrast((prev) => !prev);
  }, []);

  const setHighContrastMode = useCallback((enable) => {
    setIsHighContrast(Boolean(enable));
  }, []);

  const value = useMemo(() => ({
    isHighContrast,
    toggleHighContrast,
    setHighContrastMode,
  }), [isHighContrast, toggleHighContrast, setHighContrastMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
