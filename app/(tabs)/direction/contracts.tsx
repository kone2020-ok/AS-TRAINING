import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Animated,
  useWindowDimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Users,
  FileText,
  Calendar,
  DollarSign,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import ContractForm from '../../../components/ContractForm';
import { 
  Contract,
  ContractListItem,
  ContractStats,
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
  formatCurrency
} from '../../../types/Contract';

// Données de démonstration
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
    schedules: [],
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
    schedules: [],
    statut: 'terminé',
    dateCreation: '2023-12-01T09:15:00Z',
    dateDebut: '2023-12-15T00:00:00Z',
    dateFin: '2024-01-15T00:00:00Z',
    dureeEnMois: 1,
    creePar: 'direction_admin',
    noteInterne: 'Contrat terminé avec succès. Élève admise au BAC.',
  }
];

// Données parents et enseignants pour le formulaire
const availableParents = [
  {
    id: 'parent_1',
    nom: 'Kouassi',
    prenoms: 'Jean',
    email: 'kouassi.jean@gmail.com',
    telephone: '+225 07 12 34 56 78',
    adresse: 'Cocody, Abidjan',
  },
  {
    id: 'parent_2',
    nom: 'Traoré',
    prenoms: 'Fatou',
    email: 'traore.fatou@outlook.com',
    telephone: '+225 01 23 45 67 89',
    adresse: 'Yopougon, Abidjan',
  },
  {
    id: 'parent_3',
    nom: 'Diabaté',
    prenoms: 'Ibrahim',
    email: 'diabate.ibrahim@yahoo.fr',
    telephone: '+225 09 87 65 43 21',
    adresse: 'Adjamé, Abidjan',
  }
];

const availableTeachers = [
  {
    id: 'teacher_1',
    nom: 'N\'Guessan',
    prenoms: 'Marie',
    email: 'marie.nguessan@gmail.com',
    telephone: '+225 05 98 76 54 32',
    matieres: 'Mathématiques, Physique, Chimie',
  },
  {
    id: 'teacher_2',
    nom: 'Kouassi',
    prenoms: 'Jean',
    email: 'jean.kouassi@gmail.com',
    telephone: '+225 07 59 63 27 88',
    matieres: 'Français, Histoire, Géographie',
  },
  {
    id: 'teacher_3',
    nom: 'Diabaté',
    prenoms: 'Mamadou',
    email: 'diabate.mamadou@outlook.com',
    telephone: '+225 01 45 67 89 12',
    matieres: 'Anglais, Espagnol',
  },
  {
    id: 'teacher_4',
    nom: 'Koné',
    prenoms: 'Fatou',
    email: 'kone.fatou@yahoo.fr',
    telephone: '+225 09 87 65 43 21',
    matieres: 'Sciences Physiques, Chimie, SVT',
  }
];

