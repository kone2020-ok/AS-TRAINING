import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus,
  Calendar,
  FileText,
  User,
  Star,
  CheckCircle,
  Clock,
  MessageCircle,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Save,
  Send,
  Loader,
  UserCheck,
  GraduationCap,
  Heart
} from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import {
  ParentTeacherReport,
  ParentTeacherReportContent,
  ParentReportView,
  CreateParentReportData,
  ReportStatus,
  SatisfactionLevel,
  FrequencyLevel,
  ProgressLevel,
  ReportStats,
  generateReportId,
  SATISFACTION_LABELS,
  FREQUENCY_LABELS,
  PROGRESS_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_COLORS,
  MONTHS_LABELS,
  formatReportPeriod,
  getSatisfactionColor,
  getProgressColor,
  validateParentReportContent
} from '../../../types/Report';
import { useNotificationTriggers } from '../../../services/NotificationTriggers';

// Données de démonstration
const demoChildren = [
  { id: 'student_1', name: 'Marie Kouassi', class: '3ème', teachers: ['teacher_1', 'teacher_2'] },
  { id: 'student_2', name: 'Paul Kouassi', class: '1ère S', teachers: ['teacher_1', 'teacher_3'] },
];

const demoTeachers = [
  { id: 'teacher_1', name: 'Marie N\'Guessan', subjects: ['Mathématiques', 'Physique'] },
  { id: 'teacher_2', name: 'Jean Baptiste', subjects: ['Français', 'Histoire'] },
  { id: 'teacher_3', name: 'Sarah Diallo', subjects: ['Chimie', 'SVT'] },
];

const demoReports: ParentReportView[] = [
  {
    id: 'RPT-P-2401-XYZ789',
    teacherName: 'Marie N\'Guessan',
    studentName: 'Marie Kouassi',
    month: 0, // Janvier
    year: 2024,
    satisfactionGlobale: 8.5,
    prestationGenerale: 'tres_satisfait',
    status: 'submitted',
    createdAt: '2024-01-25T16:30:00Z',
  },
  {
    id: 'RPT-P-2401-ABC456',
    teacherName: 'Jean Baptiste',
    studentName: 'Marie Kouassi',
    month: 0, // Janvier
    year: 2024,
    satisfactionGlobale: 7.0,
    prestationGenerale: 'satisfait',
    status: 'submitted',
    createdAt: '2024-01-28T14:15:00Z',
  },
];

type TabType = 'new' | 'history';

