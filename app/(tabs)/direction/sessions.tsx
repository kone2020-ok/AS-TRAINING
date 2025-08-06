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
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  BookOpen,
  FileText,
  MessageCircle,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Loader,
  Send
} from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { 
  DirectionSessionView,
  SessionStats,
  SessionValidationData,
  SessionFilters,
  SessionStatus,
  SESSION_STATUS_LABELS,
  SESSION_STATUS_COLORS,
  formatDuration,
  SESSION_SUBJECTS
} from '../../../types/Session';
import { useNotificationTriggers } from '../../../services/NotificationTriggers';

// Données de démonstration pour les séances à valider
const demoSessions: DirectionSessionView[] = [
  {
    id: 'SES-2401-ABC123',
    teacherName: 'Marie N\'Guessan',
      teacherId: 'teacher_1',
    studentName: 'Kouassi Marie',
    parentName: 'Jean Kouassi',
    dateSeance: '2024-01-23',
    heureDebut: '14:00',
    heureFin: '16:00',
    dureeMinutes: 120,
    matieres: ['Mathématiques', 'Physique'],
    chapitres: 'Théorème de Pythagore, Équations du second degré, Forces et mouvements',
    objetSeance: 'Révision des notions de géométrie et introduction aux équations. Exercices pratiques sur les forces.',
    observations: 'Élève très attentive et participative. Bonne compréhension des concepts abordés.',
    commentaires: 'Recommande de continuer avec des exercices plus avancés la prochaine fois.',
    location: {
      latitude: 5.359952,
      longitude: -4.008256,
      accuracy: 8,
      timestamp: '2024-01-23T14:00:00Z',
      address: 'Cocody, Abidjan'
    },
    distanceFromHome: 45,
    statut: 'pending',
    dateCreation: '2024-01-23T16:30:00Z',
    anomalies: [],
    flagged: false,
  },
  {
    id: 'SES-2401-DEF456',
    teacherName: 'Jean Kouassi',
      teacherId: 'teacher_2',
    studentName: 'Traoré Amadou',
    parentName: 'Fatou Traoré',
    dateSeance: '2024-01-23',
    heureDebut: '16:00',
    heureFin: '18:00',
    dureeMinutes: 120,
    matieres: ['Français', 'Histoire'],
    chapitres: 'La littérature coloniale, L\'indépendance de la Côte d\'Ivoire',
    objetSeance: 'Analyse de textes littéraires de l\'époque coloniale et étude des événements historiques majeurs.',
    observations: 'Élève avec des difficultés en expression écrite mais bonne participation orale.',
    commentaires: 'Besoin de plus d\'exercices de rédaction à la maison.',
    location: {
      latitude: 5.345678,
      longitude: -4.012345,
      accuracy: 12,
      timestamp: '2024-01-23T16:00:00Z',
      address: 'Yopougon, Abidjan'
    },
    distanceFromHome: 650,
    statut: 'pending',
    dateCreation: '2024-01-23T18:30:00Z',
    anomalies: ['Distance excessive: 650m'],
    flagged: true,
  },
  {
    id: 'SES-2401-GHI789',
    teacherName: 'Mamadou Diabaté',
    teacherId: 'teacher_3',
    studentName: 'Koffi Sarah',
    parentName: 'Emmanuel Koffi',
    dateSeance: '2024-01-22',
    heureDebut: '15:00',
    heureFin: '17:00',
    dureeMinutes: 120,
    matieres: ['Anglais'],
    chapitres: 'Past tense, Present perfect, Vocabulary building',
    objetSeance: 'Révision des temps passés et exercices de vocabulaire avec conversations pratiques.',
    observations: 'Excellente progression en anglais. Très bonne prononciation.',
    commentaires: 'Élève prête pour le niveau supérieur.',
    location: {
      latitude: 5.334567,
      longitude: -4.067890,
      accuracy: 6,
      timestamp: '2024-01-22T15:00:00Z',
      address: 'Adjamé, Abidjan'
    },
    distanceFromHome: 120,
    statut: 'validated',
    dateCreation: '2024-01-22T17:30:00Z',
    dateValidation: '2024-01-22T19:00:00Z',
    validateurId: 'direction_admin',
    validateurName: 'Direction AS-TRAINING',
    anomalies: [],
    flagged: false,
  },
  {
    id: 'SES-2401-JKL012',
    teacherName: 'Fatou Koné',
    teacherId: 'teacher_4',
    studentName: 'Diabaté Aïcha',
    parentName: 'Ibrahim Diabaté',
    dateSeance: '2024-01-21',
    heureDebut: '18:00',
    heureFin: '20:00',
    dureeMinutes: 120,
    matieres: ['Sciences Physiques', 'Chimie'],
    chapitres: 'Optique géométrique, Réactions chimiques',
    objetSeance: 'Étude des lois de la réfraction et exercices sur les équations chimiques.',
    observations: 'Élève en difficulté avec les concepts abstraits de physique.',
    commentaires: 'Nécessite plus d\'exemples concrets et visuels.',
    location: {
      latitude: 5.298765,
      longitude: -4.045678,
      accuracy: 15,
      timestamp: '2024-01-21T18:00:00Z',
      address: 'Marcory, Abidjan'
    },
    distanceFromHome: 890,
    statut: 'rejected',
    dateCreation: '2024-01-21T20:30:00Z',
    dateValidation: '2024-01-22T08:00:00Z',
    motifRejet: 'Distance du domicile trop importante (890m > 500m autorisés). Position GPS incohérente.',
    validateurId: 'direction_admin',
    validateurName: 'Direction AS-TRAINING',
    anomalies: ['Distance excessive: 890m'],
    flagged: true,
  },
];

