import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  BookOpen,
  MessageCircle,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Loader,
  AlertTriangle
} from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { 
  ParentSessionView,
  SessionStats,
  SessionFilters,
  SessionStatus,
  SESSION_STATUS_LABELS,
  SESSION_STATUS_COLORS,
  formatDuration,
  SESSION_SUBJECTS
} from '../../../types/Session';

// Données de démonstration pour les séances des enfants du parent
const demoSessions: ParentSessionView[] = [
  {
    id: 'SES-2401-ABC123',
    teacherName: 'Marie N\'Guessan',
    studentName: 'Marie Kouassi',
    dateSeance: '2024-01-23',
    heureDebut: '14:00',
    heureFin: '16:00',
    dureeMinutes: 120,
    matieres: ['Mathématiques', 'Physique'],
    chapitres: 'Théorème de Pythagore, Équations du second degré, Forces et mouvements',
    objetSeance: 'Révision des notions de géométrie et introduction aux équations. Exercices pratiques sur les forces.',
    observations: 'Élève très attentive et participative. Bonne compréhension des concepts abordés.',
    commentaires: 'Recommande de continuer avec des exercices plus avancés la prochaine fois.',
    statut: 'validated',
    dateCreation: '2024-01-23T16:30:00Z',
    dateValidation: '2024-01-23T19:00:00Z',
  },
  {
    id: 'SES-2401-DEF456',
    teacherName: 'Jean Kouassi',
    studentName: 'Junior Kouassi',
    dateSeance: '2024-01-22',
    heureDebut: '16:00',
    heureFin: '18:00',
    dureeMinutes: 120,
    matieres: ['Français', 'Histoire'],
    chapitres: 'La littérature coloniale, L\'indépendance de la Côte d\'Ivoire',
    objetSeance: 'Analyse de textes littéraires de l\'époque coloniale et étude des événements historiques majeurs.',
    observations: 'Élève avec des difficultés en expression écrite mais bonne participation orale.',
    commentaires: 'Besoin de plus d\'exercices de rédaction à la maison.',
    statut: 'pending',
    dateCreation: '2024-01-22T18:30:00Z',
  },
  {
    id: 'SES-2401-GHI789',
    teacherName: 'Mamadou Diabaté',
    studentName: 'Marie Kouassi',
    dateSeance: '2024-01-21',
    heureDebut: '15:00',
    heureFin: '17:00',
    dureeMinutes: 120,
    matieres: ['Anglais'],
    chapitres: 'Past tense, Present perfect, Vocabulary building',
    objetSeance: 'Révision des temps passés et exercices de vocabulaire avec conversations pratiques.',
    observations: 'Excellente progression en anglais. Très bonne prononciation.',
    commentaires: 'Élève prête pour le niveau supérieur.',
    statut: 'validated',
    dateCreation: '2024-01-21T17:30:00Z',
    dateValidation: '2024-01-21T20:00:00Z',
  },
  {
    id: 'SES-2401-JKL012',
    teacherName: 'Fatou Koné',
    studentName: 'Junior Kouassi',
    dateSeance: '2024-01-20',
    heureDebut: '18:00',
    heureFin: '20:00',
    dureeMinutes: 120,
    matieres: ['Sciences Physiques', 'Chimie'],
    chapitres: 'Optique géométrique, Réactions chimiques',
    objetSeance: 'Étude des lois de la réfraction et exercices sur les équations chimiques.',
    observations: 'Élève en difficulté avec les concepts abstraits de physique.',
    commentaires: 'Nécessite plus d\'exemples concrets et visuels.',
    statut: 'rejected',
    dateCreation: '2024-01-20T20:30:00Z',
    dateValidation: '2024-01-21T08:00:00Z',
    motifRejet: 'Durée de cours insuffisante selon les observations de l\'enseignant.',
  },
  {
    id: 'SES-2401-MNO345',
    teacherName: 'Marie N\'Guessan',
    studentName: 'Marie Kouassi',
    dateSeance: '2024-01-19',
    heureDebut: '14:00',
    heureFin: '16:00',
    dureeMinutes: 120,
    matieres: ['Mathématiques'],
    chapitres: 'Fonctions linéaires, Représentations graphiques',
    objetSeance: 'Introduction aux fonctions et tracé de droites dans un repère.',
    observations: 'Bonne compréhension générale. Quelques hésitations sur les graphiques.',
    commentaires: 'Continuer avec plus d\'exercices de représentation graphique.',
    statut: 'validated',
    dateCreation: '2024-01-19T16:30:00Z',
    dateValidation: '2024-01-19T18:00:00Z',
  },
];

