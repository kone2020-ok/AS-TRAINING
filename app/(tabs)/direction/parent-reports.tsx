import React, { useState, useEffect, useMemo } from 'react';
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
  Star,
  Clock,
  BarChart,
  Users,
  MessageCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
} from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import {
  ParentTeacherReport,
  DirectionReportSummary,
  ReportFilters,
  ReportStats,
  SATISFACTION_LABELS,
  FREQUENCY_LABELS,
  PROGRESS_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_COLORS,
  MONTHS_LABELS,
  formatReportPeriod,
} from '../../../types/Report';
import { useReportExport } from '../../../components/ReportExportService';
import ReportAnalyticsDashboard from '../../../components/ReportAnalyticsDashboard';
import { useRouter } from 'expo-router';

// Données de démonstration pour la Direction
const demoParentReports: DirectionReportSummary['parentReports'] = [
  {
    id: 'RPT-P-2401-XYZ789',
    parentName: 'Jean Kouassi',
    teacherName: 'Marie N\'Guessan',
    studentName: 'Marie Kouassi',
    month: 0, // Janvier
    year: 2024,
    satisfactionGlobale: 8.5,
    status: 'submitted',
    createdAt: '2024-01-25T16:30:00Z',
  },
  {
    id: 'RPT-P-2401-ABC456',
    parentName: 'Jean Kouassi',
    teacherName: 'Jean Baptiste',
    studentName: 'Marie Kouassi',
    month: 0, // Janvier
    year: 2024,
    satisfactionGlobale: 7.0,
    status: 'submitted',
    createdAt: '2024-01-28T14:15:00Z',
  },
  {
    id: 'RPT-P-2401-DEF123',
    parentName: 'Fatou Traoré',
    teacherName: 'Marie N\'Guessan',
    studentName: 'Amadou Traoré',
    month: 0, // Janvier
    year: 2024,
    satisfactionGlobale: 9.0,
    status: 'submitted',
    createdAt: '2024-01-30T11:45:00Z',
  },
  {
    id: 'RPT-P-2401-GHI789',
    parentName: 'Emmanuel Koffi',
    teacherName: 'Sarah Diallo',
    studentName: 'Sarah Koffi',
    month: 1, // Février
    year: 2024,
    satisfactionGlobale: 6.5,
    status: 'submitted',
    createdAt: '2024-02-05T09:20:00Z',
  },
];

const demoTeachers = [
  { id: 'teacher_1', name: 'Marie N\'Guessan', subjects: ['Mathématiques', 'Physique'] },
  { id: 'teacher_2', name: 'Jean Baptiste', subjects: ['Français', 'Histoire'] },
  { id: 'teacher_3', name: 'Sarah Diallo', subjects: ['Chimie', 'SVT'] },
];

const demoParents = [
  { id: 'parent_1', name: 'Jean Kouassi' },
  { id: 'parent_2', name: 'Fatou Traoré' },
  { id: 'parent_3', name: 'Emmanuel Koffi' },
];

// Simuler les détails complets d'un rapport
const getDemoReportDetails = (reportId: string): Partial<ParentTeacherReport> => {
  const baseReport = demoParentReports.find(r => r.id === reportId);
  if (!baseReport) return {};

  return {
    id: reportId,
    parentId: 'parent_1',
    parentName: baseReport.parentName,
    teacherId: 'teacher_1',
    teacherName: baseReport.teacherName,
    studentId: 'student_1',
    studentName: baseReport.studentName,
    month: baseReport.month,
    year: baseReport.year,
    status: baseReport.status,
    createdAt: baseReport.createdAt,
    content: {
      q1_prestation_generale: 'tres_satisfait',
      q1_prestation_details: 'Excellente enseignante, très professionnelle dans son approche pédagogique.',
      q2_ponctualite: 'toujours',
      q2_ponctualite_details: 'Toujours à l\'heure, très ponctuelle.',
      q3_methodes_pedagogiques: 'tres_satisfait',
      q3_methodes_details: 'Méthodes modernes et adaptées au niveau de l\'enfant.',
      q4_communication: 'satisfait',
      q4_communication_details: 'Communication régulière et constructive.',
      q5_progres_constates: 'amelioration',
      q5_progres_details: 'Nette amélioration en mathématiques depuis le début des cours.',
      q6_recommandations: 'Continuer avec la même approche.',
      q6_suggestions_amelioration: 'Peut-être ajouter plus d\'exercices pratiques.',
      q7_satisfaction_globale: baseReport.satisfactionGlobale,
      q7_commentaire_global: 'Très satisfait de cette enseignante, nous recommandons fortement.',
      materiel_fourni_adequat: true,
      environnement_cours_adequat: true,
      frequence_communication_suffisante: true,
      recommanderiez_enseignant: true,
    },
  };
};

