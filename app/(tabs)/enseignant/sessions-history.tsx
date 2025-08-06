import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
  Modal,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Calendar, Clock, CheckCircle, XCircle, X } from 'lucide-react-native';

interface Session {
  id: string;
  studentName: string;
  date: string;
  startTime: string;
  endTime: string;
  subjects: string[];
  chapters: string;
  summary: string;
  observations: string;
  behavior: string;
  status: 'en_attente' | 'validée' | 'rejetée';
  dateCreation: string;
  rejectionReason?: string;
}

export default function SessionsHistory() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isMobile = screenWidth <= 768;
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [modalAnim] = useState(new Animated.Value(0));
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const demoSessions: Session[] = [
    {
      id: 'session_1',
      studentName: 'Kouadio Aya',
      date: '2025-01-15',
      startTime: '14:00',
      endTime: '16:00',
      subjects: ['Mathématiques'],
      chapters: 'Équations du second degré',
      summary: 'Révision des méthodes de résolution et exercices d\'application',
      observations: 'Élève très attentive et participative',
      behavior: 'Excellente concentration pendant toute la séance',
      status: 'validée',
      dateCreation: '2025-01-15T16:30:00Z',
    },
    {
      id: 'session_2',
      studentName: 'Traoré Aminata',
      date: '2025-01-14',
      startTime: '15:00',
      endTime: '17:00',
      subjects: ['Chimie'],
      chapters: 'Réactions d\'oxydoréduction',
      summary: 'Introduction aux concepts et exercices pratiques',
      observations: 'Bonne compréhension des concepts',
      behavior: 'Élève motivée et curieuse',
      status: 'en_attente',
      dateCreation: '2025-01-14T17:15:00Z',
    },
    {
      id: 'session_3',
      studentName: 'Kouadio Aya',
      date: '2025-01-12',
      startTime: '14:00',
      endTime: '16:00',
      subjects: ['Physique'],
      chapters: 'Les forces et le mouvement',
      summary: 'Application des lois de Newton avec exercices',
      observations: 'Quelques difficultés sur les calculs vectoriels',
      behavior: 'Effort soutenu malgré la difficulté',
      status: 'rejetée',
      dateCreation: '2025-01-12T16:45:00Z',
      rejectionReason: 'Durée de séance insuffisante documentée',
    },
  ];

  const months = [
    'Tous les mois', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSessions(demoSessions);
      setFilteredSessions(demoSessions);
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
    let filtered = sessions.filter(session => {
      const matchesSearch = 
        session.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()));
      const sessionDate = new Date(session.date);
      const matchesMonth = selectedMonth === 0 || sessionDate.getMonth() + 1 === selectedMonth;
      const matchesYear = sessionDate.getFullYear() === selectedYear;
      return matchesSearch && matchesMonth && matchesYear;
    });
    setFilteredSessions(filtered);
  }, [searchQuery, sessions, selectedMonth, selectedYear]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validée':
        return <CheckCircle color="#10B981" size={20} />;
      case 'en_attente':
        return <Clock color="#F59E0B" size={20} />;
      case 'rejetée':
        return <XCircle color="#EF4444" size={20} />;
      default:
        return null;
    }
  };

  const getStatusCounts = () => {
    const counts = {
      en_attente: 0,
      validée: 0,
      rejetée: 0,
    };
    sessions.forEach(session => {
      counts[session.status]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  const SessionItem = ({ session }: { session: Session }) => (
    <TouchableOpacity 
      style={styles.sessionItem}
      onPress={() => setSelectedSession(session)}
    >
      <View style={styles.sessionItemContent}>
        <Text style={styles.sessionItemText}>{session.studentName}</Text>
        <Text style={styles.sessionItemSubText}>{session.date}</Text>
      </View>
      {getStatusIcon(session.status)}
    </TouchableOpacity>
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
          justifyContent: isMobile ? 'flex-end' : 'center',
          paddingHorizontal: isMobile ? 16 : 20,
          paddingBottom: isMobile ? 20 : 0,
        }
      ]}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              width: isMobile ? '100%' : Math.min(screenWidth * 0.6, 600),
              maxHeight: isMobile ? screenHeight * 0.9 : screenHeight * 0.8,
              borderRadius: isMobile ? 20 : 16,
              borderBottomLeftRadius: isMobile ? 0 : 16,
              borderBottomRightRadius: isMobile ? 0 : 16,
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
              paddingVertical: isMobile ? 24 : 20,
              paddingHorizontal: isMobile ? 20 : 24,
            }
          ]}>
            <Text style={[
              styles.modalTitle,
              {
                fontSize: isMobile ? 18 : 20,
                paddingHorizontal: isMobile ? 40 : 0,
              }
            ]}>Détails de la Séance</Text>
            <TouchableOpacity 
              style={[
                styles.closeButton,
                {
                  right: isMobile ? 20 : 16,
                  top: isMobile ? 20 : 16,
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
                  padding: isMobile ? 20 : 24,
                  maxHeight: isMobile ? screenHeight * 0.7 : screenHeight * 0.6,
                }
              ]}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContentContainer}
            >
              <View style={[
                styles.detailSection,
                {
                  marginBottom: isMobile ? 12 : 16,
                  borderRadius: isMobile ? 12 : 8,
                  padding: isMobile ? 16 : 16,
                }
              ]}>
                <Text style={[
                  styles.detailLabel,
                  {
                    fontSize: isMobile ? 13 : 14,
                    marginBottom: isMobile ? 6 : 4,
                    textTransform: isMobile ? 'uppercase' : 'none',
                    letterSpacing: isMobile ? 0.5 : 0,
                  }
                ]}>Élève</Text>
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isMobile ? 15 : 16,
                    lineHeight: isMobile ? 22 : 24,
                  }
                ]}>{selectedSession.studentName}</Text>
              </View>
              <View style={[
                styles.detailSection,
                {
                  marginBottom: isMobile ? 12 : 16,
                  borderRadius: isMobile ? 12 : 8,
                  padding: isMobile ? 16 : 16,
                }
              ]}>
                <Text style={[
                  styles.detailLabel,
                  {
                    fontSize: isMobile ? 13 : 14,
                    marginBottom: isMobile ? 6 : 4,
                    textTransform: isMobile ? 'uppercase' : 'none',
                    letterSpacing: isMobile ? 0.5 : 0,
                  }
                ]}>Date</Text>
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isMobile ? 15 : 16,
                    lineHeight: isMobile ? 22 : 24,
                  }
                ]}>{selectedSession.date}</Text>
              </View>
              <View style={[
                styles.detailSection,
                {
                  marginBottom: isMobile ? 12 : 16,
                  borderRadius: isMobile ? 12 : 8,
                  padding: isMobile ? 16 : 16,
                }
              ]}>
                <Text style={[
                  styles.detailLabel,
                  {
                    fontSize: isMobile ? 13 : 14,
                    marginBottom: isMobile ? 6 : 4,
                    textTransform: isMobile ? 'uppercase' : 'none',
                    letterSpacing: isMobile ? 0.5 : 0,
                  }
                ]}>Horaire</Text>
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isMobile ? 15 : 16,
                    lineHeight: isMobile ? 22 : 24,
                  }
                ]}>{selectedSession.startTime} - {selectedSession.endTime}</Text>
              </View>
              <View style={[
                styles.detailSection,
                {
                  marginBottom: isMobile ? 12 : 16,
                  borderRadius: isMobile ? 12 : 8,
                  padding: isMobile ? 16 : 16,
                }
              ]}>
                <Text style={[
                  styles.detailLabel,
                  {
                    fontSize: isMobile ? 13 : 14,
                    marginBottom: isMobile ? 6 : 4,
                    textTransform: isMobile ? 'uppercase' : 'none',
                    letterSpacing: isMobile ? 0.5 : 0,
                  }
                ]}>Matières</Text>
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isMobile ? 15 : 16,
                    lineHeight: isMobile ? 22 : 24,
                  }
                ]}>{selectedSession.subjects.join(', ')}</Text>
              </View>
              <View style={[
                styles.detailSection,
                {
                  marginBottom: isMobile ? 12 : 16,
                  borderRadius: isMobile ? 12 : 8,
                  padding: isMobile ? 16 : 16,
                }
              ]}>
                <Text style={[
                  styles.detailLabel,
                  {
                    fontSize: isMobile ? 13 : 14,
                    marginBottom: isMobile ? 6 : 4,
                    textTransform: isMobile ? 'uppercase' : 'none',
                    letterSpacing: isMobile ? 0.5 : 0,
                  }
                ]}>Chapitres</Text>
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isMobile ? 15 : 16,
                    lineHeight: isMobile ? 22 : 24,
                  }
                ]}>{selectedSession.chapters}</Text>
              </View>
              <View style={[
                styles.detailSection,
                {
                  marginBottom: isMobile ? 12 : 16,
                  borderRadius: isMobile ? 12 : 8,
                  padding: isMobile ? 16 : 16,
                }
              ]}>
                <Text style={[
                  styles.detailLabel,
                  {
                    fontSize: isMobile ? 13 : 14,
                    marginBottom: isMobile ? 6 : 4,
                    textTransform: isMobile ? 'uppercase' : 'none',
                    letterSpacing: isMobile ? 0.5 : 0,
                  }
                ]}>Résumé</Text>
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isMobile ? 15 : 16,
                    lineHeight: isMobile ? 22 : 24,
                  }
                ]}>{selectedSession.summary}</Text>
              </View>
              <View style={[
                styles.detailSection,
                {
                  marginBottom: isMobile ? 12 : 16,
                  borderRadius: isMobile ? 12 : 8,
                  padding: isMobile ? 16 : 16,
                }
              ]}>
                <Text style={[
                  styles.detailLabel,
                  {
                    fontSize: isMobile ? 13 : 14,
                    marginBottom: isMobile ? 6 : 4,
                    textTransform: isMobile ? 'uppercase' : 'none',
                    letterSpacing: isMobile ? 0.5 : 0,
                  }
                ]}>Observations</Text>
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isMobile ? 15 : 16,
                    lineHeight: isMobile ? 22 : 24,
                  }
                ]}>{selectedSession.observations}</Text>
              </View>
              <View style={[
                styles.detailSection,
                {
                  marginBottom: isMobile ? 12 : 16,
                  borderRadius: isMobile ? 12 : 8,
                  padding: isMobile ? 16 : 16,
                }
              ]}>
                <Text style={[
                  styles.detailLabel,
                  {
                    fontSize: isMobile ? 13 : 14,
                    marginBottom: isMobile ? 6 : 4,
                    textTransform: isMobile ? 'uppercase' : 'none',
                    letterSpacing: isMobile ? 0.5 : 0,
                  }
                ]}>Comportement</Text>
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isMobile ? 15 : 16,
                    lineHeight: isMobile ? 22 : 24,
                  }
                ]}>{selectedSession.behavior}</Text>
              </View>
              <View style={[
                styles.detailSection,
                {
                  marginBottom: isMobile ? 12 : 16,
                  borderRadius: isMobile ? 12 : 8,
                  padding: isMobile ? 16 : 16,
                }
              ]}>
                <Text style={[
                  styles.detailLabel,
                  {
                    fontSize: isMobile ? 13 : 14,
                    marginBottom: isMobile ? 6 : 4,
                    textTransform: isMobile ? 'uppercase' : 'none',
                    letterSpacing: isMobile ? 0.5 : 0,
                  }
                ]}>Statut</Text>
                <View style={styles.statusContainer}>
                  {getStatusIcon(selectedSession.status)}
                  <Text style={[
                    styles.statusText,
                    {
                      fontSize: isMobile ? 15 : 16,
                    }
                  ]}>
                    {selectedSession.status === 'en_attente' ? 'En attente' : 
                     selectedSession.status === 'validée' ? 'Validée' : 'Rejetée'}
                  </Text>
                </View>
              </View>
              {selectedSession.rejectionReason && (
                <View style={[
                  styles.detailSection,
                  {
                    marginBottom: isMobile ? 12 : 16,
                    borderRadius: isMobile ? 12 : 8,
                    padding: isMobile ? 16 : 16,
                  }
                ]}>
                  <Text style={[
                    styles.detailLabel,
                    {
                      fontSize: isMobile ? 13 : 14,
                      marginBottom: isMobile ? 6 : 4,
                      textTransform: isMobile ? 'uppercase' : 'none',
                      letterSpacing: isMobile ? 0.5 : 0,
                    }
                  ]}>Motif de rejet</Text>
                  <Text style={[
                    styles.rejectionText,
                    {
                      fontSize: isMobile ? 15 : 16,
                      lineHeight: isMobile ? 22 : 24,
                    }
                  ]}>{selectedSession.rejectionReason}</Text>
                </View>
              )}
              <View style={styles.modalSpacer} />
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#059669', '#10B981']} style={styles.header}>
          <Text style={styles.headerTitle}>Historique des Séances</Text>
          <Text style={styles.headerSubtitle}>Chargement...</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#059669', '#10B981']} style={styles.header}>
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <Text style={styles.headerTitle}>Historique des Séances</Text>
          <Text style={styles.headerSubtitle}>Journal de bord de vos cours</Text>
        </Animated.View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
              <Clock color="#F59E0B" size={24} />
              <Text style={styles.statNumber}>{statusCounts.en_attente}</Text>
              <Text style={styles.statLabel}>En attente</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
              <CheckCircle color="#10B981" size={24} />
              <Text style={styles.statNumber}>{statusCounts.validée}</Text>
              <Text style={styles.statLabel}>Validée</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
              <XCircle color="#EF4444" size={24} />
              <Text style={styles.statNumber}>{statusCounts.rejetée}</Text>
              <Text style={styles.statLabel}>Rejetée</Text>
            </View>
          </View>

          <View style={styles.filtersContainer}>
            <View style={styles.searchBox}>
              <Search color="#6B7280" size={20} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher une séance..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <View style={styles.dateFilters}>
              <TouchableOpacity style={styles.monthSelector}>
                <Calendar color="#6B7280" size={16} />
                <Text style={styles.monthText}>{months[selectedMonth]}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.yearSelector}>
                <Text style={styles.yearText}>{selectedYear}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {filteredSessions.map((session) => (
            <SessionItem key={session.id} session={session} />
          ))}
        </ScrollView>
      </Animated.View>

      <SessionDetailsModal />
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
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minWidth: 100,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  filtersContainer: {
    paddingTop: 16,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  dateFilters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  monthText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
  },
  yearSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  yearText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sessionItemContent: {
    flex: 1,
  },
  sessionItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sessionItemSubText: {
    fontSize: 14,
    color: '#6B7280',
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
  modalHeader: {
    alignItems: 'center',
    position: 'relative',
  },
  modalTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    padding: 8,
  },
  modalContent: {
    // Styles de base, les valeurs spécifiques sont appliquées dynamiquement
  },
  modalContentContainer: {
    paddingBottom: 20, // Add some padding at the bottom for the last item
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusText: {
    color: '#1F2937',
    marginLeft: 8,
    fontWeight: '500',
  },
  rejectionText: {
    color: '#EF4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});