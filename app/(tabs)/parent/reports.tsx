import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FileText, ArrowRight, MessageCircle, Star } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';

export default function ParentReports() {
  const { colors } = useTheme();

  const handleGoToMonthlyReports = () => {
    router.push('/parent/monthly-reports');
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <LinearGradient colors={['#EA580C', '#F97316']} style={styles.fixedHeader}>
        <Text style={styles.pageTitle}>Rapports & Évaluations</Text>
      </LinearGradient>

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {/* Redirection Card */}
        <View style={[styles.redirectCard, { backgroundColor: colors.card }]}>
          <View style={styles.iconContainer}>
            <FileText color={colors.primary} size={48} />
          </View>
          
          <Text style={[styles.redirectTitle, { color: colors.text }]}>
            Rapports Mensuels
          </Text>
          
          <Text style={[styles.redirectDescription, { color: colors.text + '80' }]}>
            Vos évaluations et rapports mensuels sur les enseignants de vos enfants 
            sont maintenant disponibles dans la section dédiée.
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <MessageCircle color="#059669" size={20} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Évaluer les enseignants
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Star color="#F59E0B" size={20} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Consulter l'historique
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <FileText color="#3B82F6" size={20} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Donner votre avis détaillé
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.redirectButton, { backgroundColor: colors.primary }]}
            onPress={handleGoToMonthlyReports}
          >
            <Text style={styles.redirectButtonText}>
              Accéder aux Rapports Mensuels
            </Text>
            <ArrowRight color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={[styles.infoSection, { backgroundColor: colors.card + '80' }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            💡 À savoir
          </Text>
          <Text style={[styles.infoText, { color: colors.text + '80' }]}>
            Vos évaluations nous aident à améliorer la qualité pédagogique 
            et à assurer le meilleur suivi pour vos enfants.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  redirectCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  redirectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  redirectDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  featuresList: {
    width: '100%',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  redirectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  redirectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});