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
  TrendingUp,
  TrendingDown,
  Star,
  Award,
  AlertTriangle,
  Target,
  CheckCircle,
  Clock,
  BarChart,
  Users,
  BookOpen,
  Calendar,
  Download,
  Filter,
  GraduationCap
} from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import {
  Grade,
  Bulletin,
  GradesStats,
  BulletinsStats,
  PerformanceAnalytics,
  PerformanceAlert,
  GRADE_SUBJECTS,
  PERFORMANCE_LEVEL_COLORS,
  getPerformanceLevel,
  calculateTrend
} from '../types/Grades';

interface AcademicAnalyticsData {
  gradesStats: GradesStats;
  bulletinsStats: BulletinsStats;
  studentsAnalytics: PerformanceAnalytics[];
  performanceAlerts: PerformanceAlert[];
  teacherPerformance: Array<{
    teacherId: string;
    teacherName: string;
    averageGradeGiven: number;
    studentsCount: number;
    subjectsCount: number;
    parentSatisfaction: number;
    gradesDistribution: Record<string, number>;
    trendDirection: 'improving' | 'stable' | 'declining';
  }>;
  academicTrends: {
    monthlyPerformance: Array<{
      month: string;
      averageGrade: number;
      gradeCount: number;
      passRate: number;
      excellenceRate: number;
    }>;
    subjectComparison: Array<{
      subject: string;
      averageGrade: number;
      studentsCount: number;
      teachersCount: number;
      difficultyLevel: 'easy' | 'medium' | 'hard';
    }>;
  };
}

interface AcademicAnalyticsDashboardProps {
  visible: boolean;
  onClose: () => void;
}

