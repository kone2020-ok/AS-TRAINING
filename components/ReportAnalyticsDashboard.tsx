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
  BarChart,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  Award,
  AlertTriangle,
  Target,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  Download,
  Calendar
} from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { useReportExport } from './ReportExportService';

interface AnalyticsData {
  performanceMetrics: {
    teacherAverageGrade: number;
    parentSatisfactionRate: number;
    reportCompletionRate: number;
    aiSuggestionsUsageRate: number;
  };
  trends: {
    monthlyEvolution: Array<{
      month: string;
      teacherReports: number;
      parentReports: number;
      averageGrade: number;
      satisfaction: number;
    }>;
  };
  teacherPerformance: Array<{
    id: string;
    name: string;
    averageGrade: number;
    reportCount: number;
    parentSatisfaction: number;
    aiUsage: number;
    status: 'excellent' | 'good' | 'needs_improvement';
  }>;
  parentFeedback: Array<{
    teacherId: string;
    teacherName: string;
    averageSatisfaction: number;
    feedbackCount: number;
    topComplaints: string[];
    topPraises: string[];
  }>;
  alerts: Array<{
    type: 'performance' | 'satisfaction' | 'attendance';
    severity: 'high' | 'medium' | 'low';
    message: string;
    teacherId?: string;
    studentId?: string;
  }>;
}

interface ReportAnalyticsDashboardProps {
  visible: boolean;
  onClose: () => void;
}

