import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  FileText,
  Users,
  TrendingUp,
  BarChart,
  Calendar,
  Star,
  MessageCircle,
  ArrowRight,
  Brain,
  Award,
  Clock,
  CheckCircle
} from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';

interface ReportCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  stats: {
    total: number;
    pending?: number;
    thisMonth: number;
  };
  color: string;
}

export default function DirectionReports() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  const reportCategories: ReportCategory[] = [
    {
      id: 'teacher_reports',
      title: 'Rapports Enseignants',
      description: 'Évaluations des élèves par les enseignants avec suggestions IA',
      icon: FileText,
      route: '/direction/teacher-reports',
      stats: {
        total: 24,
        pending: 3,
        thisMonth: 8,
      },
      color: '#059669',
    },
    {
      id: 'parent_reports',
      title: 'Rapports Parents',
      description: 'Évaluations des enseignants par les parents',
      icon: Users,
      route: '/direction/parent-reports',
      stats: {
        total: 18,
        pending: 2,
        thisMonth: 6,
      },
      color: '#EA580C',
    },
  ];

  const overallStats = [
    {
      title: 'Total Rapports',
      value: '42',
      change: '+12%',
      changeType: 'positive' as const,
      icon: FileText,
    },
    {
      title: 'Ce Mois',
      value: '14',
      change: '+25%',
      changeType: 'positive' as const,
      icon: Calendar,
    },
    {
      title: 'En Attente',
      value: '5',
      change: '-18%',
      changeType: 'negative' as const,
      icon: Clock,
    },
    {
      title: 'Note Moyenne',
      value: '16.2/20',
      change: '+0.8',
      changeType: 'positive' as const,
      icon: Star,
    },
  ];

  useEffect(() => {
    // Animations
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

  const renderStatCard = (stat: typeof overallStats[0], index: number) => (
    <View
      key={index}
      style={[
        styles.statCard,
        {
          backgroundColor: colors.card,
          width: isDesktop ? '23%' : '48%',
          shadowColor: colors.border,
        },
      ]}
    >
      <View style={styles.statHeader}>
        <stat.icon color={colors.primary} size={24} />
        <Text style={[styles.statTitle, { color: colors.text }]}>
          {stat.title}
        </Text>
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>
        {stat.value}
      </Text>
      <View style={styles.statChange}>
        <Text
          style={[
            styles.statChangeText,
            {
              color:
                stat.changeType === 'positive' ? '#10B981' : '#EF4444',
            },
          ]}
        >
          {stat.change}
        </Text>
      </View>
    </View>
  );

  const renderCategoryCard = (category: ReportCategory) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryCard,
        {
          backgroundColor: colors.card,
          shadowColor: colors.border,
        },
      ]}
      onPress={() => router.push(category.route as any)}
    >
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
          <category.icon color={category.color} size={28} />
        </View>
        <ArrowRight color={colors.text} size={20} />
      </View>

      <Text style={[styles.categoryTitle, { color: colors.text }]}>
        {category.title}
      </Text>
      <Text style={[styles.categoryDescription, { color: colors.text + '80' }]}>
        {category.description}
      </Text>

      <View style={styles.categoryStats}>
        <View style={styles.categoryStat}>
          <Text style={[styles.categoryStatValue, { color: category.color }]}>
            {category.stats.total}
          </Text>
          <Text style={[styles.categoryStatLabel, { color: colors.text + '60' }]}>
            Total
          </Text>
        </View>
        {category.stats.pending && (
          <View style={styles.categoryStat}>
            <Text style={[styles.categoryStatValue, { color: '#F59E0B' }]}>
              {category.stats.pending}
            </Text>
            <Text style={[styles.categoryStatLabel, { color: colors.text + '60' }]}>
              En attente
            </Text>
          </View>
        )}
        <View style={styles.categoryStat}>
          <Text style={[styles.categoryStatValue, { color: colors.primary }]}>
            {category.stats.thisMonth}
          </Text>
          <Text style={[styles.categoryStatLabel, { color: colors.text + '60' }]}>
            Ce mois
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.fixedHeader}>
        <Text style={styles.pageTitle}>Rapports & Analytics</Text>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Introduction */}
          <View style={[styles.introSection, { backgroundColor: colors.card }]}>
            <View style={styles.introHeader}>
              <Brain color={colors.primary} size={24} />
              <Text style={[styles.introTitle, { color: colors.text }]}>
                Système de Rapports Intelligents
              </Text>
            </View>
            <Text style={[styles.introText, { color: colors.text + '80' }]}>
              Analysez les performances pédagogiques avec nos rapports bidirectionnels 
              et nos suggestions IA avancées.
            </Text>
          </View>

          {/* Statistiques Globales */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              📊 Vue d'ensemble
            </Text>
            <View style={styles.statsContainer}>
              {overallStats.map(renderStatCard)}
            </View>
          </View>

          {/* Catégories de Rapports */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              📋 Types de Rapports
            </Text>
            <View style={styles.categoriesContainer}>
              {reportCategories.map(renderCategoryCard)}
            </View>
          </View>

          {/* Actions Rapides */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              ⚡ Actions Rapides
            </Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickAction, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/direction/teacher-reports')}
              >
                <BarChart color="#FFFFFF" size={20} />
                <Text style={styles.quickActionText}>Analyser Performances</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickAction, { backgroundColor: '#059669' }]}
                onPress={() => router.push('/direction/parent-reports')}
              >
                <MessageCircle color="#FFFFFF" size={20} />
                <Text style={styles.quickActionText}>Feedback Parents</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
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
    backgroundColor: '#F8FAFC',
  },
  introSection: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoriesContainer: {
    gap: 16,
  },
  categoryCard: {
    padding: 20,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  categoryDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryStat: {
    alignItems: 'center',
  },
  categoryStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoryStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});