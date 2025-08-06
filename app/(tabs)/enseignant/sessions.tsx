import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MapPin,
  Users,
  Loader,
  ChevronDown,
  X,
  Eye,
  AlertTriangle as AlertTriangleIcon
} from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { 
  TeacherSessionView,
  SessionStats,
  SESSION_STATUS_LABELS,
  SESSION_STATUS_COLORS,
  formatDuration
} from '../../../types/Session';
import SessionRegistration from '../../../components/SessionRegistration';
import AbsenceRattrapageModal from '../../../components/AbsenceRattrapageModal';

// Données de démonstration pour les séances de l'enseignant
const demoSessions: TeacherSessionView[] = [
  {
    id: 'SES-2401-ABC123',
    studentName: 'Marie Kouassi',
    parentName: 'Jean Kouassi',
    dateSeance: '2024-01-20',
    heureDebut: '14:00',
    heureFin: '16:00',
    dureeMinutes: 120,
    matieres: ['Mathématiques', 'Physique'],
    statut: 'validated',
    dateCreation: '2024-01-20T14:30:00Z',
  },
  {
    id: 'SES-2401-DEF456',
    studentName: 'Amadou Traoré',
    parentName: 'Fatou Traoré',
    dateSeance: '2024-01-22',
    heureDebut: '16:00',
    heureFin: '18:00',
    dureeMinutes: 120,
    matieres: ['Français'],
    statut: 'pending',
    dateCreation: '2024-01-22T16:30:00Z',
  },
  {
    id: 'SES-2401-GHI789',
    studentName: 'Koffi Sarah',
    parentName: 'Emmanuel Koffi',
    dateSeance: '2024-01-19',
    heureDebut: '15:00',
    heureFin: '17:00',
    dureeMinutes: 120,
    matieres: ['Mathématiques'],
    statut: 'rejected',
    dateCreation: '2024-01-19T15:30:00Z',
    motifRejet: 'Horaires incohérents avec le planning prévu',
  },
  {
    id: 'SES-2401-JKL012',
    studentName: 'Aïcha Diabaté',
    parentName: 'Ibrahim Diabaté',
    dateSeance: '2024-01-18',
    heureDebut: '18:00',
    heureFin: '20:00',
    dureeMinutes: 120,
    matieres: ['Physique', 'Chimie'],
    statut: 'validated',
    dateCreation: '2024-01-18T18:30:00Z',
  },
];