export default function AcademicAnalyticsDashboard({ visible, onClose }: AcademicAnalyticsDashboardProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [fadeAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'trimester' | 'year'>('month');
  const [analyticsData, setAnalyticsData] = useState<AcademicAnalyticsData | null>(null);

  // Données de démonstration enrichies
  const demoAnalyticsData: AcademicAnalyticsData = {
    gradesStats: {
      totalGrades: 156,
      averageGrade: 14.2,
      bestGrade: 19.5,
      worstGrade: 6.0,
      passRate: 84.6,
      excellenceRate: 32.1,
      subjectPerformance: [
        { subject: 'Mathématiques', average: 15.8, gradeCount: 28, trend: 'improving' },
        { subject: 'Français', average: 13.2, gradeCount: 25, trend: 'stable' },
        { subject: 'Physique-Chimie', average: 14.7, gradeCount: 22, trend: 'improving' },
        { subject: 'Histoire-Géographie', average: 12.9, gradeCount: 18, trend: 'declining' },
        { subject: 'SVT', average: 16.1, gradeCount: 20, trend: 'improving' },
      ],
      monthlyEvolution: [
        { month: 'Oct', average: 13.8, gradeCount: 38 },
        { month: 'Nov', average: 14.1, gradeCount: 42 },
        { month: 'Déc', average: 14.5, gradeCount: 36 },
        { month: 'Jan', average: 14.2, gradeCount: 40 },
      ],
      performanceDistribution: {
        excellent: 18,
        tres_bien: 25,
        bien: 31,
        passable: 20,
        insuffisant: 6,
      },
    },
    bulletinsStats: {
      totalBulletins: 48,
      byTrimester: { 1: 18, 2: 15, 3: 15 },
      byYear: { 2024: 30, 2025: 18 },
      averageRank: 8.4,
      averageClassSize: 26.3,
      uploadCompletionRate: 89.6,
    },
    studentsAnalytics: [
      {
        studentId: 'student_1',
        studentName: 'Kouadio Aya',
        overallAverage: 15.8,
        gradesTrend: 'improving',
        strongestSubjects: ['Mathématiques', 'Physique-Chimie'],
        weakestSubjects: ['Histoire-Géographie'],
        recentPerformance: {
          lastMonth: 16.2,
          lastTrimester: 15.4,
          improvementNeeded: false,
        },
        parentalEngagement: {
          bulletinsUploaded: 2,
          expectedBulletins: 2,
          engagementRate: 100,
        },
        teacherFeedback: {
          positiveComments: 8,
          concernComments: 1,
          totalComments: 9,
        },
      },
      {
        studentId: 'student_2',
        studentName: 'N\'Dri Kevin',
        overallAverage: 12.3,
        gradesTrend: 'stable',
        strongestSubjects: ['SVT'],
        weakestSubjects: ['Mathématiques', 'Français'],
        recentPerformance: {
          lastMonth: 11.8,
          lastTrimester: 12.1,
          improvementNeeded: true,
        },
        parentalEngagement: {
          bulletinsUploaded: 1,
          expectedBulletins: 2,
          engagementRate: 50,
        },
        teacherFeedback: {
          positiveComments: 3,
          concernComments: 4,
          totalComments: 7,
        },
      },
    ],
    performanceAlerts: [
      {
        id: 'alert_1',
        studentId: 'student_2',
        studentName: 'N\'Dri Kevin',
        parentId: 'parent_1',
        teacherId: 'teacher_1',
        subject: 'Mathématiques',
        alertType: 'consecutive_fails',
        severity: 'high',
        currentGrade: 8.5,
        previousGrades: [9.0, 8.0, 7.5],
        trend: -15.7,
        message: 'Baisse continue des résultats en mathématiques',
        recommendations: [
          'Séances de soutien recommandées',
          'Révision des bases fondamentales',
          'Suivi renforcé par les parents'
        ],
        createdAt: '2025-01-15T10:00:00Z',
        isRead: false,
        isResolved: false,
      },
    ],
    teacherPerformance: [
      {
        teacherId: 'teacher_1',
        teacherName: 'Marie N\'Guessan',
        averageGradeGiven: 14.8,
        studentsCount: 12,
        subjectsCount: 2,
        parentSatisfaction: 8.7,
        gradesDistribution: {
          'excellent': 22,
          'tres_bien': 28,
          'bien': 35,
          'passable': 12,
          'insuffisant': 3,
        },
        trendDirection: 'improving',
      },
      {
        teacherId: 'teacher_2',
        teacherName: 'Jean Baptiste',
        averageGradeGiven: 13.2,
        studentsCount: 8,
        subjectsCount: 2,
        parentSatisfaction: 7.9,
        gradesDistribution: {
          'excellent': 15,
          'tres_bien': 20,
          'bien': 40,
          'passable': 20,
          'insuffisant': 5,
        },
        trendDirection: 'stable',
      },
    ],
    academicTrends: {
      monthlyPerformance: [
        { month: 'Sep', averageGrade: 13.5, gradeCount: 35, passRate: 82.1, excellenceRate: 28.6 },
        { month: 'Oct', averageGrade: 13.8, gradeCount: 38, passRate: 84.2, excellenceRate: 31.2 },
        { month: 'Nov', averageGrade: 14.1, gradeCount: 42, passRate: 85.7, excellenceRate: 33.3 },
        { month: 'Déc', averageGrade: 14.5, gradeCount: 36, passRate: 88.9, excellenceRate: 36.1 },
        { month: 'Jan', averageGrade: 14.2, gradeCount: 40, passRate: 87.5, excellenceRate: 35.0 },
      ],
      subjectComparison: [
        { subject: 'Mathématiques', averageGrade: 15.8, studentsCount: 15, teachersCount: 2, difficultyLevel: 'medium' },
        { subject: 'SVT', averageGrade: 16.1, studentsCount: 12, teachersCount: 1, difficultyLevel: 'easy' },
        { subject: 'Physique-Chimie', averageGrade: 14.7, studentsCount: 14, teachersCount: 1, difficultyLevel: 'medium' },
        { subject: 'Français', averageGrade: 13.2, studentsCount: 16, teachersCount: 2, difficultyLevel: 'hard' },
        { subject: 'Histoire-Géographie', averageGrade: 12.9, studentsCount: 10, teachersCount: 1, difficultyLevel: 'hard' },
      ],
    },
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
    // Simulation export analytics académiques
    console.log('Export des analytics académiques...');
  };

  const getPerformanceColor = (value: number, type: 'grade' | 'rate'): string => {
    if (type === 'grade') {
      if (value >= 16) return '#10B981';
      if (value >= 14) return '#22C55E';
      if (value >= 12) return '#84CC16';
      if (value >= 10) return '#F59E0B';
      return '#EF4444';
    } else {
      if (value >= 80) return '#10B981';
      if (value >= 70) return '#22C55E';
      if (value >= 60) return '#84CC16';
      if (value >= 50) return '#F59E0B';
      return '#EF4444';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp color="#10B981" size={16} />;
      case 'declining': return <TrendingDown color="#EF4444" size={16} />;
      default: return <Target color="#6B7280" size={16} />;
    }
  };

  const renderMetricCard = (title: string, value: string, icon: React.ReactNode, subtitle?: string, trend?: number) => (
    <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
      <View style={styles.metricHeader}>
        {icon}
        <Text style={[styles.metricTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      {subtitle && (
        <Text style={[styles.metricSubtitle, { color: colors.text + '80' }]}>{subtitle}</Text>
      )}
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

  const renderSubjectCard = (subject: typeof demoAnalyticsData.gradesStats.subjectPerformance[0]) => (
    <View key={subject.subject} style={[styles.subjectCard, { backgroundColor: colors.card }]}>
      <View style={styles.subjectHeader}>
        <Text style={[styles.subjectName, { color: colors.text }]}>{subject.subject}</Text>
        {getTrendIcon(subject.trend)}
      </View>
      <View style={styles.subjectMetrics}>
        <Text style={[styles.subjectAverage, { color: getPerformanceColor(subject.average, 'grade') }]}>
          {subject.average}/20
        </Text>
        <Text style={[styles.subjectCount, { color: colors.text + '80' }]}>
          {subject.gradeCount} notes
        </Text>
      </View>
    </View>
  );

  const renderStudentCard = (student: PerformanceAnalytics) => (
    <View key={student.studentId} style={[styles.studentCard, { backgroundColor: colors.card }]}>
      <View style={styles.studentHeader}>
        <Text style={[styles.studentName, { color: colors.text }]}>{student.studentName}</Text>
        <View style={styles.studentBadges}>
          <View style={[styles.trendBadge, { backgroundColor: getPerformanceColor(student.overallAverage, 'grade') + '20' }]}>
            <Text style={[styles.trendText, { color: getPerformanceColor(student.overallAverage, 'grade') }]}>
              {student.overallAverage}/20
            </Text>
          </View>
          {getTrendIcon(student.gradesTrend)}
        </View>
      </View>
      
      <View style={styles.studentDetails}>
        <View style={styles.studentMetric}>
          <Text style={[styles.metricLabel, { color: colors.text + '80' }]}>Points forts:</Text>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {student.strongestSubjects.join(', ')}
          </Text>
        </View>
        
        {student.weakestSubjects.length > 0 && (
          <View style={styles.studentMetric}>
            <Text style={[styles.metricLabel, { color: colors.text + '80' }]}>À améliorer:</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {student.weakestSubjects.join(', ')}
            </Text>
          </View>
        )}
        
        <View style={styles.engagementRow}>
          <Text style={[styles.metricLabel, { color: colors.text + '80' }]}>
            Engagement parental: {student.parentalEngagement.engagementRate}%
          </Text>
          <Text style={[styles.metricLabel, { color: colors.text + '80' }]}>
            Feedback: {student.teacherFeedback.positiveComments}+ / {student.teacherFeedback.concernComments}-
          </Text>
        </View>
      </View>
    </View>
  );

  const renderAlertCard = (alert: PerformanceAlert) => (
    <View key={alert.id} style={[styles.alertCard, { backgroundColor: colors.card }]}>
      <View style={styles.alertHeader}>
        <AlertTriangle color={alert.severity === 'high' ? '#EF4444' : alert.severity === 'medium' ? '#F59E0B' : '#10B981'} size={20} />
        <View style={styles.alertInfo}>
          <Text style={[styles.alertStudent, { color: colors.text }]}>{alert.studentName}</Text>
          <Text style={[styles.alertSubject, { color: colors.text + '80' }]}>{alert.subject}</Text>
        </View>
        <Text style={[styles.alertGrade, { color: '#EF4444' }]}>{alert.currentGrade}/20</Text>
      </View>
      
      <Text style={[styles.alertMessage, { color: colors.text }]}>{alert.message}</Text>
      
      <View style={styles.alertRecommendations}>
        <Text style={[styles.recommendationsTitle, { color: colors.text }]}>Recommandations:</Text>
        {alert.recommendations.map((rec, index) => (
          <Text key={index} style={[styles.recommendationItem, { color: colors.text + '80' }]}>
            • {rec}
          </Text>
        ))}
      </View>
    </View>
  );

  if (!visible || !analyticsData) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <Text style={styles.headerTitle}>📊 Analytics Académiques</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportAnalytics}>
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
            {(['month', 'trimester', 'year'] as const).map(period => (
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
                   period === 'trimester' ? 'Trimestre' : 'Année'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Métriques principales */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🎯 Indicateurs Globaux
            </Text>
            <View style={styles.metricsGrid}>
              {renderMetricCard(
                'Moyenne Générale',
                `${analyticsData.gradesStats.averageGrade}/20`,
                <Star color="#F59E0B" size={24} />,
                `${analyticsData.gradesStats.totalGrades} notes`,
                +2.8
              )}
              {renderMetricCard(
                'Taux de Réussite',
                `${analyticsData.gradesStats.passRate}%`,
                <CheckCircle color="#10B981" size={24} />,
                'Notes ≥ 10/20',
                +3.2
              )}
              {renderMetricCard(
                'Taux d\'Excellence',
                `${analyticsData.gradesStats.excellenceRate}%`,
                <Award color="#8B5CF6" size={24} />,
                'Notes ≥ 16/20',
                +5.1
              )}
              {renderMetricCard(
                'Bulletins Uploadés',
                `${analyticsData.bulletinsStats.uploadCompletionRate}%`,
                <GraduationCap color="#3B82F6" size={24} />,
                `${analyticsData.bulletinsStats.totalBulletins} bulletins`,
                +8.4
              )}
            </View>
          </View>

          {/* Performance par matière */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              📚 Performance par Matière
            </Text>
            <View style={styles.subjectsGrid}>
              {analyticsData.gradesStats.subjectPerformance.map(renderSubjectCard)}
            </View>
          </View>

          {/* Analyse des élèves */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              👨‍🎓 Analyse des Élèves
            </Text>
            {analyticsData.studentsAnalytics.map(renderStudentCard)}
          </View>

          {/* Alertes de performance */}
          {analyticsData.performanceAlerts.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                🚨 Alertes de Performance
              </Text>
              {analyticsData.performanceAlerts.map(renderAlertCard)}
            </View>
          )}

          {/* Comparaison des enseignants */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              👨‍🏫 Performance Enseignants
            </Text>
            {analyticsData.teacherPerformance.map((teacher, index) => (
              <View key={teacher.teacherId} style={[styles.teacherCard, { backgroundColor: colors.card }]}>
                <View style={styles.teacherHeader}>
                  <Text style={[styles.teacherName, { color: colors.text }]}>{teacher.teacherName}</Text>
                  {getTrendIcon(teacher.trendDirection)}
                </View>
                <View style={styles.teacherMetrics}>
                  <View style={styles.teacherMetric}>
                    <Text style={[styles.metricLabel, { color: colors.text + '80' }]}>Moyenne donnée:</Text>
                    <Text style={[styles.metricValue, { color: getPerformanceColor(teacher.averageGradeGiven, 'grade') }]}>
                      {teacher.averageGradeGiven}/20
                    </Text>
                  </View>
                  <View style={styles.teacherMetric}>
                    <Text style={[styles.metricLabel, { color: colors.text + '80' }]}>Élèves suivis:</Text>
                    <Text style={[styles.metricValue, { color: colors.text }]}>{teacher.studentsCount}</Text>
                  </View>
                  <View style={styles.teacherMetric}>
                    <Text style={[styles.metricLabel, { color: colors.text + '80' }]}>Satisfaction:</Text>
                    <Text style={[styles.metricValue, { color: getPerformanceColor(teacher.parentSatisfaction * 2, 'grade') }]}>
                      {teacher.parentSatisfaction}/10
                    </Text>
                  </View>
                </View>
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
  section: {
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
  metricSubtitle: {
    fontSize: 12,
    marginBottom: 8,
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
  subjectsGrid: {
    gap: 12,
  },
  subjectCard: {
    padding: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
  },
  subjectMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectAverage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subjectCount: {
    fontSize: 14,
  },
  studentCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  studentBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  studentDetails: {
    gap: 8,
  },
  studentMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: 14,
    flex: 1,
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alertCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertInfo: {
    flex: 1,
    marginLeft: 12,
  },
  alertStudent: {
    fontSize: 16,
    fontWeight: '600',
  },
  alertSubject: {
    fontSize: 14,
  },
  alertGrade: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertMessage: {
    fontSize: 14,
    marginBottom: 12,
  },
  alertRecommendations: {
    gap: 4,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationItem: {
    fontSize: 14,
    marginLeft: 8,
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
  teacherMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teacherMetric: {
    alignItems: 'center',
  },
}); 