export default function DirectionSessionsScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { triggers } = useNotificationTriggers();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [sessions, setSessions] = useState<DirectionSessionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<DirectionSessionView | null>(null);
  const [validationAction, setValidationAction] = useState<'validate' | 'reject'>('validate');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // États des filtres
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SessionFilters>({
    statut: ['pending'],
  });

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

  const getStats = (): SessionStats => {
    const total = sessions.length;
    const pending = sessions.filter(s => s.statut === 'pending').length;
    const validated = sessions.filter(s => s.statut === 'validated').length;
    const rejected = sessions.filter(s => s.statut === 'rejected').length;
    const flagged = sessions.filter(s => s.flagged).length;
    
    const now = new Date();
    const thisMonth = sessions.filter(s => {
      const sessionDate = new Date(s.dateSeance);
      return sessionDate.getMonth() === now.getMonth() && 
             sessionDate.getFullYear() === now.getFullYear();
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
      thisWeek: 0,
      averageDuration: validated > 0 ? Math.round(totalMinutes / validated) : 0,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
    };
  };

  const getFilteredSessions = () => {
    let filtered = sessions;

    // Filtre par statut
    if (filters.statut && filters.statut.length > 0) {
      filtered = filtered.filter(s => filters.statut!.includes(s.statut));
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.teacherName.toLowerCase().includes(query) ||
        s.studentName.toLowerCase().includes(query) ||
        s.parentName.toLowerCase().includes(query) ||
        s.matieres.some(m => m.toLowerCase().includes(query))
      );
    }

    // Filtre par enseignant
    if (filters.teacherId) {
      filtered = filtered.filter(s => s.teacherId === filters.teacherId);
    }

    // Filtre par matières
    if (filters.matieres && filters.matieres.length > 0) {
      filtered = filtered.filter(s =>
        s.matieres.some(m => filters.matieres!.includes(m))
      );
    }

    // Filtre par sessions flaggées
    if (filters.flagged !== undefined) {
      filtered = filtered.filter(s => s.flagged === filters.flagged);
    }

    return filtered.sort((a, b) => {
      // Prioriser les séances en attente et flaggées
      if (a.statut === 'pending' && b.statut !== 'pending') return -1;
      if (b.statut === 'pending' && a.statut !== 'pending') return 1;
      if (a.flagged && !b.flagged) return -1;
      if (b.flagged && !a.flagged) return 1;
      return new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime();
    });
  };

  const handleValidationAction = (session: DirectionSessionView, action: 'validate' | 'reject') => {
    setSelectedSession(session);
    setValidationAction(action);
    setRejectionReason('');
    setShowValidationModal(true);
  };

  const processValidation = async () => {
    if (!selectedSession) return;
    
    if (validationAction === 'reject' && !rejectionReason.trim()) {
      Alert.alert('Erreur', 'Veuillez indiquer le motif de rejet.');
      return;
    }

    setProcessing(true);

    try {
      // Simulation du traitement
      await new Promise(resolve => setTimeout(resolve, 2000));

      const validationData: SessionValidationData = {
        sessionId: selectedSession.id,
        action: validationAction,
        motif: validationAction === 'reject' ? rejectionReason : undefined,
        validateurId: 'direction_admin',
        validateurName: 'Direction AS-TRAINING'
      };

      // Mettre à jour la session
      setSessions(prev => prev.map(s => {
        if (s.id === selectedSession.id) {
          return {
            ...s,
            statut: validationAction === 'validate' ? 'validated' : 'rejected',
            dateValidation: new Date().toISOString(),
            motifRejet: validationAction === 'reject' ? rejectionReason : undefined,
            validateurId: validationData.validateurId,
            validateurName: validationData.validateurName
          };
        }
        return s;
      }));

      // Déclencher les notifications
      if (validationAction === 'validate') {
        await triggers.onSessionValidated({
          userId: 'direction_admin',
          userRole: 'direction',
          targetUserId: selectedSession.teacherId,
          metadata: {
            sessionId: selectedSession.id,
            studentName: selectedSession.studentName,
            teacherName: selectedSession.teacherName,
            parentId: selectedSession.parentName, // Simplified
            date: selectedSession.dateSeance,
            subject: selectedSession.matieres.join(', '),
            validatorName: 'Direction AS-TRAINING'
          }
        });
      } else {
        await triggers.onSessionRejected({
          userId: 'direction_admin',
          userRole: 'direction',
          targetUserId: selectedSession.teacherId,
          metadata: {
            sessionId: selectedSession.id,
            studentName: selectedSession.studentName,
            teacherName: selectedSession.teacherName,
            parentId: selectedSession.parentName, // Simplified
            date: selectedSession.dateSeance,
            subject: selectedSession.matieres.join(', '),
            reason: rejectionReason,
            validatorName: 'Direction AS-TRAINING'
          }
        });
      }

      setShowValidationModal(false);
    Alert.alert(
        'Succès',
        `Séance ${validationAction === 'validate' ? 'validée' : 'rejetée'} avec succès.`
      );

    } catch (error) {
      Alert.alert('Erreur', 'Impossible de traiter la validation');
    } finally {
      setProcessing(false);
    }
  };

  const getDistanceColor = (distance: number) => {
    if (distance <= 100) return '#10B981';
    if (distance <= 300) return '#F59E0B';
        return '#EF4444';
  };

  const SessionAccordion = ({ session }: { session: DirectionSessionView }) => {
    const isExpanded = expandedSession === session.id;
    const isPending = session.statut === 'pending';

    return (
      <View style={[
        styles.sessionAccordion,
        { 
          backgroundColor: colors.card,
          shadowColor: colors.text,
          borderLeftColor: session.flagged ? '#EF4444' : 
                          session.statut === 'validated' ? '#10B981' :
                          session.statut === 'rejected' ? '#EF4444' : '#F59E0B'
        }
      ]}>
        {/* Aperçu de la séance */}
        <View style={styles.sessionPreview}>
          <View style={styles.sessionHeaderInfo}>
            <View style={styles.sessionTitle}>
              <Text style={[styles.teacherName, { color: colors.text }]}>
                {session.teacherName}
              </Text>
              {session.flagged && (
                <AlertTriangle color="#EF4444" size={16} />
              )}
            </View>
            <Text style={[styles.studentInfo, { color: colors.textSecondary }]}>
              {session.studentName} • {new Date(session.dateSeance).toLocaleDateString('fr-FR')}
            </Text>
            <Text style={[styles.sessionTime, { color: colors.textSecondary }]}>
              {session.heureDebut} - {session.heureFin} • {formatDuration(session.dureeMinutes)}
            </Text>
            
            {/* Aperçu des matières */}
            <View style={styles.subjectsPreview}>
              {session.matieres.slice(0, 2).map((matiere, index) => (
                <View key={index} style={[styles.subjectPreviewTag, { backgroundColor: '#DC2626' + '20' }]}>
                  <Text style={[styles.subjectPreviewText, { color: '#DC2626', fontWeight: 'bold' }]}>
                    {matiere}
                  </Text>
                </View>
              ))}
              {session.matieres.length > 2 && (
                <Text style={[styles.moreSubjects, { color: colors.textSecondary }]}>
                  +{session.matieres.length - 2}
                </Text>
              )}
            </View>
        </View>
        
          <View style={styles.sessionHeaderActions}>
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
        </View>
      </View>

        {/* Bouton pour déplier */}
        <TouchableOpacity
          style={[styles.expandButton, { backgroundColor: colors.background }]}
          onPress={() => setExpandedSession(isExpanded ? null : session.id)}
        >
          <Text style={[styles.expandButtonText, { color: colors.primary }]}>
            {isExpanded ? 'Masquer les détails' : 'Voir les détails'}
          </Text>
          {isExpanded ? (
            <ChevronUp color={colors.primary} size={16} />
          ) : (
            <ChevronDown color={colors.primary} size={16} />
          )}
        </TouchableOpacity>

        {/* Contenu étendu */}
        {isExpanded && (
          <Animated.View style={styles.accordionContent}>
            {/* Informations géographiques */}
            <View style={styles.locationSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Données anti-fraude
              </Text>
              <View style={styles.locationData}>
                <View style={styles.locationItem}>
                  <MapPin color={getDistanceColor(session.distanceFromHome)} size={16} />
                  <Text style={[styles.locationText, { color: colors.text }]}>
                    Distance du domicile: {Math.round(session.distanceFromHome)}m
                  </Text>
                </View>
                <View style={styles.locationItem}>
                  <Clock color={colors.textSecondary} size={16} />
                  <Text style={[styles.locationText, { color: colors.text }]}>
                    Position GPS: {session.location.latitude.toFixed(6)}, {session.location.longitude.toFixed(6)}
                  </Text>
                </View>
                <Text style={[styles.locationAccuracy, { color: colors.textSecondary }]}>
                  Précision: ±{session.location.accuracy}m • {session.location.address}
                </Text>
        </View>
        
              {/* Anomalies */}
              {session.anomalies.length > 0 && (
                <View style={[styles.anomaliesContainer, { backgroundColor: '#FEF2F2' }]}>
                  <AlertTriangle color="#EF4444" size={16} />
                  <View style={styles.anomaliesList}>
                    {session.anomalies.map((anomaly, index) => (
                      <Text key={index} style={[styles.anomalyText, { color: '#EF4444' }]}>
                        • {anomaly}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
        </View>
        
            {/* Détails pédagogiques */}
            <View style={styles.pedagogicalSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Contenu pédagogique
              </Text>
              
              <View style={styles.subjectsRow}>
                <BookOpen color="#DC2626" size={16} />
                <View style={styles.subjectsContainer}>
                  {session.matieres.map((matiere, index) => (
                    <View key={index} style={[styles.subjectTag, { backgroundColor: '#DC2626' + '20' }]}>
                      <Text style={[styles.subjectText, { color: '#DC2626', fontWeight: 'bold' }]}>
                        {matiere}
                      </Text>
                    </View>
                  ))}
                </View>
        </View>

              <View style={styles.contentItem}>
                <Text style={[styles.contentLabel, { color: colors.textSecondary }]}>
                  Chapitres abordés:
                </Text>
                <Text style={[styles.contentText, { color: colors.text }]}>
                  {session.chapitres}
                </Text>
        </View>

              <View style={styles.contentItem}>
                <Text style={[styles.contentLabel, { color: colors.textSecondary }]}>
                  Objet de la séance:
                </Text>
                <Text style={[styles.contentText, { color: colors.text }]}>
                  {session.objetSeance}
                </Text>
        </View>

              <View style={styles.contentItem}>
                <Text style={[styles.contentLabel, { color: colors.textSecondary }]}>
                  Observations:
                </Text>
                <Text style={[styles.contentText, { color: colors.text }]}>
                  {session.observations}
                </Text>
      </View>

              {session.commentaires && (
                <View style={styles.contentItem}>
                  <Text style={[styles.contentLabel, { color: colors.textSecondary }]}>
                    Commentaires:
                  </Text>
                  <Text style={[styles.contentText, { color: colors.text }]}>
                    {session.commentaires}
                  </Text>
                </View>
              )}
            </View>

            {/* Actions de validation */}
            <View style={styles.validationActions}>
              {isPending && (
          <>
            <TouchableOpacity 
                    style={[styles.validationButton, styles.validateButton]}
                    onPress={() => handleValidationAction(session, 'validate')}
            >
                    <CheckCircle color="#FFFFFF" size={18} />
                    <Text style={styles.validationButtonText}>Valider</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                    style={[styles.validationButton, styles.rejectButton]}
                    onPress={() => handleValidationAction(session, 'reject')}
            >
                    <XCircle color="#FFFFFF" size={18} />
                    <Text style={styles.validationButtonText}>Rejeter</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

            {/* Informations de validation */}
            {!isPending && session.dateValidation && (
              <View style={[styles.validationInfo, { backgroundColor: colors.background }]}>
                <Text style={[styles.validationText, { color: colors.textSecondary }]}>
                  {session.statut === 'validated' ? 'Validée' : 'Rejetée'} le {new Date(session.dateValidation).toLocaleDateString('fr-FR')} par {session.validateurName}
                </Text>
                {session.motifRejet && (
                  <Text style={[styles.rejectionMotif, { color: '#EF4444' }]}>
                    Motif: {session.motifRejet}
                  </Text>
        )}
      </View>
            )}
          </Animated.View>
        )}
    </View>
  );
  };

  const filteredSessions = getFilteredSessions();
  const stats = getStats();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.pageTitle}>Validation des Séances</Text>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Loader color={colors.primary} size={48} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement des séances...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header fixe */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>Validation des Séances</Text>
          <Text style={styles.pageSubtitle}>
            {stats.pending} en attente • {stats.total} total
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Section des statistiques */}
          <View style={styles.statsSection}>
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <Clock color="#F59E0B" size={24} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{stats.pending}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>En attente</Text>
          </View>

              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <CheckCircle color="#10B981" size={24} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{stats.validated}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Validées</Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <AlertTriangle color="#EF4444" size={24} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{sessions.filter(s => s.flagged).length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Signalées</Text>
              </View>
            </View>
          </View>

          {/* Recherche et filtres */}
          <View style={styles.searchSection}>
            <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
              <Search color={colors.textSecondary} size={20} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Rechercher par enseignant, élève..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilters(!showFilters)}
            >
                <Filter color={colors.primary} size={20} />
            </TouchableOpacity>
            </View>

            {/* Filtres étendus */}
            {showFilters && (
              <View style={[styles.filtersContainer, { backgroundColor: colors.card }]}>
                <View style={styles.filterRow}>
                  <Text style={[styles.filterLabel, { color: colors.text }]}>Statut:</Text>
                  <View style={styles.statusFilters}>
                    {(['pending', 'validated', 'rejected'] as SessionStatus[]).map((status) => (
            <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusFilter,
                          {
                            backgroundColor: filters.statut?.includes(status) 
                              ? SESSION_STATUS_COLORS[status] + '20'
                              : colors.background,
                            borderColor: filters.statut?.includes(status)
                              ? SESSION_STATUS_COLORS[status]
                              : colors.border
                          }
                        ]}
                        onPress={() => {
                          const currentStatuts = filters.statut || [];
                          const newStatuts = currentStatuts.includes(status)
                            ? currentStatuts.filter(s => s !== status)
                            : [...currentStatuts, status];
                          setFilters(prev => ({ ...prev, statut: newStatuts }));
                        }}
                      >
                        <Text style={[
                          styles.statusFilterText,
                          { color: filters.statut?.includes(status) ? SESSION_STATUS_COLORS[status] : colors.text }
                        ]}>
                          {SESSION_STATUS_LABELS[status]}
              </Text>
            </TouchableOpacity>
                    ))}
          </View>
            </View>
            </View>
            )}
          </View>

          {/* Liste des séances */}
          <View style={styles.sessionsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Séances ({filteredSessions.length})
            </Text>
            
            {filteredSessions.length > 0 ? (
          <View style={styles.sessionsList}>
            {filteredSessions.map((session) => (
                  <SessionAccordion key={session.id} session={session} />
                ))}
              </View>
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                <FileText color={colors.textSecondary} size={48} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Aucune séance trouvée
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Modifiez vos filtres pour voir plus de résultats
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Modal de validation */}
      <Modal visible={showValidationModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {validationAction === 'validate' ? 'Valider la séance' : 'Rejeter la séance'}
            </Text>
            
            {selectedSession && (
              <View style={styles.modalSessionInfo}>
                <Text style={[styles.modalSessionText, { color: colors.text }]}>
                  {selectedSession.teacherName} - {selectedSession.studentName}
                </Text>
                <Text style={[styles.modalSessionDate, { color: colors.textSecondary }]}>
                  {new Date(selectedSession.dateSeance).toLocaleDateString('fr-FR')} • {selectedSession.heureDebut} - {selectedSession.heureFin}
                </Text>
              </View>
            )}

            {validationAction === 'reject' && (
              <View style={styles.rejectionReasonContainer}>
                <Text style={[styles.rejectionLabel, { color: colors.text }]}>
                  Motif de rejet *
                </Text>
                <TextInput
                  style={[styles.rejectionInput, { color: colors.text, borderColor: colors.border }]}
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  placeholder="Expliquez pourquoi cette séance est rejetée..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.border }]}
                onPress={() => setShowValidationModal(false)}
                disabled={processing}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  validationAction === 'validate' ? styles.validateModalButton : styles.rejectModalButton
                ]}
                onPress={processValidation}
                disabled={processing}
              >
                {processing ? (
                  <Loader color="#FFFFFF" size={16} />
                ) : (
                  <>
                    {validationAction === 'validate' ? (
                      <CheckCircle color="#FFFFFF" size={16} />
                    ) : (
                      <XCircle color="#FFFFFF" size={16} />
                    )}
                    <Text style={styles.modalButtonText}>
                      {validationAction === 'validate' ? 'Valider' : 'Rejeter'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 24,
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
  searchSection: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
  },
  filtersContainer: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  statusFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusFilterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sessionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sessionsList: {
    gap: 16,
  },
  sessionAccordion: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
  },
  sessionPreview: {
    padding: 16,
  },
  subjectsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
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
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    gap: 8,
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sessionHeaderInfo: {
    flex: 1,
  },
  sessionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentInfo: {
    fontSize: 14,
    marginBottom: 2,
  },
  sessionTime: {
    fontSize: 14,
  },
  sessionHeaderActions: {
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
  accordionContent: {
    padding: 16,
    paddingTop: 0,
  },
  locationSection: {
    marginBottom: 20,
  },
  locationData: {
    gap: 8,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationAccuracy: {
    fontSize: 12,
    marginLeft: 24,
  },
  anomaliesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  anomaliesList: {
    flex: 1,
  },
  anomalyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pedagogicalSection: {
    marginBottom: 20,
  },
  subjectsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  subjectTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: '500',
  },
  contentItem: {
    marginBottom: 12,
  },
  contentLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  validationActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  validationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  validateButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  validationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  validationInfo: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  validationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rejectionMotif: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
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
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalSessionInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalSessionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalSessionDate: {
    fontSize: 14,
  },
  rejectionReasonContainer: {
    marginBottom: 20,
  },
  rejectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  rejectionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  validateModalButton: {
    backgroundColor: '#10B981',
  },
  rejectModalButton: {
    backgroundColor: '#EF4444',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});