export default function DirectionParentReportsScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const router = useRouter();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<DirectionReportSummary['parentReports']>([]);
  const [filteredReports, setFilteredReports] = useState<DirectionReportSummary['parentReports']>([]);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Partial<ParentTeacherReport> | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);

  // États des filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ReportFilters>({
    month: undefined,
    year: undefined,
    teacherId: undefined,
    parentId: undefined,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { exportMultipleReportsToExcel, exportParentReportToPDF } = useReportExport();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReports(demoParentReports);
      setFilteredReports(demoParentReports);
      setLoading(false);
    };

    loadData();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredReportsMemo = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch =
        report.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.studentName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMonth = filters.month === undefined || report.month === filters.month;
      const matchesYear = filters.year === undefined || report.year === filters.year;
      const matchesTeacher =
        !filters.teacherId ||
        demoTeachers.some(t => t.id === filters.teacherId && t.name === report.teacherName);
      const matchesParent =
        !filters.parentId ||
        demoParents.some(p => p.id === filters.parentId && p.name === report.parentName);

      return matchesSearch && matchesMonth && matchesYear && matchesTeacher && matchesParent;
    });
  }, [searchQuery, filters, reports]);

  useEffect(() => {
    setFilteredReports(filteredReportsMemo);
  }, [filteredReportsMemo]);

  const getStats = (): ReportStats => {
    const total = filteredReports.length;
    const averageSatisfaction =
      total > 0
        ? Math.round((filteredReports.reduce((sum, r) => sum + r.satisfactionGlobale, 0) / total) * 10) / 10
        : 0;

    const submittedThisMonth = filteredReports.filter(
      r => r.month === new Date().getMonth() && r.year === new Date().getFullYear(),
    ).length;

    return {
      totalReports: total,
      submittedThisMonth,
      pendingReports: 0,
      completedReports: total,
      averageSatisfaction,
    };
  };

  const getTeacherStats = () => {
    const teacherRatings: Record<string, number[]> = {};

    filteredReports.forEach(report => {
      if (!teacherRatings[report.teacherName]) {
        teacherRatings[report.teacherName] = [];
      }
      teacherRatings[report.teacherName].push(report.satisfactionGlobale);
    });

    return Object.entries(teacherRatings)
      .map(([teacher, ratings]) => ({
        teacher,
        averageRating: Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10,
        totalReports: ratings.length,
      }))
      .sort((a, b) => b.averageRating - a.averageRating);
  };

  const clearFilters = () => {
    setFilters({
      month: undefined,
      year: undefined,
      teacherId: undefined,
      parentId: undefined,
    });
    setSearchQuery('');
  };

  const handleViewDetails = async (reportId: string) => {
    setLoading(true);
    try {
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
      [{ text: 'OK' }],
    );
  };

  const handleExportExcel = async () => {
    const allReports = reports.map(report => getDemoReportDetails(report.id) as any);
    await exportMultipleReportsToExcel(allReports, {
      format: 'excel',
      template: 'detailed',
    });
  };

  const handleExportReportPDF = async (reportId: string) => {
    const reportDetails = getDemoReportDetails(reportId) as any;
    if (reportDetails) {
      await exportParentReportToPDF(reportDetails, {
        format: 'pdf',
        template: 'standard',
      });
    }
  };

  const stats = getStats();
  const teacherStats = getTeacherStats();

  const renderStatsCards = () => (
    <View style={styles.statsSection}>
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
          <FileText color="#10B981" size={24} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats.totalReports}</Text>
          <Text style={[styles.statLabel, { color: '#6B7280' }]}>Total rapports</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
          <Star color="#F59E0B" size={24} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats.averageSatisfaction?.toFixed(1) || '0'}/10</Text>
          <Text style={[styles.statLabel, { color: '#6B7280' }]}>Satisfaction moy.</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
          <Calendar color="#3B82F6" size={24} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats.submittedThisMonth}</Text>
          <Text style={[styles.statLabel, { color: '#6B7280' }]}>Ce mois</Text>
        </View>
      </View>
    </View>
  );

  if (loading && reports.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.pageTitle}>Rapports Parents</Text>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Clock color={colors.primary} size={48} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Chargement des rapports...</Text>
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
          <Text style={[styles.pageTitle, { color: '#FFFFFF' }]}>📊 Rapports Parents</Text>
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
          <View
            style={[styles.welcomeSection, { backgroundColor: colors.card, borderBottomColor: colors.border, marginHorizontal: isDesktop ? -20 : -12 }]}
          >
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>Supervision Complète des Rapports Parents</Text>
            <Text style={[styles.welcomeSubtitle, { color: '#6B7280' }]}>Accédez aux analyses détaillées et à l'historique des évaluations</Text>
          </View>

          {/* Stats Cards */}
          {renderStatsCards()}

          {/* Actions et recherche */}
          <View style={styles.actionsSection}>
            <View style={styles.searchContainer}>
              <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Search color="#6B7280" size={20} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Rechercher parent, enseignant, élève..."
                  placeholderTextColor="#6B7280"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity
                style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Filter color="#6B7280" size={20} />
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
                          selectedValue={filters.month === undefined ? '' : filters.month}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, month: value === '' ? undefined : Number(value) }))}
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
                          selectedValue={filters.year === undefined ? '' : filters.year}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, year: value === '' ? undefined : Number(value) }))}
                          style={[styles.picker, { color: colors.text }]}
                        >
                          <Picker.Item label="Toutes les années" value="" />
                          <Picker.Item label="2024" value={2024} />
                          <Picker.Item label="2025" value={2025} />
                        </Picker>
                      </View>
                    </View>
                  </View>

                  <View style={styles.filterRow}>
                    <View style={styles.filterField}>
                      <Text style={[styles.filterLabel, { color: colors.text }]}>Enseignant</Text>
                      <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                        <Picker
                          selectedValue={filters.teacherId || ''}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, teacherId: value === '' ? undefined : value }))}
                          style={[styles.picker, { color: colors.text }]}
                        >
                          <Picker.Item label="Tous les enseignants" value="" />
                          {demoTeachers.map((teacher) => (
                            <Picker.Item key={teacher.id} label={teacher.name} value={teacher.id} />
                          ))}
                        </Picker>
                      </View>
                    </View>

                    <View style={styles.filterField}>
                      <Text style={[styles.filterLabel, { color: colors.text }]}>Parent</Text>
                      <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                        <Picker
                          selectedValue={filters.parentId || ''}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, parentId: value === '' ? undefined : value }))}
                          style={[styles.picker, { color: colors.text }]}
                        >
                          <Picker.Item label="Tous les parents" value="" />
                          {demoParents.map((parent) => (
                            <Picker.Item key={parent.id} label={parent.name} value={parent.id} />
                          ))}
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance par Enseignant</Text>
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
                    <Text style={[styles.ratingText, { color: colors.text }]}>{stat.averageRating.toFixed(1)}</Text>
                  </View>
                  <View style={[styles.ratingBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.ratingFill,
                        {
                          width: `${(stat.averageRating / 10) * 100}%`,
                          backgroundColor:
                            stat.averageRating >= 8 ? '#10B981' : stat.averageRating >= 6 ? '#F59E0B' : '#EF4444',
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Liste des rapports */}
          <View style={styles.reportsSection}>
            <View style={styles.sectionHeader}>
              <Users color={colors.primary} size={20} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Rapports reçus ({filteredReports.length})</Text>
            </View>

            {filteredReports.length > 0 ? (
              <View style={styles.reportsList}>
                {filteredReports.map((report) => (
                  <View key={report.id} style={[styles.reportCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                    <View style={styles.reportPreview}>
                      <View style={styles.reportInfo}>
                        <View style={styles.reportHeader}>
                          <Text style={[styles.parentName, { color: colors.text }]}>{report.parentName}</Text>
                          <View style={styles.ratingWrapper}>
                            <Star color="#F59E0B" size={16} />
                            <Text style={[styles.rating, { color: colors.text }]}>{report.satisfactionGlobale.toFixed(1)}/10</Text>
                          </View>
                        </View>

                        <Text style={[styles.teacherInfo, { color: colors.textSecondary }]}>Évaluation de {report.teacherName}</Text>
                        <Text style={[styles.studentInfo, { color: colors.textSecondary }]}>Enfant: {report.studentName}</Text>
                        <Text style={[styles.reportDate, { color: colors.textSecondary }]}>
                          {formatReportPeriod(report.month, report.year)} • {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                        </Text>
                      </View>

                      <View style={styles.reportActions}>
                        <View style={[styles.statusBadge, { backgroundColor: REPORT_STATUS_COLORS[report.status] + '20' }]}>
                          <Text style={[styles.statusText, { color: REPORT_STATUS_COLORS[report.status] }]}>
                            {REPORT_STATUS_LABELS[report.status]}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.expandButton, { backgroundColor: colors.background }]}
                      onPress={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                    >
                      <Text style={[styles.expandButtonText, { color: colors.primary }]}>
                        {expandedReport === report.id ? 'Masquer' : 'Actions'}
                      </Text>
                      {expandedReport === report.id ? <ChevronUp color={colors.primary} size={16} /> : <ChevronDown color={colors.primary} size={16} />}
                    </TouchableOpacity>

                    {expandedReport === report.id && (
                      <View style={[styles.reportActionsExpanded, { backgroundColor: colors.background }]}>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.primary }]}
                          onPress={() => handleViewDetails(report.id)}
                        >
                          <Eye color={colors.background} size={16} />
                          <Text style={[styles.actionButtonText, { color: colors.background }]}>Voir détails</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.primary }]}
                          onPress={() => handleExportReportPDF(report.id)}
                        >
                          <Download color={colors.background} size={16} />
                          <Text style={[styles.actionButtonText, { color: colors.background }]}>Export PDF</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                <MessageCircle color={colors.textSecondary} size={48} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucun rapport trouvé</Text>
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Détails du Rapport</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Text style={[styles.closeButton, { color: colors.primary }]}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {selectedReport && (
                <View>
                  {/* Informations générales */}
                  <View style={[styles.detailSection, { backgroundColor: colors.background }]}>
                    <Text style={[styles.detailSectionTitle, { color: colors.text }]}>Informations Générales</Text>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Parent:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{selectedReport.parentName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Enseignant:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{selectedReport.teacherName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Élève:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{selectedReport.studentName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Période:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {selectedReport.month !== undefined && selectedReport.year
                          ? formatReportPeriod(selectedReport.month, selectedReport.year)
                          : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Note globale:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {selectedReport.content?.q7_satisfaction_globale || 'N/A'}/10
                      </Text>
                    </View>
                  </View>

                  {/* Évaluations détaillées */}
                  <View style={[styles.detailSection, { backgroundColor: colors.background }]}>
                    <Text style={[styles.detailSectionTitle, { color: colors.text }]}>Évaluations Détaillées</Text>

                    <View style={styles.evaluationItem}>
                      <Text style={[styles.evaluationLabel, { color: colors.text }]}>Prestation générale</Text>
                      <Text style={[styles.evaluationValue, { color: colors.textSecondary }]}>
                        {selectedReport.content?.q1_prestation_generale
                          ? SATISFACTION_LABELS[selectedReport.content.q1_prestation_generale]
                          : 'N/A'}
                      </Text>
                      <Text style={[styles.evaluationDetails, { color: colors.text }]}>
                        {selectedReport.content?.q1_prestation_details || 'Aucun détail fourni'}
                      </Text>
                    </View>

                    <View style={styles.evaluationItem}>
                      <Text style={[styles.evaluationLabel, { color: colors.text }]}>Ponctualité</Text>
                      <Text style={[styles.evaluationValue, { color: colors.textSecondary }]}>
                        {selectedReport.content?.q2_ponctualite
                          ? FREQUENCY_LABELS[selectedReport.content.q2_ponctualite]
                          : 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.evaluationItem}>
                      <Text style={[styles.evaluationLabel, { color: colors.text }]}>Méthodes pédagogiques</Text>
                      <Text style={[styles.evaluationValue, { color: colors.textSecondary }]}>
                        {selectedReport.content?.q3_methodes_pedagogiques
                          ? SATISFACTION_LABELS[selectedReport.content.q3_methodes_pedagogiques]
                          : 'N/A'}
                      </Text>
                      <Text style={[styles.evaluationDetails, { color: colors.text }]}>
                        {selectedReport.content?.q3_methodes_details || 'Aucun détail fourni'}
                      </Text>
                    </View>

                    <View style={styles.evaluationItem}>
                      <Text style={[styles.evaluationLabel, { color: colors.text }]}>Communication</Text>
                      <Text style={[styles.evaluationValue, { color: colors.textSecondary }]}>
                        {selectedReport.content?.q4_communication
                          ? SATISFACTION_LABELS[selectedReport.content.q4_communication]
                          : 'N/A'}
                      </Text>
                      <Text style={[styles.evaluationDetails, { color: colors.text }]}>
                        {selectedReport.content?.q4_communication_details || 'Aucun détail fourni'}
                      </Text>
                    </View>

                    <View style={styles.evaluationItem}>
                      <Text style={[styles.evaluationLabel, { color: colors.text }]}>Progrès constatés</Text>
                      <Text style={[styles.evaluationValue, { color: colors.textSecondary }]}>
                        {selectedReport.content?.q5_progres_constates
                          ? PROGRESS_LABELS[selectedReport.content.q5_progres_constates]
                          : 'N/A'}
                      </Text>
                      <Text style={[styles.evaluationDetails, { color: colors.text }]}>
                        {selectedReport.content?.q5_progres_details || 'Aucun détail fourni'}
                      </Text>
                    </View>
                  </View>

                  {/* Recommandations */}
                  <View style={[styles.detailSection, { backgroundColor: colors.background }]}>
                    <Text style={[styles.detailSectionTitle, { color: colors.text }]}>Recommandations et Commentaires</Text>

                    <View style={styles.evaluationItem}>
                      <Text style={[styles.evaluationLabel, { color: colors.text }]}>Recommandations</Text>
                      <Text style={[styles.evaluationDetails, { color: colors.text }]}>
                        {selectedReport.content?.q6_recommandations || 'Aucune recommandation'}
                      </Text>
                    </View>

                    <View style={styles.evaluationItem}>
                      <Text style={[styles.evaluationLabel, { color: colors.text }]}>Suggestions d'amélioration</Text>
                      <Text style={[styles.evaluationDetails, { color: colors.text }]}>
                        {selectedReport.content?.q6_suggestions_amelioration || 'Aucune suggestion'}
                      </Text>
                    </View>

                    <View style={styles.evaluationItem}>
                      <Text style={[styles.evaluationLabel, { color: colors.text }]}>Commentaire global</Text>
                      <Text style={[styles.evaluationDetails, { color: colors.text }]}>
                        {selectedReport.content?.q7_commentaire_global || 'Aucun commentaire'}
                      </Text>
                    </View>

                    <View style={styles.evaluationItem}>
                      <Text style={[styles.evaluationLabel, { color: colors.text }]}>Recommande l'enseignant</Text>
                      <Text
                        style={[
                          styles.evaluationValue,
                          { color: selectedReport.content?.recommanderiez_enseignant ? '#10B981' : '#EF4444' },
                        ]}
                      >
                        {selectedReport.content?.recommanderiez_enseignant ? '✅ Oui' : '❌ Non'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowDetailsModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Analytics Dashboard */}
      {showAnalyticsDashboard && (
        <ReportAnalyticsDashboard visible={showAnalyticsDashboard} onClose={() => setShowAnalyticsDashboard(false)} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
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
  parentName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
  },
  teacherInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
  studentInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
  },
  reportActions: {
    alignItems: 'flex-end',
  },
  reportActionsExpanded: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
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
    marginLeft: 8,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButton: {
    marginRight: 16,
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