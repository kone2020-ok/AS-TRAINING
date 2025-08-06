import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  // Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, GraduationCap, Calendar, DollarSign, CircleAlert as AlertCircle, TrendingUp, Clock, CircleCheck as CheckCircle, ArrowRight, Briefcase, FilePenLine, FileText, FileSignature, CreditCard, Camera, AlertTriangle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useWindowDimensions } from 'react-native'; // Importer useWindowDimensions
import { useTheme } from '@react-navigation/native'; // Importer useTheme

// const { width } = Dimensions.get('window'); // Supprimer cette ligne

interface StatCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  change?: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  time: string;
  status: 'success' | 'warning' | 'pending';
}

export default function DirectionDashboard() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const { width } = useWindowDimensions(); // Utiliser useWindowDimensions
  const isDesktop = width >= 768; // Définir un breakpoint pour le bureau
  const { colors } = useTheme(); // Utiliser useTheme

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const stats: StatCard[] = [
    {
      title: 'Enseignants Actifs',
      value: '24',
      icon: <GraduationCap color="#FFFFFF" size={24} />,
      color: '#059669',
      change: '+3 ce mois',
    },
    {
      title: 'Parents Inscrits',
      value: '156',
      icon: <Users color="#FFFFFF" size={24} />,
      color: '#EA580C',
      change: '+12 ce mois',
    },
    {
      title: 'Séances ce mois',
      value: '342',
      icon: <Calendar color="#FFFFFF" size={24} />,
      color: '#7C3AED',
      change: '+18% vs mois dernier',
    },
    {
      title: 'Revenus ce mois',
      value: '1,250,000 F',
      icon: <DollarSign color="#FFFFFF" size={24} />,
      color: '#DC2626',
      change: '+15% vs mois dernier',
    },
    {
      title: 'Contrats Signés',
      value: '88',
      icon: <FileSignature color="#FFFFFF" size={24} />,
      color: '#065F46',
      change: '+5 ce mois',
    },
    {
      title: 'Paiements Reçus',
      value: '156',
      icon: <CreditCard color="#FFFFFF" size={24} />,
      color: '#3B82F6',
      change: '+23 ce mois',
    },
    // Carte masquée temporairement pour la version d'urgence
    // {
    //   title: 'Total Élèves',
    //   value: '450',
    //   icon: <Users color="#FFFFFF" size={24} />,
    //   color: '#3B82F6',
    //   change: '+20 ce mois',
    // },
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'Séance',
      description: 'Nouvelle séance enregistrée par M. Kouassi',
      time: 'Il y a 5 minutes',
      status: 'pending',
    },
    {
      id: '2',
      type: 'Paiement',
      description: 'Paiement reçu de Mme Diabate',
      time: 'Il y a 15 minutes',
      status: 'success',
    },
    {
      id: '3',
      type: 'Rapport',
      description: 'Rapport mensuel soumis par Mme N\'Guessan',
      time: 'Il y a 1 heure',
      status: 'warning',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#10B981'; // Vert pour le succès
      case 'warning':
        return '#F59E0B'; // Orange pour l'avertissement
      case 'pending':
        return '#3B82F6'; // Bleu pour pending
      default:
        return '#6B7280'; // Gris pour défaut
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="#10B981" size={16} />;
      case 'warning':
        return <AlertCircle color="#F59E0B" size={16} />;
      case 'pending':
        return <Clock color="#3B82F6" size={16} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fixed Header */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.fixedHeader}>
        <View style={styles.headerContent}>
          <Text style={[styles.pageTitle, { color: '#FFFFFF' }]}>Tableau de Bord Direction</Text>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, paddingHorizontal: isDesktop ? 20 : 12 }]}>
          {/* Welcome Section */}
          <View style={[styles.welcomeSection, { backgroundColor: colors.card, borderBottomColor: colors.border, marginHorizontal: isDesktop ? -20 : -12 }]}>
            <Text style={[styles.welcomeText, { color: '#6B7280' }]}>Bienvenue</Text>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>Direction AS-TRAINING</Text>
            <Text style={[styles.welcomeSubtitle, { color: '#6B7280' }]}>Vue d'ensemble de la plateforme</Text>
          </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Animated.View
              key={stat.title}
              style={[
                styles.statCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: slideAnim,
                    },
                  ],
                },
                isDesktop ? { width: (width - 24 * 3) / 4 - 8 } : { width: (width - 24 * 2) / 2 - 8 }, // Ajustement de la largeur
              ]}
            >
              <LinearGradient
                colors={[stat.color, stat.color === '#059669' ? '#10B981' : stat.color === '#EA580C' ? '#F97316' : stat.color === '#7C3AED' ? '#8B5CF6' : stat.color === '#DC2626' ? '#EF4444' : stat.color]}
                style={styles.statCardGradient}
              >
                <View style={styles.statCardHeader}>
                  <View style={styles.statIcon}>{stat.icon}</View>
                  <View style={styles.statContent}>
                    <Text style={[styles.statValue, { color: '#FFFFFF' }]}>{stat.value}</Text>
                    <Text style={[styles.statTitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>{stat.title}</Text>
                    {stat.change && (
                      <View style={styles.statChange}>
                        <TrendingUp color={'rgba(255, 255, 255, 0.8)'} size={12} />
                        <Text style={[styles.statChangeText, { color: 'rgba(255, 255, 255, 0.8)' }]}>{stat.change}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions Rapides</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.quickActionCard, isDesktop && { width: (width - 24 * 3) / 4 - 8 }, !isDesktop && { width: (width - 48) / 2 }]} // Ajustement responsive
              onPress={() => router.push('/direction/teachers')}
            >
              <LinearGradient
                colors={['#059669', '#10B981', '#34D399']}
                style={styles.quickActionGradient}
              >
                <Briefcase color={'#FFFFFF'} size={32} />
                <Text style={[styles.quickActionText, { color: '#FFFFFF' }]}>Gérer Enseignants</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, isDesktop && { width: (width - 24 * 3) / 4 - 8 }, !isDesktop && { width: (width - 48) / 2 }]} // Ajustement responsive
              onPress={() => router.push('/direction/parents')}
            >
              <LinearGradient
                colors={['#EA580C', '#F97316', '#FB923C']}
                style={styles.quickActionGradient}
              >
                <Users color={'#FFFFFF'} size={32} />
                <Text style={[styles.quickActionText, { color: '#FFFFFF' }]}>Gérer Parents</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, isDesktop && { width: (width - 24 * 3) / 4 - 8 }, !isDesktop && { width: (width - 48) / 2 }]} // Ajustement responsive
              onPress={() => router.push('/direction/sessions')}
            >
              <LinearGradient
                colors={['#7C3AED', '#8B5CF6', '#A855F7']}
                style={styles.quickActionGradient}
              >
                <CheckCircle color={'#FFFFFF'} size={32} />
                <Text style={[styles.quickActionText, { color: '#FFFFFF' }]}>Valider Séances</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, isDesktop && { width: (width - 24 * 3) / 4 - 8 }, !isDesktop && { width: (width - 48) / 2 }]} // Ajustement responsive
              onPress={() => router.push('/direction/contracts')}
            >
              <LinearGradient
                colors={['#DC2626', '#EF4444', '#F87171']}
                style={styles.quickActionGradient}
              >
                <FilePenLine color={'#FFFFFF'} size={32} />
                <Text style={[styles.quickActionText, { color: '#FFFFFF' }]}>Gérer Contrats</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, isDesktop && { width: (width - 24 * 3) / 4 - 8 }, !isDesktop && { width: (width - 48) / 2 }]} // Ajustement responsive
              onPress={() => router.push('/direction/invoicing')}
            >
              <LinearGradient
                colors={['#F59E0B', '#FBBF24']}
                style={styles.quickActionGradient}
              >
                <FileText color={'#FFFFFF'} size={32} />
                <Text style={[styles.quickActionText, { color: '#FFFFFF' }]}>Gérer Facturation</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, isDesktop && { width: (width - 24 * 3) / 4 - 8 }, !isDesktop && { width: (width - 48) / 2 }]} // Ajustement responsive
              onPress={() => router.push('/direction/payments')}
            >
              <LinearGradient
                colors={['#4B5563', '#6B7280', '#9CA3AF']}
                style={styles.quickActionGradient}
              >
                <CreditCard color={'#FFFFFF'} size={32} />
                <Text style={[styles.quickActionText, { color: '#FFFFFF' }]}>Gérer Paiements</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, isDesktop && { width: (width - 24 * 3) / 4 - 8 }, !isDesktop && { width: (width - 48) / 2 }]}
              onPress={() => router.push('/direction/photo-approvals')}
            >
              <LinearGradient
                colors={['#F59E0B', '#FBBF24']}
                style={styles.quickActionGradient}
              >
                <Camera color={'#FFFFFF'} size={32} />
                <Text style={[styles.quickActionText, { color: '#FFFFFF' }]}>Approbation Photos</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, isDesktop && { width: (width - 24 * 3) / 4 - 8 }, !isDesktop && { width: (width - 48) / 2 }]}
              onPress={() => router.push('/direction/absences')}
            >
              <LinearGradient
                colors={['#EF4444', '#F87171']}
                style={styles.quickActionGradient}
              >
                <AlertTriangle color={'#FFFFFF'} size={32} />
                <Text style={[styles.quickActionText, { color: '#FFFFFF' }]}>Signalements d'Absences</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, isDesktop && { width: (width - 24 * 3) / 4 - 8 }, !isDesktop && { width: (width - 48) / 2 }]}
              onPress={() => router.push('/direction/market-offers')}
            >
              <LinearGradient
                colors={['#3B82F6', '#60A5FA']}
                style={styles.quickActionGradient}
              >
                <Briefcase color={'#FFFFFF'} size={32} />
                <Text style={[styles.quickActionText, { color: '#FFFFFF' }]}>Offres de marché</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Actions masquées temporairement pour la version d'urgence */}
            {/* <TouchableOpacity 
              style={[styles.quickActionCard, isDesktop && { width: (width - 24 * 3) / 4 - 8 }]}
              onPress={() => router.push('/direction/accounting')}
            >
              <LinearGradient
                colors={['#F59E0B', '#FBBF24']}
                style={styles.quickActionGradient}
              >
                <CreditCard color={'#FFFFFF'} size={32} />
                <Text style={[styles.quickActionText, { color: '#FFFFFF' }]}>Gérer Comptabilité</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, isDesktop && { width: (width - 24 * 3) / 4 - 8 }]}
              onPress={() => router.push('/direction/reports')}
            >
              <LinearGradient
                colors={['#4B5563', '#6B7280']}
                style={styles.quickActionGradient}
              >
                <FileText color={'#FFFFFF'} size={32} />
                <Text style={[styles.quickActionText, { color: '#FFFFFF' }]}>Voir Rapports</Text>
              </LinearGradient>
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Activités Récentes</Text>
          <View style={[styles.activityList, { backgroundColor: colors.card }]}>
            {recentActivities.map((activity) => (
              <TouchableOpacity key={activity.id} style={[styles.activityCard, { borderBottomColor: colors.border }]}>
                <View style={styles.activityHeader}>
                  {getStatusIcon(activity.status)}
                  <Text style={[styles.activityType, { color: colors.text }]}>{activity.type}</Text>
                  <Text style={[styles.activityTime, { color: '#6B7280' }]}>{activity.time}</Text>
                </View>
                <Text style={[styles.activityDescription, { color: '#4B5563' }]}>
                  {activity.description}
                </Text>
                <ArrowRight color={'#6B7280'} size={16} style={styles.activityArrow} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Alerts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Alertes Importantes</Text>
          
          {/* Alerte pour les photos en attente */}
          <View style={[styles.alertCard, { backgroundColor: '#FEF3C7', borderLeftColor: '#F59E0B' }]}>
            <View style={styles.alertHeader}>
              <Camera color={'#92400E'} size={20} />
              <Text style={[styles.alertTitle, { color: '#92400E' }]}>3 photos de profil en attente d'approbation</Text>
            </View>
            <Text style={[styles.alertDescription, { color: '#78350F' }]}>
              Des enseignants ont soumis de nouvelles photos de profil nécessitant votre validation.
            </Text>
            <TouchableOpacity 
              style={styles.alertAction}
              onPress={() => router.push('/direction/photo-approvals')}
            >
              <Text style={[styles.alertActionText, { color: '#D97706' }]}>Voir les photos</Text>
            </TouchableOpacity>
          </View>

          {/* Alerte pour les séances */}
          <View style={[styles.alertCard, { backgroundColor: '#FFFBEB', borderLeftColor: '#F59E0B', marginTop: 12 }]}>
            <View style={styles.alertHeader}>
              <AlertCircle color={'#92400E'} size={20} />
              <Text style={[styles.alertTitle, { color: '#92400E' }]}>5 séances en attente de validation</Text>
            </View>
            <Text style={[styles.alertDescription, { color: '#78350F' }]}>
              Des séances enregistrées aujourd'hui nécessitent votre validation.
            </Text>
            <TouchableOpacity style={styles.alertAction}>
              <Text style={[styles.alertActionText, { color: '#D97706' }]}>Voir les séances</Text>
            </TouchableOpacity>
          </View>

          {/* Alerte pour les signalements d'absences */}
          <View style={[styles.alertCard, { backgroundColor: '#FEF2F2', borderLeftColor: '#EF4444', marginTop: 12 }]}>
            <View style={styles.alertHeader}>
              <AlertTriangle color={'#DC2626'} size={20} />
              <Text style={[styles.alertTitle, { color: '#DC2626' }]}>2 signalements d'absences en attente</Text>
            </View>
            <Text style={[styles.alertDescription, { color: '#991B1B' }]}>
              Des enseignants ont signalé des absences et programmé des rattrapages nécessitant votre validation.
            </Text>
            <TouchableOpacity 
              style={styles.alertAction}
              onPress={() => router.push('/direction/absences')}
            >
              <Text style={[styles.alertActionText, { color: '#EF4444' }]}>Voir les signalements</Text>
            </TouchableOpacity>
          </View>
        </View>      
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Remplace par la couleur de fond par défaut
  },
  fixedHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)', // Conserve l'opacité pour un effet plus doux
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF', // Conserve blanc pour l'en-tête
    flex: 1,
    textAlign: 'center',
  },
  logoutButton: {
    padding: 8,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF', // Utilise le blanc pour la section bienvenue
    marginHorizontal: -20,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB', // Couleur de bordure plus claire
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280', // Couleur secondaire grisâtre
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937', // Couleur de texte principale
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280', // Couleur secondaire grisâtre
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statCardGradient: {
    padding: 16,
    height: 120,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statChangeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937', // Couleur de texte principale
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionGradient: {
    padding: 16,
    alignItems: 'center',
    height: 100,
    justifyContent: 'center',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  activityList: {
    backgroundColor: '#FFFFFF', // Utilise le blanc pour la liste d'activités
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  activityCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6', // Couleur de bordure plus claire
    position: 'relative',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937', // Couleur de texte principale
    marginLeft: 8,
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280', // Couleur secondaire grisâtre
    marginLeft: 'auto',
  },
  activityDescription: {
    fontSize: 14,
    color: '#4B5563', // Couleur de texte secondaire plus foncée
    lineHeight: 20,
  },
  activityArrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -8,
  },
  alertCard: {
    backgroundColor: '#FFFBEB', // Couleur de fond pour les alertes (jaune pâle)
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B', // Couleur de bordure pour les alertes (orange)
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E', // Couleur de texte pour les alertes (marron foncé)
    marginLeft: 8,
  },
  alertDescription: {
    fontSize: 14,
    color: '#78350F', // Couleur de texte pour les alertes (marron plus clair)
    marginBottom: 12,
    lineHeight: 20,
  },
  alertAction: {
    alignSelf: 'flex-start',
  },
  alertActionText: {
    color: '#D97706', // Couleur de texte pour l'action d'alerte (orange plus foncé)
    fontSize: 14,
    fontWeight: '600',
  },
});