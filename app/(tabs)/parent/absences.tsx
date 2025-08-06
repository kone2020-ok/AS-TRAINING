import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  MapPin,
  MessageCircle,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Loader,
  BookOpen
} from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';

interface AbsenceRecord {
  id: string;
  studentName: string;
  teacherName: string;
  parentName: string;
  absenceDate: string;
  absenceTime: string;
  rattrapageDate: string;
  rattrapageTime: string;
  location: string;
  reason: string;
  subjects: string[];
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  dateCreation: string;
  dateValidation?: string;
  motifRejet?: string;
}

export default function ParentAbsencesScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [absences, setAbsences] = useState<AbsenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [expandedAbsence, setExpandedAbsence] = useState<string | null>(null);

  // Données de démonstration pour les signalements d'absence des enfants du parent
  const demoAbsences: AbsenceRecord[] = [
    {
      id: 'ABS-2401-001',
      studentName: 'Marie Kouassi',
      teacherName: 'Traoré Amadou',
      parentName: 'Jean Kouassi',
      absenceDate: '15/01/2024',
      absenceTime: '14:00',
      rattrapageDate: '20/01/2024',
      rattrapageTime: '14:00',
      location: 'Domicile',
      reason: 'Maladie',
      subjects: ['Mathématiques', 'Physique'],
      notes: 'Cours de rattrapage programmé pour les matières manquées',
      status: 'approved',
      dateCreation: '2024-01-15T14:30:00Z',
      dateValidation: '2024-01-15T16:00:00Z',
    },
    {
      id: 'ABS-2401-002',
      studentName: 'Junior Kouassi',
      teacherName: 'Fatou Koné',
      parentName: 'Jean Kouassi',
      absenceDate: '18/01/2024',
      absenceTime: '16:00',
      rattrapageDate: '22/01/2024',
      rattrapageTime: '16:00',
      location: 'Centre de formation',
      reason: 'Rendez-vous médical',
      subjects: ['Français', 'Histoire'],
      notes: 'Absence justifiée par certificat médical',
      status: 'pending',
      dateCreation: '2024-01-18T16:30:00Z',
    },
    {
      id: 'ABS-2401-003',
      studentName: 'Marie Kouassi',
      teacherName: 'Mamadou Diabaté',
      parentName: 'Jean Kouassi',
      absenceDate: '20/01/2024',
      absenceTime: '15:00',
      rattrapageDate: '25/01/2024',
      rattrapageTime: '15:00',
      location: 'Domicile',
      reason: 'Problème de transport',
      subjects: ['Anglais'],
      notes: 'Rattrapage programmé pour la semaine suivante',
      status: 'rejected',
      dateCreation: '2024-01-20T15:30:00Z',
      motifRejet: 'Absence non justifiée, problème de transport non valide',
    },
  ];

  useEffect(() => {
    const loadAbsences = async () => {
      // Simulation du chargement
      setTimeout(() => {
        setAbsences(demoAbsences);
        setLoading(false);
      }, 1000);
    };

    loadAbsences();

    // Animation d'entrée
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

  const getFilteredAbsences = () => {
    if (filter === 'all') return absences;
    return absences.filter(absence => absence.status === filter);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle color="#10B981" size={20} />;
      case 'rejected':
        return <XCircle color="#EF4444" size={20} />;
      case 'pending':
        return <Clock color="#F59E0B" size={20} />;
      default:
        return <AlertTriangle color="#6B7280" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      case 'pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      case 'pending':
        return 'En attente';
      default:
        return 'Inconnu';
    }
  };

  const AbsenceCard = ({ absence }: { absence: AbsenceRecord }) => {
    const isExpanded = expandedAbsence === absence.id;

    return (
      <View style={[styles.absenceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.studentInfo}>
              <Text style={[styles.studentName, { color: colors.text }]}>
                {absence.studentName}
              </Text>
              <Text style={[styles.teacherName, { color: colors.textSecondary }]}>
                {absence.teacherName}
              </Text>
            </View>
            <View style={styles.statusContainer}>
              {getStatusIcon(absence.status)}
              <Text style={[styles.statusText, { color: getStatusColor(absence.status) }]}>
                {getStatusLabel(absence.status)}
              </Text>
            </View>
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.basicInfo}>
          <View style={styles.infoRow}>
            <Calendar size={16} color={colors.text + '60'} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Absence: {absence.absenceDate} à {absence.absenceTime}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Clock size={16} color="#10B981" />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Rattrapage: {absence.rattrapageDate} à {absence.rattrapageTime}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <AlertTriangle size={16} color="#EF4444" />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Raison: {absence.reason}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={16} color={colors.text + '60'} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Lieu: {absence.location}
            </Text>
          </View>

          {/* Matières */}
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.text }]}>Matières:</Text>
            <View style={styles.subjectsContainer}>
              {absence.subjects.map((subject, index) => (
                <View key={index} style={[styles.subjectTag, { backgroundColor: '#DC2626' + '20' }]}>
                  <Text style={[styles.subjectText, { color: '#DC2626', fontWeight: 'bold' }]}>
                    {subject}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {absence.notes && (
            <View style={styles.notesContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Notes:</Text>
              <Text style={[styles.notesText, { color: colors.text }]}>{absence.notes}</Text>
            </View>
          )}

          {/* Informations de validation/rejet */}
          {absence.status === 'rejected' && absence.motifRejet && (
            <View style={[styles.rejectionContainer, { backgroundColor: '#FEF2F2' }]}>
              <XCircle color="#EF4444" size={16} />
              <Text style={[styles.rejectionText, { color: '#EF4444' }]}>
                Motif du rejet: {absence.motifRejet}
              </Text>
            </View>
          )}

          {absence.status === 'approved' && absence.dateValidation && (
            <View style={[styles.approvalContainer, { backgroundColor: '#F0FDF4' }]}>
              <CheckCircle color="#10B981" size={16} />
              <Text style={[styles.approvalText, { color: '#10B981' }]}>
                Approuvé le {new Date(absence.dateValidation).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const filteredAbsences = getFilteredAbsences();
  const stats = {
    total: absences.length,
    pending: absences.filter(a => a.status === 'pending').length,
    approved: absences.filter(a => a.status === 'approved').length,
    rejected: absences.filter(a => a.status === 'rejected').length,
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={['#EF4444', '#F87171']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.pageTitle}>Signalements d'Absence</Text>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Loader color={colors.primary} size={48} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement des signalements...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fixed Header */}
      <LinearGradient colors={['#EF4444', '#F87171']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>Signalements d'Absence</Text>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.pending}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>En attente</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.approved}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Approuvés</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.rejected}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rejetés</Text>
            </View>
          </View>

          {/* Filters */}
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { key: 'all', label: 'Tous', count: stats.total },
                { key: 'pending', label: 'En attente', count: stats.pending },
                { key: 'approved', label: 'Approuvés', count: stats.approved },
                { key: 'rejected', label: 'Rejetés', count: stats.rejected },
              ].map((filterOption) => (
                <TouchableOpacity
                  key={filterOption.key}
                  style={[
                    styles.filterButton,
                    filter === filterOption.key && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setFilter(filterOption.key as any)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      { color: filter === filterOption.key ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {filterOption.label} ({filterOption.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Absences List */}
          <View style={styles.absencesList}>
            {filteredAbsences.length === 0 ? (
              <View style={styles.emptyState}>
                <AlertTriangle color={colors.textSecondary} size={48} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Aucun signalement
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  {filter === 'all'
                    ? 'Aucun signalement d\'absence pour vos enfants'
                    : `Aucun signalement ${filter === 'pending' ? 'en attente' : filter === 'approved' ? 'approuvé' : 'rejeté'}`}
                </Text>
              </View>
            ) : (
              filteredAbsences.map((absence) => (
                <AbsenceCard key={absence.id} absence={absence} />
              ))
            )}
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
  header: {
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  filtersContainer: {
    marginBottom: 24,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  absencesList: {
    gap: 16,
  },
  absenceCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  teacherName: {
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  basicInfo: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    width: 80,
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  subjectTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 12,
  },
  notesText: {
    fontSize: 14,
    flex: 1,
  },
  rejectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  rejectionText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  approvalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  approvalText: {
    fontSize: 14,
    fontWeight: '500',
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
}); 