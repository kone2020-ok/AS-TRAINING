import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search,
  Filter,
  Calendar,
  FileText,
  User,
  Star,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  BarChart,
  Users,
  Award,
  GraduationCap,
  Brain,
  ArrowLeft
} from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import {
  TeacherStudentReport,
  TeacherReportView,
  DirectionReportSummary,
  ReportFilters,
  ReportStats,
  ATTITUDE_LABELS,
  ATTENTION_LABELS,
  COMPREHENSION_LABELS,
  PROGRESS_LABELS,
  APPLICATION_LABELS,
  INVOLVEMENT_LABELS,
  APPRECIATION_LABELS,
  FREQUENCY_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_COLORS,
  MONTHS_LABELS,
  formatReportPeriod,
  getProgressColor,
  getAppreciationColor
} from '../../../types/Report';
import ReportAnalyticsDashboard from '../../../components/ReportAnalyticsDashboard';
import { useRouter } from 'expo-router';

// Données de démonstration pour la Direction
const demoTeacherReports: DirectionReportSummary['teacherReports'] = [
  {
    id: 'RPT-T-2401-ABC123',
    teacherName: 'Marie N\'Guessan',
    studentName: 'Marie Kouassi',
    parentName: 'Jean Kouassi',
    month: 0, // Janvier
    year: 2024,
    overallGrade: 16.5,
    status: 'completed',
    createdAt: '2024-01-20T10:30:00Z',
  },
  {
    id: 'RPT-T-2401-DEF456',
    teacherName: 'Marie N\'Guessan',
    studentName: 'Amadou Traoré',
    parentName: 'Fatou Traoré',
    month: 0, // Janvier
    year: 2024,
    overallGrade: 12.0,
    status: 'submitted',
    createdAt: '2024-01-22T14:15:00Z',
  },
  {
    id: 'RPT-T-2401-GHI789',
    teacherName: 'Jean Baptiste',
    studentName: 'Marie Kouassi',
    parentName: 'Jean Kouassi',
    month: 0, // Janvier
    year: 2024,
    overallGrade: 14.5,
    status: 'completed',
    createdAt: '2024-01-25T16:45:00Z',
  },
  {
    id: 'RPT-T-2401-JKL012',
    teacherName: 'Sarah Diallo',
    studentName: 'Sarah Koffi',
    parentName: 'Emmanuel Koffi',
    month: 1, // Février
    year: 2024,
    overallGrade: 18.0,
    status: 'completed',
    createdAt: '2024-02-03T09:20:00Z',
  },
];

const demoTeachers = [
  { id: 'teacher_1', name: 'Marie N\'Guessan', subjects: ['Mathématiques', 'Physique'] },
  { id: 'teacher_2', name: 'Jean Baptiste', subjects: ['Français', 'Histoire'] },
  { id: 'teacher_3', name: 'Sarah Diallo', subjects: ['Chimie', 'SVT'] },
];

// Simuler les détails complets d'un rapport
const getDemoReportDetails = (reportId: string): Partial<TeacherStudentReport> => {
  const baseReport = demoTeacherReports.find(r => r.id === reportId);
  if (!baseReport) return {};

  return {
    id: reportId,
    teacherId: 'teacher_1',
    teacherName: baseReport.teacherName,
    studentId: 'student_1',
    studentName: baseReport.studentName,
    parentId: 'parent_1',
    parentName: baseReport.parentName,
    month: baseReport.month,
    year: baseReport.year,
    status: baseReport.status,
    createdAt: baseReport.createdAt,
    content: {
      // Section 1: Engagement et Compréhension
      attitude: 'tres_motive',
      attention: 'souvent',
      difficulties: 'Quelques difficultés en géométrie, mais fait des efforts constants pour progresser.',
      strengths: 'Excellente en algèbre et calcul mental. Très participative en classe.',
      comprehension: 'oui',
      complaintsFrequency: 'jamais',
      
      // Section 2: Progression et Résultats
      progressEvolution: 'amelioration',
      classApplication: 'oui_toujours',
      lastGrades: [
        { subject: 'Mathématiques', grade: 16, maxGrade: 20, comment: 'Bon travail' },
        { subject: 'Physique', grade: 14, maxGrade: 20, comment: 'Peut mieux faire' },
      ],
      necessaryAdjustments: 'Renforcer les exercices de géométrie et varier les approches pédagogiques.',
      
      // Section 3: Conditions de Travail
      workConditions: {
        hasMaterials: true,
        favorableEnvironment: true,
      },
      
      // Section 4: Implication des Parents
      parentalInvolvement: 'tres_impliques',
      needParentalSupport: false,
      
      // Section 5: Assiduité et Engagements
      attendance: {
        hasMissed: false,
      },
      
      // Section 6: Appréciation Générale
      generalAppreciation: 'tres_bien',
      overallGrade: baseReport.overallGrade,
      generalDescription: 'Excellente élève, très motivée et travailleuse. Continue sur cette voie !',
      
      // IA Suggestions
      aiSuggestions: {
        generated: true,
        recommendations: [
          'Proposer des exercices supplémentaires en géométrie',
          'Encourager la participation aux concours de mathématiques',
          'Développer les projets interdisciplinaires'
        ],
        pedagogicalAdjustments: [
          'Utiliser plus de supports visuels pour la géométrie',
          'Proposer des défis personnalisés',
          'Intégrer des applications pratiques'
        ],
        parentalSupport: [
          'Maintenir l\'encouragement quotidien',
          'Continuer le suivi des devoirs',
          'Célébrer les progrès'
        ],
        workEnvironment: [
          'Continuer avec l\'environnement actuel',
          'Ajouter des ressources géométriques',
          'Maintenir la motivation'
        ],
        generatedAt: '2024-01-20T11:00:00Z'
      },
    },
  };
};

