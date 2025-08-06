import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Image,
  Animated,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Eye,
  Calendar,
  Clock,
  DollarSign,
  User,
  GraduationCap,
  School,
  Phone,
  Mail,
  BookOpen,
  X
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { 
  ContractTeacherView,
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
  DAYS_OF_WEEK_LABELS,
  formatCurrency
} from '../../../types/Contract';

// Données simulées pour les contrats de l'enseignant connecté
const teacherContracts: ContractTeacherView[] = [
    {
      id: 'contract_1',
    codeContrat: 'CONT-202401-ABC123',
    studentName: 'Marie Kouassi',
    studentClasse: '6ème',
    studentEcole: 'Collège Moderne',
    studentPhoto: '',
    matieres: ['Mathématiques', 'Physique'],
    remunerationTotale: 60000,
    heuresParSemaine: 6,
    schedules: [
      {
        jour: 'lundi',
        heureDebut: '14:00',
        heureFin: '16:00',
        matiere: 'Mathématiques',
        enseignantId: 'teacher_1',
        lieu: 'Domicile',
      },
      {
        jour: 'mercredi',
        heureDebut: '16:00',
        heureFin: '18:00',
        matiere: 'Physique',
        enseignantId: 'teacher_1',
        lieu: 'Domicile',
      }
    ],
    parentContact: {
      name: 'Kouassi Jean',
      phone: '+225 07 12 34 56 78',
      email: 'kouassi.jean@gmail.com',
    },
    statut: 'actif',
    dateDebut: '2024-01-20T00:00:00Z',
  },
  {
    id: 'contract_4',
    codeContrat: 'CONT-202401-JKL012',
    studentName: 'Koffi Sarah',
    studentClasse: '5ème',
    studentEcole: 'Collège Saint-Paul',
    matieres: ['Mathématiques'],
    remunerationTotale: 40000,
    heuresParSemaine: 4,
    schedules: [
      {
        jour: 'mardi',
        heureDebut: '17:00',
        heureFin: '19:00',
        matiere: 'Mathématiques',
        enseignantId: 'teacher_1',
        lieu: 'Centre AS-Training',
      },
      {
        jour: 'vendredi',
        heureDebut: '17:00',
        heureFin: '19:00',
        matiere: 'Mathématiques',
        enseignantId: 'teacher_1',
        lieu: 'Centre AS-Training',
      }
    ],
    parentContact: {
      name: 'Koffi Emmanuel',
      phone: '+225 05 44 55 66 77',
      email: 'koffi.emmanuel@gmail.com',
    },
    statut: 'actif',
    dateDebut: '2024-01-25T00:00:00Z',
  },
  {
    id: 'contract_5',
    codeContrat: 'CONT-202312-MNO345',
    studentName: 'Yao Patricia',
    studentClasse: 'Terminale',
    studentEcole: 'Lycée Moderne',
    matieres: ['Mathématiques', 'Physique'],
    remunerationTotale: 80000,
    heuresParSemaine: 6,
    schedules: [
      {
        jour: 'samedi',
        heureDebut: '08:00',
        heureFin: '12:00',
        matiere: 'Mathématiques',
        enseignantId: 'teacher_1',
        lieu: 'Centre AS-Training',
      }
    ],
    parentContact: {
      name: 'Yao Kouadio',
      phone: '+225 01 78 89 90 12',
      email: 'yao.kouadio@outlook.com',
    },
    statut: 'terminé',
    dateDebut: '2023-12-01T00:00:00Z',
  }
];

