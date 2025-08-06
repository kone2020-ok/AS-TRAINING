import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Plus
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import AbsenceRattrapageModal from '../../../components/AbsenceRattrapageModal';

interface AbsenceRecord {
  id: string;
  studentName: string;
  parentName: string;
  subjects: string[];
  reason: string;
  absenceDate: string;
  makeUpDate: string;
  makeUpTime: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  notes: string;
  createdAt: string;
}

export default function TeacherAbsencesScreen() {
  const [absences, setAbsences] = useState<AbsenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { colors } = useTheme();

  // Données de démonstration
  const demoAbsences: AbsenceRecord[] = [
    {
      id: '1',
      studentName: 'Marie Kouassi',
      parentName: 'Jean Kouassi',
      subjects: ['Mathématiques', 'Physique'],
      reason: 'Maladie',
      absenceDate: '15/01/2024',
      makeUpDate: '20/01/2024',
      makeUpTime: '14:00',
      location: 'Domicile',
      status: 'approved',
      notes: 'Cours de rattrapage programmé pour les matières manquées',
      createdAt: '15/01/2024',
    },
    {
      id: '2',
      studentName: 'Yao Patricia',
      parentName: 'Kouadio Yao',
      subjects: ['Français'],
      reason: 'Rendez-vous médical',
      absenceDate: '18/01/2024',
      makeUpDate: '22/01/2024',
      makeUpTime: '16:00',
      location: 'Domicile',
      status: 'pending',
      notes: 'Absence justifiée par certificat médical',
      createdAt: '18/01/2024',
    },
    {
      id: '3',
      studentName: 'Kouame Boris',
      parentName: 'Akoua Kouame',
      subjects: ['Mathématiques', 'Physique', 'Chimie'],
      reason: 'Voyage familial',
      absenceDate: '20/01/2024',
      makeUpDate: '25/01/2024',
      makeUpTime: '10:00',
      location: 'Autre famille',
      status: 'completed',
      notes: 'Rattrapage effectué avec succès',
      createdAt: '20/01/2024',
    },
  ];

  useEffect(() => {
    loadAbsences();
  }, []);

  const loadAbsences = () => {
    setLoading(true);
    // Simulation du chargement
    setTimeout(() => {
      setAbsences(demoAbsences);
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      case 'completed':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon size={16} color="#F59E0B" />;
      case 'approved':
        return <CheckCircle size={16} color="#10B981" />;
      case 'rejected':
        return <XCircle size={16} color="#EF4444" />;
      case 'completed':
        return <CheckCircle size={16} color="#3B82F6" />;
      default:
        return <ClockIcon size={16} color="#6B7280" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      case 'completed':
        return 'Terminé';
      default:
        return 'Inconnu';
    }
  };

  const handleAbsenceSubmit = (absenceData: any) => {
    const newAbsence: AbsenceRecord = {
      id: Date.now().toString(),
      studentName: absenceData.student,
      parentName: 'Parent de ' + absenceData.student,
      subjects: absenceData.subjects,
      reason: absenceData.reason,
      absenceDate: absenceData.absenceDate,
      makeUpDate: absenceData.makeUpDate,
      makeUpTime: absenceData.makeUpTime,
      location: absenceData.location,
      status: 'pending',
      notes: absenceData.notes,
      createdAt: new Date().toLocaleDateString('fr-FR'),
    };

    setAbsences(prev => [newAbsence, ...prev]);
    setShowModal(false);

    Alert.alert(
      'Signalement envoyé',
      'Votre signalement d\'absence a été envoyé à la direction et aux parents concernés.',
      [{ text: 'OK' }]
    );
  };

  const AbsenceCard = ({ absence }: { absence: AbsenceRecord }) => (
    <View style={[styles.absenceCard, { borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.studentInfo}>
          <User size={16} color={colors.text} />
          <Text style={[styles.studentName, { color: colors.text }]}>
            {absence.studentName}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(absence.status) + '20' }]}>
          {getStatusIcon(absence.status)}
          <Text style={[styles.statusText, { color: getStatusColor(absence.status) }]}>
            {getStatusLabel(absence.status)}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.text }]}>Parent:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{absence.parentName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.text }]}>Matières:</Text>
          <View style={styles.subjectsContainer}>
            {absence.subjects.map((subject, index) => (
              <View key={index} style={[styles.subjectTag, { backgroundColor: '#DC2626' + '20' }]}>
                <Text style={[styles.subjectText, { color: '#DC2626', fontWeight: 'bold' }]}>{subject}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.text }]}>Raison:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{absence.reason}</Text>
        </View>

        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeItem}>
            <Calendar size={14} color={colors.text} />
            <Text style={[styles.dateTimeText, { color: colors.text }]}>
              Absence: {absence.absenceDate}
            </Text>
          </View>
          <View style={styles.dateTimeItem}>
            <Clock size={14} color={colors.text} />
            <Text style={[styles.dateTimeText, { color: colors.text }]}>
              Rattrapage: {absence.makeUpDate} à {absence.makeUpTime}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.text }]}>Lieu:</Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color={colors.text} />
            <Text style={[styles.value, { color: colors.text }]}>{absence.location}</Text>
          </View>
        </View>

        {absence.notes && (
          <View style={styles.notesContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Notes:</Text>
            <Text style={[styles.notesText, { color: colors.text }]}>{absence.notes}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={['#1E40AF', '#3B82F6']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <AlertTriangle color="#FFFFFF" size={24} />
          <Text style={styles.headerTitle}>Signalements d'Absences</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <Plus color="#FFFFFF" size={20} />
          <Text style={styles.addButtonText}>Nouveau</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderStats = () => {
    const stats = {
      total: absences.length,
      pending: absences.filter(a => a.status === 'pending').length,
      approved: absences.filter(a => a.status === 'approved').length,
      completed: absences.filter(a => a.status === 'completed').length,
    };

    return (
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{stats.pending}</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>En attente</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.approved}</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Approuvés</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: '#3B82F6' }]}>{stats.completed}</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Terminés</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderStats()}
        
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Mes Signalements ({absences.length})
          </Text>
          
          {absences.length === 0 ? (
            <View style={styles.emptyContainer}>
              <AlertTriangle size={48} color={colors.text} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Aucun signalement
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.text }]}>
                Vous n'avez pas encore signalé d'absences
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowModal(true)}
              >
                <Plus color="#FFFFFF" size={16} />
                <Text style={styles.emptyButtonText}>Signaler une absence</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.absencesList}>
              {absences.map((absence) => (
                <AbsenceCard key={absence.id} absence={absence} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <AbsenceRattrapageModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAbsenceSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
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
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  absencesList: {
    gap: 16,
  },
  absenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
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
  value: {
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
  dateTimeContainer: {
    marginVertical: 8,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dateTimeText: {
    fontSize: 14,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  notesText: {
    fontSize: 14,
    fontStyle: 'italic',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
}); 