export default function ReportAnalyticsDashboard({ visible, onClose }: ReportAnalyticsDashboardProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { exportMultipleReportsToExcel } = useReportExport();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  // Données de démonstration
  const demoAnalyticsData: AnalyticsData = {
    performanceMetrics: {
      teacherAverageGrade: 15.2,
      parentSatisfactionRate: 8.7,
      reportCompletionRate: 94.5,
      aiSuggestionsUsageRate: 78.3,
    },
    trends: {
      monthlyEvolution: [
        { month: 'Jan', teacherReports: 24, parentReports: 18, averageGrade: 14.8, satisfaction: 8.2 },
        { month: 'Fév', teacherReports: 28, parentReports: 22, averageGrade: 15.1, satisfaction: 8.5 },
        { month: 'Mar', teacherReports: 32, parentReports: 26, averageGrade: 15.2, satisfaction: 8.7 },
        { month: 'Avr', teacherReports: 30, parentReports: 24, averageGrade: 15.0, satisfaction: 8.4 },
      ],
    },
    teacherPerformance: [
      {
        id: 'teacher_1',
        name: 'Marie N\'Guessan',
        averageGrade: 16.2,
        reportCount: 8,
        parentSatisfaction: 9.1,
        aiUsage: 85,
        status: 'excellent',
      },
      {
        id: 'teacher_2',
        name: 'Jean Baptiste',
        averageGrade: 14.8,
        reportCount: 6,
        parentSatisfaction: 8.3,
        aiUsage: 72,
        status: 'good',
      },
      {
        id: 'teacher_3',
        name: 'Sarah Diallo',
        averageGrade: 13.5,
        reportCount: 4,
        parentSatisfaction: 7.9,
        aiUsage: 45,
        status: 'needs_improvement',
      },
    ],
    parentFeedback: [
      {
        teacherId: 'teacher_1',
        teacherName: 'Marie N\'Guessan',
        averageSatisfaction: 9.1,
        feedbackCount: 12,
        topComplaints: ['Parfois un peu rapide', 'Devoirs nombreux'],
        topPraises: ['Très pédagogue', 'Excellente communication', 'Résultats visibles'],
      },
      {
        teacherId: 'teacher_2',
        teacherName: 'Jean Baptiste',
        averageSatisfaction: 8.3,
        feedbackCount: 8,
        topComplaints: ['Ponctualité à améliorer'],
        topPraises: ['Patient avec les enfants', 'Méthodique'],
      },
    ],
    alerts: [
      {
        type: 'performance',
        severity: 'medium',
        message: 'Sarah Diallo: Note moyenne en baisse (13.5/20)',
        teacherId: 'teacher_3',
      },
      {
        type: 'satisfaction',
        severity: 'low',
        message: 'Jean Baptiste: Retards signalés par 2 parents',
        teacherId: 'teacher_2',
      },
      {
        type: 'attendance',
        severity: 'high',
        message: '3 élèves avec taux d\'absentéisme > 20%',
      },
    ],
  };

  useEffect(() => {
    if (visible) {
      loadAnalyticsData();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, selectedPeriod]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAnalyticsData(demoAnalyticsData);
    setLoading(false);
  };

  const handleExportAnalytics = async () => {
    // Simuler l'export des données analytiques
    await exportMultipleReportsToExcel([], { 
      format: 'excel',
      template: 'summary'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'excellent': return '#10B981';
      case 'good': return '#3B82F6';
      case 'needs_improvement': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const renderMetricCard = (title: string, value: string, icon: React.ReactNode, trend?: number) => (
    <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
      <View style={styles.metricHeader}>
        {icon}
        <Text style={[styles.metricTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      {trend !== undefined && (
        <View style={styles.metricTrend}>
          {trend > 0 ? (
            <TrendingUp color="#10B981" size={16} />
          ) : (
            <TrendingDown color="#EF4444" size={16} />
          )}
          <Text style={[styles.trendText, { color: trend > 0 ? '#10B981' : '#EF4444' }]}>
            {Math.abs(trend)}%
          </Text>
        </View>
      )}
    </View>
  );

  const renderTeacherPerformanceCard = (teacher: typeof demoAnalyticsData.teacherPerformance[0]) => (
    <View key={teacher.id} style={[styles.teacherCard, { backgroundColor: colors.card }]}>
      <View style={styles.teacherHeader}>
        <Text style={[styles.teacherName, { color: colors.text }]}>{teacher.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(teacher.status) }]}>
          <Text style={styles.statusText}>
            {teacher.status === 'excellent' ? 'Excellent' :
             teacher.status === 'good' ? 'Bon' : 'À améliorer'}
          </Text>
        </View>
      </View>
      
      <View style={styles.teacherMetrics}>
        <View style={styles.teacherMetric}>
          <Star color="#F59E0B" size={16} />
          <Text style={[styles.metricText, { color: colors.text }]}>
            {teacher.averageGrade}/20
          </Text>
        </View>
        <View style={styles.teacherMetric}>
          <Users color="#3B82F6" size={16} />
          <Text style={[styles.metricText, { color: colors.text }]}>
            {teacher.parentSatisfaction}/10
          </Text>
        </View>
        <View style={styles.teacherMetric}>
          <FileText color="#10B981" size={16} />
          <Text style={[styles.metricText, { color: colors.text }]}>
            {teacher.reportCount} rapports
          </Text>
        </View>
        <View style={styles.teacherMetric}>
          <Target color="#8B5CF6" size={16} />
          <Text style={[styles.metricText, { color: colors.text }]}>
            {teacher.aiUsage}% IA
          </Text>
        </View>
      </View>
    </View>
  );

  const renderAlert = (alert: typeof demoAnalyticsData.alerts[0], index: number) => (
    <View key={index} style={[styles.alertCard, { backgroundColor: colors.card }]}>
      <View style={styles.alertHeader}>
        <AlertTriangle color={getSeverityColor(alert.severity)} size={20} />
        <Text style={[styles.alertMessage, { color: colors.text }]}>{alert.message}</Text>
      </View>
      <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) + '20' }]}>
        <Text style={[styles.severityText, { color: getSeverityColor(alert.severity) }]}>
          {alert.severity === 'high' ? 'Urgent' :
           alert.severity === 'medium' ? 'Modéré' : 'Faible'}
        </Text>
      </View>
    </View>
  );

  if (!visible || !analyticsData) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <Text style={styles.headerTitle}>📊 Analytics Rapports</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportAnalytics}
          >
            <Download color="#FFFFFF" size={20} />
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Filtres de période */}
          <View style={styles.periodFilters}>
            {(['month', 'quarter', 'year'] as const).map(period => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && { backgroundColor: colors.primary }
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodText,
                  { color: selectedPeriod === period ? '#FFFFFF' : colors.text }
                ]}>
                  {period === 'month' ? 'Mois' :
                   period === 'quarter' ? 'Trimestre' : 'Année'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Métriques principales */}
          <View style={styles.metricsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              📈 Indicateurs Clés
            </Text>
            <View style={styles.metricsGrid}>
              {renderMetricCard(
                'Note Moyenne Enseignants',
                `${analyticsData.performanceMetrics.teacherAverageGrade}/20`,
                <Star color="#F59E0B" size={24} />,
                +2.3
              )}
              {renderMetricCard(
                'Satisfaction Parents',
                `${analyticsData.performanceMetrics.parentSatisfactionRate}/10`,
                <Users color="#10B981" size={24} />,
                +1.8
              )}
              {renderMetricCard(
                'Taux de Completion',
                `${analyticsData.performanceMetrics.reportCompletionRate}%`,
                <CheckCircle color="#3B82F6" size={24} />,
                +5.2
              )}
              {renderMetricCard(
                'Usage IA',
                `${analyticsData.performanceMetrics.aiSuggestionsUsageRate}%`,
                <Target color="#8B5CF6" size={24} />,
                +12.7
              )}
            </View>
          </View>

          {/* Performance des enseignants */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              👨‍🏫 Performance Enseignants
            </Text>
            {analyticsData.teacherPerformance.map(renderTeacherPerformanceCard)}
          </View>

          {/* Alertes qualité */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🚨 Alertes Qualité
            </Text>
            {analyticsData.alerts.map(renderAlert)}
          </View>

          {/* Feedback parents détaillé */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              💬 Feedback Parents Détaillé
            </Text>
            {analyticsData.parentFeedback.map((feedback, index) => (
              <View key={index} style={[styles.feedbackCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.feedbackTeacher, { color: colors.text }]}>
                  {feedback.teacherName}
                </Text>
                <View style={styles.feedbackMetrics}>
                  <Text style={[styles.feedbackStat, { color: colors.text }]}>
                    Note: {feedback.averageSatisfaction}/10
                  </Text>
                  <Text style={[styles.feedbackStat, { color: colors.text }]}>
                    {feedback.feedbackCount} évaluations
                  </Text>
                </View>
                
                <View style={styles.feedbackSection}>
                  <Text style={[styles.feedbackLabel, { color: '#10B981' }]}>
                    ✅ Points forts:
                  </Text>
                  {feedback.topPraises.map((praise, i) => (
                    <Text key={i} style={[styles.feedbackItem, { color: colors.text }]}>
                      • {praise}
                    </Text>
                  ))}
                </View>

                {feedback.topComplaints.length > 0 && (
                  <View style={styles.feedbackSection}>
                    <Text style={[styles.feedbackLabel, { color: '#F59E0B' }]}>
                      ⚠️ Points d'amélioration:
                    </Text>
                    {feedback.topComplaints.map((complaint, i) => (
                      <Text key={i} style={[styles.feedbackItem, { color: colors.text }]}>
                        • {complaint}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  exportText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  periodFilters: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  periodText: {
    fontWeight: '600',
    fontSize: 14,
  },
  metricsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '48%',
    padding: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  teacherCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teacherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  teacherMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teacherMetric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  alertCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  feedbackCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackTeacher: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  feedbackMetrics: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  feedbackStat: {
    fontSize: 14,
    fontWeight: '500',
  },
  feedbackSection: {
    marginBottom: 12,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  feedbackItem: {
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 2,
  },
}); 