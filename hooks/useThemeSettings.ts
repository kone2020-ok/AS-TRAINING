import { useMemo } from 'react';
import { useThemeSettings } from '../contexts/ThemeContext';

export const useThemeStyles = () => {
  const { settings } = useThemeSettings();

  const themeStyles = useMemo(() => {
    // Calculer la taille de police basée sur les paramètres
    const getFontSize = (baseSize: number) => {
      switch (settings.fontSize) {
        case 'small':
          return baseSize * 0.8;
        case 'large':
          return baseSize * 1.2;
        case 'extra-large':
          return baseSize * 1.4;
        default:
          return baseSize;
      }
    };

    // Calculer le contraste basé sur les paramètres
    const getContrast = (baseColor: string) => {
      switch (settings.contrast) {
        case 'high':
          return baseColor + 'FF'; // Plus opaque
        case 'low':
          return baseColor + '80'; // Plus transparent
        default:
          return baseColor;
      }
    };

    // Appliquer le mode compact
    const getSpacing = (baseSpacing: number) => {
      return settings.display.compactMode ? baseSpacing * 0.7 : baseSpacing;
    };

    return {
      // Styles de texte
      text: {
        fontSize: getFontSize(14),
        fontWeight: settings.accessibility.boldText ? 'bold' : 'normal' as const,
      },
      title: {
        fontSize: getFontSize(18),
        fontWeight: settings.accessibility.boldText ? 'bold' : '600' as const,
      },
      subtitle: {
        fontSize: getFontSize(16),
        fontWeight: settings.accessibility.boldText ? 'bold' : '500' as const,
      },
      caption: {
        fontSize: getFontSize(12),
        fontWeight: settings.accessibility.boldText ? 'bold' : 'normal' as const,
      },

      // Styles de conteneurs
      container: {
        padding: getSpacing(16),
        gap: getSpacing(12),
      },
      card: {
        borderRadius: getSpacing(8),
        padding: getSpacing(16),
        marginBottom: getSpacing(12),
      },

      // Styles de boutons
      button: {
        paddingVertical: getSpacing(12),
        paddingHorizontal: getSpacing(16),
        borderRadius: getSpacing(8),
      },

      // Couleurs dynamiques
      colors: {
        primary: settings.primaryColor,
        secondary: settings.secondaryColor,
        accent: settings.accentColor,
        pageColors: settings.pageColors,
      },

      // Paramètres d'affichage
      display: {
        showAnimations: settings.display.showAnimations,
        showImages: settings.display.showImages,
        showIcons: settings.display.showIcons,
        compactMode: settings.display.compactMode,
      },

      // Paramètres d'accessibilité
      accessibility: {
        reduceMotion: settings.accessibility.reduceMotion,
        highContrast: settings.accessibility.highContrast,
        screenReader: settings.accessibility.screenReader,
      },
    };
  }, [settings]);

  return themeStyles;
}; 