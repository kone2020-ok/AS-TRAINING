import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  useWindowDimensions,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  X, 
  Upload, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Calendar, 
  Clock,
  DollarSign,
  GraduationCap,
  School,
  Users,
  Plus,
  Minus,
  CheckCircle,
  BookOpen
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { 
  ContractFormData, 
  ContractTeacher, 
  ContractSchedule, 
  DayOfWeek,
  VALID_CLASSES,
  VALID_SUBJECTS,
  DAYS_OF_WEEK_LABELS,
  generateContractCode 
} from '../types/Contract';
import { useNotificationTriggers } from '../services/NotificationTriggers';

interface ContractFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (contract: any) => void;
  editingContract?: any;
  availableParents: Array<{
    id: string;
    nom: string;
    prenoms: string;
    email: string;
    telephone: string;
    adresse: string;
  }>;
  availableTeachers: Array<{
    id: string;
    nom: string;
    prenoms: string;
    email: string;
    telephone: string;
    matieres: string;
  }>;
}

interface FormTeacher {
  teacherId: string;
  teacherName: string;
  matieres: string[];
  remunerationParHeure: string;
  heuresParSemaine: string;
}

interface FormSchedule {
  jour: DayOfWeek;
  heureDebut: string;
  heureFin: string;
  matiere: string;
  enseignantId: string;
  lieu: string;
}