export default function TeacherSessionsScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [fadeAnim] = useState(new Animated.Value(0));
  const [modalAnim] = useState(new Animated.Value(0));
  const [sessions, setSessions] = useState<TeacherSessionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TeacherSessionView | null>(null);

  const teacherId = 'teacher_1';
  const teacherName = 'Marie N\'Guessan';

  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSessions(demoSessions);
      setLoading(false);
    };

    loadSessions();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedSession]);

  const getStats = (): SessionStats => {
    const total = sessions.length;
    const pending = sessions.filter(s => s.statut === 'pending').length;
    const validated = sessions.filter(s => s.statut === 'validated').length;
    const rejected = sessions.filter(s => s.statut === 'rejected').length;
    
    const now = new Date();
    const thisMonth = sessions.filter(s => {
      const sessionDate = new Date(s.dateSeance);
      return sessionDate.getMonth() === now.getMonth() && 
             sessionDate.getFullYear() === now.getFullYear();
    }).length;
    
    const thisWeek = sessions.filter(s => {
      const sessionDate = new Date(s.dateSeance);
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return sessionDate >= weekStart && sessionDate <= now;
    }).length;
    
    const totalMinutes = sessions
      .filter(s => s.statut === 'validated')
      .reduce((sum, s) => sum + s.dureeMinutes, 0);
    
    return {
      total,
      pending,
      validated,
      rejected,
      thisMonth,
      thisWeek,
      averageDuration: total > 0 ? Math.round(totalMinutes / total) : 0,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
    };
  };

  const handleRegistrationSuccess = () => {
    setSessions(prev => [...prev]);
    setShowRegistration(false);
  };

  const handleAbsenceSubmit = (absenceData: any) => {
    // Ici vous pourriez envoyer les données au backend
    console.log('Absence signalée:', absenceData);
    setSessions(prev => [...prev]); // Recharger les séances
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'validated':
        return <CheckCircle color={SESSION_STATUS_COLORS.validated} size={20} />;
      case 'rejected':
        return <XCircle color={SESSION_STATUS_COLORS.rejected} size={20} />;
      case 'pending':
      default:
        return <Clock color={SESSION_STATUS_COLORS.pending} size={20} />;
    }
  };

  const SessionCard = ({ session }: { session: TeacherSessionView }) => (
    <View style={[styles.sessionCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
      <View style={styles.cardContent}>
        <View style={styles.sessionInfo}>
          <Text style={[styles.studentName, { color: colors.text }]}>
            {session.studentName}
          </Text>
          <Text style={[styles.parentName, { color: colors.text }]}>
            Parent: {session.parentName}
          </Text>
          <Text style={[styles.sessionDate, { color: colors.text }]}>
            {new Date(session.dateSeance).toLocaleDateString('fr-FR')} • {session.heureDebut} - {session.heureFin}
          </Text>
        </View>
        
        <View style={styles.cardActions}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: SESSION_STATUS_COLORS[session.statut] + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: SESSION_STATUS_COLORS[session.statut] }
            ]}>
              {SESSION_STATUS_LABELS[session.statut]}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.detailsButton, { backgroundColor: colors.primary }]}
            onPress={() => setSelectedSession(session)}
          >
            <Eye color={colors.background} size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const SessionDetailsModal = () => (
    <Modal
      visible={!!selectedSession}
      animationType="none"
      transparent={true}
      onRequestClose={() => setSelectedSession(null)}
    >
             <View style={[
         styles.modalOverlay,
         {
           justifyContent: isDesktop ? 'center' : 'flex-end',
           paddingHorizontal: isDesktop ? 20 : 16,
           paddingBottom: isDesktop ? 0 : 20,
         }
       ]}>
         <Animated.View 
           style={[
             styles.modalContainer,
             {
               width: isDesktop ? Math.min(width * 0.5, 500) : '100%',
               maxHeight: isDesktop ? width * 0.5 : width * 0.9,
               borderRadius: isDesktop ? 16 : 20,
               borderBottomLeftRadius: isDesktop ? 16 : 0,
               borderBottomRightRadius: isDesktop ? 16 : 0,
              opacity: modalAnim,
              transform: [{
                scale: modalAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              }],
            },
          ]}
        >
          <LinearGradient colors={['#059669', '#10B981']} style={[
            styles.modalHeader,
            {
              paddingVertical: isDesktop ? 20 : 24,
              paddingHorizontal: isDesktop ? 24 : 20,
            }
          ]}>
            <Text style={[
              styles.modalTitle,
              {
                fontSize: isDesktop ? 20 : 18,
                paddingHorizontal: isDesktop ? 0 : 40,
              }
            ]}>Détails de la Séance</Text>
            <TouchableOpacity 
              style={[
                styles.closeButton,
                {
                  right: isDesktop ? 16 : 20,
                  top: isDesktop ? 16 : 20,
                }
              ]}
              onPress={() => setSelectedSession(null)}
            >
              <X color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </LinearGradient>

          {selectedSession && (
            <ScrollView 
              style={[
                styles.modalContent,
                                 {
                   padding: isDesktop ? 24 : 20,
                   maxHeight: isDesktop ? width * 0.35 : width * 0.7,
                 }
              ]}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContentContainer}
            >
              <View style={[
                styles.detailSection,
                {
                  marginBottom: isDesktop ? 16 : 12,
                  borderRadius: isDesktop ? 8 : 12,
                  padding: isDesktop ? 16 : 16,
                }
              ]}>
                <Text style={[
                  styles.detailLabel,
                  {
                    fontSize: isDesktop ? 14 : 13,
                    marginBottom: isDesktop ? 4 : 6,
                    textTransform: isDesktop ? 'none' : 'uppercase',
                    letterSpacing: isDesktop ? 0 : 0.5,
                  }
                ]}>Élève</Text>
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isDesktop ? 16 : 15,
                    lineHeight: isDesktop ? 24 : 22,
                  }
                ]}>{selectedSession.studentName}</Text>
              </View>
              <View style={[
                styles.detailSection,
                {
                  marginBottom: isDesktop ? 16 : 12,
                  borderRadius: isDesktop ? 8 : 12,
                  padding: isDesktop ? 16 : 16,
                }
              ]}>
                <Text style={[
                  styles.detailLabel,
                  {
                    fontSize: isDesktop ? 14 : 13,
                    marginBottom: isDesktop ? 4 : 6,
                    textTransform: isDesktop ? 'none' : 'uppercase',
                    letterSpacing: isDesktop ? 0 : 0.5,
                  }
                ]}>Parent</Text>
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isDesktop ? 16 : 15,
                    lineHeight: isDesktop ? 24 : 22,
                  }
                ]}>{selectedSession.parentName}</Text>
              </View>
              <View style={[
                styles.detailSection,
                {
                  marginBottom: isDesktop ? 16 : 12,
                  borderRadius: isDesktop ? 8 : 12,
                  padding: isDesktop ? 16 : 16,
                }
              ]}>
                <Text style={[
                  styles.detailLabel,
                  {
                    fontSize: isDesktop ? 14 : 13,
                    marginBottom: isDesktop ? 4 : 6,
                    textTransform: isDesktop ? 'none' : 'uppercase',
                    letterSpacing: isDesktop ? 0 : 0.5,
                  }
                ]}>Date</Text>
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isDesktop ? 16 : 15,
                    lineHeight: isDesktop ? 24 : 22,
                  }
                ]}>{new Date(selectedSession.dateSeance).toLocaleDateString('fr-FR')}</Text>
              </View>
              <View style={[
                styles.detailSection,
                {
                  marginBottom: isDesktop ? 16 : 12,
                  borderRadius: isDesktop ? 8 : 12,
                  padding: isDesktop ? 16 : 16,
                }
              ]}>
                <Text style={[
                  styles.detailLabel,
                  {
                    fontSize: isDesktop ? 14 : 13,
                    marginBottom: isDesktop ? 4 : 6,
                    textTransform: isDesktop ? 'none' : 'uppercase',
                    letterSpacing: isDesktop ? 0 : 0.5,
                  }
                ]}>Horaire</Text>
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isDesktop ? 16 : 15,
                    lineHeight: isDesktop ? 24 : 22,
                  }
                ]}>{selectedSession.heureDebut} - {selectedSession.heureFin}</Text>
              </View>
              <View style={[
                styles.detailSection,
                {
                  marginBottom: isDesktop ? 16 : 12,
                  borderRadius: isDesktop ? 8 : 12,
                  padding: isDesktop ? 16 : 16,
                }
              ]}>
                <Text style={[
                  styles.detailLabel,
                  {
                    fontSize: isDesktop ? 14 : 13,
                    marginBottom: isDesktop ? 4 : 6,
                    textTransform: isDesktop ? 'none' : 'uppercase',
                    letterSpacing: isDesktop ? 0 : 0.5,
                  }
                ]}>Matières</Text>
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isDesktop ? 16 : 15,
                    lineHeight: isDesktop ? 24 : 22,
                  }
                ]}>{selectedSession.matieres.join(', ')}</Text>
              </View>
              <View style={[
                styles.detailSection,
                {
                  marginBottom: isDesktop ? 16 : 12,
                  borderRadius: isDesktop ? 8 : 12,
                  padding: isDesktop ? 16 : 16,
                }
              ]}>
                <Text style={[
                  styles.detailLabel,
                  {
                    fontSize: isDesktop ? 14 : 13,
                    marginBottom: isDesktop ? 4 : 6,
                    textTransform: isDesktop ? 'none' : 'uppercase',
                    letterSpacing: isDesktop ? 0 : 0.5,
                  }
                ]}>Statut</Text>
                <View style={styles.statusContainer}>
                  {getStatusIcon(selectedSession.statut)}
                  <Text style={[
                    styles.statusText,
                    {
                      fontSize: isDesktop ? 16 : 15,
                      color: SESSION_STATUS_COLORS[selectedSession.statut],
                    }
                  ]}>
                    {SESSION_STATUS_LABELS[selectedSession.statut]}
                  </Text>
                </View>
              </View>
              {selectedSession.motifRejet && (
                <View style={[
                  styles.detailSection,
                  {
                    marginBottom: isDesktop ? 16 : 12,
                    borderRadius: isDesktop ? 8 : 12,
                    padding: isDesktop ? 16 : 16,
                  }
                ]}>
                  <Text style={[
                    styles.detailLabel,
                    {
                      fontSize: isDesktop ? 14 : 13,
                      marginBottom: isDesktop ? 4 : 6,
                      textTransform: isDesktop ? 'none' : 'uppercase',
                      letterSpacing: isDesktop ? 0 : 0.5,
                    }
                  ]}>Motif de rejet</Text>
                  <Text style={[
                    styles.rejectionText,
                    {
                      fontSize: isDesktop ? 16 : 15,
                      lineHeight: isDesktop ? 24 : 22,
                    }
                  ]}>{selectedSession.motifRejet}</Text>
                </View>
              )}
              <View style={styles.modalSpacer} />
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );

  const stats = getStats();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={['#059669', '#10B981']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.pageTitle}>Mes Séances</Text>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Loader color={colors.primary} size={48} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement de vos séances...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={['#059669', '#10B981']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>Mes Séances</Text>
          <Text style={styles.pageSubtitle}>
            {stats.total} séance{stats.total > 1 ? 's' : ''} • {stats.totalHours}h enseignées
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.statsSection}>
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <CheckCircle color="#10B981" size={24} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{stats.validated}</Text>
                <Text style={[styles.statLabel, { color: colors.text }]}>Validées</Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <Clock color="#F59E0B" size={24} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{stats.pending}</Text>
                <Text style={[styles.statLabel, { color: colors.text }]}>En attente</Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <Users color="#3B82F6" size={24} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{stats.thisMonth}</Text>
                <Text style={[styles.statLabel, { color: colors.text }]}>Ce mois</Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowRegistration(true)}
            >
              <View style={styles.registerButtonContent}>
                <View style={styles.registerButtonIcon}>
                  <Plus color={colors.background} size={24} />
                </View>
                <View style={styles.registerButtonText}>
                  <Text style={[styles.registerTitle, { color: colors.background }]}>
                    Enregistrer une nouvelle séance
                  </Text>
                  <Text style={[styles.registerSubtitle, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                    Scan QR + Géolocalisation requis
                  </Text>
                </View>
                <MapPin color="rgba(255, 255, 255, 0.8)" size={20} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.absenceButton, { backgroundColor: '#EF4444' }]}
              onPress={() => setShowAbsenceModal(true)}
            >
              <View style={styles.registerButtonContent}>
                <View style={styles.registerButtonIcon}>
                  <AlertTriangleIcon color={colors.background} size={24} />
                </View>
                <View style={styles.registerButtonText}>
                  <Text style={[styles.registerTitle, { color: colors.background }]}>
                    Signaler une absence
                  </Text>
                  <Text style={[styles.registerSubtitle, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                    Absence + Programmer rattrapage
                  </Text>
                </View>
                <AlertTriangleIcon color="rgba(255, 255, 255, 0.8)" size={20} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.sessionsSection}>
            {sessions.length > 0 ? (
              <View style={styles.sessionsList}>
                {sessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </View>
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                <Calendar color={colors.text} size={48} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Aucune séance enregistrée
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.text }]}>
                  Enregistrez votre première séance pour commencer
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      <SessionRegistration
        visible={showRegistration}
        onClose={() => setShowRegistration(false)}
        onSuccess={handleRegistrationSuccess}
        teacherId={teacherId}
        teacherName={teacherName}
      />

      <AbsenceRattrapageModal
        visible={showAbsenceModal}
        onClose={() => setShowAbsenceModal(false)}
        onSubmit={handleAbsenceSubmit}
      />
      
      <SessionDetailsModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
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
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  statsSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
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
    minWidth: 100,
    marginBottom: 8,
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
  buttonsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  registerButton: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  absenceButton: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  registerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  registerButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    flex: 1,
  },
  registerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  registerSubtitle: {
    fontSize: 14,
  },
  sessionsSection: {
    marginBottom: 24,
  },
  sessionsList: {
    gap: 16,
  },
  sessionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
  },
  sessionInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  parentName: {
    fontSize: 14,
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: 8,
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
  subjectsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  subjectPreviewTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectPreviewText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreSubjects: {
    fontSize: 12,
    fontWeight: '500',
  },
  sessionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rejectionReason: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  rejectionText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  submissionDate: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  detailsButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
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
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cardActions: {
    alignItems: 'flex-end',
    gap: 12,
  },
  modalHeader: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  modalContent: {
    // Styles de base, les valeurs spécifiques sont appliquées dynamiquement
  },
  modalContentContainer: {
    paddingBottom: 20,
  },
  modalSpacer: {
    height: 20,
  },
  detailSection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#059669',
  },
  detailText: {
    color: '#1F2937',
  },
});