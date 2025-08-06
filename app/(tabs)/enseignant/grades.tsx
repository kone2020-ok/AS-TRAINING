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
  Modal,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Search, Filter, GraduationCap, Calendar, User, BookOpen, Star, TrendingUp, TrendingDown, X } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@react-navigation/native';
import { useNotificationTriggers } from '../../../services/NotificationTriggers';
import {
  Grade,
  GradeFormData,
  GradeType,
  GradeScale,
  GRADE_SUBJECTS,
  GRADE_TYPE_LABELS,
  calculatePercentage,
  getPerformanceLevel,
  getGradeColor,
  generateGradeId,
  validateGradeInput,
  shouldTriggerPerformanceAlert
} from '../../../types/Grades';

// Données améliorées avec structure parent-enfants
const families = [
  {
    parentId: 'parent_1',
    parentName: 'M. Diabaté Mamadou',
    children: [
      { id: 'student_1', name: 'Kouadio Aya', class: '3ème A' },
      { id: 'student_2', name: 'N\'Dri Kevin', class: '6ème B' }
    ]
  },
  {
    parentId: 'parent_2', 
    parentName: 'Mme Koné Fatou',
    children: [
      { id: 'student_3', name: 'Traoré Sarah', class: '2nde C' }
    ]
  },
  {
    parentId: 'parent_3',
    parentName: 'M. N\'Guessan Emmanuel', 
    children: [
      { id: 'student_4', name: 'Kouassi Junior', class: 'Terminale S' },
      { id: 'student_5', name: 'Kouassi Prisca', class: '1ère ES' }
    ]
  }
];