export default function ContractForm({ 
  visible, 
  onClose, 
  onSuccess, 
  editingContract,
  availableParents = [],
  availableTeachers = []
}: ContractFormProps) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { triggers } = useNotificationTriggers();

  // États du formulaire
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Données de l'élève
  const [studentData, setStudentData] = useState({
    nom: '',
    prenoms: '',
    classe: '',
    ecole: '',
    matricule: '',
    dateNaissance: '',
  });

  // Parent sélectionné
  const [selectedParentId, setSelectedParentId] = useState('');

  // Enseignants assignés
  const [formTeachers, setFormTeachers] = useState<FormTeacher[]>([]);

  // Aspects financiers
  const [financialData, setFinancialData] = useState({
    coutParent: '',
    fraisAdministratifs: '',
    modePaiement: 'mensuel' as 'mensuel' | 'trimestriel' | 'annuel',
  });

  // Planning
  const [schedules, setSchedules] = useState<FormSchedule[]>([]);

  // Métadonnées
  const [metaData, setMetaData] = useState({
    dateDebut: '',
    dureeEnMois: '12',
    noteInterne: '',
  });

  useEffect(() => {
    if (editingContract) {
      // Pré-remplir le formulaire en mode édition
      loadContractData(editingContract);
    } else {
      resetForm();
    }
  }, [editingContract, visible]);

  const resetForm = () => {
    setStudentData({
      nom: '',
      prenoms: '',
      classe: '',
      ecole: '',
      matricule: '',
      dateNaissance: '',
    });
    setSelectedParentId('');
    setFormTeachers([]);
    setFinancialData({
      coutParent: '',
      fraisAdministratifs: '',
      modePaiement: 'mensuel',
    });
    setSchedules([]);
    setMetaData({
      dateDebut: '',
      dureeEnMois: '12',
      noteInterne: '',
    });
    setPhotoUri(null);
    setCurrentStep(1);
    setErrors({});
  };

  const loadContractData = (contract: any) => {
    // Logique de chargement des données existantes
    setStudentData({
      nom: contract.student?.nom || '',
      prenoms: contract.student?.prenoms || '',
      classe: contract.student?.classe || '',
      ecole: contract.student?.ecole || '',
      matricule: contract.student?.matricule || '',
      dateNaissance: contract.student?.dateNaissance || '',
    });
    setSelectedParentId(contract.parentId || '');
    setPhotoUri(contract.student?.photo || null);
    // ... autres champs
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1: // Informations élève
        if (!studentData.nom.trim()) newErrors.nom = 'Le nom est requis';
        if (!studentData.prenoms.trim()) newErrors.prenoms = 'Les prénoms sont requis';
        if (!studentData.classe) newErrors.classe = 'La classe est requise';
        if (!studentData.ecole.trim()) newErrors.ecole = 'L\'école est requise';
        if (!studentData.matricule.trim()) newErrors.matricule = 'Le matricule est requis';
        if (!studentData.dateNaissance) newErrors.dateNaissance = 'La date de naissance est requise';
        if (!photoUri) newErrors.photo = 'La photo de l\'élève est requise';
        break;

      case 2: // Parent
        if (!selectedParentId) newErrors.parent = 'Sélectionnez un parent';
        break;

      case 3: // Enseignants
        if (formTeachers.length === 0) {
          newErrors.teachers = 'Au moins un enseignant est requis';
        } else {
          formTeachers.forEach((teacher, index) => {
            if (!teacher.teacherId) newErrors[`teacher_${index}_id`] = 'Sélectionnez un enseignant';
            if (teacher.matieres.length === 0) newErrors[`teacher_${index}_matieres`] = 'Sélectionnez au moins une matière';
            if (!teacher.remunerationParHeure || parseFloat(teacher.remunerationParHeure) <= 0) {
              newErrors[`teacher_${index}_remuneration`] = 'Rémunération invalide';
            }
            if (!teacher.heuresParSemaine || parseFloat(teacher.heuresParSemaine) <= 0) {
              newErrors[`teacher_${index}_heures`] = 'Nombre d\'heures invalide';
            }
          });
        }
        break;

      case 4: // Aspects financiers
        if (!financialData.coutParent || parseFloat(financialData.coutParent) <= 0) {
          newErrors.coutParent = 'Coût parent invalide';
        }
        break;

      case 5: // Métadonnées
        if (!metaData.dateDebut) newErrors.dateDebut = 'Date de début requise';
        if (!metaData.dureeEnMois || parseInt(metaData.dureeEnMois) <= 0) {
          newErrors.dureeEnMois = 'Durée invalide';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const addTeacher = () => {
    setFormTeachers([...formTeachers, {
      teacherId: '',
      teacherName: '',
      matieres: [],
      remunerationParHeure: '',
      heuresParSemaine: '',
    }]);
  };

  const removeTeacher = (index: number) => {
    setFormTeachers(formTeachers.filter((_, i) => i !== index));
  };

  const updateTeacher = (index: number, field: keyof FormTeacher, value: any) => {
    const updatedTeachers = [...formTeachers];
    if (field === 'teacherId') {
      const teacher = availableTeachers.find(t => t.id === value);
      if (teacher) {
        updatedTeachers[index] = {
          ...updatedTeachers[index],
          teacherId: value,
          teacherName: `${teacher.prenoms} ${teacher.nom}`,
        };
      }
    } else {
      updatedTeachers[index] = {
        ...updatedTeachers[index],
        [field]: value,
      };
    }
    setFormTeachers(updatedTeachers);
  };

  const addSchedule = () => {
    setSchedules([...schedules, {
      jour: 'lundi',
      heureDebut: '',
      heureFin: '',
      matiere: '',
      enseignantId: '',
      lieu: '',
    }]);
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const updateSchedule = (index: number, field: keyof FormSchedule, value: any) => {
    const updatedSchedules = [...schedules];
    updatedSchedules[index] = {
      ...updatedSchedules[index],
      [field]: value,
    };
    setSchedules(updatedSchedules);
  };

  const calculateTotalCost = (): number => {
    const teachersCost = formTeachers.reduce((sum, teacher) => {
      const remuneration = parseFloat(teacher.remunerationParHeure) || 0;
      const hours = parseFloat(teacher.heuresParSemaine) || 0;
      return sum + (remuneration * hours * 4); // 4 semaines par mois
    }, 0);
    const adminFees = parseFloat(financialData.fraisAdministratifs) || 0;
    return teachersCost + adminFees;
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);
    try {
      const contractData = {
        id: editingContract?.id || `contract_${Date.now()}`,
        codeContrat: editingContract?.codeContrat || generateContractCode(),
        student: {
          id: editingContract?.student?.id || `student_${Date.now()}`,
          ...studentData,
          photo: photoUri,
        },
        parentId: selectedParentId,
        teachers: formTeachers.map((teacher, index) => ({
          id: `teacher_${index}_${Date.now()}`,
          teacherId: teacher.teacherId,
          teacherName: teacher.teacherName,
          teacherEmail: availableTeachers.find(t => t.id === teacher.teacherId)?.email || '',
          teacherPhone: availableTeachers.find(t => t.id === teacher.teacherId)?.telephone || '',
          matieres: teacher.matieres,
          remunerationParHeure: parseFloat(teacher.remunerationParHeure),
          totalHeuresParSemaine: parseFloat(teacher.heuresParSemaine),
          remunerationTotale: parseFloat(teacher.remunerationParHeure) * parseFloat(teacher.heuresParSemaine) * 4,
        })),
        financial: {
          coutParent: parseFloat(financialData.coutParent),
          remunerationTotaleEnseignants: calculateTotalCost() - (parseFloat(financialData.fraisAdministratifs) || 0),
          fraisAdministratifs: parseFloat(financialData.fraisAdministratifs) || 0,
          totalContrat: calculateTotalCost(),
          modePaiement: financialData.modePaiement,
          dateEcheance: new Date(new Date(metaData.dateDebut).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        schedules,
        statut: 'actif' as const,
        dateCreation: editingContract?.dateCreation || new Date().toISOString(),
        dateDebut: metaData.dateDebut,
        dureeEnMois: parseInt(metaData.dureeEnMois),
        creePar: 'direction_admin',
        noteInterne: metaData.noteInterne,
      };

      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Déclencher les notifications
      if (!editingContract) {
        // Nouveau contrat
        await triggers.onContractCreated({
          userId: 'direction_admin',
          userRole: 'direction',
          metadata: {
            contractCode: contractData.codeContrat,
            studentName: `${contractData.student.prenoms} ${contractData.student.nom}`,
            parentName: contractData.parentName || availableParents.find(p => p.id === selectedParentId)?.prenoms + ' ' + availableParents.find(p => p.id === selectedParentId)?.nom,
            parentId: selectedParentId,
            teachersCount: contractData.teachers.length,
            teacherIds: contractData.teachers.map(t => t.teacherId),
            amount: contractData.financial.coutParent,
            startDate: contractData.dateDebut,
            subjects: contractData.teachers.map(t => t.matieres.join(', ')).join(' | ')
          }
        });
      } else {
        // Contrat modifié
        await triggers.onContractUpdated({
          userId: 'direction_admin',
          userRole: 'direction',
          metadata: {
            contractCode: contractData.codeContrat,
            studentName: `${contractData.student.prenoms} ${contractData.student.nom}`,
            parentId: selectedParentId,
            teacherIds: contractData.teachers.map(t => t.teacherId),
            changes: 'Informations du contrat',
            notifyParent: true,
            notifyTeachers: true
          }
        });
      }

      onSuccess(contractData);
      Alert.alert(
        'Succès', 
        editingContract ? 'Contrat modifié avec succès' : 'Contrat créé avec succès'
      );
      onClose();
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      'Élève',
      'Parent', 
      'Enseignants',
      'Financier',
      'Planning',
      'Finalisation'
    ];

    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              {
                backgroundColor: index + 1 <= currentStep ? colors.primary : colors.border,
              }
            ]}>
              <Text style={[
                styles.stepNumber,
                { color: index + 1 <= currentStep ? colors.background : colors.text }
              ]}>
                {index + 1}
              </Text>
            </View>
            <Text style={[
              styles.stepLabel,
              { color: index + 1 === currentStep ? colors.primary : colors.text }
            ]}>
              {step}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderStudentForm = () => (
    <View style={styles.formSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations de l'élève</Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Photo de l'élève *</Text>
        <TouchableOpacity 
          style={[styles.photoUpload, { borderColor: colors.border }]} 
          onPress={pickImage}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          ) : (
            <>
              <Camera color={colors.primary} size={32} />
              <Text style={[styles.photoUploadText, { color: colors.text }]}>
                Ajouter une photo
              </Text>
            </>
          )}
        </TouchableOpacity>
        {errors.photo && <Text style={styles.errorText}>{errors.photo}</Text>}
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Nom *</Text>
          <View style={[styles.inputContainer, { borderColor: colors.border }]}>
            <User color={colors.text} size={20} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="Nom de famille"
              placeholderTextColor={colors.text}
              value={studentData.nom}
              onChangeText={(text) => setStudentData({ ...studentData, nom: text })}
            />
          </View>
          {errors.nom && <Text style={styles.errorText}>{errors.nom}</Text>}
        </View>

        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Prénoms *</Text>
          <View style={[styles.inputContainer, { borderColor: colors.border }]}>
            <User color={colors.text} size={20} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="Prénoms"
              placeholderTextColor={colors.text}
              value={studentData.prenoms}
              onChangeText={(text) => setStudentData({ ...studentData, prenoms: text })}
            />
          </View>
          {errors.prenoms && <Text style={styles.errorText}>{errors.prenoms}</Text>}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Classe *</Text>
          <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
            <GraduationCap color={colors.text} size={20} />
            <Picker
              selectedValue={studentData.classe}
              onValueChange={(value) => setStudentData({ ...studentData, classe: value })}
              style={[styles.picker, { color: colors.text }]}
            >
              <Picker.Item label="Sélectionner une classe" value="" />
              {VALID_CLASSES.map((classe) => (
                <Picker.Item key={classe} label={classe} value={classe} />
              ))}
            </Picker>
          </View>
          {errors.classe && <Text style={styles.errorText}>{errors.classe}</Text>}
        </View>

        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>École *</Text>
          <View style={[styles.inputContainer, { borderColor: colors.border }]}>
            <School color={colors.text} size={20} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="Nom de l'école"
              placeholderTextColor={colors.text}
              value={studentData.ecole}
              onChangeText={(text) => setStudentData({ ...studentData, ecole: text })}
            />
          </View>
          {errors.ecole && <Text style={styles.errorText}>{errors.ecole}</Text>}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Matricule *</Text>
          <View style={[styles.inputContainer, { borderColor: colors.border }]}>
            <BookOpen color={colors.text} size={20} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="Matricule élève"
              placeholderTextColor={colors.text}
              value={studentData.matricule}
              onChangeText={(text) => setStudentData({ ...studentData, matricule: text })}
            />
          </View>
          {errors.matricule && <Text style={styles.errorText}>{errors.matricule}</Text>}
        </View>

        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Date de naissance *</Text>
          <View style={[styles.inputContainer, { borderColor: colors.border }]}>
            <Calendar color={colors.text} size={20} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.text}
              value={studentData.dateNaissance}
              onChangeText={(text) => setStudentData({ ...studentData, dateNaissance: text })}
            />
          </View>
          {errors.dateNaissance && <Text style={styles.errorText}>{errors.dateNaissance}</Text>}
        </View>
      </View>
    </View>
  );

  const renderParentForm = () => (
    <View style={styles.formSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Sélection du parent</Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Parent responsable *</Text>
        <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
          <Users color={colors.text} size={20} />
          <Picker
            selectedValue={selectedParentId}
            onValueChange={setSelectedParentId}
            style={[styles.picker, { color: colors.text }]}
          >
            <Picker.Item label="Sélectionner un parent" value="" />
            {availableParents.map((parent) => (
              <Picker.Item 
                key={parent.id} 
                label={`${parent.prenoms} ${parent.nom}`} 
                value={parent.id} 
              />
            ))}
          </Picker>
        </View>
        {errors.parent && <Text style={styles.errorText}>{errors.parent}</Text>}
      </View>

      {selectedParentId && (
        <View style={[styles.parentInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(() => {
            const parent = availableParents.find(p => p.id === selectedParentId);
            return parent ? (
              <>
                <Text style={[styles.parentInfoTitle, { color: colors.text }]}>
                  Informations du parent
                </Text>
                <Text style={[styles.parentInfoText, { color: colors.text }]}>
                  Email: {parent.email}
                </Text>
                <Text style={[styles.parentInfoText, { color: colors.text }]}>
                  Téléphone: {parent.telephone}
                </Text>
                <Text style={[styles.parentInfoText, { color: colors.text }]}>
                  Adresse: {parent.adresse}
                </Text>
              </>
            ) : null;
          })()}
        </View>
      )}
    </View>
  );

  const renderTeachersForm = () => (
    <View style={styles.formSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Enseignants assignés</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]} 
          onPress={addTeacher}
        >
          <Plus color={colors.background} size={20} />
          <Text style={[styles.addButtonText, { color: colors.background }]}>
            Ajouter
          </Text>
        </TouchableOpacity>
      </View>

      {formTeachers.map((teacher, index) => (
        <View key={index} style={[styles.teacherCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Enseignant {index + 1}
            </Text>
            <TouchableOpacity 
              style={styles.removeButton} 
              onPress={() => removeTeacher(index)}
            >
              <Minus color="#EF4444" size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Enseignant *</Text>
            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
              <User color={colors.text} size={20} />
              <Picker
                selectedValue={teacher.teacherId}
                onValueChange={(value) => updateTeacher(index, 'teacherId', value)}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Sélectionner un enseignant" value="" />
                {availableTeachers.map((t) => (
                  <Picker.Item 
                    key={t.id} 
                    label={`${t.prenoms} ${t.nom}`} 
                    value={t.id} 
                  />
                ))}
              </Picker>
            </View>
            {errors[`teacher_${index}_id`] && (
              <Text style={styles.errorText}>{errors[`teacher_${index}_id`]}</Text>
            )}
          </View>

          {/* Autres champs du formulaire enseignant... */}
        </View>
      ))}

      {formTeachers.length === 0 && (
        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            Aucun enseignant assigné. Cliquez sur "Ajouter" pour commencer.
          </Text>
        </View>
      )}
      {errors.teachers && <Text style={styles.errorText}>{errors.teachers}</Text>}
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStudentForm();
      case 2: return renderParentForm();
      case 3: return renderTeachersForm();
      case 4: return <Text style={{ color: colors.text }}>Aspects financiers (à implémenter)</Text>;
      case 5: return <Text style={{ color: colors.text }}>Planning (à implémenter)</Text>;
      case 6: return <Text style={{ color: colors.text }}>Finalisation (à implémenter)</Text>;
      default: return null;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        {/* Header */}
        <LinearGradient colors={['#7C3AED', '#8B5CF6', '#A855F7']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {editingContract ? 'Modifier le contrat' : 'Nouveau contrat'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Form Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={styles.footerButtons}>
            {currentStep > 1 && (
              <TouchableOpacity 
                style={[styles.navButton, styles.prevButton, { borderColor: colors.border }]}
                onPress={handlePrevStep}
              >
                <Text style={[styles.navButtonText, { color: colors.text }]}>
                  Précédent
                </Text>
              </TouchableOpacity>
            )}

            {currentStep < 6 ? (
              <TouchableOpacity 
                style={[styles.navButton, styles.nextButton, { backgroundColor: '#8B5CF6' }]}
                onPress={handleNextStep}
              >
                <Text style={[styles.navButtonText, { color: '#FFFFFF' }]}>
                  Suivant
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.navButton, styles.submitButton, { backgroundColor: '#10B981' }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={[styles.navButtonText, { color: '#FFFFFF' }]}>
                    {editingContract ? 'Modifier' : 'Créer le contrat'}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 800,
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 12,
  },
  picker: {
    flex: 1,
    marginLeft: 12,
  },
  photoUpload: {
    height: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  photoUploadText: {
    marginTop: 8,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  parentInfo: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  parentInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  parentInfoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  teacherCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 4,
  },
  emptyState: {
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    borderTopWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prevButton: {
    borderWidth: 1,
    backgroundColor: '#F3F4F6',
  },
  nextButton: {},
  submitButton: {},
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 