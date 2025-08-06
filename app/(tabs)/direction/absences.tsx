import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Eye,
  Bell,
  MessageCircle,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface AbsenceRecord {
  id: string;
  teacherName: string;
  teacherEmail: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  subject: string;
  absenceDate: string;
  absenceTime: string;
  reason: string;
  makeUpDate: string;
  makeUpTime: string;
  makeUpDuration: string;
  location: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  submissionDate: string;
}

export default function DirectionAbsencesScreen() {
  const { colors } = useTheme();
  const [absences, setAbsences] = useState<AbsenceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Données fictives pour la démonstration
  const demoAbsences: AbsenceRecord[] = [
    {
      id: 'ABS-001',
      teacherName: 'Pierre Martin',
      teacherEmail: 'pierre.martin@astra-training.com',
      studentName: 'Marie Kouassi',
      parentName: 'Jean Kouassi',
      parentPhone: '+225 0701234567',
      parentEmail: 'jean.kouassi@email.com',
      subject: 'Mathématiques',
      absenceDate: '20/01/2024',
      absenceTime: '14:00',
      reason: 'Maladie',
      makeUpDate: '25/01/2024',
      makeUpTime: '15:00',
      makeUpDuration: '2h',
      location: 'Centre AS-Training',
      notes: 'Étudiante fiévreuse, rattrapage programmé',
      status: 'pending',
      submissionDate: '20/01/2024 14:30',
    },
    {
      id: 'ABS-002',
      teacherName: 'Sophie Dupont',
      teacherEmail: 'sophie.dupont@astra-training.com',
      studentName: 'Pierre Yao',
      parentName: 'Sophie Yao',
      parentPhone: '+225 0702345678',
      parentEmail: 'sophie.yao@email.com',
      subject: 'Physique',
      absenceDate: '19/01/2024',
      absenceTime: '16:00',
      reason: 'Rendez-vous médical',
      makeUpDate: '26/01/2024',
      makeUpTime: '14:00',
      makeUpDuration: '1h30',
      location: 'Domicile',
      notes: 'Consultation médicale prévue',
      status: 'approved',
      submissionDate: '19/01/2024 16:15',
    },
  ];

  useEffect(() => {
    loadAbsences();
  }, []);

  const loadAbsences = async () => {
    setLoading(true);
    // Simuler un chargement
    setTimeout(() => {
      setAbsences(demoAbsences);
      setLoading(false);
    }, 1000);
  };

  const handleApprove = (absence: AbsenceRecord) => {
    Alert.alert(
      'Approuver l\'absence',
      `Êtes-vous sûr d'approuver l'absence de ${absence.studentName} ?\n\nCette action va :\n• Notifier l'enseignant ${absence.teacherName}\n• Envoyer un SMS au parent ${absence.parentName}\n• Envoyer une notification push au parent`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Approuver',
          style: 'default',
          onPress: () => {
            setAbsences(prev => 
              prev.map(abs => 
                abs.id === absence.id 
                  ? { ...abs, status: 'approved' as const }
                  : abs
              )
            );
            
            // Simuler l'envoi de notifications
            setTimeout(() => {
              Alert.alert(
                '✅ Absence approuvée',
                `Signalement d'absence approuvé pour ${absence.studentName}\n\n📱 Notifications envoyées :\n• ✅ Notification push à ${absence.teacherName}\n• ✅ SMS à ${absence.parentName} (${absence.parentPhone})\n• ✅ Notification push au parent\n\nLe rattrapage est maintenant confirmé pour le ${absence.makeUpDate} à ${absence.makeUpTime}`,
                [{ text: 'OK' }]
              );
            }, 500);
          },
        },
      ]
    );
  };

  const handleReject = (absence: AbsenceRecord) => {
    Alert.alert(
      'Rejeter l\'absence',
      `Êtes-vous sûr de rejeter l'absence de ${absence.studentName} ?\n\nCette action va :\n• Notifier l'enseignant ${absence.teacherName}\n• Envoyer un SMS au parent ${absence.parentName}\n• Envoyer une notification push au parent\n\n⚠️ Le rattrapage programmé sera annulé`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Rejeter',
          style: 'destructive',
          onPress: () => {
            setAbsences(prev => 
              prev.map(abs => 
                abs.id === absence.id 
                  ? { ...abs, status: 'rejected' as const }
                  : abs
              )
            );
            
            // Simuler l'envoi de notifications
            setTimeout(() => {
              Alert.alert(
                '❌ Absence rejetée',
                `Signalement d'absence rejeté pour ${absence.studentName}\n\n📱 Notifications envoyées :\n• ✅ Notification push à ${absence.teacherName}\n• ✅ SMS à ${absence.parentName} (${absence.parentPhone})\n• ✅ Notification push au parent\n\n⚠️ Le rattrapage programmé pour le ${absence.makeUpDate} a été annulé`,
                [{ text: 'OK' }]
              );
            }, 500);
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertTriangle size={16} color="#F59E0B" />;
      case 'approved':
        return <CheckCircle size={16} color="#10B981" />;
      case 'rejected':
        return <XCircle size={16} color="#EF4444" />;
      default:
        return <AlertTriangle size={16} color="#6B7280" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvée';
      case 'rejected':
        return 'Rejetée';
      default:
        return 'Inconnu';
    }
  };

  const AbsenceCard = ({ absence }: { absence: AbsenceRecord }) => (
    <View style={[styles.absenceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={[styles.studentName, { color: colors.text }]}>{absence.studentName}</Text>
          <Text style={[styles.subject, { color: colors.text + '60' }]}>{absence.subject}</Text>
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
          <Text style={[styles.label, { color: colors.text }]}>Enseignant:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{absence.teacherName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.text }]}>Parent:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{absence.parentName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.text }]}>Matières:</Text>
          <View style={styles.subjectsContainer}>
            <View style={[styles.subjectTag, { backgroundColor: '#DC2626' + '20' }]}>
              <Text style={[styles.subjectText, { color: '#DC2626', fontWeight: 'bold' }]}>{absence.subject}</Text>
            </View>
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
              Absence: {absence.absenceDate} à {absence.absenceTime}
            </Text>
          </View>
          <View style={styles.dateTimeItem}>
            <Clock size={14} color={colors.text} />
            <Text style={[styles.dateTimeText, { color: colors.text }]}>
              Rattrapage: {absence.makeUpDate} à {absence.makeUpTime} ({absence.makeUpDuration})
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.text }]}>Lieu:</Text>
          <View style={styles.locationContainer}>
            <User size={14} color={colors.text} />
            <Text style={[styles.value, { color: colors.text }]}>{absence.location}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.text }]}>Contact:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{absence.parentPhone}</Text>
        </View>

        {absence.notes && (
          <View style={styles.notesContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Notes:</Text>
            <Text style={[styles.notesText, { color: colors.text }]}>{absence.notes}</Text>
          </View>
        )}
      </View>

      {absence.status === 'pending' && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(absence)}
          >
            <CheckCircle size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Approuver</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(absence)}
          >
            <XCircle size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Rejeter</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={['#EF4444', '#F87171', '#FCA5A5']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="#FFFFFF" size={20} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Signalements d'absences</Text>
            <View style={styles.headerIcon}>
              <AlertTriangle color="#FFFFFF" size={20} />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.loadingContainer}>
          <AlertTriangle color={colors.text} size={48} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement des signalements...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#EF4444', '#F87171', '#FCA5A5']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Signalements d'absences</Text>
          <View style={styles.headerIcon}>
            <AlertTriangle color="#FFFFFF" size={20} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <AlertTriangle color="#F59E0B" size={24} />
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {absences.filter(a => a.status === 'pending').length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>En attente</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <CheckCircle color="#10B981" size={24} />
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {absences.filter(a => a.status === 'approved').length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Approuvées</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <XCircle color="#EF4444" size={24} />
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {absences.filter(a => a.status === 'rejected').length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Rejetées</Text>
          </View>
        </View>

        <View style={styles.absencesSection}>
          {absences.length > 0 ? (
            <View style={styles.absencesList}>
              {absences.map((absence) => (
                <AbsenceCard key={absence.id} absence={absence} />
              ))}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <AlertTriangle color={colors.text} size={48} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Aucun signalement d'absence
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.text }]}>
                Les enseignants signaleront les absences ici
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerIcon: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  absencesSection: {
    flex: 1,
  },
  absencesList: {
    gap: 16,
  },
  absenceCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subject: {
    fontSize: 14,
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
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
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
}); 