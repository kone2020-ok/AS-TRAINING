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
  Users,
  MapPin,
  CreditCard
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { 
  ContractParentView,
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
  DAYS_OF_WEEK_LABELS,
  formatCurrency
} from '../../../types/Contract';

// Données simulées pour les contrats des enfants du parent connecté
const parentContracts: ContractParentView[] = [
  {
    id: 'contract_1',
    codeContrat: 'CONT-202401-ABC123',
    student: {
      id: 'student_1',
      nom: 'Kouassi',
      prenoms: 'Marie',
      classe: '6ème',
      ecole: 'Collège Moderne',
      matricule: 'CM2024001',
      dateNaissance: '2010-03-15',
      photo: '',
    },
    teachers: [
      {
        name: 'Marie N\'Guessan',
        matieres: ['Mathématiques', 'Physique'],
        contact: {
          email: 'marie.nguessan@gmail.com',
          phone: '+225 05 98 76 54 32',
        },
      }
    ],
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
    financial: {
      coutTotal: 80000,
      modePaiement: 'mensuel',
      prochainePaiement: '2024-02-01T00:00:00Z',
    },
    statut: 'actif',
    dateDebut: '2024-01-20T00:00:00Z',
  },
  {
    id: 'contract_6',
    codeContrat: 'CONT-202401-PQR678',
    student: {
      id: 'student_6',
      nom: 'Kouassi',
      prenoms: 'Junior',
      classe: '3ème',
      ecole: 'Collège Moderne',
      matricule: 'CM2024006',
      dateNaissance: '2008-11-20',
    },
      teachers: [
        {
        name: 'Jean Kouassi',
        matieres: ['Français', 'Histoire'],
        contact: {
          email: 'jean.kouassi@gmail.com',
          phone: '+225 07 59 63 27 88',
        },
      },
      {
        name: 'Mamadou Diabaté',
        matieres: ['Anglais'],
        contact: {
          email: 'diabate.mamadou@outlook.com',
          phone: '+225 01 45 67 89 12',
        },
      }
    ],
    schedules: [
      {
        jour: 'mardi',
        heureDebut: '15:00',
        heureFin: '17:00',
        matiere: 'Français',
        enseignantId: 'teacher_2',
        lieu: 'Centre AS-Training',
      },
      {
        jour: 'jeudi',
        heureDebut: '14:00',
        heureFin: '16:00',
        matiere: 'Histoire',
        enseignantId: 'teacher_2',
        lieu: 'Centre AS-Training',
      },
      {
        jour: 'samedi',
        heureDebut: '09:00',
        heureFin: '11:00',
        matiere: 'Anglais',
        enseignantId: 'teacher_3',
        lieu: 'Domicile',
      }
    ],
    financial: {
      coutTotal: 120000,
      modePaiement: 'mensuel',
      prochainePaiement: '2024-02-01T00:00:00Z',
    },
    statut: 'actif',
    dateDebut: '2024-01-15T00:00:00Z',
  },
  {
    id: 'contract_7',
    codeContrat: 'CONT-202312-STU901',
    student: {
      id: 'student_7',
      nom: 'Kouassi',
      prenoms: 'Prisca',
      classe: 'Terminale',
      ecole: 'Lycée Moderne',
      matricule: 'LM2023007',
      dateNaissance: '2005-04-12',
    },
      teachers: [
        {
        name: 'Fatou Koné',
        matieres: ['Sciences Physiques', 'Chimie'],
        contact: {
          email: 'kone.fatou@yahoo.fr',
          phone: '+225 09 87 65 43 21',
        },
      }
    ],
    schedules: [
      {
        jour: 'lundi',
        heureDebut: '18:00',
        heureFin: '20:00',
        matiere: 'Sciences Physiques',
        enseignantId: 'teacher_4',
        lieu: 'Centre AS-Training',
      },
      {
        jour: 'mercredi',
        heureDebut: '18:00',
        heureFin: '20:00',
        matiere: 'Chimie',
        enseignantId: 'teacher_4',
        lieu: 'Centre AS-Training',
      }
    ],
    financial: {
      coutTotal: 150000,
      modePaiement: 'mensuel',
      prochainePaiement: '2024-02-01T00:00:00Z',
    },
    statut: 'terminé',
    dateDebut: '2023-12-01T00:00:00Z',
    dateFin: '2024-01-15T00:00:00Z',
  }
];