// Liste des enfants pour les filtres
const children = [
  { id: 'child_1', name: 'Marie Kouassi' },
  { id: 'child_2', name: 'Junior Kouassi' },
];

export default function ParentLessonsLogScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [fadeAnim] = useState(new Animated.Value(0));
  const [sessions, setSessions] = useState<ParentSessionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // États des filtres
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SessionFilters>({});

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
        s.matieres.some(m => m.toLowerCase().includes(query)) ||
        s.chapitres.toLowerCase().includes(query)
      );
    }

    // Filtre par enfant
    if (filters.studentId) {
      const selectedChild = children.find(c => c.id === filters.studentId);
      if (selectedChild) {
        filtered = filtered.filter(s => s.studentName === selectedChild.name);
      }
    }

    // Filtre par matières
    if (filters.matieres && filters.matieres.length > 0) {
      filtered = filtered.filter(s =>
        s.matieres.some(m => filters.matieres!.includes(m))
      );
    }

    // Filtre par période
    if (filters.dateDebut && filters.dateFin) {
      const startDate = new Date(filters.dateDebut);
      const endDate = new Date(filters.dateFin);
      filtered = filtered.filter(s => {
        const sessionDate = new Date(s.dateSeance);
        return sessionDate >= startDate && sessionDate <= endDate;
      });
    }

    return filtered.sort((a, b) => 
      new Date(b.dateSeance).getTime() - new Date(a.dateSeance).getTime()
    );
  };

  const getStatusIcon = (statut: SessionStatus) => {
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

  const SessionAccordion = ({ session }: { session: ParentSessionView }) => {
    const isExpanded = expandedSession === session.id;

    return (
      <View style={[
        styles.sessionAccordion,
        { 
          backgroundColor: colors.card,
          shadowColor: colors.text,
          borderLeftColor: SESSION_STATUS_COLORS[session.statut]
        }
      ]}>
        {/* Aperçu de la séance */}
        <View style={styles.sessionPreview}>
          <View style={styles.sessionHeaderInfo}>
            <View style={styles.sessionTitle}>
              <Text style={[styles.studentName, { color: colors.text }]}>
                {session.studentName}
              </Text>
              <Text style={[styles.teacherName, { color: colors.textSecondary }]}>
                avec {session.teacherName}
              </Text>
            </View>
            <Text style={[styles.sessionDate, { color: colors.textSecondary }]}>
              {new Date(session.dateSeance).toLocaleDateString('fr-FR')} • {session.heureDebut} - {session.heureFin}
            </Text>
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
            {getStatusIcon(session.statut)}
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
            {/* Informations générales */}
            <View style={styles.generalSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Détails de la séance
              </Text>
              
              <View style={styles.infoRow}>
                <User color={colors.primary} size={16} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Enseignant:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {session.teacherName}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Clock color={colors.primary} size={16} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Durée:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {formatDuration(session.dureeMinutes)}
                </Text>
              </View>
            </View>

            {/* Contenu pédagogique */}
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
            </View>

            {/* Observations et commentaires */}
            <View style={styles.feedbackSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Observations et commentaires
              </Text>
              
              <View style={styles.feedbackItem}>
                <MessageCircle color={colors.primary} size={16} />
                <View style={styles.feedbackContent}>
                  <Text style={[styles.feedbackLabel, { color: colors.textSecondary }]}>
                    Observations:
                  </Text>
                  <Text style={[styles.feedbackText, { color: colors.text }]}>
                    {session.observations}
                  </Text>
                </View>
              </View>

              <View style={styles.feedbackItem}>
                <MessageCircle color={colors.primary} size={16} />
                <View style={styles.feedbackContent}>
                  <Text style={[styles.feedbackLabel, { color: colors.textSecondary }]}>
                    Commentaires:
                  </Text>
                  <Text style={[styles.feedbackText, { color: colors.text }]}>
                    {session.commentaires}
                  </Text>
                </View>
              </View>
            </View>

            {/* Statut de validation */}
            {session.dateValidation && (
              <View style={[styles.validationInfo, { backgroundColor: '#F0FDF4' }]}>
                <CheckCircle color="#10B981" size={16} />
                <Text style={[styles.validationText, { color: '#10B981' }]}>
                  Validée le {new Date(session.dateValidation).toLocaleDateString('fr-FR')}
                </Text>
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
            <Text style={styles.pageTitle}>Séances d'Études</Text>
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
      <LinearGradient colors={['#EA580C', '#F97316']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>Séances d'Études</Text>
          <Text style={styles.pageSubtitle}>
            {stats.total} séance{stats.total > 1 ? 's' : ''} • {stats.totalHours}h d'enseignement
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Section des statistiques */}
          <View style={styles.statsSection}>
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <CheckCircle color="#10B981" size={24} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{stats.validated}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Validées</Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <Clock color="#F59E0B" size={24} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{stats.pending}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>En attente</Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <Calendar color="#3B82F6" size={24} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{stats.thisMonth}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Ce mois</Text>
              </View>
            </View>
          </View>

          {/* Recherche et filtres */}
          <View style={styles.searchSection}>
            <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
              <Search color={colors.textSecondary} size={20} />
            <TextInput
                style={[styles.searchInput, { color: colors.text }]}
              placeholder="Rechercher une séance..."
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
                  <Text style={[styles.filterLabel, { color: colors.text }]}>Enfant:</Text>
                  <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                    <Picker
                      selectedValue={filters.studentId || ''}
                      onValueChange={(value) => 
                        setFilters(prev => ({ ...prev, studentId: value || undefined }))
                      }
                      style={[styles.picker, { color: colors.text }]}
                    >
                      <Picker.Item label="Tous mes enfants" value="" />
                      {children.map((child) => (
                        <Picker.Item
                          key={child.id}
                          label={child.name}
                          value={child.id}
                        />
                      ))}
                    </Picker>
          </View>
        </View>

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
              Historique des séances ({filteredSessions.length})
            </Text>
            
            {filteredSessions.length > 0 ? (
              <View style={styles.sessionsList}>
                {filteredSessions.map((session) => (
                  <SessionAccordion key={session.id} session={session} />
                ))}
              </View>
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                <Calendar color={colors.textSecondary} size={48} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Aucune séance trouvée
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  {searchQuery || Object.keys(filters).length > 0 
                    ? 'Modifiez vos filtres pour voir plus de résultats'
                    : 'Les séances de vos enfants apparaîtront ici'}
                </Text>
          </View>
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
    marginBottom: 16,
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
    height: 50,
  },
  statusFilters: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
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
    marginBottom: 6,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  teacherName: {
    fontSize: 14,
  },
  sessionDate: {
    fontSize: 14,
    marginBottom: 8,
  },
  subjectsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  generalSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  subjectsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
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
    borderRadius: 12,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: '500',
  },
  pedagogicalSection: {
    marginBottom: 20,
  },
  contentItem: {
    marginBottom: 16,
  },
  contentLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusSection: {},
  statusInfo: {
    padding: 16,
    borderRadius: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  statusDetails: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusDate: {
    fontSize: 14,
  },
  validationDate: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  rejectionInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  rejectionContent: {
    flex: 1,
  },
  rejectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 14,
    lineHeight: 18,
  },
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  pendingText: {
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