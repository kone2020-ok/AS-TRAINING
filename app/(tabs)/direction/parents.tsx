import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Search, Filter, Users, ArrowLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import ParentsList from '../../../components/ParentsList';
import ParentForm from '../../../components/ParentForm';

interface Parent {
  id: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  latitude: string;
  longitude: string;
  codeId: string;
  qrCode: string;
  statut: 'actif' | 'inactif';
  dateCreation: string;
  enfants: string[];
  photo?: string;
}

export default function ParentsManagement() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { editParentId } = useLocalSearchParams<{ editParentId?: string }>();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [parents, setParents] = useState<Parent[]>([]);
  const [filteredParents, setFilteredParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | undefined>();

  // Données de démonstration étendues
  const demoParents: Parent[] = [
    {
      id: 'parent_1',
      nom: 'Diabaté',
      prenoms: 'Mamadou',
      email: 'diabate.mamadou@gmail.com',
      telephone: '+225 07 12 34 56 78',
      adresse: 'Rue des Jardins, Yopougon',
      ville: 'Yopougon',
      latitude: '5.336000',
      longitude: '-4.084000',
      codeId: 'PAR-JAN-20240001',
      qrCode: 'QR_PAR_JAN_20240001',
      statut: 'actif',
      dateCreation: '2024-01-15T10:00:00Z',
      enfants: ['Kouadio Aya', 'N\'Dri Kevin'],
    },
    {
      id: 'parent_2',
      nom: 'Koné',
      prenoms: 'Fatou',
      email: 'kone.fatou@gmail.com',
      telephone: '+225 05 98 76 54 32',
      adresse: 'Avenue de la Paix, Adjamé',
      ville: 'Adjamé',
      latitude: '5.351000',
      longitude: '-4.025000',
      codeId: 'PAR-JAN-20240002',
      qrCode: 'QR_PAR_JAN_20240002',
      statut: 'actif',
      dateCreation: '2024-01-20T14:30:00Z',
      enfants: ['Traoré Aminata'],
    },
    {
      id: 'parent_3',
      nom: 'Kouassi',
      prenoms: 'Marie Claire',
      email: 'kouassi.marie@yahoo.fr',
      telephone: '+225 01 23 45 67 89',
      adresse: 'Boulevard de la République, Cocody',
      ville: 'Cocody',
      latitude: '5.360000',
      longitude: '-3.980000',
      codeId: 'PAR-FEB-20240003',
      qrCode: 'QR_PAR_FEB_20240003',
      statut: 'actif',
      dateCreation: '2024-02-05T08:15:00Z',
      enfants: ['Kouassi Junior', 'Kouassi Prisca', 'Kouassi David'],
    },
    {
      id: 'parent_4',
      nom: 'Traoré',
      prenoms: 'Ibrahim',
      email: 'traore.ibrahim@gmail.com',
      telephone: '+225 09 87 65 43 21',
      adresse: 'Quartier Sicogi, Abobo',
      ville: 'Abobo',
      latitude: '5.416000',
      longitude: '-4.016000',
      codeId: 'PAR-FEB-20240004',
      qrCode: 'QR_PAR_FEB_20240004',
      statut: 'inactif',
      dateCreation: '2024-02-10T16:45:00Z',
      enfants: ['Traoré Salif'],
    },
  ];

  useEffect(() => {
    const loadParents = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setParents(demoParents);
      setFilteredParents(demoParents);
      setLoading(false);
    };

    loadParents();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Gestion de l'édition depuis les paramètres de navigation
  useEffect(() => {
    if (editParentId) {
      const parentToEdit = parents.find(p => p.id === editParentId);
      if (parentToEdit) {
        setEditingParent(parentToEdit);
        setShowForm(true);
      }
    }
  }, [editParentId, parents]);

  useEffect(() => {
    const filtered = parents.filter(parent =>
      parent.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.prenoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.codeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.enfants.some(enfant => 
        enfant.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setFilteredParents(filtered);
  }, [searchQuery, parents]);

  const handleGoBack = () => {
    router.back();
  };

  const handleCreateParent = () => {
    setEditingParent(undefined);
    setShowForm(true);
  };

  const handleEditParent = (parent: Parent) => {
    setEditingParent(parent);
    setShowForm(true);
  };

  const handleDeleteParent = (parentId: string) => {
            const updatedParents = parents.filter(p => p.id !== parentId);
            setParents(updatedParents);
    setFilteredParents(updatedParents.filter(parent =>
      parent.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.prenoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.codeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.enfants.some(enfant => 
        enfant.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ));
  };

  const handleViewProfile = (parent: Parent) => {
    router.push({
      pathname: '/direction/parent-detail',
      params: { parentId: parent.id }
    });
  };

  const handleFormSuccess = (parentData: Parent) => {
    if (editingParent) {
      // Modification
      const updatedParents = parents.map(p => 
        p.id === editingParent.id ? parentData : p
      );
      setParents(updatedParents);
      setFilteredParents(updatedParents.filter(parent =>
        parent.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parent.prenoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parent.codeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parent.enfants.some(enfant => 
          enfant.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ));
    } else {
      // Création
      const newParents = [...parents, parentData];
      setParents(newParents);
      setFilteredParents(newParents.filter(parent =>
        parent.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parent.prenoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parent.codeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parent.enfants.some(enfant => 
          enfant.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ));
    }
    
    setShowForm(false);
    setEditingParent(undefined);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingParent(undefined);
    
    // Nettoyer le paramètre editParentId s'il existe
    if (editParentId) {
      router.setParams({ editParentId: undefined });
    }
  };

  const getStatsData = () => {
    const actifs = parents.filter(p => p.statut === 'actif').length;
    const inactifs = parents.filter(p => p.statut === 'inactif').length;
    const totalEnfants = parents.reduce((total, parent) => total + parent.enfants.length, 0);
    
    return { actifs, inactifs, total: parents.length, totalEnfants };
  };

  const stats = getStatsData();

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <ArrowLeft color="#FFFFFF" size={20} />
            </TouchableOpacity>
            <Text style={[styles.pageTitle, { color: colors.onPrimary }]}>Gestion des Parents</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des familles...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header fixe */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ArrowLeft color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: colors.onPrimary }]}>Gestion des Parents</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Contenu scrollable */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Section des statistiques */}
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>
              {stats.total} famille{stats.total > 1 ? 's' : ''} • {stats.totalEnfants} enfant{stats.totalEnfants > 1 ? 's' : ''}
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Users color="#10B981" size={24} />
                <Text style={styles.statNumber}>{stats.actifs}</Text>
                <Text style={styles.statLabel}>Actives</Text>
              </View>
              <View style={styles.statCard}>
                <Users color="#6B7280" size={24} />
                <Text style={styles.statNumber}>{stats.inactifs}</Text>
                <Text style={styles.statLabel}>Inactives</Text>
              </View>
              <View style={styles.statCard}>
                <Users color="#3B82F6" size={24} />
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </View>

          {/* Barre d'actions */}
          <View style={styles.actionsBar}>
            <View style={styles.searchContainer}>
              <View style={styles.searchBox}>
                <Search color="#6B7280" size={20} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher une famille..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity style={styles.filterButton}>
                <Filter color="#6B7280" size={20} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.createButton, isDesktop && styles.createButtonDesktop]} 
              onPress={handleCreateParent}
            >
              <Plus color="#FFFFFF" size={20} />
              <Text style={styles.createButtonText}>
                {isDesktop ? 'Créer une famille' : 'Nouveau'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Liste des parents */}
          <View style={styles.parentsList}>
            <ParentsList
              parents={filteredParents}
              loading={false}
              onEdit={handleEditParent}
              onDelete={handleDeleteParent}
              onViewProfile={handleViewProfile}
            />
          </View>
        </Animated.View>
      </ScrollView>

      {/* Formulaire de parent */}
      <ParentForm
        visible={showForm}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        editingParent={editingParent}
      />
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
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  actionsBar: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  createButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonDesktop: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  parentsList: {
    minHeight: 400,
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