import React from 'react';
import { View, ScrollView, Animated, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { TouchableOpacity, Text } from 'react-native';

interface ScrollViewTemplateProps {
  children: React.ReactNode;
  title: string;
  onBack?: () => void;
  fadeAnim: Animated.Value;
  slideAnim?: Animated.Value;
  headerColors?: [string, string];
  backgroundColor?: string;
  showBackButton?: boolean;
  userRole?: 'direction' | 'enseignant' | 'parent';
}

export const ScrollViewTemplate: React.FC<ScrollViewTemplateProps> = ({
  children,
  title,
  onBack,
  fadeAnim,
  slideAnim,
  headerColors,
  backgroundColor = '#F8FAFC',
  showBackButton = true,
  userRole = 'direction',
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // Couleurs par rôle
  const getHeaderColors = () => {
    if (headerColors) return headerColors;
    
    switch (userRole) {
      case 'direction':
        return ['#1E40AF', '#3B82F6'] as [string, string];
      case 'enseignant':
        return ['#059669', '#10B981'] as [string, string];
      case 'parent':
        return ['#EA580C', '#F97316'] as [string, string];
      default:
        return ['#1E40AF', '#3B82F6'] as [string, string];
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor }}>
      {/* Fixed Header */}
      <LinearGradient colors={getHeaderColors()} style={{
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {showBackButton && onBack ? (
            <TouchableOpacity style={{ padding: 8, marginLeft: -8 }} onPress={onBack}>
              <ArrowLeft color="#FFFFFF" size={20} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#FFFFFF',
            flex: 1,
            textAlign: 'center',
          }}>
            {title}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Animated.View style={{
          paddingHorizontal: isDesktop ? 20 : 12,
          paddingBottom: 100,
          opacity: fadeAnim,
          transform: slideAnim ? [{ translateY: slideAnim }] : [],
        }}>
          {children}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

// Exemples d'utilisation :
/*
// Pour Direction (bleu)
<ScrollViewTemplate 
  title="Gestion des Enseignants"
  fadeAnim={fadeAnim}
  slideAnim={slideAnim}
  userRole="direction"
  onBack={() => router.back()}
>
  {/* Contenu de la page */}
</ScrollViewTemplate>

// Pour Enseignant (vert)
<ScrollViewTemplate 
  title="Mes Notes"
  fadeAnim={fadeAnim}
  slideAnim={slideAnim}
  userRole="enseignant"
  onBack={() => router.back()}
>
  {/* Contenu de la page */}
</ScrollViewTemplate>

// Pour Parent (orange)
<ScrollViewTemplate 
  title="Notes & Bulletins"
  fadeAnim={fadeAnim}
  slideAnim={slideAnim}
  userRole="parent"
  onBack={() => router.back()}
>
  {/* Contenu de la page */}
</ScrollViewTemplate>
*/ 