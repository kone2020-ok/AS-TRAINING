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
  Brain,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  MessageCircle,
  Book,
  Home,
  Users,
  Target,
  Award,
  ChevronDown,
  ChevronUp,
  Save,
  Send,
  Loader,
  Sparkles
} from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import {
  TeacherStudentReport,
  TeacherStudentReportContent,
  TeacherReportView,
  CreateTeacherReportData,
  ReportStatus,
  AttitudeLevel,
  AttentionLevel,
  ComprehensionLevel,
  ProgressLevel,
  ApplicationLevel,
  InvolvementLevel,
  AppreciationLevel,
  FrequencyLevel,
  SubjectGrade,
  MissingConditions,
  MissedSessions,
  AISuggestions,
  ReportStats,
  generateReportId,
  ATTITUDE_LABELS,
  ATTENTION_LABELS,
  COMPREHENSION_LABELS,
  PROGRESS_LABELS,
  APPLICATION_LABELS,
  INVOLVEMENT_LABELS,
  APPRECIATION_LABELS,
  FREQUENCY_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_COLORS,
  MONTHS_LABELS,
  formatReportPeriod,
  getProgressColor,
  getAppreciationColor,
  validateTeacherReportContent,
  calculateAverageGrade
} from '../../../types/Report';
import { useNotificationTriggers } from '../../../services/NotificationTriggers';

// Données de démonstration
const demoStudents = [
  { id: 'student_1', name: 'Marie Kouassi', parentName: 'Jean Kouassi', class: '3ème' },
  { id: 'student_2', name: 'Amadou Traoré', parentName: 'Fatou Traoré', class: '2nde' },
  { id: 'student_3', name: 'Sarah Koffi', parentName: 'Emmanuel Koffi', class: '1ère S' },
  { id: 'student_4', name: 'Junior Diabaté', parentName: 'Ibrahim Diabaté', class: 'Terminale S' },
];

const demoSubjects = [
  'Mathématiques', 'Physique', 'Chimie', 'SVT', 'Français', 
  'Anglais', 'Histoire', 'Géographie', 'Philosophie'
];

const demoReports: TeacherReportView[] = [
  {
    id: 'RPT-T-2401-ABC123',
    studentName: 'Marie Kouassi',
    parentName: 'Jean Kouassi',
    month: 0, // Janvier
    year: 2024,
    overallGrade: 16.5,
    generalAppreciation: 'tres_bien',
    status: 'completed',
    createdAt: '2024-01-20T10:30:00Z',
    hasAISuggestions: true,
  },
  {
    id: 'RPT-T-2401-DEF456',
    studentName: 'Amadou Traoré',
    parentName: 'Fatou Traoré',
    month: 0, // Janvier
    year: 2024,
    overallGrade: 12.0,
    generalAppreciation: 'bien',
    status: 'submitted',
    createdAt: '2024-01-22T14:15:00Z',
    hasAISuggestions: false,
  },
];

type TabType = 'new' | 'history';

