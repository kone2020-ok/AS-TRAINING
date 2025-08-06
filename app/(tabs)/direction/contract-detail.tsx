import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  useWindowDimensions,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  User,
  GraduationCap,
  School,
  FileText,
  Printer,
  Download,
  Copy,
  CheckCircle,
  Users,
  BookOpen
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Linking } from 'react-native';
import { safeCopyToClipboard } from '../../../utils/PlatformUtils';
import { 
  Contract,
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
  DAYS_OF_WEEK_LABELS,
  formatCurrency,
  getContractDuration
} from '../../../types/Contract';

// Données de démonstration (même que dans contracts.tsx)
const demoContracts: Contract[] = [
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
    parentId: 'parent_1',
    parentName: 'Kouassi Jean',
    parentEmail: 'kouassi.jean@gmail.com',
    parentPhone: '+225 07 12 34 56 78',
    parentAddress: 'Cocody, Abidjan',
    teachers: [
      {
        id: 'ct_1',
        teacherId: 'teacher_1',
        teacherName: 'Marie N\'Guessan',
        teacherEmail: 'marie.nguessan@gmail.com',
        teacherPhone: '+225 05 98 76 54 32',
        matieres: ['Mathématiques', 'Physique'],
        remunerationParHeure: 2500,
        totalHeuresParSemaine: 6,
        remunerationTotale: 60000,
      }
    ],
    financial: {
      coutParent: 80000,
      remunerationTotaleEnseignants: 60000,
      fraisAdministratifs: 15000,
      totalContrat: 75000,
      modePaiement: 'mensuel',
      dateEcheance: '2024-02-01T00:00:00Z',
    },
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
    statut: 'actif',
    dateCreation: '2024-01-15T10:00:00Z',
    dateDebut: '2024-01-20T00:00:00Z',
    dureeEnMois: 12,
    creePar: 'direction_admin',
    noteInterne: 'Élève très motivée, parents très impliqués.',
  },
  {
    id: 'contract_2',
    codeContrat: 'CONT-202401-DEF456',
    student: {
      id: 'student_2',
      nom: 'Traoré',
      prenoms: 'Amadou',
      classe: '3ème',
      ecole: 'Lycée Moderne',
      matricule: 'LM2024002',
      dateNaissance: '2008-07-22',
    },
    parentId: 'parent_2',
    parentName: 'Traoré Fatou',
    parentEmail: 'traore.fatou@outlook.com',
    parentPhone: '+225 01 23 45 67 89',
    parentAddress: 'Yopougon, Abidjan',
    teachers: [
      {
        id: 'ct_2',
        teacherId: 'teacher_2',
        teacherName: 'Jean Kouassi',
        teacherEmail: 'jean.kouassi@gmail.com',
        teacherPhone: '+225 07 59 63 27 88',
        matieres: ['Français', 'Histoire'],
        remunerationParHeure: 3000,
        totalHeuresParSemaine: 4,
        remunerationTotale: 48000,
      },
      {
        id: 'ct_3',
        teacherId: 'teacher_3',
        teacherName: 'Mamadou Diabaté',
        teacherEmail: 'diabate.mamadou@outlook.com',
        teacherPhone: '+225 01 45 67 89 12',
        matieres: ['Anglais'],
        remunerationParHeure: 2800,
        totalHeuresParSemaine: 3,
        remunerationTotale: 33600,
      }
    ],
    financial: {
      coutParent: 100000,
      remunerationTotaleEnseignants: 81600,
      fraisAdministratifs: 18400,
      totalContrat: 100000,
      modePaiement: 'mensuel',
      dateEcheance: '2024-02-01T00:00:00Z',
    },
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
    statut: 'actif',
    dateCreation: '2024-01-10T14:30:00Z',
    dateDebut: '2024-01-15T00:00:00Z',
    dureeEnMois: 10,
    creePar: 'direction_admin',
  },
  {
    id: 'contract_3',
    codeContrat: 'CONT-202312-GHI789',
    student: {
      id: 'student_3',
      nom: 'Diabaté',
      prenoms: 'Aïcha',
      classe: 'Terminale',
      ecole: 'Lycée Technique',
      matricule: 'LT2023001',
      dateNaissance: '2005-11-08',
    },
    parentId: 'parent_3',
    parentName: 'Diabaté Ibrahim',
    parentEmail: 'diabate.ibrahim@yahoo.fr',
    parentPhone: '+225 09 87 65 43 21',
    parentAddress: 'Adjamé, Abidjan',
    teachers: [
      {
        id: 'ct_4',
        teacherId: 'teacher_4',
        teacherName: 'Fatou Koné',
        teacherEmail: 'kone.fatou@yahoo.fr',
        teacherPhone: '+225 09 87 65 43 21',
        matieres: ['Sciences Physiques', 'Chimie'],
        remunerationParHeure: 4000,
        totalHeuresParSemaine: 5,
        remunerationTotale: 80000,
      }
    ],
    financial: {
      coutParent: 120000,
      remunerationTotaleEnseignants: 80000,
      fraisAdministratifs: 25000,
      totalContrat: 105000,
      modePaiement: 'mensuel',
      dateEcheance: '2024-01-01T00:00:00Z',
    },
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
    statut: 'terminé',
    dateCreation: '2023-12-01T09:15:00Z',
    dateDebut: '2023-12-15T00:00:00Z',
    dateFin: '2024-01-15T00:00:00Z',
    dureeEnMois: 1,
    creePar: 'direction_admin',
    noteInterne: 'Contrat terminé avec succès. Élève admise au BAC.',
  }
];