export default function DirectionTeacherReportsScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const router = useRouter();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<DirectionReportSummary['teacherReports']>([]);
  const [filteredReports, setFilteredReports] = useState<DirectionReportSummary['teacherReports']>([]);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Partial<TeacherStudentReport> | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);

  // États des filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ReportFilters>({
    month: undefined,
    year: undefined,
    teacherId: undefined,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReports(demoTeacherReports);
      setFilteredReports(demoTeacherReports);
      setLoading(false);
    };

    loadData();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    let filtered = reports.filter(report => {
      const matchesSearch = 
        report.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.parentName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMonth = filters.month === undefined || report.month === filters.month;
      const matchesYear = filters.year === undefined || report.year === filters.year;
      const matchesTeacher = !filters.teacherId || report.teacherName.includes(filters.teacherId);

      return matchesSearch && matchesMonth && matchesYear && matchesTeacher;
    });

    setFilteredReports(filtered);
  }, [searchQuery, filters, reports]);

  const getStats = (): ReportStats => {
    const total = filteredReports.length;
    const averageGrade = total > 0 
      ? Math.round((filteredReports.reduce((sum, r) => sum + r.overallGrade, 0) / total) * 100) / 100
      : 0;
    
    const submittedThisMonth = filteredReports.filter(r => 
      r.month === new Date().getMonth() && 
      r.year === new Date().getFullYear()
    ).length;

    const completed = filteredReports.filter(r => r.status === 'completed').length;
    const pending = filteredReports.filter(r => r.status === 'submitted').length;

    return {
      totalReports: total,
      submittedThisMonth,
      pendingReports: pending,
      completedReports: completed,
      averageGrade,
    };
  };

  const getTeacherStats = () => {
    const teacherGrades: Record<string, number[]> = {};
    
    filteredReports.forEach(report => {
      if (!teacherGrades[report.teacherName]) {
        teacherGrades[report.teacherName] = [];
      }
      teacherGrades[report.teacherName].push(report.overallGrade);
    });

    return Object.entries(teacherGrades).map(([teacher, grades]) => ({
      teacher,
      averageGrade: Math.round((grades.reduce((sum, g) => sum + g, 0) / grades.length) * 100) / 100,
      totalReports: grades.length,
    })).sort((a, b) => b.averageGrade - a.averageGrade);
  };

  const getClassStats = () => {
    const gradeRanges = {
      'Excellent (18-20)': 0,
      'Très bien (16-18)': 0,
      'Bien (14-16)': 0,
      'Assez bien (12-14)': 0,
      'Passable (10-12)': 0,
      'Insuffisant (<10)': 0,
    };

    filteredReports.forEach(report => {
      if (report.overallGrade >= 18) gradeRanges['Excellent (18-20)']++;
      else if (report.overallGrade >= 16) gradeRanges['Très bien (16-18)']++;
      else if (report.overallGrade >= 14) gradeRanges['Bien (14-16)']++;
      else if (report.overallGrade >= 12) gradeRanges['Assez bien (12-14)']++;
      else if (report.overallGrade >= 10) gradeRanges['Passable (10-12)']++;
      else gradeRanges['Insuffisant (<10)']++;
    });

    return gradeRanges;
  };

  const clearFilters = () => {
    setFilters({
      month: undefined,
      year: undefined,
      teacherId: undefined,
    });
    setSearchQuery('');
  };

  const handleViewDetails = async (reportId: string) => {
    setLoading(true);
    try {
      // Simulation du chargement des détails
      await new Promise(resolve => setTimeout(resolve, 500));
      const details = getDemoReportDetails(reportId);
      setSelectedReport(details);
      setShowDetailsModal(true);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les détails du rapport');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReports = () => {
    Alert.alert(
      'Export des rapports',
      'Fonctionnalité d\'export en cours de développement. Les rapports seront exportés en PDF.',
      [{ text: 'OK' }]
    );
  };

  const stats = getStats();
  const teacherStats = getTeacherStats();
  const classStats = getClassStats();

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
        <FileText color="#10B981" size={24} />
        <Text style={[styles.statNumber, { color: colors.text }]}>{stats.totalReports}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total rapports</Text>
      </View>
      
      <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
        <Star color="#F59E0B" size={24} />
        <Text style={[styles.statNumber, { color: colors.text }]}>{stats.averageGrade?.toFixed(1) || '0'}/20</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Note moyenne</Text>
      </View>
      
      <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
        <CheckCircle color="#3B82F6" size={24} />
        <Text style={[styles.statNumber, { color: colors.text }]}>{stats.completedReports}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Terminés</Text>
      </View>
    </View>
  );

  if (loading && reports.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.pageTitle}>Rapports Enseignants</Text>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Clock color={colors.primary} size={48} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement des rapports...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.fixedHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: '#FFFFFF' }]}>📊 Rapports Enseignants</Text>
          <TouchableOpacity 
            style={styles.analyticsButton}
            onPress={() => setShowAnalyticsDashboard(true)}
          >
            <BarChart color="#FFFFFF" size={20} />
            <Text style={styles.analyticsButtonText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, paddingHorizontal: isDesktop ? 20 : 12 }]}>
          {/* Welcome Section */}
          <View style={[styles.welcomeSection, { backgroundColor: colors.card, borderBottomColor: colors.border, marginHorizontal: isDesktop ? -20 : -12 }]}>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>Supervision Complète des Rapports Enseignants</Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>Accédez aux analyses détaillées et à l'historique des rapports</Text>
          </View>

          {/* Stats Cards */}
          {renderStatsCards()}

          {/* Actions et recherche */}
          <View style={styles.actionsSection}>
            <View style={styles.searchContainer}>
              <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Search color={colors.textSecondary} size={20} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Rechercher enseignant, élève, parent..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity 
                style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Filter color={colors.textSecondary} size={20} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.exportButton, { backgroundColor: colors.primary }]}
                onPress={handleExportReports}
              >
                <Download color={colors.background} size={20} />
              </TouchableOpacity>
            </View>

            {/* Filtres avancés */}
            {showFilters && (
              <View style={[styles.filtersPanel, { backgroundColor: colors.card }]}>
                <View style={styles.filtersHeader}>
                  <Text style={[styles.filtersTitle, { color: colors.text }]}>Filtres avancés</Text>
                  <TouchableOpacity onPress={clearFilters}>
                    <Text style={[styles.clearFilters, { color: colors.primary }]}>Effacer</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.filtersContent}>
                  <View style={styles.filterRow}>
                    <View style={styles.filterField}>
                      <Text style={[styles.filterLabel, { color: colors.text }]}>Mois</Text>
                      <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                        <Picker
                          selectedValue={filters.month}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, month: value === '' ? undefined : value }))}
                          style={[styles.picker, { color: colors.text }]}
                        >
                          <Picker.Item label="Tous les mois" value="" />
                          {MONTHS_LABELS.map((month, index) => (
                            <Picker.Item key={index} label={month} value={index} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                    
                    <View style={styles.filterField}>
                      <Text style={[styles.filterLabel, { color: colors.text }]}>Année</Text>
                      <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                        <Picker
                          selectedValue={filters.year}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, year: value === '' ? undefined : value }))}
                          style={[styles.picker, { color: colors.text }]}
                        >
                          <Picker.Item label="Toutes les années" value="" />
                          <Picker.Item label="2024" value={2024} />
                          <Picker.Item label="2025" value={2025} />
                        </Picker>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Statistiques par enseignant */}
          <View style={[styles.teacherStatsSection, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <BarChart color={colors.primary} size={20} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Performance par Enseignant
              </Text>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teacherStatsScroll}>
              {teacherStats.map((stat, index) => (
                <View key={index} style={[styles.teacherStatCard, { backgroundColor: colors.background }]}>
                  <View style={styles.teacherInfo}>
                    <Text style={[styles.teacherName, { color: colors.text }]} numberOfLines={1}>
                      {stat.teacher}
                    </Text>
                    <Text style={[styles.teacherReports, { color: colors.textSecondary }]}>
                      {stat.totalReports} rapport{stat.totalReports > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.teacherRating}>
                    <Star color="#F59E0B" size={16} />
                    <Text style={[styles.ratingText, { color: colors.text }]}>
                      {stat.averageGrade.toFixed(1)}/20
                    </Text>
                  </View>
                  <View style={[
                    styles.ratingBar,
                    { backgroundColor: colors.border }
                  ]}>
                    <View style={[
                      styles.ratingFill,
                      { 
                        width: `${(stat.averageGrade / 20) * 100}%`,
                        backgroundColor: stat.averageGrade >= 16 ? '#10B981' : 
                                       stat.averageGrade >= 12 ? '#F59E0B' : '#EF4444'
                      }
                    ]} />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Répartition des notes */}
          <View style={[styles.gradeDistributionSection, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Award color={colors.primary} size={20} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Répartition des Notes
              </Text>
            </View>

            <View style={styles.gradeDistribution}>
              {Object.entries(classStats).map(([range, count]) => (
                <View key={range} style={styles.gradeItem}>
                  <Text style={[styles.gradeRange, { color: colors.text }]}>
                    {range}
                  </Text>
                  <View style={styles.gradeBarContainer}>
                    <View style={[
                      styles.gradeBar,
                      { backgroundColor: colors.border }
                    ]}>
                      <View style={[
                        styles.gradeBarFill,
                        { 
                          width: `${stats.totalReports > 0 ? (count / stats.totalReports) * 100 : 0}%`,
                          backgroundColor: range.includes('Excellent') || range.includes('Très bien') ? '#10B981' :
                                         range.includes('Bien') || range.includes('Assez bien') ? '#F59E0B' :
                                         range.includes('Passable') ? '#EF4444' : '#DC2626'
                        }
                      ]} />
                    </View>
                    <Text style={[styles.gradeCount, { color: colors.text }]}>
                      {count}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Liste des rapports */}
          <View style={styles.reportsSection}>
            <View style={styles.sectionHeader}>
              <GraduationCap color={colors.primary} size={20} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Rapports reçus ({filteredReports.length})
              </Text>
            </View>

            {filteredReports.length > 0 ? (
              <View style={styles.reportsList}>
                {filteredReports.map((report) => (
                  <View 
                    key={report.id} 
                    style={[styles.reportCard, { backgroundColor: colors.card, shadowColor: colors.text }]}
                  >
                    <View style={styles.reportPreview}>
                      <View style={styles.reportInfo}>
                        <View style={styles.reportHeader}>
                          <Text style={[styles.teacherName, { color: colors.text }]}>
                            {report.teacherName}
                          </Text>
                          <View style={styles.gradeContainer}>
                            <Star color="#F59E0B" size={16} />
                            <Text style={[styles.grade, { color: colors.text }]}>
                              {report.overallGrade.toFixed(1)}/20
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.studentInfo, { color: colors.textSecondary }]}>
                          Élève: {report.studentName}
                        </Text>
                        <Text style={[styles.parentInfo, { color: colors.textSecondary }]}>
                          Parent: {report.parentName}
                        </Text>
                        <Text style={[styles.reportDate, { color: colors.textSecondary }]}>
                          {formatReportPeriod(report.month, report.year)} • {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                        </Text>
                      </View>

                      <View style={styles.reportActions}>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: REPORT_STATUS_COLORS[report.status] + '20' }
                        ]}>
                          <Text style={[
                            styles.statusText,
                            { color: REPORT_STATUS_COLORS[report.status] }
                          ]}>
                            {REPORT_STATUS_LABELS[report.status]}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity 
                      style={[styles.expandButton, { backgroundColor: colors.background }]}
                      onPress={() => setExpandedReport(
                        expandedReport === report.id ? null : report.id
                      )}
                    >
                      <Text style={[styles.expandButtonText, { color: colors.primary }]}>
                        {expandedReport === report.id ? 'Masquer' : 'Actions'}
                      </Text>
                      {expandedReport === report.id ? (
                        <ChevronUp color={colors.primary} size={16} />
                      ) : (
                        <ChevronDown color={colors.primary} size={16} />
                      )}
                    </TouchableOpacity>
                    
                    {expandedReport === report.id && (
                      <View style={[styles.reportActions, { backgroundColor: colors.background }]}>
                        <TouchableOpacity 
                          style={[styles.actionButton, { backgroundColor: colors.primary }]}
                          onPress={() => handleViewDetails(report.id)}
                        >
                          <Eye color={colors.background} size={16} />
                          <Text style={[styles.actionButtonText, { color: colors.background }]}>
                            Voir détails
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                <FileText color={colors.textSecondary} size={48} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Aucun rapport trouvé
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Aucun rapport ne correspond à vos critères de recherche
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Modal des détails */}
      <Modal visible={showDetailsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Détails du Rapport
              </Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Text style={[styles.closeButton, { color: colors.primary }]}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {selectedReport && (
                <View>
                  {/* Informations générales */}
                  <View style={[styles.detailSection, { backgroundColor: colors.background }]}>
                    <Text style={[styles.detailSectionTitle, { color: colors.text }]}>
                      Informations Générales
                    </Text>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Enseignant:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{selectedReport.teacherName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Élève:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{selectedReport.studentName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Parent:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{selectedReport.parentName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Période:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {selectedReport.month !== undefined && selectedReport.year ? 
                          formatReportPeriod(selectedReport.month, selectedReport.year) : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Note globale:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {selectedReport.content?.overallGrade || 'N/A'}/20
                      </Text>
                    </View>
                  </View>

                  {/* Évaluations détaillées */}
                  <View style={[styles.detailSection, { backgroundColor: colors.background }]}>
                    <Text style={[styles.detailSectionTitle, { color: colors.text }]}>
                      Engagement et Compréhension
                    </Text>
                    
                    <View style={styles.evaluationItem}>
                      <Text style={[styles.evaluationLabel, { color: colors.text }]}>Attitude générale</Text>
                      <Text style={[styles.evaluationValue, { color: colors.textSecondary }]}>
                        {selectedReport.content?.attitude ? 
                          ATTITUDE_LABELS[selectedReport.content.attitude] : 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.evaluationItem}>
                      <Text style={[styles.evaluationLabel, { color: colors.text }]}>Attention/Concentration</Text>
                      <Text style={[styles.evaluationValue, { color: colors.textSecondary }]}>
                        {selectedReport.content?.attention ? 
                          ATTENTION_LABELS[selectedReport.content.attention] : 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.evaluationItem}>
                      <Text style={[styles.evaluationLabel, { color: colors.text }]}>Points forts</Text>
                      <Text style={[styles.evaluationDetails, { color: colors.text }]}>
                        {selectedReport.content?.strengths || 'Aucun détail fourni'}
                      </Text>
                    </View>

                    <View style={styles.evaluationItem}>
                      <Text style={[styles.evaluationLabel, { color: colors.text }]}>Principales difficultés</Text>
                      <Text style={[styles.evaluationDetails, { color: colors.text }]}>
                        {selectedReport.content?.difficulties || 'Aucune difficulté signalée'}
                      </Text>
                    </View>
                  </View>

                  {/* Progression et résultats */}
                  <View style={[styles.detailSection, { backgroundColor: colors.background }]}>
                    <Text style={[styles.detailSectionTitle, { color: colors.text }]}>
                      Progression et Résultats
                    </Text>
                    
                    <View style={styles.evaluationItem}>
                      <Text style={[styles.evaluationLabel, { color: colors.text }]}>Évolution des résultats</Text>
                      <Text style={[styles.evaluationValue, { color: colors.textSecondary }]}>
                        {selectedReport.content?.progressEvolution ? 
                          PROGRESS_LABELS[selectedReport.content.progressEvolution] : 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.evaluationItem}>
                      <Text style={[styles.evaluationLabel, { color: colors.text }]}>Application en classe</Text>
                      <Text style={[styles.evaluationValue, { color: colors.textSecondary }]}>
                        {selectedReport.content?.classApplication ? 
                          APPLICATION_LABELS[selectedReport.content.classApplication] : 'N/A'}
                      </Text>
                    </View>

                    {selectedReport.content?.lastGrades && selectedReport.content.lastGrades.length > 0 && (
                      <View style={styles.evaluationItem}>
                        <Text style={[styles.evaluationLabel, { color: colors.text }]}>Dernières notes</Text>
                        {selectedReport.content.lastGrades.map((grade, index) => (
                          <Text key={index} style={[styles.evaluationDetails, { color: colors.text }]}>
                            • {grade.subject}: {grade.grade}/{grade.maxGrade}
                            {grade.comment && ` - ${grade.comment}`}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Appréciation générale */}
                  <View style={[styles.detailSection, { backgroundColor: colors.background }]}>
                    <Text style={[styles.detailSectionTitle, { color: colors.text }]}>
                      Appréciation Générale
                    </Text>
                    
                    <View style={styles.evaluationItem}>
                      <Text style={[styles.evaluationLabel, { color: colors.text }]}>Appréciation</Text>
                      <Text style={[styles.evaluationValue, { color: colors.textSecondary }]}>
                        {selectedReport.content?.generalAppreciation ? 
                          APPRECIATION_LABELS[selectedReport.content.generalAppreciation] : 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.evaluationItem}>
                      <Text style={[styles.evaluationLabel, { color: colors.text }]}>Description générale</Text>
                      <Text style={[styles.evaluationDetails, { color: colors.text }]}>
                        {selectedReport.content?.generalDescription || 'Aucune description'}
                      </Text>
                    </View>

                    <View style={styles.evaluationItem}>
                      <Text style={[styles.evaluationLabel, { color: colors.text }]}>Implication parentale</Text>
                      <Text style={[styles.evaluationValue, { color: colors.textSecondary }]}>
                        {selectedReport.content?.parentalInvolvement ? 
                          INVOLVEMENT_LABELS[selectedReport.content.parentalInvolvement] : 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Suggestions IA */}
                  {selectedReport.content?.aiSuggestions?.generated && (
                    <View style={[styles.detailSection, { backgroundColor: colors.background }]}>
                      <View style={styles.aiSectionHeader}>
                        <Brain color={colors.primary} size={20} />
                        <Text style={[styles.detailSectionTitle, { color: colors.text }]}>
                          Suggestions IA
                        </Text>
                      </View>
                      
                      <View style={styles.evaluationItem}>
                        <Text style={[styles.evaluationLabel, { color: colors.text }]}>Recommandations pédagogiques</Text>
                        {selectedReport.content.aiSuggestions.recommendations.map((rec, index) => (
                          <Text key={index} style={[styles.evaluationDetails, { color: colors.text }]}>
                            • {rec}
                          </Text>
                        ))}
                      </View>

                      <View style={styles.evaluationItem}>
                        <Text style={[styles.evaluationLabel, { color: colors.text }]}>Ajustements pédagogiques</Text>
                        {selectedReport.content.aiSuggestions.pedagogicalAdjustments.map((adj, index) => (
                          <Text key={index} style={[styles.evaluationDetails, { color: colors.text }]}>
                            • {adj}
                          </Text>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowDetailsModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>
                  Fermer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Analytics Dashboard Modal */}
      {showAnalyticsDashboard && (
        <ReportAnalyticsDashboard
          visible={showAnalyticsDashboard}
          onClose={() => setShowAnalyticsDashboard(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  statsSection: {
    padding: 20,
    paddingBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  exportButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  filtersPanel: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearFilters: {
    fontSize: 14,
    fontWeight: '600',
  },
  filtersContent: {
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterField: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  teacherStatsSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  teacherStatsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  teacherStatCard: {
    width: 180,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  teacherInfo: {
    marginBottom: 8,
  },
  teacherName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  teacherReports: {
    fontSize: 12,
  },
  teacherRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  ratingFill: {
    height: '100%',
    borderRadius: 2,
  },
  gradeDistributionSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradeDistribution: {
    gap: 12,
  },
  gradeItem: {
    gap: 8,
  },
  gradeRange: {
    fontSize: 14,
    fontWeight: '600',
  },
  gradeBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gradeBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  gradeBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  gradeCount: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  reportsSection: {
    marginBottom: 20,
  },
  reportsList: {
    gap: 16,
  },
  reportCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  reportPreview: {
    padding: 16,
  },
  reportInfo: {
    flex: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  grade: {
    fontSize: 14,
    fontWeight: '600',
  },
  studentInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
  parentInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
  },
  reportActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    gap: 8,
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    margin: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  detailSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  aiSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  evaluationItem: {
    marginBottom: 16,
  },
  evaluationLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  evaluationValue: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  evaluationDetails: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fixedHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  analyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  analyticsButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    marginRight: 16,
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
  scrollContent: {
    flex: 1,
  },
});