export default function ParentContractsScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [fadeAnim] = useState(new Animated.Value(0));
  const [contracts, setContracts] = useState<ContractParentView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContracts = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setContracts(parentContracts);
      setLoading(false);
    };

    loadContracts();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleViewContract = (contract: ContractParentView) => {
    router.push({
      pathname: '/parent/contract-detail',
      params: { contractId: contract.id }
    });
  };

  const handleContactTeacher = (teacher: any, studentName: string) => {
    router.push({
      pathname: '/parent/contact-teacher',
      params: { 
        teacherName: teacher.name,
        teacherPhone: teacher.contact.phone,
        teacherEmail: teacher.contact.email,
        studentName: studentName,
        subjects: teacher.matieres.join(', ')
      }
    });
  };

  const handleViewSchedule = (contract: ContractParentView) => {
    router.push({
      pathname: '/parent/schedule-detail',
      params: { 
        contractId: contract.id,
        studentName: `${contract.student.prenoms} ${contract.student.nom}`
      }
    });
  };

  const getStatsData = () => {
    const actifs = contracts.filter(c => c.statut === 'actif').length;
    const termines = contracts.filter(c => c.statut === 'terminé').length;
    const totalCost = contracts
      .filter(c => c.statut === 'actif')
      .reduce((sum, c) => sum + c.financial.coutTotal, 0);
    const totalChildren = contracts.length;
    
    return { actifs, termines, total: contracts.length, totalCost, totalChildren };
  };

  const ContractCard = ({ contract }: { contract: ContractParentView }) => (
    <View style={[styles.contractCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
      {/* Header de la carte avec photo de l'enfant */}
      <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
        <View style={styles.studentInfo}>
          {contract.student.photo ? (
            <Image source={{ uri: contract.student.photo }} style={styles.studentPhoto} />
          ) : (
            <View style={[styles.studentPhotoPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.studentInitials}>
                {contract.student.prenoms.charAt(0)}{contract.student.nom.charAt(0)}
              </Text>
            </View>
          )}
          <View style={styles.studentDetails}>
            <Text style={[styles.studentName, { color: colors.text }]}>
              {contract.student.prenoms} {contract.student.nom}
            </Text>
            <View style={styles.studentMeta}>
              <View style={styles.metaItem}>
                <GraduationCap color={colors.textSecondary} size={14} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {contract.student.classe}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <School color={colors.textSecondary} size={14} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {contract.student.ecole}
                </Text>
              </View>
            </View>
            <Text style={[styles.contractCode, { color: colors.primary }]}>
              {contract.codeContrat}
            </Text>
          </View>
        </View>
        
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
      </View>

      {/* Contenu principal */}
      <View style={styles.cardContent}>
        {/* Section enseignants */}
        <View style={styles.teachersSection}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Enseignants ({contract.teachers.length})
          </Text>
          <View style={styles.teachersList}>
            {contract.teachers.map((teacher, index) => (
              <View key={index} style={[styles.teacherCard, { backgroundColor: colors.background }]}>
                <View style={styles.teacherInfo}>
                  <View style={styles.teacherHeader}>
                    <User color={colors.primary} size={16} />
                    <Text style={[styles.teacherName, { color: colors.text }]}>
                      {teacher.name}
                    </Text>
                  </View>
                  <Text style={[styles.teacherSubjects, { color: colors.textSecondary }]}>
                    {teacher.matieres.join(', ')}
                  </Text>
                </View>
                <View style={styles.teacherActions}>
                  <TouchableOpacity 
                    style={[styles.teacherActionButton, { backgroundColor: '#10B981' }]}
                    onPress={() => handleContactTeacher(teacher, `${contract.student.prenoms} ${contract.student.nom}`)}
                  >
                    <Phone color="#FFFFFF" size={14} />
                  </TouchableOpacity>
        <TouchableOpacity 
                    style={[styles.teacherActionButton, { backgroundColor: '#3B82F6' }]}
                    onPress={() => handleContactTeacher(teacher, `${contract.student.prenoms} ${contract.student.nom}`)}
        >
                    <Mail color="#FFFFFF" size={14} />
        </TouchableOpacity>
      </View>
              </View>
            ))}
          </View>
        </View>

        {/* Planning résumé */}
        {contract.schedules.length > 0 && (
          <View style={styles.scheduleSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                Planning ({contract.schedules.length} cours/semaine)
              </Text>
              <TouchableOpacity 
                style={[styles.viewScheduleButton, { backgroundColor: colors.primary + '20' }]}
                onPress={() => handleViewSchedule(contract)}
              >
                <Calendar color={colors.primary} size={14} />
                <Text style={[styles.viewScheduleText, { color: colors.primary }]}>
                  Voir tout
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.schedulePreview}>
              {contract.schedules.slice(0, 2).map((schedule, index) => (
                <View key={index} style={[styles.scheduleItem, { backgroundColor: colors.background }]}>
                  <View style={styles.scheduleTime}>
                    <Text style={[styles.dayText, { color: colors.text }]}>
                      {DAYS_OF_WEEK_LABELS[schedule.jour]}
                    </Text>
                    <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                      {schedule.heureDebut}-{schedule.heureFin}
                    </Text>
                  </View>
                  <View style={styles.scheduleInfo}>
                    <Text style={[styles.subjectText, { color: colors.primary }]}>
                      {schedule.matiere}
                    </Text>
                    <View style={styles.locationInfo}>
                      <MapPin color={colors.textSecondary} size={12} />
                      <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                        {schedule.lieu}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
              {contract.schedules.length > 2 && (
                <Text style={[styles.moreSchedules, { color: colors.textSecondary }]}>
                  +{contract.schedules.length - 2} autres cours...
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Informations financières */}
        <View style={styles.financialSection}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Informations financières
          </Text>
          <View style={[styles.financialCard, { backgroundColor: colors.background }]}>
            <View style={styles.financialRow}>
              <View style={styles.financialItem}>
                <DollarSign color="#10B981" size={18} />
                <View>
                  <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>
                    Coût mensuel
                  </Text>
                  <Text style={[styles.financialValue, { color: colors.text }]}>
                    {formatCurrency(contract.financial.coutTotal)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.financialItem}>
                <CreditCard color="#3B82F6" size={18} />
                <View>
                  <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>
                    Paiement
                  </Text>
                  <Text style={[styles.financialValue, { color: colors.text }]}>
                    {contract.financial.modePaiement}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={[styles.nextPayment, { borderTopColor: colors.border }]}>
              <Calendar color="#F59E0B" size={16} />
              <Text style={[styles.nextPaymentText, { color: colors.text }]}>
                Prochaine échéance: {new Date(contract.financial.prochainePaiement).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>
        </View>

        {/* Dates du contrat */}
        <View style={styles.datesSection}>
          <View style={styles.dateItem}>
            <Calendar color={colors.textSecondary} size={16} />
            <View>
              <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
                Début du contrat
              </Text>
              <Text style={[styles.dateValue, { color: colors.text }]}>
                {new Date(contract.dateDebut).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>
          
          {contract.dateFin && (
            <View style={styles.dateItem}>
              <Calendar color={colors.textSecondary} size={16} />
              <View>
                <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
                  Fin du contrat
                </Text>
                <Text style={[styles.dateValue, { color: colors.text }]}>
                  {new Date(contract.dateFin).toLocaleDateString('fr-FR')}
            </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => handleViewContract(contract)}
        >
          <Eye color={colors.background} size={18} />
          <Text style={[styles.actionButtonText, { color: colors.background }]}>
            Voir détails
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#10B981' }]}
          onPress={() => handleViewSchedule(contract)}
        >
          <Calendar color="#FFFFFF" size={18} />
          <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
            Planning
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const stats = getStatsData();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.pageTitle}>Contrats de mes Enfants</Text>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement des contrats...
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
          <Text style={styles.pageTitle}>Contrats de mes Enfants</Text>
          <Text style={styles.pageSubtitle}>
            {stats.totalChildren} enfant{stats.totalChildren > 1 ? 's' : ''} • {stats.actifs} contrat{stats.actifs > 1 ? 's' : ''} actif{stats.actifs > 1 ? 's' : ''}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Section des statistiques */}
          <View style={styles.statsSection}>
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <Users color="#10B981" size={24} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{stats.totalChildren}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Enfants inscrits</Text>
          </View>

              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <BookOpen color="#3B82F6" size={24} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{stats.actifs}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Contrats actifs</Text>
            </View>
              
              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <DollarSign color="#F59E0B" size={24} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{formatCurrency(stats.totalCost)}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Coût mensuel total</Text>
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
                <Users color={colors.textSecondary} size={48} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Aucun contrat trouvé
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Vos enfants n'ont pas encore de contrats actifs.
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
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
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  contractsList: {
    gap: 20,
  },
  contractCard: {
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
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  studentPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  studentPhotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentInitials: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  studentMeta: {
    gap: 4,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
  },
  contractCode: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 20,
  },
  teachersSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  teachersList: {
    gap: 8,
  },
  teacherCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  teacherName: {
    fontSize: 14,
    fontWeight: '600',
  },
  teacherSubjects: {
    fontSize: 12,
  },
  teacherActions: {
    flexDirection: 'row',
    gap: 6,
  },
  teacherActionButton: {
    padding: 6,
    borderRadius: 6,
  },
  scheduleSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewScheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  viewScheduleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  schedulePreview: {
    gap: 8,
  },
  scheduleItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  scheduleTime: {
    minWidth: 70,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
  },
  scheduleInfo: {
    flex: 1,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
  },
  moreSchedules: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  financialSection: {
    marginBottom: 20,
  },
  financialCard: {
    padding: 16,
    borderRadius: 12,
  },
  financialRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  financialItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  financialLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  financialValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  nextPayment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  nextPaymentText: {
    fontSize: 13,
    fontWeight: '500',
  },
  datesSection: {
    flexDirection: 'row',
    gap: 20,
  },
  dateItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    padding: 20,
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
});