import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Search, Filter, Users, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import TeacherForm from '@/components/TeacherForm';
import TeachersList from '@/components/TeachersList';

interface Teacher {
  id: string;
  nom: string;
  prenoms: string;
  profession: string;
  ville: string;
  matieres: string;
  telephone: string;
  email: string;
  formation: string;
  experience: string;
  codeId: string;
  statut: 'actif' | 'inactif';
  dateCreation: string;
  cv?: string;
  photo?: string;
}

export default function TeachersManagement() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | undefined>();

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // Données de démonstration
  const demoTeachers: Teacher[] = [
    {
      id: 'teacher_1',
      nom: 'Kouassi',
      prenoms: 'Jean Baptiste',
      profession: 'Enseignant de Mathématiques',
      ville: 'Cocody',
      matieres: 'Mathématiques, Physique, Chimie',
      telephone: '+225 07 59 63 27 88',
      email: 'kouassi.jean@gmail.com',
      formation: 'Master en Mathématiques Appliquées\nLicence en Physique-Chimie',
      experience: 'Enseignant au Lycée Moderne de Cocody (5 ans)\nCours particuliers (3 ans)',
      codeId: 'ENS-JAN-20240001',
      statut: 'actif',
      dateCreation: '2024-01-15T10:00:00Z',
    },
    {
      id: 'teacher_2',
      nom: 'N\'Guessan',
      prenoms: 'Marie Antoinette',
      profession: 'Enseignante de Français',
      ville: 'Marcory',
      matieres: 'Français, Littérature, Histoire-Géographie',
      telephone: '+225 05 67 89 12 34',
      email: 'nguessan.marie@gmail.com',
      formation: 'Master en Lettres Modernes\nCAPES de Français',
      experience: 'Enseignante au Collège Sainte-Marie (7 ans)\nCorrectrice au BEPC (2 ans)',
      codeId: 'ENS-JAN-20240002',
      statut: 'actif',
      dateCreation: '2024-01-20T14:30:00Z',
    },
    {
      id: 'teacher_3',
      nom: 'Diabaté',
      prenoms: 'Mamadou',
      profession: 'Enseignant d\'Anglais',
      ville: 'Yopougon',
      matieres: 'Anglais, Espagnol',
      telephone: '+225 01 45 67 89 12',
      email: 'diabate.mamadou@outlook.com',
      formation: 'Master en Langues Étrangères Appliquées\nCertificat TOEFL',
      experience: 'Enseignant d\'anglais au Lycée Technique (4 ans)\nFormateur en entreprise (2 ans)',
      codeId: 'ENS-FEB-20240003',
      statut: 'actif',
      dateCreation: '2024-02-05T08:15:00Z',
    },
    {
      id: 'teacher_4',
      nom: 'Koné',
      prenoms: 'Fatou',
      profession: 'Enseignante de Sciences',
      ville: 'Adjamé',
      matieres: 'Sciences Physiques, Chimie, SVT',
      telephone: '+225 09 87 65 43 21',
      email: 'kone.fatou@yahoo.fr',
      formation: 'Master en Sciences Physiques\nLicence en Biologie',
      experience: 'Enseignante au Collège Moderne (6 ans)\nLaboratoire de recherche CNRS (1 an)',
      codeId: 'ENS-FEB-20240004',
      statut: 'actif',
      dateCreation: '2024-02-10T16:45:00Z',
    },
    {
      id: 'teacher_5',
      nom: 'Traoré',
      prenoms: 'Salif',
      profession: 'Enseignant d\'Informatique',
      ville: 'Plateau',
      matieres: 'Informatique, Programmation, Bureautique',
      telephone: '+225 07 11 22 33 44',
      email: 'traore.salif@gmail.com',
      formation: 'Master en Informatique\nCertification Microsoft Office',
      experience: 'Développeur en entreprise (3 ans)\nFormateur en informatique (2 ans)',
      codeId: 'ENS-MAR-20240005',
      statut: 'inactif',
      dateCreation: '2024-03-01T11:20:00Z',
    },
  ];

  useEffect(() => {
    // Simulation du chargement des données
    const loadTeachers = async () => {
      setLoading(true);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTeachers(demoTeachers);
      setFilteredTeachers(demoTeachers);
      setLoading(false);
    };

    loadTeachers();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    // Filtrage des enseignants basé sur la recherche
    const filtered = teachers.filter(teacher =>
      teacher.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.prenoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.matieres.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.codeId.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [searchQuery, teachers]);

  const handleGoBack = () => {
    router.back();
  };

  const handleCreateTeacher = () => {
    setEditingTeacher(undefined);
    setShowForm(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setShowForm(true);
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    try {
      // Simulation de la suppression
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedTeachers = teachers.filter(t => t.id !== teacherId);
      setTeachers(updatedTeachers);
      setFilteredTeachers(updatedTeachers.filter(teacher =>
        teacher.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.prenoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.matieres.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.codeId.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleViewProfile = (teacher: Teacher) => {
    // Navigation vers la page de profil détaillé
    router.push({
      pathname: '/(tabs)/direction/teacher-detail',
      params: { teacherId: teacher.id }
    });
  };

  const handleFormSuccess = (teacherData: Teacher) => {
    if (editingTeacher) {
      // Mise à jour d'un enseignant existant
      const updatedTeachers = teachers.map(t => 
        t.id === editingTeacher.id ? { ...teacherData, id: editingTeacher.id } : t
      );
      setTeachers(updatedTeachers);
      setFilteredTeachers(updatedTeachers);
    } else {
      // Ajout d'un nouvel enseignant
      const newTeachers = [...teachers, teacherData];
      setTeachers(newTeachers);
      setFilteredTeachers(newTeachers);
    }
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.fixedHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ArrowLeft color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Gestion des Enseignants</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Stats Section */}
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>
              {teachers.length} enseignant{teachers.length > 1 ? 's' : ''} enregistré{teachers.length > 1 ? 's' : ''}
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Users color="#059669" size={24} />
                <Text style={styles.statNumber}>{teachers.filter(t => t.statut === 'actif').length}</Text>
                <Text style={styles.statLabel}>Actifs</Text>
              </View>
              <View style={styles.statCard}>
                <Users color="#6B7280" size={24} />
                <Text style={styles.statNumber}>{teachers.filter(t => t.statut === 'inactif').length}</Text>
                <Text style={styles.statLabel}>Inactifs</Text>
              </View>
              <View style={styles.statCard}>
                <Users color="#3B82F6" size={24} />
                <Text style={styles.statNumber}>{teachers.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </View>

        {/* Actions Bar */}
        <View style={styles.actionsBar}>
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Search color="#6B7280" size={20} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un enseignant..."
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
            onPress={handleCreateTeacher}
          >
            <Plus color="#FFFFFF" size={18} />
            <Text style={[styles.createButtonText, isDesktop && styles.createButtonTextDesktop]}>
              {isDesktop ? 'Créer un profil enseignant' : 'Nouveau'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {/* Teachers List */}
        <TeachersList
          teachers={filteredTeachers}
          loading={loading}
          onEdit={handleEditTeacher}
          onDelete={handleDeleteTeacher}
          onViewProfile={handleViewProfile}
        />
        </Animated.View>
      </ScrollView>

      {/* Teacher Form Modal */}
      <TeacherForm
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleFormSuccess}
        editingTeacher={editingTeacher}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  fixedHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
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
  },
  createButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    paddingVertical: 10,  // Réduit encore plus pour diminuer la hauteur
    paddingHorizontal: 12, // Réduit encore plus pour diminuer la largeur
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start', // Empêche le bouton de s'étendre
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 13,  // Réduit encore plus la police
    fontWeight: '600',
    marginLeft: 6,  // Réduit l'espace entre l'icône et le texte
  },
  createButtonDesktop: {
    paddingVertical: 12,  // Ajusté pour desktop
    paddingHorizontal: 16,
  },
  createButtonTextDesktop: {
    fontSize: 14,  // Ajusté pour desktop
  },
});