import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  BookOpen, 
  TrendingUp, 
  Clock,
  FileText,
  CheckCircle,
  Activity,
  Eye,
  Star,
  CreditCard,
  Phone,
  Archive,
  GraduationCap,
  Bell,
  AlertTriangle
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';

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
  child: string;
  time: string;
  status: 'success' | 'warning' | 'pending';
}

export default function ParentDashboard() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { colors } = useTheme();

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
      title: 'Mes Enfants',
      value: '3',
      icon: <Users color="#FFFFFF" size={24} />,
      color: '#EA580C',
      change: 'Tous actifs',
    },
    {
      title: 'Séances ce mois',
      value: '24',
      icon: <Calendar color="#FFFFFF" size={24} />,
      color: '#7C3AED',
      change: '+6 vs mois dernier',
    },
    {
      title: 'Facture ce mois',
      value: '180,000 F',
      icon: <DollarSign color="#FFFFFF" size={24} />,
      color: '#DC2626',
      change: 'Payée ✓',
    },
    {
      title: 'Heures d\'études',
      value: '42h',
      icon: <Clock color="#FFFFFF" size={24} />,
      color: '#3B82F6',
      change: '+8h ce mois',
    },
    // Cartes masquées temporairement pour la version d'urgence
    // {
    //   title: 'Notes reçues',
    //   value: '15',
    //   icon: <BookOpen color="#FFFFFF" size={24} />,
    //   color: '#059669',
    //   change: '+3 cette semaine',
    // },
    // {
    //   title: 'Satisfaction',
    //   value: '4.9/5',
    //   icon: <Star color="#FFFFFF" size={24} />,
    //   color: '#065F46',
    //   change: 'Excellent',
    // },
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'Séance terminée',
      child: 'Kouadio Aya - Mathématiques avec Mme N\'Guessan',
      time: 'Il y a 1h',
      status: 'success',
    },
    {
      id: '2',
      type: 'Nouvelle note',
      child: 'N\'Dri Kevin - Devoir Physique: 16/20',
      time: 'Il y a 3h',
      status: 'success',
    },
    {
      id: '3',
      type: 'Prochaine séance',
      child: 'Traoré Aminata - Français demain 15h',
      time: 'Demain',
      status: 'pending',
    },
    {
      id: '4',
      type: 'Facture disponible',
      child: 'Facture février 2025 - 180,000 F',
      time: 'Il y a 2 jours',
      status: 'warning',
    },
  ];

  const quickActions = [
    {
      title: 'QR Code',
      icon: <Activity color="#FFFFFF" size={24} />,
      color: '#EA580C',
      onPress: () => router.push('/parent/qr-code'),
    },
    {
      title: 'Mes Contrats',
      icon: <FileText color="#FFFFFF" size={24} />,
      color: '#7C3AED',
      onPress: () => router.push('/parent/contracts'),
    },
    {
      title: 'Journal Séances',
      icon: <BookOpen color="#FFFFFF" size={24} />,
      color: '#DC2626',
      onPress: () => router.push('/parent/lessons-log'),
    },
    {
      title: 'Factures',
      icon: <CreditCard color="#FFFFFF" size={24} />,
      color: '#059669',
      onPress: () => router.push('/parent/invoices'),
    },
    {
      title: 'Mes Enfants',
      icon: <Users color="#FFFFFF" size={24} />,
      color: '#3B82F6',
      onPress: () => router.push('/parent/children'),
    },
    {
      title: 'Paiements',
      icon: <DollarSign color="#FFFFFF" size={24} />,
      color: '#065F46',
      onPress: () => router.push('/parent/invoices'),
    },
    {
      title: 'Signalements',
      icon: <AlertTriangle color="#FFFFFF" size={24} />,
      color: '#EF4444',
      onPress: () => router.push('/parent/absences'),
    },
    // Actions masquées temporairement pour la version d'urgence
    // {
    //   title: 'Mes Enfants',
    //   icon: <Users color="#FFFFFF" size={24} />,
    //   color: '#EA580C',
    //   onPress: () => router.push('/parent/children'),
    // },
    // {
    //   title: 'Notes & Bulletins',
    //   icon: <GraduationCap color="#FFFFFF" size={24} />,
    //   color: '#7C3AED',
    //   onPress: () => router.push('/parent/grades-reports'),
    // },
    // {
    //   title: 'Contact École',
    //   icon: <Phone color="#FFFFFF" size={24} />,
    //   color: '#059669',
    //   onPress: () => router.push('/parent/contact'),
    // },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="#10B981" size={16} />;
      case 'warning':
        return <Bell color="#F59E0B" size={16} />;
      case 'pending':
        return <Clock color="#3B82F6" size={16} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fixed Header */}
      <LinearGradient colors={['#EA580C', '#F97316']} style={styles.fixedHeader}>
        <View style={styles.headerContent}>
          <Text style={[styles.pageTitle, { color: '#FFFFFF' }]}>Tableau de Bord Parent</Text>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Welcome Section */}
          <View style={[styles.welcomeSection, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Bienvenue</Text>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>M. Diabaté Mamadou</Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
              Suivi de vos enfants
            </Text>
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
                    transform: [{ translateY: slideAnim }],
                  },
                  isDesktop ? { width: (width - 24 * 4) / 3 - 8 } : { width: (width - 24 * 2) / 2 - 8 },
                ]}
              >
                <LinearGradient
                  colors={[stat.color, stat.color === '#EA580C' ? '#F97316' : stat.color === '#7C3AED' ? '#8B5CF6' : stat.color === '#DC2626' ? '#EF4444' : stat.color === '#059669' ? '#10B981' : stat.color === '#3B82F6' ? '#60A5FA' : '#10B981']}
                  style={styles.statCardGradient}
                >
                  <View style={styles.statCardHeader}>
                    <View style={styles.statIcon}>{stat.icon}</View>
                    <View style={styles.statContent}>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statTitle}>{stat.title}</Text>
                      {stat.change && (
                        <View style={styles.statChange}>
                          <TrendingUp color="rgba(255, 255, 255, 0.8)" size={12} />
                          <Text style={styles.statChangeText}>{stat.change}</Text>
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🚀 Accès Rapide</Text>
            <View style={styles.quickActions}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={action.title}
                  style={[
                    styles.quickActionCard,
                    isDesktop ? { width: (width - 24 * 6) / 6 - 8 } : { width: (width - 24 * 3) / 3 - 8 },
                  ]}
                  onPress={action.onPress}
                >
                  <LinearGradient
                    colors={[action.color, action.color === '#EA580C' ? '#F97316' : action.color === '#7C3AED' ? '#8B5CF6' : action.color === '#DC2626' ? '#EF4444' : '#10B981']}
                    style={styles.quickActionGradient}
                  >
                    {action.icon}
                    <Text style={styles.quickActionText}>{action.title}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Alertes Signalements d'Absence */}
          <View style={styles.section}>
            <View style={[styles.alertCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
              <View style={styles.alertHeader}>
                <AlertTriangle color="#DC2626" size={20} />
                <Text style={[styles.alertTitle, { color: '#DC2626' }]}>1 signalement d'absence en attente</Text>
              </View>
              <Text style={[styles.alertDescription, { color: colors.textSecondary }]}>
                Marie Kouassi a un signalement d'absence en attente de validation par la direction.
              </Text>
              <TouchableOpacity
                style={[styles.alertAction, { backgroundColor: '#DC2626' }]}
                onPress={() => router.push('/parent/absences')}
              >
                <Text style={[styles.alertActionText, { color: '#FFFFFF' }]}>Voir les signalements</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Activities */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 Activités Récentes</Text>
            <View style={styles.activityList}>
              {recentActivities.map((activity, index) => (
                <View
                  key={activity.id}
                  style={[
                    styles.activityCard,
                    index === recentActivities.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.activityHeader}>
                    {getStatusIcon(activity.status)}
                    <Text style={[styles.activityType, { color: colors.text }]}>{activity.type}</Text>
                  </View>
                  <Text style={[styles.activityDescription, { color: colors.text }]}>
                    {activity.child}
                  </Text>
                  <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                    {activity.time}
                  </Text>
                </View>
              ))}
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
    backgroundColor: '#F8FAFC',
  },
  fixedHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
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
    backgroundColor: '#FFFFFF',
    marginHorizontal: -20,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
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
    color: '#1F2937',
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
    backgroundColor: '#FFFFFF',
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
    borderColor: '#F3F4F6',
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
    color: '#1F2937',
    marginLeft: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  alertCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  alertDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  alertAction: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  alertActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});