export default function TeacherReportsScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { triggers } = useNotificationTriggers();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [activeTab, setActiveTab] = useState<TabType>('new');
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<TeacherReportView[]>([]);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  // États du formulaire
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [reportContent, setReportContent] = useState<Partial<TeacherStudentReportContent>>({
    lastGrades: [],
    workConditions: {
      hasMaterials: true,
      favorableEnvironment: true,
    },
    attendance: {
      hasMissed: false,
    },
    needParentalSupport: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<AISuggestions | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);

  const teacherId = 'teacher_1';
  const teacherName = 'Marie N\'Guessan';

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

  const getStats = (): ReportStats => {
    const total = reports.length;
    const submittedThisMonth = reports.filter(r => 
      r.month === new Date().getMonth() && 
      r.year === new Date().getFullYear()
    ).length;
    const pending = reports.filter(r => r.status === 'submitted').length;
    const completed = reports.filter(r => r.status === 'completed').length;
    const averageGrade = total > 0 
      ? Math.round((reports.reduce((sum, r) => sum + r.overallGrade, 0) / total) * 100) / 100
      : 0;

    return {
      totalReports: total,
      submittedThisMonth,
      pendingReports: pending,
      completedReports: completed,
      averageGrade,
    };
  };

  const updateFormContent = (field: keyof TeacherStudentReportContent, value: any) => {
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

  const addGrade = () => {
    const newGrade: SubjectGrade = {
      subject: demoSubjects[0],
      grade: 0,
      maxGrade: 20,
      comment: ''
    };
    
    updateFormContent('lastGrades', [...(reportContent.lastGrades || []), newGrade]);
  };

  const updateGrade = (index: number, field: keyof SubjectGrade, value: any) => {
    const updatedGrades = [...(reportContent.lastGrades || [])];
    updatedGrades[index] = { ...updatedGrades[index], [field]: value };
    updateFormContent('lastGrades', updatedGrades);
  };

  const removeGrade = (index: number) => {
    const updatedGrades = (reportContent.lastGrades || []).filter((_, i) => i !== index);
    updateFormContent('lastGrades', updatedGrades);
  };

  const generateAISuggestions = async () => {
    setGeneratingAI(true);
    
    try {
      // Simulation de l'IA avec contexte élargi
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const student = demoStudents.find(s => s.id === selectedStudent);
      
      // Analyse du contexte actuel du rapport
      const currentGrades = reportContent.lastGrades || [];
      const averageGrade = currentGrades.length > 0 
        ? currentGrades.reduce((sum, grade) => sum + grade.note, 0) / currentGrades.length 
        : 0;
      
      const hasWorkingConditionIssues = !reportContent.workConditions?.hasMaterials || 
                                       !reportContent.workConditions?.favorableEnvironment;
      
      const needsParentalSupport = reportContent.needParentalSupport;
      const hasAttendanceIssues = reportContent.attendance?.hasMissed;
      
      // Suggestions personnalisées basées sur l'analyse
      let recommendations = [];
      let pedagogicalAdjustments = [];
      let parentalSupport = [];
      let workEnvironment = [];
      
      // Recommandations basées sur les notes
      if (averageGrade < 10) {
        recommendations.push('Renforcer les bases fondamentales avec des exercices ciblés');
        recommendations.push('Mettre en place un plan de rattrapage personnalisé');
        pedagogicalAdjustments.push('Ralentir le rythme et décomposer les concepts complexes');
      } else if (averageGrade >= 15) {
        recommendations.push('Proposer des exercices d\'approfondissement et défis supplémentaires');
        recommendations.push('Encourager l\'autonomie et la prise d\'initiative');
        pedagogicalAdjustments.push('Accélérer le programme avec des projets avancés');
      } else {
        recommendations.push('Consolider les acquis avant d\'aborder de nouveaux concepts');
        recommendations.push('Alterner exercices de révision et nouvelles notions');
        pedagogicalAdjustments.push('Maintenir un rythme équilibré avec des révisions régulières');
      }
      
      // Suggestions basées sur l'attitude et l'attention
      if (reportContent.attitude === 'pas_motive' || reportContent.attention === 'jamais') {
        recommendations.push('Utiliser des méthodes ludiques et interactives');
        recommendations.push('Proposer des objectifs courts et atteignables');
        pedagogicalAdjustments.push('Intégrer des pauses régulières et du matériel concret');
        parentalSupport.push('Créer un système de récompenses à la maison');
      }
      
      // Suggestions pour les conditions de travail
      if (hasWorkingConditionIssues) {
        workEnvironment.push('Établir une liste du matériel indispensable avec les parents');
        workEnvironment.push('Créer un espace de travail dédié et calme');
        workEnvironment.push('Minimiser les distractions (télévision, téléphone)');
        parentalSupport.push('Investir dans le matériel pédagogique nécessaire');
      } else {
        workEnvironment.push('Maintenir l\'organisation actuelle qui fonctionne bien');
        workEnvironment.push('Optimiser l\'éclairage et la position de travail');
      }
      
      // Suggestions pour l'implication parentale
      if (needsParentalSupport) {
        parentalSupport.push('Programmer des points réguliers avec les parents');
        parentalSupport.push('Fournir des exercices à faire à la maison avec accompagnement');
        parentalSupport.push('Créer un carnet de liaison quotidien');
        parentalSupport.push('Organiser une réunion famille-enseignant-élève');
      } else {
        parentalSupport.push('Maintenir la communication actuelle qui est efficace');
        parentalSupport.push('Encourager l\'autonomie progressive de l\'élève');
      }
      
      // Suggestions basées sur l'assiduité
      if (hasAttendanceIssues) {
        recommendations.push('Mettre en place un plan de rattrapage pour les séances manquées');
        recommendations.push('Sensibiliser sur l\'importance de la régularité');
        parentalSupport.push('Établir un planning fixe et s\'y tenir rigoureusement');
      }
      
      // Suggestions spécifiques à l'élève et à la matière
      const subjectSpecificSuggestions = getSubjectSpecificSuggestions(currentGrades);
      recommendations.push(...subjectSpecificSuggestions);
      
      const suggestions: AISuggestions = {
        generated: true,
        recommendations,
        pedagogicalAdjustments,
        parentalSupport,
        workEnvironment,
        generatedAt: new Date().toISOString(),
        // Nouvelles propriétés pour contexte élargi
        analysisContext: {
          studentProfile: student?.name || 'Élève',
          averageGrade,
          mainStrengths: reportContent.strengths || '',
          mainDifficulties: reportContent.difficulties || '',
          attendanceRate: hasAttendanceIssues ? 'Irrégulière' : 'Régulière',
          parentalInvolvement: reportContent.parentalInvolvement || 'impliques'
        }
      };
      
      setAISuggestions(suggestions);
      setReportContent(prev => ({
        ...prev,
        aiSuggestions: suggestions
      }));
      setShowAIModal(true);
      
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de générer les suggestions IA');
    } finally {
      setGeneratingAI(false);
    }
  };

  // Fonction helper pour suggestions spécifiques par matière
  const getSubjectSpecificSuggestions = (grades: any[]): string[] => {
    const suggestions = [];
    
    grades.forEach(grade => {
      if (grade.matiere === 'Mathématiques' && grade.note < 10) {
        suggestions.push('Renforcer les bases en calcul mental et tables de multiplication');
        suggestions.push('Utiliser des supports visuels pour la géométrie');
      } else if (grade.matiere === 'Français' && grade.note < 10) {
        suggestions.push('Augmenter la fréquence de lecture à voix haute');
        suggestions.push('Travailler la compréhension avec des textes courts');
      } else if (grade.matiere === 'Physique' && grade.note < 10) {
        suggestions.push('Privilégier les expériences pratiques et concrètes');
        suggestions.push('Faire des liens avec des exemples du quotidien');
      }
    });
    
    return suggestions;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!selectedStudent) errors.selectedStudent = 'Sélectionnez un élève';
    
    const contentErrors = validateTeacherReportContent(reportContent);
    contentErrors.forEach(error => {
      const field = error.toLowerCase().includes('attitude') ? 'attitude' :
                   error.toLowerCase().includes('attention') ? 'attention' :
                   error.toLowerCase().includes('difficultés') ? 'difficulties' :
                   error.toLowerCase().includes('points forts') ? 'strengths' :
                   error.toLowerCase().includes('compréhension') ? 'comprehension' :
                   error.toLowerCase().includes('évolution') ? 'progressEvolution' :
                   error.toLowerCase().includes('application') ? 'classApplication' :
                   error.toLowerCase().includes('implication') ? 'parentalInvolvement' :
                   error.toLowerCase().includes('appréciation') ? 'generalAppreciation' :
                   error.toLowerCase().includes('note') ? 'overallGrade' :
                   error.toLowerCase().includes('description') ? 'generalDescription' : 'general';
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
      const student = demoStudents.find(s => s.id === selectedStudent);
      if (!student) return;

      const newReport: TeacherReportView = {
        id: generateReportId('teacher_to_student'),
        studentName: student.name,
        parentName: student.parentName,
        month: selectedMonth,
        year: selectedYear,
        overallGrade: reportContent.overallGrade || 0,
        generalAppreciation: reportContent.generalAppreciation || 'passable',
        status: 'submitted',
        createdAt: new Date().toISOString(),
        hasAISuggestions: !!reportContent.aiSuggestions?.generated,
      };

      // Simulation de soumission
      await new Promise(resolve => setTimeout(resolve, 2000));

      setReports(prev => [newReport, ...prev]);

      // 🔔 DÉCLENCHEMENT DES NOTIFICATIONS
      await triggers.onMonthlyReportReady({
        userId: teacherId,
        userRole: 'enseignant',
        metadata: {
          teacherName: teacherName,
          teacherId: teacherId,
          studentName: student.name,
          parentName: student.parentName,
          studentId: selectedStudent,
          reportId: newReport.id,
          month: selectedMonth,
          year: selectedYear,
          overallGrade: reportContent.overallGrade,
          generalAppreciation: reportContent.generalAppreciation,
          hasAISuggestions: !!reportContent.aiSuggestions?.generated,
          reportType: 'teacher_evaluation',
          aiSuggestions: reportContent.aiSuggestions
        }
      });
      
      // Réinitialiser le formulaire
      setSelectedStudent('');
      setReportContent({
        lastGrades: [],
        workConditions: {
          hasMaterials: true,
          favorableEnvironment: true,
        },
        attendance: {
          hasMissed: false,
        },
        needParentalSupport: false,
      });
      
      Alert.alert(
        'Succès',
        'Rapport soumis avec succès ! Il sera transmis à la direction et aux parents.',
        [{ text: 'OK', onPress: () => setActiveTab('history') }]
      );
      
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de soumettre le rapport');
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
      {/* Sélection élève et période */}
      <View style={[styles.selectionSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.selectionTitle, { color: colors.text }]}>
          Nouveau Rapport Mensuel
          </Text>
        
        <View style={styles.selectionRow}>
          <View style={styles.selectionField}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Élève *</Text>
            <View style={[
              styles.pickerContainer, 
              { borderColor: formErrors.selectedStudent ? '#EF4444' : colors.border }
            ]}>
              <Picker
                selectedValue={selectedStudent}
                onValueChange={setSelectedStudent}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Sélectionnez un élève..." value="" />
                {demoStudents.map(student => (
                  <Picker.Item
                    key={student.id}
                    label={`${student.name} (${student.class})`}
                    value={student.id}
              />
                ))}
              </Picker>
            </View>
            {formErrors.selectedStudent && (
              <Text style={styles.errorText}>{formErrors.selectedStudent}</Text>
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

      {/* Section 1: Engagement et Compréhension */}
      {renderFormSection(
        "1. Engagement et Compréhension",
        <User color={colors.primary} size={20} />,
        <View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Attitude générale *</Text>
            <View style={[
              styles.pickerContainer,
              { borderColor: formErrors.attitude ? '#EF4444' : colors.border }
            ]}>
              <Picker
                selectedValue={reportContent.attitude || ''}
                onValueChange={(value) => updateFormContent('attitude', value)}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Sélectionnez..." value="" />
                {Object.entries(ATTITUDE_LABELS).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
            </View>
            {formErrors.attitude && (
              <Text style={styles.errorText}>{formErrors.attitude}</Text>
            )}
                </View>
                
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Attention/Concentration *</Text>
            <View style={[
              styles.pickerContainer,
              { borderColor: formErrors.attention ? '#EF4444' : colors.border }
            ]}>
              <Picker
                selectedValue={reportContent.attention || ''}
                onValueChange={(value) => updateFormContent('attention', value)}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Sélectionnez..." value="" />
                {Object.entries(ATTENTION_LABELS).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
                    </View>
            {formErrors.attention && (
              <Text style={styles.errorText}>{formErrors.attention}</Text>
                  )}
                  </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Principales difficultés * (min. 10 caractères)</Text>
            <TextInput
              style={[
                styles.textArea,
                { 
                  color: colors.text, 
                  borderColor: formErrors.difficulties ? '#EF4444' : colors.border 
                }
              ]}
              value={reportContent.difficulties || ''}
              onChangeText={(value) => updateFormContent('difficulties', value)}
              placeholder="Décrivez les principales difficultés rencontrées..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
            {formErrors.difficulties && (
              <Text style={styles.errorText}>{formErrors.difficulties}</Text>
            )}
                </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Points forts *</Text>
            <TextInput
              style={[
                styles.textArea,
                { 
                  color: colors.text, 
                  borderColor: formErrors.strengths ? '#EF4444' : colors.border 
                }
              ]}
              value={reportContent.strengths || ''}
              onChangeText={(value) => updateFormContent('strengths', value)}
              placeholder="Décrivez les points forts de l'élève..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
            {formErrors.strengths && (
              <Text style={styles.errorText}>{formErrors.strengths}</Text>
            )}
              </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Compréhension des méthodes *</Text>
            <View style={[
              styles.pickerContainer,
              { borderColor: formErrors.comprehension ? '#EF4444' : colors.border }
            ]}>
              <Picker
                selectedValue={reportContent.comprehension || ''}
                onValueChange={(value) => updateFormContent('comprehension', value)}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Sélectionnez..." value="" />
                {Object.entries(COMPREHENSION_LABELS).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
            </View>
            {formErrors.comprehension && (
              <Text style={styles.errorText}>{formErrors.comprehension}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Fréquence des plaintes sur les méthodes</Text>
            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
              <Picker
                selectedValue={reportContent.complaintsFrequency || 'jamais'}
                onValueChange={(value) => updateFormContent('complaintsFrequency', value)}
                style={[styles.picker, { color: colors.text }]}
              >
                {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      )}

      {/* Section 2: Progression et Résultats */}
      {renderFormSection(
        "2. Progression et Résultats",
        <TrendingUp color={colors.primary} size={20} />,
        <View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Évolution des résultats *</Text>
            <View style={[
              styles.pickerContainer,
              { borderColor: formErrors.progressEvolution ? '#EF4444' : colors.border }
            ]}>
              <Picker
                selectedValue={reportContent.progressEvolution || ''}
                onValueChange={(value) => updateFormContent('progressEvolution', value)}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Sélectionnez..." value="" />
                {Object.entries(PROGRESS_LABELS).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
            </View>
            {formErrors.progressEvolution && (
              <Text style={styles.errorText}>{formErrors.progressEvolution}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Application en classe *</Text>
            <View style={[
              styles.pickerContainer,
              { borderColor: formErrors.classApplication ? '#EF4444' : colors.border }
            ]}>
              <Picker
                selectedValue={reportContent.classApplication || ''}
                onValueChange={(value) => updateFormContent('classApplication', value)}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Sélectionnez..." value="" />
                {Object.entries(APPLICATION_LABELS).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
            </View>
            {formErrors.classApplication && (
              <Text style={styles.errorText}>{formErrors.classApplication}</Text>
            )}
          </View>

          {/* Dernières notes */}
          <View style={styles.fieldGroup}>
            <View style={styles.gradesHeader}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Dernières notes</Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={addGrade}
              >
                <Plus color={colors.background} size={16} />
                <Text style={[styles.addButtonText, { color: colors.background }]}>
                  Ajouter
                </Text>
              </TouchableOpacity>
              </View>

            {(reportContent.lastGrades || []).map((grade, index) => (
              <View key={index} style={[styles.gradeItem, { backgroundColor: colors.background }]}>
                <View style={styles.gradeRow}>
                  <View style={styles.gradeField}>
                    <Text style={[styles.gradeLabel, { color: colors.text }]}>Matière</Text>
                    <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                      <Picker
                        selectedValue={grade.subject}
                        onValueChange={(value) => updateGrade(index, 'subject', value)}
                        style={[styles.picker, { color: colors.text }]}
                      >
                        {demoSubjects.map(subject => (
                          <Picker.Item key={subject} label={subject} value={subject} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                  
                  <View style={styles.gradeField}>
                    <Text style={[styles.gradeLabel, { color: colors.text }]}>Note</Text>
                    <TextInput
                      style={[styles.gradeInput, { color: colors.text, borderColor: colors.border }]}
                      value={grade.grade.toString()}
                      onChangeText={(value) => updateGrade(index, 'grade', parseFloat(value) || 0)}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.gradeField}>
                    <Text style={[styles.gradeLabel, { color: colors.text }]}>Sur</Text>
                    <TextInput
                      style={[styles.gradeInput, { color: colors.text, borderColor: colors.border }]}
                      value={grade.maxGrade.toString()}
                      onChangeText={(value) => updateGrade(index, 'maxGrade', parseFloat(value) || 20)}
                      placeholder="20"
                      keyboardType="numeric"
                    />
                  </View>
                  
                <TouchableOpacity 
                    style={[styles.removeButton, { backgroundColor: '#EF4444' }]}
                    onPress={() => removeGrade(index)}
                >
                    <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
                
                <TextInput
                  style={[styles.commentInput, { color: colors.text, borderColor: colors.border }]}
                  value={grade.comment || ''}
                  onChangeText={(value) => updateGrade(index, 'comment', value)}
                  placeholder="Commentaire sur cette note..."
                  placeholderTextColor={colors.textSecondary}
                />
            </View>
          ))}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Ajustements nécessaires</Text>
            <TextInput
              style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
              value={reportContent.necessaryAdjustments || ''}
              onChangeText={(value) => updateFormContent('necessaryAdjustments', value)}
              placeholder="Mesures d'amélioration recommandées..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
            </View>
        </View>
      )}

      {/* Section 3: Conditions de Travail */}
      {renderFormSection(
        "3. Conditions de Travail",
        <Home color={colors.primary} size={20} />,
        <View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Matériel nécessaire disponible</Text>
            <View style={styles.checkboxRow}>
                  <TouchableOpacity
                    style={[
                  styles.checkbox,
                  { 
                    backgroundColor: reportContent.workConditions?.hasMaterials 
                      ? colors.primary 
                      : colors.background,
                    borderColor: colors.border
                  }
                    ]}
                onPress={() => updateFormContent('workConditions', {
                  ...reportContent.workConditions,
                  hasMaterials: !reportContent.workConditions?.hasMaterials
                })}
              >
                {reportContent.workConditions?.hasMaterials && (
                  <CheckCircle color={colors.background} size={16} />
                )}
                  </TouchableOpacity>
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                L'élève dispose du matériel nécessaire
              </Text>
            </View>

            {!reportContent.workConditions?.hasMaterials && (
                <TextInput
                style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
                value={reportContent.workConditions?.missingMaterials || ''}
                onChangeText={(value) => updateFormContent('workConditions', {
                  ...reportContent.workConditions,
                  missingMaterials: value
                })}
                placeholder="Détails du matériel manquant..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={2}
                />
            )}
              </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Environnement favorable</Text>
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  { 
                    backgroundColor: reportContent.workConditions?.favorableEnvironment 
                      ? colors.primary 
                      : colors.background,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => updateFormContent('workConditions', {
                  ...reportContent.workConditions,
                  favorableEnvironment: !reportContent.workConditions?.favorableEnvironment
                })}
              >
                {reportContent.workConditions?.favorableEnvironment && (
                  <CheckCircle color={colors.background} size={16} />
                )}
              </TouchableOpacity>
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                L'environnement de travail est favorable
              </Text>
            </View>

            {!reportContent.workConditions?.favorableEnvironment && (
                <TextInput
                style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
                value={reportContent.workConditions?.distractions || ''}
                onChangeText={(value) => updateFormContent('workConditions', {
                  ...reportContent.workConditions,
                  distractions: value
                })}
                placeholder="Détails des distractions ou problèmes..."
                placeholderTextColor={colors.textSecondary}
                  multiline
                numberOfLines={2}
                />
            )}
              </View>
            </View>
      )}

      {/* Section 4: Implication des Parents */}
      {renderFormSection(
        "4. Implication des Parents",
        <Users color={colors.primary} size={20} />,
        <View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Niveau d'implication *</Text>
            <View style={[
              styles.pickerContainer,
              { borderColor: formErrors.parentalInvolvement ? '#EF4444' : colors.border }
            ]}>
              <Picker
                selectedValue={reportContent.parentalInvolvement || ''}
                onValueChange={(value) => updateFormContent('parentalInvolvement', value)}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Sélectionnez..." value="" />
                {Object.entries(INVOLVEMENT_LABELS).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
            </View>
            {formErrors.parentalInvolvement && (
              <Text style={styles.errorText}>{formErrors.parentalInvolvement}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Besoin de soutien parental renforcé</Text>
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  { 
                    backgroundColor: reportContent.needParentalSupport 
                      ? colors.primary 
                      : colors.background,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => updateFormContent('needParentalSupport', !reportContent.needParentalSupport)}
              >
                {reportContent.needParentalSupport && (
                  <CheckCircle color={colors.background} size={16} />
                )}
              </TouchableOpacity>
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                Un soutien parental renforcé est nécessaire
              </Text>
            </View>
            
            {reportContent.needParentalSupport && (
                <TextInput
                style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
                value={reportContent.parentalSupportDetails || ''}
                onChangeText={(value) => updateFormContent('parentalSupportDetails', value)}
                placeholder="Détails du soutien parental nécessaire..."
                placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
            )}
              </View>
            </View>
      )}

      {/* Section 5: Assiduité et Engagements */}
      {renderFormSection(
        "5. Assiduité et Engagements",
        <Calendar color={colors.primary} size={20} />,
        <View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Séances manquées</Text>
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  { 
                    backgroundColor: reportContent.attendance?.hasMissed 
                      ? colors.primary 
                      : colors.background,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => updateFormContent('attendance', {
                  ...reportContent.attendance,
                  hasMissed: !reportContent.attendance?.hasMissed
                })}
              >
                {reportContent.attendance?.hasMissed && (
                  <CheckCircle color={colors.background} size={16} />
                )}
              </TouchableOpacity>
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                L'élève a manqué des séances
              </Text>
            </View>
            
            {reportContent.attendance?.hasMissed && (
              <View>
                <View style={styles.attendanceRow}>
                  <View style={styles.attendanceField}>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>Nombre</Text>
                <TextInput
                      style={[styles.gradeInput, { color: colors.text, borderColor: colors.border }]}
                      value={reportContent.attendance?.numberOfMissed?.toString() || ''}
                      onChangeText={(value) => updateFormContent('attendance', {
                        ...reportContent.attendance,
                        numberOfMissed: parseInt(value) || 0
                      })}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.checkboxField}>
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        { 
                          backgroundColor: reportContent.attendance?.wereCaughtUp 
                            ? colors.primary 
                            : colors.background,
                          borderColor: colors.border
                        }
                      ]}
                      onPress={() => updateFormContent('attendance', {
                        ...reportContent.attendance,
                        wereCaughtUp: !reportContent.attendance?.wereCaughtUp
                      })}
                    >
                      {reportContent.attendance?.wereCaughtUp && (
                        <CheckCircle color={colors.background} size={16} />
                      )}
                    </TouchableOpacity>
                    <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                      Rattrapées
                    </Text>
                  </View>
                </View>
                
                <TextInput
                  style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
                  value={reportContent.attendance?.reason || ''}
                  onChangeText={(value) => updateFormContent('attendance', {
                    ...reportContent.attendance,
                    reason: value
                  })}
                  placeholder="Raisons des absences..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={2}
                />
              </View>
            )}
            </View>
        </View>
      )}

      {/* Section 6: Appréciation Générale */}
      {renderFormSection(
        "6. Appréciation Générale",
        <Award color={colors.primary} size={20} />,
        <View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Appréciation générale *</Text>
            <View style={[
              styles.pickerContainer,
              { borderColor: formErrors.generalAppreciation ? '#EF4444' : colors.border }
            ]}>
              <Picker
                selectedValue={reportContent.generalAppreciation || ''}
                onValueChange={(value) => updateFormContent('generalAppreciation', value)}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Sélectionnez..." value="" />
                {Object.entries(APPRECIATION_LABELS).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
            </View>
            {formErrors.generalAppreciation && (
              <Text style={styles.errorText}>{formErrors.generalAppreciation}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Note sur 20 *</Text>
                <TextInput
              style={[
                styles.gradeInput,
                { 
                  color: colors.text, 
                  borderColor: formErrors.overallGrade ? '#EF4444' : colors.border,
                  width: '100%'
                }
              ]}
              value={reportContent.overallGrade?.toString() || ''}
              onChangeText={(value) => updateFormContent('overallGrade', parseFloat(value) || 0)}
              placeholder="Note entre 0 et 20"
              keyboardType="numeric"
            />
            {formErrors.overallGrade && (
              <Text style={styles.errorText}>{formErrors.overallGrade}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Description générale *</Text>
            <TextInput
              style={[
                styles.textArea,
                { 
                  color: colors.text, 
                  borderColor: formErrors.generalDescription ? '#EF4444' : colors.border 
                }
              ]}
              value={reportContent.generalDescription || ''}
              onChangeText={(value) => updateFormContent('generalDescription', value)}
              placeholder="Description générale du comportement et des performances de l'élève..."
              placeholderTextColor={colors.textSecondary}
                  multiline
              numberOfLines={4}
                />
            {formErrors.generalDescription && (
              <Text style={styles.errorText}>{formErrors.generalDescription}</Text>
            )}
              </View>
            </View>
      )}

      {/* Bouton IA et actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.aiButton, { backgroundColor: colors.primary }]}
          onPress={generateAISuggestions}
          disabled={generatingAI}
        >
          {generatingAI ? (
            <Loader color={colors.background} size={20} />
          ) : (
            <Brain color={colors.background} size={20} />
          )}
          <Text style={[styles.aiButtonText, { color: colors.background }]}>
            {generatingAI ? 'Génération...' : 'Générer suggestions IA'}
          </Text>
          <Sparkles color={colors.background} size={16} />
            </TouchableOpacity>

        {reportContent.aiSuggestions?.generated && (
          <View style={[styles.aiSummary, { backgroundColor: colors.card }]}>
            <Brain color={colors.primary} size={16} />
            <Text style={[styles.aiSummaryText, { color: colors.text }]}>
              Suggestions IA générées • {reportContent.aiSuggestions.recommendations.length} recommandations
            </Text>
            <TouchableOpacity onPress={() => setShowAIModal(true)}>
              <Text style={[styles.aiSummaryLink, { color: colors.primary }]}>
                Voir détails
              </Text>
              </TouchableOpacity>
          </View>
        )}

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
          Mes Rapports Soumis
        </Text>
        <Text style={[styles.historySubtitle, { color: colors.textSecondary }]}>
          {reports.length} rapport{reports.length > 1 ? 's' : ''} créé{reports.length > 1 ? 's' : ''}
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
                  <Text style={[styles.reportStudent, { color: colors.text }]}>
                    {report.studentName}
                  </Text>
                  <Text style={[styles.reportPeriod, { color: colors.textSecondary }]}>
                    {formatReportPeriod(report.month, report.year)}
                  </Text>
                  <View style={styles.reportMeta}>
                    <View style={styles.gradeContainer}>
                      <Star color="#F59E0B" size={16} />
                      <Text style={[styles.reportGrade, { color: colors.text }]}>
                        {report.overallGrade}/20
                      </Text>
                    </View>
                    <View style={[
                      styles.appreciationBadge,
                      { backgroundColor: getAppreciationColor(report.generalAppreciation) + '20' }
                    ]}>
                      <Text style={[
                        styles.appreciationText,
                        { color: getAppreciationColor(report.generalAppreciation) }
                      ]}>
                        {APPRECIATION_LABELS[report.generalAppreciation]}
                      </Text>
                    </View>
                    {report.hasAISuggestions && (
                      <View style={styles.aiIndicator}>
                        <Brain color={colors.primary} size={14} />
                      </View>
                    )}
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
                    Détails du rapport
                  </Text>
                  <View style={styles.detailsContent}>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                        Parent:
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {report.parentName}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                        Créé le:
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                        Statut:
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {REPORT_STATUS_LABELS[report.status]}
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
          <FileText color={colors.textSecondary} size={48} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Aucun rapport créé
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Créez votre premier rapport mensuel pour vos élèves
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
            Chargement des rapports...
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
          <Text style={styles.pageTitle}>Rapports Mensuels</Text>
          <Text style={styles.pageSubtitle}>
            {stats.totalReports} rapport{stats.totalReports > 1 ? 's' : ''} • Note moyenne: {stats.averageGrade?.toFixed(1) || 'N/A'}
          </Text>
        </View>
      </LinearGradient>

      {/* Statistiques */}
      <View style={styles.statsSection}>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
            <CheckCircle color="#10B981" size={24} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{stats.completedReports}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Terminés</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
            <Clock color="#F59E0B" size={24} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{stats.pendingReports}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>En attente</Text>
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
            Nouveau Rapport
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
            Mes Rapports Soumis
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu des onglets */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {activeTab === 'new' ? renderNewReportTab() : renderHistoryTab()}
      </Animated.View>

      {/* Modal des suggestions IA */}
      <Modal visible={showAIModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.aiModalTitle}>
                <Brain color={colors.primary} size={24} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Suggestions IA
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAIModal(false)}>
                <Text style={[styles.closeButton, { color: colors.primary }]}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {aiSuggestions && (
                <View>
                  <View style={styles.suggestionSection}>
                    <Text style={[styles.suggestionTitle, { color: colors.text }]}>
                      📚 Recommandations Pédagogiques
                    </Text>
                    {aiSuggestions.recommendations.map((rec, index) => (
                      <Text key={index} style={[styles.suggestionItem, { color: colors.text }]}>
                        • {rec}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.suggestionSection}>
                    <Text style={[styles.suggestionTitle, { color: colors.text }]}>
                      🎯 Ajustements Pédagogiques
                    </Text>
                    {aiSuggestions.pedagogicalAdjustments.map((adj, index) => (
                      <Text key={index} style={[styles.suggestionItem, { color: colors.text }]}>
                        • {adj}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.suggestionSection}>
                    <Text style={[styles.suggestionTitle, { color: colors.text }]}>
                      👨‍👩‍👧‍👦 Soutien Parental
                    </Text>
                    {aiSuggestions.parentalSupport.map((support, index) => (
                      <Text key={index} style={[styles.suggestionItem, { color: colors.text }]}>
                        • {support}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.suggestionSection}>
                    <Text style={[styles.suggestionTitle, { color: colors.text }]}>
                      🏠 Environnement de Travail
                    </Text>
                    {aiSuggestions.workEnvironment.map((env, index) => (
                      <Text key={index} style={[styles.suggestionItem, { color: colors.text }]}>
                        • {env}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowAIModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>
                  Fermer
                </Text>
              </TouchableOpacity>
            </View>
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
  gradesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  gradeItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  gradeField: {
    flex: 1,
  },
  gradeLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  gradeInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    fontSize: 12,
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  attendanceField: {
    flex: 1,
  },
  checkboxField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionsSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  aiButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  aiSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  aiSummaryText: {
    flex: 1,
    fontSize: 14,
  },
  aiSummaryLink: {
    fontSize: 14,
    fontWeight: '600',
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
  reportStudent: {
    fontSize: 18,
    fontWeight: 'bold',
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
  appreciationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appreciationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  aiIndicator: {
    padding: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  aiModalTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  suggestionSection: {
    marginBottom: 20,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  suggestionItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});