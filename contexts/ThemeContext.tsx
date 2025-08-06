import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeSettings {
  // Thème général
  theme: 'light' | 'dark' | 'auto';
  
  // Couleurs personnalisées
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  
  // Contraste
  contrast: 'normal' | 'high' | 'low';
  
  // Taille de police
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  
  // Couleurs spécifiques par page
  pageColors: {
    dashboard: string;
    sessions: string;
    contracts: string;
    salary: string;
    profile: string;
    settings: string;
  };
  
  // Paramètres d'accessibilité
  accessibility: {
    reduceMotion: boolean;
    boldText: boolean;
    highContrast: boolean;
    screenReader: boolean;
  };
  
  // Paramètres de notification
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    badges: boolean;
  };
  
  // Paramètres d'affichage
  display: {
    compactMode: boolean;
    showAnimations: boolean;
    showImages: boolean;
    showIcons: boolean;
  };
}

interface ThemeContextType {
  settings: ThemeSettings;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
  resetToDefaults: () => void;
  exportSettings: () => Promise<string>;
  importSettings: (settingsJson: string) => Promise<void>;
}

const defaultSettings: ThemeSettings = {
  theme: 'light',
  primaryColor: '#059669',
  secondaryColor: '#10B981',
  accentColor: '#34D399',
  contrast: 'normal',
  fontSize: 'medium',
  pageColors: {
    dashboard: '#059669',
    sessions: '#3B82F6',
    contracts: '#8B5CF6',
    salary: '#F59E0B',
    profile: '#EF4444',
    settings: '#6B7280',
  },
  accessibility: {
    reduceMotion: false,
    boldText: false,
    highContrast: false,
    screenReader: false,
  },
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    badges: true,
  },
  display: {
    compactMode: false,
    showAnimations: true,
    showImages: true,
    showIcons: true,
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeSettings = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeSettings must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('themeSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  };

  const saveSettings = async (newSettings: ThemeSettings) => {
    try {
      await AsyncStorage.setItem('themeSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
    }
  };

  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
  };

  const exportSettings = async (): Promise<string> => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = async (settingsJson: string) => {
    try {
      const importedSettings = JSON.parse(settingsJson);
      setSettings({ ...defaultSettings, ...importedSettings });
      saveSettings({ ...defaultSettings, ...importedSettings });
    } catch (error) {
      throw new Error('Format de paramètres invalide');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        settings,
        updateSettings,
        resetToDefaults,
        exportSettings,
        importSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}; 