interface PrintableContractViewProps {
  contract: Contract;
  viewType: 'parent' | 'enseignant' | 'direction';
  onClose: () => void;
}

const PrintableContractView: React.FC<PrintableContractViewProps> = ({ 
  contract, 
  viewType, 
  onClose 
}) => {
  const { colors } = useTheme();

  const handlePrint = () => {
    if (Platform.OS === 'web') {
      window.print();
    } else {
      Alert.alert(
        'Impression', 
        'Sur mobile, utilisez le menu de partage pour imprimer ou sauvegarder en PDF.'
      );
    }
  };

  const getViewTitle = () => {
    switch (viewType) {
      case 'parent': return 'Contrat - Vue Parent';
      case 'enseignant': return 'Contrat - Vue Enseignant';
      case 'direction': return 'Contrat - Vue Administrative';
      default: return 'Contrat';
    }
  };

  const shouldShowSection = (section: string) => {
    switch (viewType) {
      case 'parent':
        return ['student', 'teachers', 'schedules', 'financial-parent'].includes(section);
      case 'enseignant':
        return ['student', 'parent-contact', 'schedules', 'financial-teacher'].includes(section);
      case 'direction':
        return true; // Toutes les sections
      default:
        return true;
    }
  };

  return (
    <Modal visible={true} animationType="slide" transparent={false}>
      <View style={[styles.printContainer, { backgroundColor: colors.background }]}>
        {/* Header d'impression */}
        <View style={[styles.printHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={[styles.printTitle, { color: colors.text }]}>{getViewTitle()}</Text>
          <TouchableOpacity onPress={handlePrint} style={[styles.printButton, { backgroundColor: colors.primary }]}>
            <Printer color={colors.background} size={20} />
          </TouchableOpacity>
        </View>

        {/* Contenu à imprimer */}
        <ScrollView style={styles.printContent} showsVerticalScrollIndicator={false}>
          {/* En-tête du contrat */}
          <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.contractHeader}>
            <View style={styles.brandSection}>
              <Text style={styles.brandName}>AS-TRAINING</Text>
              <Text style={styles.brandSubtitle}>Groupe Éducatif</Text>
            </View>
            <View style={styles.contractInfo}>
              <Text style={styles.contractCode}>{contract.codeContrat}</Text>
              <Text style={styles.contractDate}>
                Créé le {new Date(contract.dateCreation).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.printSections}>
            {/* Section Élève */}
            {shouldShowSection('student') && (
              <View style={[styles.printSection, { borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  <GraduationCap color={colors.primary} size={20} /> Informations de l'élève
                </Text>
                <View style={styles.studentSection}>
                  <View style={styles.studentPhotoContainer}>
                    {contract.student.photo ? (
                      <Image source={{ uri: contract.student.photo }} style={styles.studentPhotoPrint} />
                    ) : (
                      <View style={[styles.studentPhotoPlaceholder, { backgroundColor: colors.primary }]}>
                        <Text style={styles.studentInitials}>
                          {contract.student.prenoms.charAt(0)}{contract.student.nom.charAt(0)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.studentDetails}>
                    <Text style={[styles.studentName, { color: colors.text }]}>
                      {contract.student.prenoms} {contract.student.nom}
                    </Text>
                    <View style={styles.studentInfoGrid}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Classe:</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{contract.student.classe}</Text>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>École:</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{contract.student.ecole}</Text>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Matricule:</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{contract.student.matricule}</Text>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Date de naissance:</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>
                        {new Date(contract.student.dateNaissance).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Section Parent (si autorisée) */}
            {shouldShowSection('parent-contact') && (
              <View style={[styles.printSection, { borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  <Users color={colors.primary} size={20} /> Contact Parent
                </Text>
                <View style={styles.contactGrid}>
                  <View style={styles.contactItem}>
                    <User color={colors.textSecondary} size={16} />
                    <Text style={[styles.contactValue, { color: colors.text }]}>{contract.parentName}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Phone color={colors.textSecondary} size={16} />
                    <Text style={[styles.contactValue, { color: colors.text }]}>{contract.parentPhone}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Mail color={colors.textSecondary} size={16} />
                    <Text style={[styles.contactValue, { color: colors.text }]}>{contract.parentEmail}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <MapPin color={colors.textSecondary} size={16} />
                    <Text style={[styles.contactValue, { color: colors.text }]}>{contract.parentAddress}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Section Enseignants */}
            {shouldShowSection('teachers') && (
              <View style={[styles.printSection, { borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  <BookOpen color={colors.primary} size={20} /> Enseignants Assignés
                </Text>
                {contract.teachers.map((teacher, index) => (
                  <View key={teacher.id} style={[styles.teacherCard, { backgroundColor: colors.card }]}>
                    <View style={styles.teacherHeader}>
                      <Text style={[styles.teacherName, { color: colors.text }]}>{teacher.teacherName}</Text>
                      {viewType === 'enseignant' && (
                        <Text style={[styles.teacherSalary, { color: '#10B981' }]}>
                          {formatCurrency(teacher.remunerationTotale)}/mois
                        </Text>
                      )}
                    </View>
                    <View style={styles.teacherDetails}>
                      <Text style={[styles.teacherSubjects, { color: colors.textSecondary }]}>
                        Matières: {teacher.matieres.join(', ')}
                      </Text>
                      <Text style={[styles.teacherHours, { color: colors.textSecondary }]}>
                        {teacher.totalHeuresParSemaine}h/semaine
                      </Text>
                      {viewType !== 'parent' && (
                        <View style={styles.teacherContact}>
                          <Text style={[styles.contactInfo, { color: colors.textSecondary }]}>
                            📧 {teacher.teacherEmail}
                          </Text>
                          <Text style={[styles.contactInfo, { color: colors.textSecondary }]}>
                            📞 {teacher.teacherPhone}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Section Planning */}
            {shouldShowSection('schedules') && contract.schedules.length > 0 && (
              <View style={[styles.printSection, { borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  <Calendar color={colors.primary} size={20} /> Planning des Cours
                </Text>
                <View style={styles.scheduleGrid}>
                  {contract.schedules.map((schedule, index) => (
                    <View key={index} style={[styles.scheduleItem, { backgroundColor: colors.card }]}>
                      <Text style={[styles.scheduleDay, { color: colors.text }]}>
                        {DAYS_OF_WEEK_LABELS[schedule.jour]}
                      </Text>
                      <Text style={[styles.scheduleTime, { color: colors.textSecondary }]}>
                        {schedule.heureDebut} - {schedule.heureFin}
                      </Text>
                      <Text style={[styles.scheduleSubject, { color: colors.primary }]}>
                        {schedule.matiere}
                      </Text>
                      <Text style={[styles.scheduleLocation, { color: colors.textSecondary }]}>
                        📍 {schedule.lieu}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Section Financière - Vue Parent */}
            {shouldShowSection('financial-parent') && (
              <View style={[styles.printSection, { borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  <DollarSign color={colors.primary} size={20} /> Informations Financières
                </Text>
                <View style={styles.financialGrid}>
                  <View style={styles.financialItem}>
                    <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>Coût mensuel:</Text>
                    <Text style={[styles.financialValue, { color: colors.text }]}>
                      {formatCurrency(contract.financial.coutParent)}
                    </Text>
                  </View>
                  <View style={styles.financialItem}>
                    <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>Mode de paiement:</Text>
                    <Text style={[styles.financialValue, { color: colors.text }]}>
                      {contract.financial.modePaiement}
                    </Text>
                  </View>
                  <View style={styles.financialItem}>
                    <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>Prochaine échéance:</Text>
                    <Text style={[styles.financialValue, { color: colors.text }]}>
                      {new Date(contract.financial.dateEcheance).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Section Financière - Vue Enseignant */}
            {shouldShowSection('financial-teacher') && (
              <View style={[styles.printSection, { borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  <DollarSign color={colors.primary} size={20} /> Rémunération
                </Text>
                <View style={styles.financialGrid}>
                  {contract.teachers.map((teacher, index) => (
                    <View key={teacher.id} style={styles.teacherSalaryBreakdown}>
                      <Text style={[styles.teacherName, { color: colors.text }]}>{teacher.teacherName}</Text>
                      <Text style={[styles.salaryDetail, { color: colors.textSecondary }]}>
                        {formatCurrency(teacher.remunerationParHeure)}/heure × {teacher.totalHeuresParSemaine}h/semaine
                      </Text>
                      <Text style={[styles.salaryTotal, { color: '#10B981' }]}>
                        Total: {formatCurrency(teacher.remunerationTotale)}/mois
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Section Administrative (Direction uniquement) */}
            {viewType === 'direction' && (
              <View style={[styles.printSection, { borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  <FileText color={colors.primary} size={20} /> Informations Administratives
                </Text>
                <View style={styles.adminGrid}>
                  <View style={styles.adminItem}>
                    <Text style={[styles.adminLabel, { color: colors.textSecondary }]}>Statut:</Text>
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
                  <View style={styles.adminItem}>
                    <Text style={[styles.adminLabel, { color: colors.textSecondary }]}>Durée:</Text>
                    <Text style={[styles.adminValue, { color: colors.text }]}>
                      {contract.dureeEnMois} mois
                    </Text>
                  </View>
                  <View style={styles.adminItem}>
                    <Text style={[styles.adminLabel, { color: colors.textSecondary }]}>Date de début:</Text>
                    <Text style={[styles.adminValue, { color: colors.text }]}>
                      {new Date(contract.dateDebut).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                  {contract.dateFin && (
                    <View style={styles.adminItem}>
                      <Text style={[styles.adminLabel, { color: colors.textSecondary }]}>Date de fin:</Text>
                      <Text style={[styles.adminValue, { color: colors.text }]}>
                        {new Date(contract.dateFin).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                  )}
                  <View style={styles.adminItem}>
                    <Text style={[styles.adminLabel, { color: colors.textSecondary }]}>Coût total:</Text>
                    <Text style={[styles.adminValue, { color: colors.text }]}>
                      {formatCurrency(contract.financial.totalContrat)}
                    </Text>
                  </View>
                  <View style={styles.adminItem}>
                    <Text style={[styles.adminLabel, { color: colors.textSecondary }]}>Rémunération enseignants:</Text>
                    <Text style={[styles.adminValue, { color: colors.text }]}>
                      {formatCurrency(contract.financial.remunerationTotaleEnseignants)}
                    </Text>
                  </View>
                  <View style={styles.adminItem}>
                    <Text style={[styles.adminLabel, { color: colors.textSecondary }]}>Frais administratifs:</Text>
                    <Text style={[styles.adminValue, { color: colors.text }]}>
                      {formatCurrency(contract.financial.fraisAdministratifs)}
                    </Text>
                  </View>
                  {contract.noteInterne && (
                    <View style={styles.noteSection}>
                      <Text style={[styles.adminLabel, { color: colors.textSecondary }]}>Note interne:</Text>
                      <Text style={[styles.noteText, { color: colors.text }]}>{contract.noteInterne}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={[styles.printFooter, { borderTopColor: colors.border }]}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Document généré le {new Date().toLocaleDateString('fr-FR')} - AS-TRAINING Groupe Éducatif
            </Text>
            <Text style={[styles.footerContact, { color: colors.textSecondary }]}>
              📧 groupeas.infos@yahoo.fr | 📞 +225 XX XX XX XX XX
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default function ContractDetailScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { contractId } = useLocalSearchParams<{ contractId: string }>();

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printViewType, setPrintViewType] = useState<'parent' | 'enseignant' | 'direction'>('direction');

  useEffect(() => {
    const loadContract = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundContract = demoContracts.find(c => c.id === contractId);
      setContract(foundContract || null);
      setLoading(false);
    };

    if (contractId) {
      loadContract();
    }
  }, [contractId]);

  const handleGoBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push({
      pathname: '/direction/contracts',
      params: { editContractId: contractId }
    });
  };

  const handleDelete = () => {
    if (!contract) return;

    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer le contrat ${contract.codeContrat} ?\n\nCette action supprimera définitivement :\n• Le contrat et toutes ses données\n• Les informations de planning\n• L'historique financier\n\nCette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Simulation de suppression
              await new Promise(resolve => setTimeout(resolve, 1000));
              Alert.alert('Succès', 'Contrat supprimé avec succès.', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le contrat');
            }
          }
        }
      ]
    );
  };

  const handleCall = (phone: string) => {
    Alert.alert(
      'Appeler',
      `Voulez-vous appeler ${phone} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Appeler', 
          onPress: () => {
            const url = Platform.OS === 'ios' ? `telprompt:${phone}` : `tel:${phone}`;
            Linking.openURL(url).catch(() => {
              Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application téléphone');
            });
          }
        }
      ]
    );
  };

  const handleEmail = (email: string) => {
    const url = `mailto:${email}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application email');
    });
  };

  const handleCopyInfo = (text: string, label: string) => {
    safeCopyToClipboard(text);
    Alert.alert('Copié', `${label} copié dans le presse-papiers`);
  };

  const handlePrint = (viewType: 'parent' | 'enseignant' | 'direction') => {
    setPrintViewType(viewType);
    setShowPrintModal(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <ArrowLeft color="#FFFFFF" size={20} />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Détails du Contrat</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement du contrat...
          </Text>
        </View>
      </View>
    );
  }

  if (!contract) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <ArrowLeft color="#FFFFFF" size={20} />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Contrat Introuvable</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Le contrat demandé n'a pas été trouvé.
          </Text>
          <TouchableOpacity 
            style={[styles.errorButton, { backgroundColor: colors.primary }]}
            onPress={handleGoBack}
          >
            <Text style={styles.errorButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header fixe */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ArrowLeft color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.pageTitle}>{contract.codeContrat}</Text>
            <Text style={styles.pageSubtitle}>
              {contract.student.prenoms} {contract.student.nom}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton} onPress={handleEdit}>
              <Edit color="#FFFFFF" size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton} onPress={handleDelete}>
              <Trash2 color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Actions rapides */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.quickAction, { backgroundColor: colors.card }]}
              onPress={() => handleCall(contract.parentPhone)}
            >
              <Phone color="#10B981" size={20} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>Appeler Parent</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAction, { backgroundColor: colors.card }]}
              onPress={() => handleEmail(contract.parentEmail)}
            >
              <Mail color="#3B82F6" size={20} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>Email Parent</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAction, { backgroundColor: colors.card }]}
              onPress={() => handlePrint('direction')}
            >
              <Printer color="#F59E0B" size={20} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>Imprimer</Text>
            </TouchableOpacity>
          </View>

          {/* Options d'impression */}
          <View style={[styles.printOptions, { backgroundColor: colors.card }]}>
            <Text style={[styles.printOptionsTitle, { color: colors.text }]}>Options d'impression</Text>
            <View style={styles.printButtons}>
              <TouchableOpacity 
                style={[styles.printButton, { backgroundColor: '#10B981' }]}
                onPress={() => handlePrint('parent')}
              >
                <Users color="#FFFFFF" size={16} />
                <Text style={styles.printButtonText}>Vue Parent</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.printButton, { backgroundColor: '#3B82F6' }]}
                onPress={() => handlePrint('enseignant')}
              >
                <BookOpen color="#FFFFFF" size={16} />
                <Text style={styles.printButtonText}>Vue Enseignant</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.printButton, { backgroundColor: '#F59E0B' }]}
                onPress={() => handlePrint('direction')}
              >
                <FileText color="#FFFFFF" size={16} />
                <Text style={styles.printButtonText}>Vue Administrative</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reste du contenu existant... */}
          {/* Cette partie contiendrait l'affichage détaillé du contrat */}
          <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Informations Complètes du Contrat
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              Utilisez les options d'impression ci-dessus pour générer des vues adaptées à chaque utilisateur.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal d'impression */}
      {showPrintModal && (
        <PrintableContractView
          contract={contract}
          viewType={printViewType}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pageSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    padding: 8,
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  printOptions: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  printOptionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  printButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  printButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  printButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  detailCard: {
    padding: 20,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Styles pour l'impression
  printContainer: {
    flex: 1,
  },
  printHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  printTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  printContent: {
    flex: 1,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  brandSection: {
    alignItems: 'flex-start',
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  brandSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  contractInfo: {
    alignItems: 'flex-end',
  },
  contractCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contractDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  printSections: {
    padding: 20,
  },
  printSection: {
    marginBottom: 24,
    padding: 20,
    borderWidth: 1,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentSection: {
    flexDirection: 'row',
    gap: 20,
  },
  studentPhotoContainer: {
    alignItems: 'center',
  },
  studentPhotoPrint: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  studentPhotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentInitials: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  studentInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    width: '30%',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    width: '65%',
  },
  contactGrid: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactValue: {
    fontSize: 16,
  },
  teacherCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  teacherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  teacherSalary: {
    fontSize: 14,
    fontWeight: '600',
  },
  teacherDetails: {
    gap: 4,
  },
  teacherSubjects: {
    fontSize: 14,
  },
  teacherHours: {
    fontSize: 14,
  },
  teacherContact: {
    gap: 2,
    marginTop: 8,
  },
  contactInfo: {
    fontSize: 12,
  },
  scheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  scheduleItem: {
    flex: 1,
    minWidth: 200,
    padding: 12,
    borderRadius: 8,
  },
  scheduleDay: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 14,
    marginBottom: 4,
  },
  scheduleSubject: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  scheduleLocation: {
    fontSize: 12,
  },
  financialGrid: {
    gap: 12,
  },
  financialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  financialValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  teacherSalaryBreakdown: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  salaryDetail: {
    fontSize: 12,
    marginTop: 4,
  },
  salaryTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  adminGrid: {
    gap: 12,
  },
  adminItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  adminValue: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noteSection: {
    marginTop: 16,
    gap: 8,
  },
  noteText: {
    fontSize: 14,
    fontStyle: 'italic',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  printFooter: {
    padding: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
  footerContact: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
}); 