export default function TeacherGrades() {
  const { colors } = useTheme();
  const { triggers } = useNotificationTriggers();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [grades, setGrades] = useState<Grade[]>([]);
  const [filteredGrades, setFilteredGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<GradeFormData>({
    parentId: '',
    studentId: '',
    subject: '',
    type: 'devoir',
    grade: '',
    maxGrade: 20,
    date: new Date().toISOString().split('T')[0],
    comment: '',
  });

  const teacherId = 'teacher_1';
  const teacherName = 'Marie N\'Guessan';

  // Données de démonstration améliorées
  const demoGrades: Grade[] = [
    {
      id: 'grade_1',
      studentId: 'student_1',
      studentName: 'Kouadio Aya',
      parentId: 'parent_1',
      parentName: 'M. Diabaté Mamadou',
      teacherId: teacherId,
      teacherName: teacherName,
      subject: 'Mathématiques',
      type: 'devoir',
      grade: 16,
      maxGrade: 20,
      percentage: 80,
      performanceLevel: 'tres_bien',
      date: '2025-01-15',
      month: 0,
      year: 2025,
      comment: 'Excellent travail sur les équations',
      isRetake: false,
      createdAt: '2025-01-15T10:30:00Z',
    },
    {
      id: 'grade_2',
      studentId: 'student_2',
      studentName: 'N\'Dri Kevin',
      parentId: 'parent_1',
      parentName: 'M. Diabaté Mamadou',
      teacherId: teacherId,
      teacherName: teacherName,
      subject: 'Français',
      type: 'interrogation',
      grade: 12,
      maxGrade: 20,
      percentage: 60,
      performanceLevel: 'passable',
      date: '2025-01-14',
      month: 0,
      year: 2025,
      comment: 'Peut mieux faire en expression',
      isRetake: false,
      createdAt: '2025-01-14T14:15:00Z',
    },
  ];

  useEffect(() => {
    const loadGrades = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setGrades(demoGrades);
      setFilteredGrades(demoGrades);
      setLoading(false);
    };

    loadGrades();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const filtered = grades.filter(grade =>
      grade.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grade.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grade.parentName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredGrades(filtered);
  }, [searchQuery, grades]);

  // Obtenir les enfants du parent sélectionné
  const getAvailableStudents = () => {
    if (!formData.parentId) return [];
    const family = families.find(f => f.parentId === formData.parentId);
    return family ? family.children : [];
  };

  const handleAddGrade = () => {
    setFormData({
      parentId: '',
      studentId: '',
      subject: '',
      type: 'devoir',
      grade: '',
      maxGrade: 20,
      date: new Date().toISOString().split('T')[0],
      comment: '',
    });
    setShowForm(true);
  };

  const handleSubmitGrade = async () => {
    if (!formData.parentId || !formData.studentId || !formData.subject || !formData.grade) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const gradeValue = parseFloat(formData.grade);
    if (!validateGradeInput(gradeValue, formData.maxGrade)) {
      Alert.alert('Erreur', `La note doit être comprise entre 0 et ${formData.maxGrade}`);
      return;
    }

    // Trouver les informations de la famille et de l'étudiant
    const family = families.find(f => f.parentId === formData.parentId);
    const student = family?.children.find(c => c.id === formData.studentId);
    
    if (!family || !student) {
      Alert.alert('Erreur', 'Impossible de trouver les informations de l\'élève');
      return;
    }

    const percentage = calculatePercentage(gradeValue, formData.maxGrade);
    const performanceLevel = getPerformanceLevel(gradeValue, formData.maxGrade);

    const newGrade: Grade = {
      id: generateGradeId(),
      studentId: formData.studentId,
      studentName: student.name,
      parentId: formData.parentId,
      parentName: family.parentName,
      teacherId: teacherId,
      teacherName: teacherName,
      subject: formData.subject,
      type: formData.type,
      grade: gradeValue,
      maxGrade: formData.maxGrade,
      percentage,
      performanceLevel,
      date: formData.date,
      month: new Date(formData.date).getMonth(),
      year: new Date(formData.date).getFullYear(),
      comment: formData.comment,
      isRetake: false,
      createdAt: new Date().toISOString(),
    };

    // Vérifier si une alerte de performance doit être déclenchée
    const studentRecentGrades = grades
      .filter(g => g.studentId === formData.studentId && g.subject === formData.subject)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(g => g.grade);

    const shouldAlert = shouldTriggerPerformanceAlert(gradeValue, formData.maxGrade, studentRecentGrades);

    setGrades([newGrade, ...grades]);
    setFilteredGrades([newGrade, ...filteredGrades]);
    setShowForm(false);

    // 🔔 NOTIFICATIONS AUTOMATIQUES
    try {
      // 1. Notification au parent
      await triggers.onGradePublished({
        userId: teacherId,
        userRole: 'enseignant',
        metadata: {
          parentId: formData.parentId,
          studentId: formData.studentId,
          studentName: student.name,
          teacherName: teacherName,
          subject: formData.subject,
          grade: gradeValue,
          maxGrade: formData.maxGrade,
          percentage,
          performanceLevel,
          gradeType: formData.type,
          comment: formData.comment,
          gradeId: newGrade.id
        }
      });

      // 2. Alerte de performance si nécessaire
      if (shouldAlert) {
        await triggers.onStudentPerformanceAlert({
          userId: teacherId,
          userRole: 'enseignant',
          metadata: {
            parentId: formData.parentId,
            studentId: formData.studentId,
            studentName: student.name,
            teacherName: teacherName,
            subject: formData.subject,
            currentGrade: gradeValue,
            previousGrade: studentRecentGrades[0] || 0,
            recommendedAction: percentage < 50 ? 'Soutien scolaire recommandé' : 'Suivi renforcé conseillé'
          }
        });
      }

      Alert.alert(
        'Succès', 
        `Note ajoutée avec succès ! ${shouldAlert ? 'Une alerte de performance a été envoyée.' : 'Le parent a été notifié.'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Note ajoutée', 'La note a été ajoutée mais les notifications ont échoué');
    }
  };

  // Réinitialiser la sélection d'étudiant quand le parent change
  useEffect(() => {
    if (formData.parentId && formData.studentId) {
      const family = families.find(f => f.parentId === formData.parentId);
      const studentExists = family?.children.some(c => c.id === formData.studentId);
      if (!studentExists) {
        setFormData(prev => ({ ...prev, studentId: '' }));
      }
    }
  }, [formData.parentId]);

  const renderGradeCard = (grade: Grade) => (
    <View key={grade.id} style={[styles.gradeCard, { backgroundColor: colors.card }]}>
      <View style={styles.gradeHeader}>
        <View style={styles.gradeInfo}>
          <Text style={[styles.studentName, { color: colors.text }]}>{grade.studentName}</Text>
          <Text style={[styles.parentName, { color: colors.text + '80' }]}>({grade.parentName})</Text>
          <Text style={[styles.subjectText, { color: colors.text }]}>{grade.subject}</Text>
        </View>
        <View style={styles.gradeValue}>
          <Text style={[styles.gradeNumber, { color: getGradeColor(grade.grade, grade.maxGrade) }]}>
            {grade.grade}/{grade.maxGrade}
          </Text>
          <Text style={[styles.gradePercentage, { color: colors.text + '80' }]}>
            {grade.percentage}%
          </Text>
        </View>
      </View>
      
      <View style={styles.gradeDetails}>
        <View style={[styles.typeBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.typeText, { color: colors.primary }]}>
            {GRADE_TYPE_LABELS[grade.type]}
          </Text>
        </View>
        <Text style={[styles.gradeDate, { color: colors.text + '60' }]}>
          {new Date(grade.date).toLocaleDateString('fr-FR')}
        </Text>
      </View>
      
      {grade.comment && (
        <Text style={[styles.gradeComment, { color: colors.text + '80' }]}>
          💬 {grade.comment}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header fixe */}
      <LinearGradient colors={['#059669', '#10B981']} style={styles.fixedHeader}>
        <Text style={styles.pageTitle}>Gestion des Notes</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddGrade}>
          <Plus color="#FFFFFF" size={20} />
          <Text style={styles.addButtonText}>Nouvelle Note</Text>
        </TouchableOpacity>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Recherche */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Search color={colors.text + '60'} size={20} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Rechercher par élève, matière ou parent..."
            placeholderTextColor={colors.text + '60'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Liste des notes */}
        <ScrollView style={styles.gradesList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <Text style={[styles.loadingText, { color: colors.text }]}>Chargement...</Text>
          ) : filteredGrades.length > 0 ? (
            filteredGrades.map(renderGradeCard)
          ) : (
            <Text style={[styles.emptyText, { color: colors.text }]}>Aucune note trouvée</Text>
          )}
        </ScrollView>
      </Animated.View>

      {/* Modal de formulaire */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Nouvelle Note</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              {/* Sélection Parent */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Famille *</Text>
                <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                  <Picker
                    selectedValue={formData.parentId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value, studentId: '' }))}
                    style={[styles.picker, { color: colors.text }]}
                  >
                    <Picker.Item label="Sélectionner une famille" value="" />
                    {families.map(family => (
                      <Picker.Item
                        key={family.parentId}
                        label={family.parentName}
                        value={family.parentId}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Sélection Élève (filtré par parent) */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Élève *</Text>
                <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                  <Picker
                    selectedValue={formData.studentId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, studentId: value }))}
                    style={[styles.picker, { color: colors.text }]}
                    enabled={!!formData.parentId}
                  >
                    <Picker.Item label="Sélectionner un élève" value="" />
                    {getAvailableStudents().map(student => (
                      <Picker.Item
                        key={student.id}
                        label={`${student.name} (${student.class})`}
                        value={student.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Matière */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Matière *</Text>
                <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                  <Picker
                    selectedValue={formData.subject}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                    style={[styles.picker, { color: colors.text }]}
                  >
                    <Picker.Item label="Sélectionner une matière" value="" />
                    {GRADE_SUBJECTS.map(subject => (
                      <Picker.Item key={subject} label={subject} value={subject} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Type d'évaluation */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Type d'évaluation *</Text>
                <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                  <Picker
                    selectedValue={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as GradeType }))}
                    style={[styles.picker, { color: colors.text }]}
                  >
                    {Object.entries(GRADE_TYPE_LABELS).map(([key, label]) => (
                      <Picker.Item key={key} label={label} value={key} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Note et barème */}
              <View style={styles.gradeRow}>
                <View style={[styles.fieldContainer, { flex: 1, marginRight: 10 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Note *</Text>
                  <TextInput
                    style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                    value={formData.grade}
                    onChangeText={(value) => setFormData(prev => ({ ...prev, grade: value }))}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.text + '60'}
                  />
                </View>
                <View style={[styles.fieldContainer, { flex: 1, marginLeft: 10 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Sur</Text>
                  <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                    <Picker
                      selectedValue={formData.maxGrade}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, maxGrade: value as GradeScale }))}
                      style={[styles.picker, { color: colors.text }]}
                    >
                      <Picker.Item label="10" value={10} />
                      <Picker.Item label="20" value={20} />
                      <Picker.Item label="40" value={40} />
                      <Picker.Item label="80" value={80} />
                      <Picker.Item label="100" value={100} />
                    </Picker>
                  </View>
                </View>
              </View>

              {/* Date */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Date *</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                  value={formData.date}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, date: value }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.text + '60'}
                />
              </View>

              {/* Commentaire */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Commentaire</Text>
                <TextInput
                  style={[styles.textAreaInput, { color: colors.text, borderColor: colors.border }]}
                  value={formData.comment}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, comment: value }))}
                  multiline
                  numberOfLines={3}
                  placeholder="Commentaire sur la performance..."
                  placeholderTextColor={colors.text + '60'}
                />
              </View>

              {/* Boutons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.border }]}
                  onPress={() => setShowForm(false)}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: colors.primary }]}
                  onPress={handleSubmitGrade}
                >
                  <Text style={styles.submitButtonText}>Ajouter</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  fixedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  gradesList: {
    flex: 1,
  },
  gradeCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gradeInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  parentName: {
    fontSize: 14,
    marginBottom: 4,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '500',
  },
  gradeValue: {
    alignItems: 'flex-end',
  },
  gradeNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  gradePercentage: {
    fontSize: 12,
    marginTop: 2,
  },
  gradeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  gradeDate: {
    fontSize: 12,
  },
  gradeComment: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  formContainer: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
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
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textAreaInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});