export default function ContractsManagement() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { editContractId } = useLocalSearchParams<{ editContractId?: string }>();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | undefined>();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [contractsPerPage] = useState(10);

  useEffect(() => {
    const loadContracts = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setContracts(demoContracts);
      setFilteredContracts(demoContracts);
      setLoading(false);
    };

    loadContracts();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Gestion de l'édition depuis les paramètres de navigation
  useEffect(() => {
    if (editContractId) {
      const contractToEdit = contracts.find(c => c.id === editContractId);
      if (contractToEdit) {
        setEditingContract(contractToEdit);
        setShowForm(true);
      }
    }
  }, [editContractId, contracts]);

  useEffect(() => {
    // Filtrage des contrats basé sur la recherche
    const filtered = contracts.filter(contract =>
      contract.codeContrat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.student.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.student.prenoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.student.classe.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.teachers.some(teacher => 
        teacher.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setFilteredContracts(filtered);
    setCurrentPage(1); // Reset à la première page lors d'une recherche
  }, [searchQuery, contracts]);

  const handleGoBack = () => {
    router.back();
  };

  const handleCreateContract = () => {
    setEditingContract(undefined);
    setShowForm(true);
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setShowForm(true);
  };

  const handleDeleteContract = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
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
            const updatedContracts = contracts.filter(c => c.id !== contractId);
            setContracts(updatedContracts);
              Alert.alert('Succès', 'Contrat supprimé avec succès.');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le contrat');
            }
          }
        }
      ]
    );
  };

  const handleViewContract = (contract: Contract) => {
    router.push({
      pathname: '/direction/contract-detail',
      params: { contractId: contract.id }
    });
  };

  const handleFormSuccess = (contractData: Contract) => {
    if (editingContract) {
      // Modification
      const updatedContracts = contracts.map(c => 
        c.id === editingContract.id ? contractData : c
      );
      setContracts(updatedContracts);
    } else {
      // Création
      setContracts([contractData, ...contracts]);
    }
    
    setShowForm(false);
    setEditingContract(undefined);
    
    // Nettoyer le paramètre editContractId s'il existe
    if (editContractId) {
      router.setParams({ editContractId: undefined });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingContract(undefined);
    
    // Nettoyer le paramètre editContractId s'il existe
    if (editContractId) {
      router.setParams({ editContractId: undefined });
    }
  };

  const getStatsData = (): ContractStats => {
    const actifs = contracts.filter(c => c.statut === 'actif').length;
    const suspendus = contracts.filter(c => c.statut === 'suspendu').length;
    const termines = contracts.filter(c => c.statut === 'terminé').length;
    const enAttente = contracts.filter(c => c.statut === 'en_attente').length;
    
    const revenueTotal = contracts.reduce((sum, c) => sum + c.financial.coutParent, 0);
    const revenueActifs = contracts
      .filter(c => c.statut === 'actif')
      .reduce((sum, c) => sum + c.financial.coutParent, 0);
    
    return {
      total: contracts.length,
      actifs,
      suspendus,
      termines,
      enAttente,
      revenueTotal,
      revenueActifs,
    };
  };

  // Pagination
  const indexOfLastContract = currentPage * contractsPerPage;
  const indexOfFirstContract = indexOfLastContract - contractsPerPage;
  const currentContracts = filteredContracts.slice(indexOfFirstContract, indexOfLastContract);
  const totalPages = Math.ceil(filteredContracts.length / contractsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const stats = getStatsData();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <ArrowLeft color="#FFFFFF" size={20} />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Gestion des Contrats</Text>
            <View style={styles.placeholder} />
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
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ArrowLeft color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Gestion des Contrats</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Contenu scrollable */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Section des statistiques */}
          <View style={styles.statsSection}>
            <Text style={[styles.statsTitle, { color: colors.text }]}>
              {stats.total} contrat{stats.total > 1 ? 's' : ''} • {formatCurrency(stats.revenueTotal)} de revenus
            </Text>
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <FileText color="#10B981" size={24} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{stats.actifs}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Actifs</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <Calendar color="#3B82F6" size={24} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{stats.enAttente}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>En attente</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <Users color="#6B7280" size={24} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{stats.termines}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Terminés</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <DollarSign color="#10B981" size={24} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{formatCurrency(stats.revenueActifs)}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Revenus actifs</Text>
              </View>
            </View>
          </View>

          {/* Barre d'actions */}
          <View style={styles.actionsBar}>
            <View style={styles.searchContainer}>
              <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Search color="#6B7280" size={20} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Rechercher un contrat..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Filter color="#6B7280" size={20} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.createButton, isDesktop && styles.createButtonDesktop]} 
              onPress={handleCreateContract}
            >
              <LinearGradient colors={['#10B981', '#059669']} style={styles.createButtonGradient}>
              <Plus color="#FFFFFF" size={20} />
                <Text style={styles.createButtonText}>
                  {isDesktop ? 'Nouveau contrat' : 'Nouveau'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Table des contrats */}
          <View style={[styles.tableContainer, { backgroundColor: colors.card }]}>
            {/* En-tête du tableau */}
            <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.tableHeaderText, { color: colors.text }]}>Élève</Text>
              <Text style={[styles.tableHeaderText, { color: colors.text }]}>Parent</Text>
              <Text style={[styles.tableHeaderText, { color: colors.text }]}>Enseignant(s)</Text>
              <Text style={[styles.tableHeaderText, { color: colors.text }]}>Statut</Text>
              <Text style={[styles.tableHeaderText, { color: colors.text }]}>Coût</Text>
              <Text style={[styles.tableHeaderText, { color: colors.text }]}>Actions</Text>
            </View>

            {/* Lignes du tableau */}
            {currentContracts.map((contract) => (
              <View key={contract.id} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
                <View style={styles.studentCell}>
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
                    <View>
                      <Text style={[styles.studentName, { color: colors.text }]}>
                        {contract.student.prenoms} {contract.student.nom}
                      </Text>
                      <Text style={[styles.studentClass, { color: colors.textSecondary }]}>
                        {contract.student.classe} - {contract.student.ecole}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.parentCell}>
                  <Text style={[styles.parentName, { color: colors.text }]}>
                    {contract.parentName}
                  </Text>
                </View>

                <View style={styles.teachersCell}>
                  <Text style={[styles.teacherCount, { color: colors.text }]}>
                    {contract.teachers.length} enseignant{contract.teachers.length > 1 ? 's' : ''}
                  </Text>
                  <Text style={[styles.teacherNames, { color: colors.textSecondary }]}>
                    {contract.teachers.map(t => t.teacherName).join(', ')}
                  </Text>
                </View>

                <View style={styles.statusCell}>
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

                <View style={styles.costCell}>
                  <Text style={[styles.costAmount, { color: colors.text }]}>
                    {formatCurrency(contract.financial.coutParent)}
                  </Text>
                  <Text style={[styles.costPeriod, { color: colors.textSecondary }]}>
                    /{contract.financial.modePaiement}
                  </Text>
                </View>

                <View style={styles.actionsCell}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleViewContract(contract)}
                  >
                    <Eye color="#3B82F6" size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditContract(contract)}
                  >
                    <Edit color="#059669" size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteContract(contract.id)}
                  >
                    <Trash2 color="#EF4444" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  { 
                    backgroundColor: currentPage === 1 ? colors.border : colors.primary,
                    opacity: currentPage === 1 ? 0.5 : 1
                  }
                ]}
                onPress={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft color={currentPage === 1 ? colors.textSecondary : colors.background} size={20} />
              </TouchableOpacity>

              <View style={styles.paginationInfo}>
                <Text style={[styles.paginationText, { color: colors.text }]}>
                  Page {currentPage} sur {totalPages}
                </Text>
                <Text style={[styles.paginationSubtext, { color: colors.textSecondary }]}>
                  {filteredContracts.length} contrat{filteredContracts.length > 1 ? 's' : ''}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  { 
                    backgroundColor: currentPage === totalPages ? colors.border : colors.primary,
                    opacity: currentPage === totalPages ? 0.5 : 1
                  }
                ]}
                onPress={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight color={currentPage === totalPages ? colors.textSecondary : colors.background} size={20} />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Formulaire de contrat */}
      <ContractForm
        visible={showForm}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        editingContract={editingContract}
        availableParents={availableParents}
        availableTeachers={availableTeachers}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
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
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
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
    fontSize: 14,
    textAlign: 'center',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  createButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  createButtonDesktop: {
    minWidth: 160,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tableContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  contractCell: {
    flex: 1,
    alignItems: 'center',
  },
  contractCode: {
    fontSize: 14,
    fontWeight: '600',
  },
  contractDate: {
    fontSize: 12,
    marginTop: 2,
  },
  studentCell: {
    flex: 1,
    alignItems: 'center',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  studentPhotoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentInitials: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
  },
  studentClass: {
    fontSize: 12,
  },
  parentCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parentName: {
    fontSize: 14,
    textAlign: 'center',
  },
  teachersCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  teacherNames: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  statusCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  costCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  costAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  costPeriod: {
    fontSize: 12,
  },
  actionsCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  paginationButton: {
    padding: 8,
    borderRadius: 8,
  },
  paginationInfo: {
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paginationSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
});