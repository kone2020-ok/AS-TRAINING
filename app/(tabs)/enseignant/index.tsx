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
  GraduationCap, 
  Calendar, 
  Clock, 
  BookOpen, 
  TrendingUp, 
  Users, 
  DollarSign,
  FileText,
  CheckCircle,
  Activity,
  ClipboardPlus,
  Eye,
  Star,
  Archive,
  Briefcase
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
  student: string;
  time: string;
  status: 'success' | 'warning' | 'pending';
}

export default function EnseignantDashboard() {
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
      title: 'Mes Élèves',
      value: '32',
      icon: <Users color="#FFFFFF" size={24} />,
      color: '#059669',
      change: '+3 ce mois',
    },
    {
      title: 'Séances ce mois',
      value: '45',
      icon: <Calendar color="#FFFFFF" size={24} />,
      color: '#7C3AED',
      change: '+8 vs mois dernier',
    },
    {
      title: 'Heures enseignées',
      value: '78h',
      icon: <Clock color="#FFFFFF" size={24} />,
      color: '#EA580C',
      change: '+12h ce mois',
    },
    {
      title: 'Salaire prévu',
      value: '485,000 F',
      icon: <DollarSign color="#FFFFFF" size={24} />,
      color: '#3B82F6',
      change: '+8% vs mois dernier',
    },
    // Cartes masquées temporairement pour la version d'urgence
    // {
    //   title: 'Notes saisies',
    //   value: '124',
    //   icon: <BookOpen color="#FFFFFF" size={24} />,
    //   color: '#DC2626',
    //   change: '+15 cette semaine',
    // },
    // {
    //   title: 'Note moyenne',
    //   value: '4.8/5',
    //   icon: <Star color="#FFFFFF" size={24} />,
    //   color: '#065F46',
    //   change: 'Excellent',
    // },
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'Séance terminée',
      student: 'Kouadio Aya - Mathématiques',
      time: 'Il y a 2h',
      status: 'success',
    },
    {
      id: '2',
      type: 'Note ajoutée',
      student: 'N\'Dri Kevin - Devoir Physique',
      time: 'Il y a 4h',
      status: 'success',
    },
    {
      id: '3',
      type: 'Séance programmée',
      student: 'Traoré Aminata - Français',
      time: 'Demain 14h',
      status: 'pending',
    },
    {
      id: '4',
      type: 'Rapport à rédiger',
      student: 'Bah Mohamed - Évaluation mensuelle',
      time: 'Dans 2 jours',
      status: 'warning',
    },
  ];

  const quickActions = [
    {
      title: 'Mes Contrats',
      icon: <FileText color="#FFFFFF" size={24} />,
      color: '#059669',
      onPress: () => router.push('/enseignant/contracts'),
    },
    {
      title: 'Mes Séances',
      icon: <ClipboardPlus color="#FFFFFF" size={24} />,
      color: '#7C3AED',
      onPress: () => router.push('/enseignant/sessions'),
    },
    {
      title: 'Historique',
      icon: <Archive color="#FFFFFF" size={24} />,
      color: '#EA580C',
      onPress: () => router.push('/enseignant/sessions-history'),
    },
    {
      title: 'Mon Salaire',
      icon: <DollarSign color="#FFFFFF" size={24} />,
      color: '#3B82F6',
      onPress: () => router.push('/enseignant/salary'),
    },
    {
      title: 'Offres de marché',
      icon: <Briefcase color="#FFFFFF" size={24} />,
      color: '#8B5CF6',
      onPress: () => router.push('/enseignant/market-offers'),
    },
    {
      title: 'Nouvelle Séance',
      icon: <ClipboardPlus color="#FFFFFF" size={24} />,
      color: '#DC2626',
      onPress: () => router.push('/enseignant/sessions'),
    },
    {
      title: 'Mes Élèves',
      icon: <Users color="#FFFFFF" size={24} />,
      color: '#065F46',
      onPress: () => router.push('/enseignant/contracts'),
    },
    // Actions masquées temporairement pour la version d'urgence
    // {
    //   title: 'Ajouter Note',
    //   icon: <BookOpen color="#FFFFFF" size={24} />,
    //   color: '#7C3AED',
    //   onPress: () => router.push('/enseignant/grades'),
    // },
    // {
    //   title: 'Planning',
    //   icon: <Calendar color="#FFFFFF" size={24} />,
    //   color: '#EA580C',
    //   onPress: () => router.push('/enseignant/schedule'),
    // },
    // {
    //   title: 'Rapports',
    //   icon: <FileText color="#FFFFFF" size={24} />,
    //   color: '#DC2626',
    //   onPress: () => router.push('/enseignant/reports'),
    // },
    // {
    //   title: 'Mes Bulletins',
    //   icon: <Archive color="#FFFFFF" size={24} />,
    //   color: '#3B82F6',
    //   onPress: () => router.push('/enseignant/bulletins'),
    // },
    // {
    //   title: 'Mon Profil',
    //   icon: <Users color="#FFFFFF" size={24} />,
    //   color: '#065F46',
    //   onPress: () => router.push('/enseignant/profile'),
    // },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="#10B981" size={16} />;
      case 'warning':
        return <Clock color="#F59E0B" size={16} />;
      case 'pending':
        return <Activity color="#3B82F6" size={16} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fixed Header */}
      <LinearGradient colors={['#059669', '#10B981']} style={styles.fixedHeader}>
        <View style={styles.headerContent}>
          <Text style={[styles.pageTitle, { color: '#FFFFFF' }]}>Tableau de Bord Enseignant</Text>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, paddingHorizontal: isDesktop ? 20 : 12 }]}>
          {/* Welcome Section */}
          <View style={[styles.welcomeSection, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Bonjour</Text>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>Marie N'Guessan</Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
              Votre espace enseignant
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
                  colors={[stat.color, stat.color === '#059669' ? '#10B981' : stat.color === '#EA580C' ? '#F97316' : stat.color === '#7C3AED' ? '#8B5CF6' : stat.color === '#DC2626' ? '#EF4444' : stat.color === '#3B82F6' ? '#60A5FA' : '#10B981']}
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🚀 Actions Rapides</Text>
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
                    colors={[action.color, action.color === '#059669' ? '#10B981' : action.color === '#EA580C' ? '#F97316' : action.color === '#7C3AED' ? '#8B5CF6' : '#EF4444']}
                    style={styles.quickActionGradient}
                  >
                    {action.icon}
                    <Text style={styles.quickActionText}>{action.title}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
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
                    {activity.student}
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
});