export default function ParentMonthlyReportsScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [fadeAnim] = useState(new Animated.Value(0));
  const [activeTab, setActiveTab] = useState<TabType>('new');
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<ParentReportView[]>([]);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  // États du formulaire
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [reportContent, setReportContent] = useState<Partial<ParentTeacherReportContent>>({
    materiel_fourni_adequat: true,
    environnement_cours_adequat: true,
    frequence_communication_suffisante: true,
    recommanderiez_enseignant: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const parentId = 'parent_1';
  const parentName = 'Jean Kouassi';
  const { triggers } = useNotificationTriggers();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReports(demoReports);
      setLoading(false);
    };

    loadData();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const getAvailableTeachers = () => {
    if (!selectedChild) return [];
    const child = demoChildren.find(c => c.id === selectedChild);
    if (!child) return [];
    return demoTeachers.filter(teacher => child.teachers.includes(teacher.id));
  };

  const getStats = (): ReportStats => {
    const total = reports.length;
    const submittedThisMonth = reports.filter(r => 
      r.month === new Date().getMonth() && 
      r.year === new Date().getFullYear()
    ).length;
    const averageSatisfaction = total > 0 
      ? Math.round((reports.reduce((sum, r) => sum + r.satisfactionGlobale, 0) / total) * 10) / 10
      : 0;

    return {
      totalReports: total,
      submittedThisMonth,
      pendingReports: 0,
      completedReports: total,
      averageSatisfaction,
    };
  };

  const updateFormContent = (field: keyof ParentTeacherReportContent, value: any) => {
    setReportContent(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Supprimer l'erreur du champ modifié
    if (formErrors[field]) {
      setFormErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!selectedChild) errors.selectedChild = 'Sélectionnez un enfant';
    if (!selectedTeacher) errors.selectedTeacher = 'Sélectionnez un enseignant';
    
    const contentErrors = validateParentReportContent(reportContent);
    contentErrors.forEach(error => {
      const field = error.toLowerCase().includes('prestation générale') ? 'q1_prestation_generale' :
                   error.toLowerCase().includes('ponctualité') ? 'q2_ponctualite' :
                   error.toLowerCase().includes('méthodes') ? 'q3_methodes_pedagogiques' :
                   error.toLowerCase().includes('communication') ? 'q4_communication' :
                   error.toLowerCase().includes('progrès') ? 'q5_progres_constates' :
                   error.toLowerCase().includes('satisfaction') ? 'q7_satisfaction_globale' : 'general';
      errors[field] = error;
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveDraft = async () => {
    setLoading(true);
    
    try {
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Succès', 'Brouillon sauvegardé');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le brouillon');
    } finally {
      setLoading(false);
    }
  };

  const submitReport = async () => {
    if (!validateForm()) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs du formulaire');
      return;
    }

    setLoading(true);
    
    try {
      const child = demoChildren.find(c => c.id === selectedChild);
      const teacher = demoTeachers.find(t => t.id === selectedTeacher);
      if (!child || !teacher) return;

      const newReport: ParentReportView = {
        id: generateReportId('parent_to_teacher'),
        teacherName: teacher.name,
        studentName: child.name,
        month: selectedMonth,
        year: selectedYear,
        satisfactionGlobale: reportContent.q7_satisfaction_globale || 5,
        prestationGenerale: reportContent.q1_prestation_generale || 'satisfait',
        status: 'submitted',
        createdAt: new Date().toISOString(),
      };

      // Simulation de soumission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setReports(prev => [newReport, ...prev]);

      // 🔔 DÉCLENCHEMENT DES NOTIFICATIONS
      await triggers.onMonthlyReportReady({
        userId: parentId,
        userRole: 'parent',
        metadata: {
          teacherName: teacher.name,
          teacherId: selectedTeacher,
          studentName: child.name,
          studentId: selectedChild,
          reportId: newReport.id,
          month: selectedMonth,
          year: selectedYear,
          satisfactionGlobale: reportContent.q7_satisfaction_globale,
          prestationGenerale: reportContent.q1_prestation_generale,
          reportType: 'parent_evaluation'
        }
      });
      
      // Réinitialiser le formulaire
      setSelectedChild('');
      setSelectedTeacher('');
      setReportContent({
        materiel_fourni_adequat: true,
        environnement_cours_adequat: true,
        frequence_communication_suffisante: true,
        recommanderiez_enseignant: true,
      });
      
      Alert.alert(
        'Succès',
        'Évaluation soumise avec succès ! Elle sera transmise à la direction et à l\'enseignant concerné.',
        [{ text: 'OK', onPress: () => setActiveTab('history') }]
      );
      
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de soumettre l\'évaluation');
    } finally {
      setLoading(false);
    }
  };

  const renderFormSection = (
    title: string,
    icon: React.ReactNode,
    children: React.ReactNode
  ) => (
    <View style={[styles.formSection, { backgroundColor: colors.card }]}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {title}
        </Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const renderNewReportTab = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      {/* Sélection enfant, enseignant et période */}
      <View style={[styles.selectionSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.selectionTitle, { color: colors.text }]}>
          Nouvelle Évaluation Enseignant
        </Text>
        
        <View style={styles.selectionRow}>
          <View style={styles.selectionField}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Mon enfant *</Text>
            <View style={[
              styles.pickerContainer, 
              { borderColor: formErrors.selectedChild ? '#EF4444' : colors.border }
            ]}>
              <Picker
                selectedValue={selectedChild}
                onValueChange={(value) => {
                  setSelectedChild(value);
                  setSelectedTeacher(''); // Reset teacher when child changes
                }}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Sélectionnez un enfant..." value="" />
                {demoChildren.map(child => (
                  <Picker.Item
                    key={child.id}
                    label={`${child.name} (${child.class})`}
                    value={child.id}
                  />
      ))}
              </Picker>
    </View>
            {formErrors.selectedChild && (
              <Text style={styles.errorText}>{formErrors.selectedChild}</Text>
            )}
          </View>
        </View>

        <View style={styles.selectionRow}>
          <View style={styles.selectionField}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Enseignant à évaluer *</Text>
            <View style={[
              styles.pickerContainer, 
              { borderColor: formErrors.selectedTeacher ? '#EF4444' : colors.border }
            ]}>
              <Picker
                selectedValue={selectedTeacher}
                onValueChange={setSelectedTeacher}
                style={[styles.picker, { color: colors.text }]}
                enabled={!!selectedChild}
              >
                <Picker.Item label="Sélectionnez un enseignant..." value="" />
                {getAvailableTeachers().map(teacher => (
                  <Picker.Item
                    key={teacher.id}
                    label={`${teacher.name} (${teacher.subjects.join(', ')})`}
                    value={teacher.id}
                  />
                ))}
              </Picker>
            </View>
            {formErrors.selectedTeacher && (
              <Text style={styles.errorText}>{formErrors.selectedTeacher}</Text>
            )}
          </View>
        </View>

        <View style={styles.selectionRow}>
          <View style={[styles.selectionField, { flex: 1, marginRight: 8 }]}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Mois</Text>
            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
              <Picker
                selectedValue={selectedMonth}
                onValueChange={setSelectedMonth}
                style={[styles.picker, { color: colors.text }]}
              >
                {MONTHS_LABELS.map((month, index) => (
                  <Picker.Item key={index} label={month} value={index} />
                ))}
              </Picker>
            </View>
        </View>
        
          <View style={[styles.selectionField, { flex: 1, marginLeft: 8 }]}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Année</Text>
            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
              <Picker
                selectedValue={selectedYear}
                onValueChange={setSelectedYear}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="2024" value={2024} />
                <Picker.Item label="2025" value={2025} />
              </Picker>
            </View>
          </View>
        </View>
      </View>

      {/* Questions d'évaluation */}
      
      {/* Question 1: Prestation générale */}
      {renderFormSection(
        "1. Prestation Générale",
        <UserCheck color={colors.primary} size={20} />,
        <View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Comment évaluez-vous la prestation générale de l'enseignant ? *</Text>
            <View style={[
              styles.pickerContainer,
              { borderColor: formErrors.q1_prestation_generale ? '#EF4444' : colors.border }
            ]}>
              <Picker
                selectedValue={reportContent.q1_prestation_generale || ''}
                onValueChange={(value) => updateFormContent('q1_prestation_generale', value)}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Sélectionnez votre évaluation..." value="" />
                {Object.entries(SATISFACTION_LABELS).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
          </View>
            {formErrors.q1_prestation_generale && (
              <Text style={styles.errorText}>{formErrors.q1_prestation_generale}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Détails sur la prestation générale *</Text>
            <TextInput
              style={[
                styles.textArea,
                { 
                  color: colors.text, 
                  borderColor: formErrors.q1_prestation_details ? '#EF4444' : colors.border 
                }
              ]}
              value={reportContent.q1_prestation_details || ''}
              onChangeText={(value) => updateFormContent('q1_prestation_details', value)}
              placeholder="Décrivez votre impression générale sur les prestations de l'enseignant..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
            {formErrors.q1_prestation_details && (
              <Text style={styles.errorText}>{formErrors.q1_prestation_details}</Text>
            )}
          </View>
          </View>
      )}

      {/* Question 2: Ponctualité */}
      {renderFormSection(
        "2. Ponctualité et Assiduité",
        <Clock color={colors.primary} size={20} />,
        <View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>L'enseignant est-il ponctuel ? *</Text>
            <View style={[
              styles.pickerContainer,
              { borderColor: formErrors.q2_ponctualite ? '#EF4444' : colors.border }
            ]}>
              <Picker
                selectedValue={reportContent.q2_ponctualite || ''}
                onValueChange={(value) => updateFormContent('q2_ponctualite', value)}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Sélectionnez..." value="" />
                {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
            </View>
            {formErrors.q2_ponctualite && (
              <Text style={styles.errorText}>{formErrors.q2_ponctualite}</Text>
            )}
        </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Détails sur la ponctualité (optionnel)</Text>
            <TextInput
              style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
              value={reportContent.q2_ponctualite_details || ''}
              onChangeText={(value) => updateFormContent('q2_ponctualite_details', value)}
              placeholder="Ajoutez des détails si nécessaire..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>
      )}

      {/* Question 3: Méthodes pédagogiques */}
      {renderFormSection(
        "3. Méthodes Pédagogiques",
        <GraduationCap color={colors.primary} size={20} />,
        <View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Êtes-vous satisfait(e) des méthodes pédagogiques ? *</Text>
            <View style={[
              styles.pickerContainer,
              { borderColor: formErrors.q3_methodes_pedagogiques ? '#EF4444' : colors.border }
            ]}>
              <Picker
                selectedValue={reportContent.q3_methodes_pedagogiques || ''}
                onValueChange={(value) => updateFormContent('q3_methodes_pedagogiques', value)}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Sélectionnez votre évaluation..." value="" />
                {Object.entries(SATISFACTION_LABELS).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
        </View>
            {formErrors.q3_methodes_pedagogiques && (
              <Text style={styles.errorText}>{formErrors.q3_methodes_pedagogiques}</Text>
            )}
      </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Commentaires sur les méthodes *</Text>
            <TextInput
              style={[
                styles.textArea,
                { 
                  color: colors.text, 
                  borderColor: formErrors.q3_methodes_details ? '#EF4444' : colors.border 
                }
              ]}
              value={reportContent.q3_methodes_details || ''}
              onChangeText={(value) => updateFormContent('q3_methodes_details', value)}
              placeholder="Décrivez votre avis sur les méthodes utilisées par l'enseignant..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
            {formErrors.q3_methodes_details && (
              <Text style={styles.errorText}>{formErrors.q3_methodes_details}</Text>
            )}
          </View>
        </View>
      )}

      {/* Question 4: Communication */}
      {renderFormSection(
        "4. Communication",
        <MessageCircle color={colors.primary} size={20} />,
        <View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Comment évaluez-vous la communication avec l'enseignant ? *</Text>
            <View style={[
              styles.pickerContainer,
              { borderColor: formErrors.q4_communication ? '#EF4444' : colors.border }
            ]}>
              <Picker
                selectedValue={reportContent.q4_communication || ''}
                onValueChange={(value) => updateFormContent('q4_communication', value)}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Sélectionnez votre évaluation..." value="" />
                {Object.entries(SATISFACTION_LABELS).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
      </View>
            {formErrors.q4_communication && (
              <Text style={styles.errorText}>{formErrors.q4_communication}</Text>
            )}
    </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Détails sur la communication *</Text>
            <TextInput
              style={[
                styles.textArea,
                { 
                  color: colors.text, 
                  borderColor: formErrors.q4_communication_details ? '#EF4444' : colors.border 
                }
              ]}
              value={reportContent.q4_communication_details || ''}
              onChangeText={(value) => updateFormContent('q4_communication_details', value)}
              placeholder="Comment se passent les échanges avec l'enseignant ?"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
            {formErrors.q4_communication_details && (
              <Text style={styles.errorText}>{formErrors.q4_communication_details}</Text>
            )}
          </View>
        </View>
      )}

      {/* Question 5: Progrès constatés */}
      {renderFormSection(
        "5. Progrès de l'Enfant",
        <TrendingUp color={colors.primary} size={20} />,
        <View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Avez-vous constaté des progrès chez votre enfant ? *</Text>
            <View style={[
              styles.pickerContainer,
              { borderColor: formErrors.q5_progres_constates ? '#EF4444' : colors.border }
            ]}>
              <Picker
                selectedValue={reportContent.q5_progres_constates || ''}
                onValueChange={(value) => updateFormContent('q5_progres_constates', value)}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Sélectionnez..." value="" />
                {Object.entries(PROGRESS_LABELS).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
      </View>
            {formErrors.q5_progres_constates && (
              <Text style={styles.errorText}>{formErrors.q5_progres_constates}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Détails sur les progrès *</Text>
            <TextInput
              style={[
                styles.textArea,
                { 
                  color: colors.text, 
                  borderColor: formErrors.q5_progres_details ? '#EF4444' : colors.border 
                }
              ]}
              value={reportContent.q5_progres_details || ''}
              onChangeText={(value) => updateFormContent('q5_progres_details', value)}
              placeholder="Décrivez les progrès observés chez votre enfant..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
            {formErrors.q5_progres_details && (
              <Text style={styles.errorText}>{formErrors.q5_progres_details}</Text>
            )}
          </View>
        </View>
      )}

      {/* Question 6: Recommandations */}
      {renderFormSection(
        "6. Recommandations",
        <MessageCircle color={colors.primary} size={20} />,
        <View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Avez-vous des recommandations ?</Text>
            <TextInput
              style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
              value={reportContent.q6_recommandations || ''}
              onChangeText={(value) => updateFormContent('q6_recommandations', value)}
              placeholder="Vos recommandations pour améliorer l'enseignement..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Suggestions d'amélioration</Text>
              <TextInput
              style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
              value={reportContent.q6_suggestions_amelioration || ''}
              onChangeText={(value) => updateFormContent('q6_suggestions_amelioration', value)}
              placeholder="Que pourrait améliorer l'enseignant ?"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              />
            </View>
          </View>
      )}

      {/* Question 7: Satisfaction globale */}
      {renderFormSection(
        "7. Évaluation Globale",
        <Award color={colors.primary} size={20} />,
        <View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Note de satisfaction globale * (sur 10)</Text>
            <TextInput
              style={[
                styles.gradeInput,
                { 
                  color: colors.text, 
                  borderColor: formErrors.q7_satisfaction_globale ? '#EF4444' : colors.border,
                  width: '100%'
                }
              ]}
              value={reportContent.q7_satisfaction_globale?.toString() || ''}
              onChangeText={(value) => updateFormContent('q7_satisfaction_globale', parseFloat(value) || 0)}
              placeholder="Note entre 0 et 10"
              keyboardType="numeric"
            />
            {formErrors.q7_satisfaction_globale && (
              <Text style={styles.errorText}>{formErrors.q7_satisfaction_globale}</Text>
            )}
        </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Commentaire global</Text>
            <TextInput
              style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
              value={reportContent.q7_commentaire_global || ''}
              onChangeText={(value) => updateFormContent('q7_commentaire_global', value)}
              placeholder="Votre impression générale sur cet enseignant..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>
          </View>
      )}

      {/* Questions optionnelles */}
      {renderFormSection(
        "8. Questions Complémentaires",
        <Heart color={colors.primary} size={20} />,
        <View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Le matériel fourni par l'enseignant est-il adéquat ?</Text>
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  { 
                    backgroundColor: reportContent.materiel_fourni_adequat 
                      ? colors.primary 
                      : colors.background,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => updateFormContent('materiel_fourni_adequat', !reportContent.materiel_fourni_adequat)}
              >
                {reportContent.materiel_fourni_adequat && (
                  <CheckCircle color={colors.background} size={16} />
                )}
              </TouchableOpacity>
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                Oui, le matériel est adéquat
            </Text>
          </View>
        </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>L'environnement des cours est-il adapté ?</Text>
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  { 
                    backgroundColor: reportContent.environnement_cours_adequat 
                      ? colors.primary 
                      : colors.background,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => updateFormContent('environnement_cours_adequat', !reportContent.environnement_cours_adequat)}
              >
                {reportContent.environnement_cours_adequat && (
                  <CheckCircle color={colors.background} size={16} />
                )}
              </TouchableOpacity>
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                Oui, l'environnement est adapté
              </Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>La fréquence de communication est-elle suffisante ?</Text>
            <View style={styles.checkboxRow}>
                  <TouchableOpacity
                    style={[
                  styles.checkbox,
                  { 
                    backgroundColor: reportContent.frequence_communication_suffisante 
                      ? colors.primary 
                      : colors.background,
                    borderColor: colors.border
                  }
                    ]}
                onPress={() => updateFormContent('frequence_communication_suffisante', !reportContent.frequence_communication_suffisante)}
                  >
                {reportContent.frequence_communication_suffisante && (
                  <CheckCircle color={colors.background} size={16} />
                )}
                  </TouchableOpacity>
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                Oui, la communication est suffisante
              </Text>
              </View>
            </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Recommanderiez-vous cet enseignant ?</Text>
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  { 
                    backgroundColor: reportContent.recommanderiez_enseignant 
                      ? colors.primary 
                      : colors.background,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => updateFormContent('recommanderiez_enseignant', !reportContent.recommanderiez_enseignant)}
              >
                {reportContent.recommanderiez_enseignant && (
                  <CheckCircle color={colors.background} size={16} />
                )}
              </TouchableOpacity>
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                Oui, je recommande cet enseignant
              </Text>
              </View>
            </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Commentaires additionnels</Text>
                <TextInput
              style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
              value={reportContent.commentaires_additionnels || ''}
              onChangeText={(value) => updateFormContent('commentaires_additionnels', value)}
              placeholder="Autres commentaires ou observations..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
                />
              </View>
            </View>
      )}

      {/* Boutons d'action */}
      <View style={styles.actionsSection}>
        <View style={styles.submitActions}>
          <TouchableOpacity
            style={[styles.draftButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={saveDraft}
            disabled={loading}
          >
            <Save color={colors.text} size={18} />
            <Text style={[styles.draftButtonText, { color: colors.text }]}>
              Sauvegarder
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={submitReport}
            disabled={loading}
          >
            {loading ? (
              <Loader color={colors.background} size={18} />
            ) : (
              <Send color={colors.background} size={18} />
            )}
            <Text style={[styles.submitButtonText, { color: colors.background }]}>
              Soumettre
            </Text>
          </TouchableOpacity>
              </View>
      </View>
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.historyContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.historyHeader}>
        <Text style={[styles.historyTitle, { color: colors.text }]}>
          Mes Évaluations Soumises
        </Text>
        <Text style={[styles.historySubtitle, { color: colors.textSecondary }]}>
          {reports.length} évaluation{reports.length > 1 ? 's' : ''} envoyée{reports.length > 1 ? 's' : ''}
        </Text>
              </View>

      {reports.length > 0 ? (
        <View style={styles.reportsList}>
          {reports.map((report) => (
            <View 
              key={report.id} 
              style={[styles.reportCard, { backgroundColor: colors.card, shadowColor: colors.text }]}
            >
              <View style={styles.reportPreview}>
                <View style={styles.reportInfo}>
                  <Text style={[styles.reportTeacher, { color: colors.text }]}>
                    {report.teacherName}
                  </Text>
                  <Text style={[styles.reportStudent, { color: colors.textSecondary }]}>
                    Enseignant de {report.studentName}
                  </Text>
                  <Text style={[styles.reportPeriod, { color: colors.textSecondary }]}>
                    {formatReportPeriod(report.month, report.year)}
                  </Text>
                  <View style={styles.reportMeta}>
                    <View style={styles.gradeContainer}>
                      <Star color="#F59E0B" size={16} />
                      <Text style={[styles.reportGrade, { color: colors.text }]}>
                        {report.satisfactionGlobale}/10
                      </Text>
                    </View>
                    <View style={[
                      styles.satisfactionBadge,
                      { backgroundColor: getSatisfactionColor(report.prestationGenerale) + '20' }
                    ]}>
                      <Text style={[
                        styles.satisfactionText,
                        { color: getSatisfactionColor(report.prestationGenerale) }
                      ]}>
                        {SATISFACTION_LABELS[report.prestationGenerale]}
                      </Text>
                    </View>
                  </View>
              </View>

                <View style={styles.reportActions}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: REPORT_STATUS_COLORS[report.status] + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: REPORT_STATUS_COLORS[report.status] }
                    ]}>
                      {REPORT_STATUS_LABELS[report.status]}
                    </Text>
                  </View>
              </View>
            </View>

              <TouchableOpacity
                style={[styles.expandButton, { backgroundColor: colors.background }]}
                onPress={() => setExpandedReport(
                  expandedReport === report.id ? null : report.id
                )}
              >
                <Text style={[styles.expandButtonText, { color: colors.primary }]}>
                  {expandedReport === report.id ? 'Masquer les détails' : 'Voir les détails'}
                </Text>
                {expandedReport === report.id ? (
                  <ChevronUp color={colors.primary} size={16} />
                ) : (
                  <ChevronDown color={colors.primary} size={16} />
                )}
              </TouchableOpacity>

              {expandedReport === report.id && (
                <View style={[styles.reportDetails, { backgroundColor: colors.background }]}>
                  <Text style={[styles.detailsTitle, { color: colors.text }]}>
                    Détails de l'évaluation
                  </Text>
                  <View style={styles.detailsContent}>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                        Enseignant:
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {report.teacherName}
                      </Text>
              </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                        Enfant:
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {report.studentName}
                      </Text>
            </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                        Créée le:
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                        Note globale:
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {report.satisfactionGlobale}/10
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
          <Star color={colors.textSecondary} size={48} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Aucune évaluation créée
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Évaluez vos enseignants pour améliorer la qualité des cours
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const stats = getStats();

  if (loading && reports.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.pageTitle}>Rapports Mensuels</Text>
              </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Loader color={colors.primary} size={48} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement des évaluations...
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
          <Text style={styles.pageTitle}>Rapports Mensuels</Text>
          <Text style={styles.pageSubtitle}>
            {stats.totalReports} évaluation{stats.totalReports > 1 ? 's' : ''} • Satisfaction moyenne: {stats.averageSatisfaction?.toFixed(1) || 'N/A'}/10
          </Text>
              </View>
      </LinearGradient>

      {/* Statistiques */}
      <View style={styles.statsSection}>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
            <Star color="#F59E0B" size={24} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{stats.averageSatisfaction?.toFixed(1) || '0'}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Satisfaction</Text>
            </View>

          <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
            <FileText color="#10B981" size={24} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{stats.totalReports}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
            <Calendar color="#3B82F6" size={24} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{stats.submittedThisMonth}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Ce mois</Text>
          </View>
        </View>
      </View>

      {/* Onglets */}
      <View style={styles.tabsContainer}>
                <TouchableOpacity
                  style={[
            styles.tab,
            { backgroundColor: activeTab === 'new' ? colors.primary : colors.card }
                  ]}
          onPress={() => setActiveTab('new')}
                >
          <Plus color={activeTab === 'new' ? colors.background : colors.text} size={20} />
                  <Text style={[
            styles.tabText,
            { color: activeTab === 'new' ? colors.background : colors.text }
                  ]}>
            Nouvelle Évaluation
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
            styles.tab,
            { backgroundColor: activeTab === 'history' ? colors.primary : colors.card }
                  ]}
          onPress={() => setActiveTab('history')}
                >
          <FileText color={activeTab === 'history' ? colors.background : colors.text} size={20} />
                  <Text style={[
            styles.tabText,
            { color: activeTab === 'history' ? colors.background : colors.text }
                  ]}>
            Mes Évaluations
                  </Text>
                </TouchableOpacity>
            </View>

      {/* Contenu des onglets */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {activeTab === 'new' ? renderNewReportTab() : renderHistoryTab()}
      </Animated.View>
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
  statsSection: {
    padding: 20,
    paddingBottom: 10,
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    paddingTop: 0,
  },
  selectionSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  selectionRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  selectionField: {
    flex: 1,
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
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  formSection: {
    borderRadius: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  gradeInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
  },
  actionsSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  submitActions: {
    flexDirection: 'row',
    gap: 12,
  },
  draftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  historyContainer: {
    padding: 20,
    paddingTop: 0,
  },
  historyHeader: {
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  historySubtitle: {
    fontSize: 14,
  },
  reportsList: {
    gap: 16,
  },
  reportCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  reportPreview: {
    padding: 16,
  },
  reportInfo: {
    marginBottom: 12,
  },
  reportTeacher: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reportStudent: {
    fontSize: 14,
    marginBottom: 4,
  },
  reportPeriod: {
    fontSize: 14,
    marginBottom: 8,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportGrade: {
    fontSize: 14,
    fontWeight: '600',
  },
  satisfactionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  satisfactionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reportActions: {
    alignItems: 'flex-end',
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
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    gap: 8,
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reportDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailsContent: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
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