export default function TeacherContractsScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [fadeAnim] = useState(new Animated.Value(0));
  const [contracts, setContracts] = useState<ContractTeacherView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContracts = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setContracts(teacherContracts);
      setLoading(false);
    };

    loadContracts();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleViewContract = (contract: ContractTeacherView) => {
    router.push({
      pathname: '/enseignant/contract-detail',
      params: { contractId: contract.id }
    });
  };

  const handleContactParent = (contract: ContractTeacherView) => {
    router.push({
      pathname: '/enseignant/contact-parent',
      params: { 
        contractId: contract.id,
        parentName: contract.parentContact.name,
        parentPhone: contract.parentContact.phone,
        parentEmail: contract.parentContact.email,
        studentName: contract.studentName
      }
    });
  };

  const getStatsData = () => {
    const actifs = contracts.filter(c => c.statut === 'actif').length;
    const termines = contracts.filter(c => c.statut === 'terminé').length;
    const totalRevenue = contracts
      .filter(c => c.statut === 'actif')
      .reduce((sum, c) => sum + c.remunerationTotale, 0);
    const totalHeures = contracts
      .filter(c => c.statut === 'actif')
      .reduce((sum, c) => sum + c.heuresParSemaine, 0);
    
    return { actifs, termines, total: contracts.length, totalRevenue, totalHeures };
  };

  const [selectedContract, setSelectedContract] = useState<ContractTeacherView | null>(null);
  const [modalAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (selectedContract) {
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
  }, [selectedContract]);

  const ContractCard = ({ contract }: { contract: ContractTeacherView }) => (
    <View style={[styles.contractCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
      <View style={styles.cardContent}>
        <View style={styles.contractInfo}>
          <View style={styles.studentInfo}>
            {contract.studentPhoto ? (
              <Image source={{ uri: contract.studentPhoto }} style={styles.studentPhoto} />
            ) : (
              <View style={[styles.studentPhotoPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.studentInitials}>
                  {contract.studentName.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
            )}
            <View style={styles.studentDetails}>
              <Text style={[styles.studentName, { color: colors.text }]}>{contract.studentName}</Text>
              <Text style={[styles.studentClass, { color: colors.textSecondary }]}>
                {contract.studentClasse} - {contract.studentEcole}
              </Text>
              <Text style={[styles.contractCode, { color: colors.primary }]}>{contract.codeContrat}</Text>
            </View>
          </View>
          
          <View style={styles.cardActions}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: CONTRACT_STATUS_COLORS[contract.statut] + '20' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: CONTRACT_STATUS_COLORS[contract.statut] }
              ]}>
                {CONTRACT_STATUS_LABELS[contract.statut]}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.detailsButton, { backgroundColor: colors.primary }]}
              onPress={() => setSelectedContract(contract)}
            >
              <Eye color={colors.background} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const ContractDetailsModal = () => (
    <Modal
      visible={!!selectedContract}
      animationType="none"
      transparent={true}
      onRequestClose={() => setSelectedContract(null)}
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
            ]}>Détails du Contrat</Text>
            <TouchableOpacity 
              style={[
                styles.closeButton,
                {
                  right: isDesktop ? 16 : 20,
                  top: isDesktop ? 16 : 20,
                }
              ]}
              onPress={() => setSelectedContract(null)}
            >
              <X color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </LinearGradient>

          {selectedContract && (
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
                ]}>{selectedContract.studentName}</Text>
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
                ]}>Classe</Text>
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isDesktop ? 16 : 15,
                    lineHeight: isDesktop ? 24 : 22,
                  }
                ]}>{selectedContract.studentClasse} - {selectedContract.studentEcole}</Text>
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
                ]}>Code Contrat</Text>
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isDesktop ? 16 : 15,
                    lineHeight: isDesktop ? 24 : 22,
                  }
                ]}>{selectedContract.codeContrat}</Text>
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
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isDesktop ? 16 : 15,
                    lineHeight: isDesktop ? 24 : 22,
                    color: CONTRACT_STATUS_COLORS[selectedContract.statut],
                  }
                ]}>{CONTRACT_STATUS_LABELS[selectedContract.statut]}</Text>
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
                ]}>Matières enseignées</Text>
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isDesktop ? 16 : 15,
                    lineHeight: isDesktop ? 24 : 22,
                  }
                ]}>{selectedContract.matieres.join(', ')}</Text>
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
                ]}>Rémunération mensuelle</Text>
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isDesktop ? 16 : 15,
                    lineHeight: isDesktop ? 24 : 22,
                  }
                ]}>{formatCurrency(selectedContract.remunerationTotale)}</Text>
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
                ]}>Heures par semaine</Text>
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isDesktop ? 16 : 15,
                    lineHeight: isDesktop ? 24 : 22,
                  }
                ]}>{selectedContract.heuresParSemaine}h</Text>
              </View>

              {selectedContract.schedules.length > 0 && (
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
                  ]}>Planning des cours</Text>
                  {selectedContract.schedules.map((schedule, index) => (
                    <View key={index} style={styles.scheduleDetail}>
                      <Text style={[
                        styles.detailText,
                        {
                          fontSize: isDesktop ? 16 : 15,
                          lineHeight: isDesktop ? 24 : 22,
                          fontWeight: '600',
                        }
                      ]}>
                        {DAYS_OF_WEEK_LABELS[schedule.jour]}
                      </Text>
                      <Text style={[
                        styles.detailText,
                        {
                          fontSize: isDesktop ? 16 : 15,
                          lineHeight: isDesktop ? 24 : 22,
                        }
                      ]}>
                        {schedule.heureDebut} - {schedule.heureFin}
                      </Text>
                      <Text style={[
                        styles.detailText,
                        {
                          fontSize: isDesktop ? 16 : 15,
                          lineHeight: isDesktop ? 24 : 22,
                        }
                      ]}>
                        {schedule.matiere}
                      </Text>
                      <Text style={[
                        styles.detailText,
                        {
                          fontSize: isDesktop ? 16 : 15,
                          lineHeight: isDesktop ? 24 : 22,
                        }
                      ]}>
                        📍 {schedule.lieu}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

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
                ]}>Contact parent</Text>
                <Text style={[
                  styles.detailText,
                  {
                    fontSize: isDesktop ? 16 : 15,
                    lineHeight: isDesktop ? 24 : 22,
                  }
                ]}>{selectedContract.parentContact.name}</Text>
              </View>

              <View style={styles.modalSpacer} />
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );

  const stats = getStatsData();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.pageTitle}>Mes Contrats</Text>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement de vos contrats...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header fixe */}
      <LinearGradient colors={['#059669', '#10B981']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>Mes Contrats</Text>
          <Text style={styles.pageSubtitle}>
            {stats.total} contrat{stats.total > 1 ? 's' : ''} • {stats.totalHeures}h/semaine
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Section des statistiques */}
          <View style={styles.statsSection}>
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <BookOpen color="#10B981" size={24} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{stats.actifs}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Contrats actifs</Text>
          </View>

              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <Clock color="#3B82F6" size={24} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{stats.totalHeures}h</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Heures/semaine</Text>
          </View>

              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <DollarSign color="#F59E0B" size={24} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{formatCurrency(stats.totalRevenue)}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Revenus mensuels</Text>
            </View>
            </View>
          </View>

          {/* Liste des contrats */}
          <View style={styles.contractsList}>
            {contracts.length > 0 ? (
              contracts.map((contract) => (
              <ContractCard key={contract.id} contract={contract} />
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                <BookOpen color={colors.textSecondary} size={48} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Aucun contrat trouvé
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Vous n'avez pas encore de contrats assignés.
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
      
      <ContractDetailsModal />
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
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  contractsList: {
    gap: 16,
  },
  contractCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  contractInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardActions: {
    alignItems: 'flex-end',
    gap: 12,
  },
  detailsButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  studentPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  studentPhotoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  studentClass: {
    fontSize: 14,
    marginBottom: 2,
  },
  contractCode: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  subjectsSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: '600',
  },
  financialSection: {
    marginBottom: 16,
  },
  financialRow: {
    flexDirection: 'row',
    gap: 16,
  },
  financialItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  financialLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  financialValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  scheduleSection: {
    marginBottom: 16,
  },
  scheduleList: {
    gap: 8,
  },
  scheduleItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  scheduleDay: {
    minWidth: 80,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
  },
  scheduleDetails: {
    flex: 1,
  },
  matiereText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  lieuText: {
    fontSize: 12,
  },
  parentSection: {
    marginBottom: 16,
  },
  parentContact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  parentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  parentName: {
    fontSize: 14,
    fontWeight: '600',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    padding: 8,
    borderRadius: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
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
  scheduleDetail: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});