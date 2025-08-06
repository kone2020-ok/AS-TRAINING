// Types pour le système de rapports bidirectionnel

export type ReportStatus = 'draft' | 'submitted' | 'completed' | 'archived';
export type ReportType = 'teacher_to_student' | 'parent_to_teacher';

// Types pour les évaluations par échelle
export type AttitudeLevel = 'tres_motive' | 'motive' | 'peu_motive' | 'pas_motive';
export type AttentionLevel = 'toujours' | 'souvent' | 'parfois' | 'jamais';
export type ComprehensionLevel = 'oui' | 'non' | 'je_crois_que_oui' | 'je_ne_sais_pas';
export type ProgressLevel = 'forte_amelioration' | 'amelioration' | 'stable' | 'regression' | 'forte_baisse';
export type ApplicationLevel = 'oui_toujours' | 'souvent' | 'parfois' | 'non_jamais';
export type InvolvementLevel = 'tres_impliques' | 'impliques' | 'peu_impliques' | 'pas_impliques';
export type AppreciationLevel = 'excellent' | 'tres_bien' | 'bien' | 'passable' | 'insuffisant';
export type SatisfactionLevel = 'tres_satisfait' | 'satisfait' | 'peu_satisfait' | 'pas_satisfait';
export type FrequencyLevel = 'toujours' | 'souvent' | 'parfois' | 'jamais';

// Interface pour les notes par matière
export interface SubjectGrade {
  subject: string;
  grade: number;
  maxGrade: number;
  comment?: string;
}

// Interface pour les conditions manquantes
export interface MissingConditions {
  hasMaterials: boolean;
  missingMaterials?: string;
  favorableEnvironment: boolean;
  distractions?: string;
}

// Interface pour les séances manquées
export interface MissedSessions {
  hasMissed: boolean;
  numberOfMissed?: number;
  wereCaughtUp?: boolean;
  reason?: string;
}

// Suggestions IA améliorées avec contexte
export interface AISuggestions {
  generated: boolean;
  recommendations: string[];
  pedagogicalAdjustments: string[];
  parentalSupport: string[];
  workEnvironment: string[];
  generatedAt?: string;
  
  // Nouveau: Contexte d'analyse pour personnalisation
  analysisContext?: {
    studentProfile: string;
    averageGrade: number;
    mainStrengths: string;
    mainDifficulties: string;
    attendanceRate: string;
    parentalInvolvement: InvolvementLevel;
    subjectSpecificIssues?: Array<{
      subject: string;
      issue: string;
      suggestedAction: string;
    }>;
    improvementPriorities?: Array<{
      area: 'academic' | 'behavioral' | 'environmental' | 'parental';
      priority: 'high' | 'medium' | 'low';
      description: string;
      timeline: string;
    }>;
  };

  // Nouveau: Suggestions personnalisées basées sur l'historique
  personalizedSuggestions?: {
    basedOnHistory: boolean;
    previousReports: number;
    trendAnalysis: {
      gradeEvolution: 'improving' | 'stable' | 'declining';
      attentionEvolution: 'improving' | 'stable' | 'declining';
      parentInvolvementEvolution: 'increasing' | 'stable' | 'decreasing';
    };
    adaptiveSuggestions: string[];
  };

  // Nouveau: Suggestions collaboratives (enseignant-parent)
  collaborativeSuggestions?: {
    teacherActions: string[];
    parentActions: string[];
    jointActions: string[];
    communicationPlan: {
      frequency: 'daily' | 'weekly' | 'biweekly';
      method: 'app' | 'call' | 'meeting';
      topics: string[];
    };
  };
}

// Rapport Enseignant vers Élève
export interface TeacherStudentReportContent {
  // Section 1: Engagement et Compréhension
  attitude: AttitudeLevel;
  attention: AttentionLevel;
  difficulties: string; // Min 10 caractères
  strengths: string;
  comprehension: ComprehensionLevel;
  complaintsFrequency: FrequencyLevel;
  
  // Section 2: Progression et Résultats
  progressEvolution: ProgressLevel;
  classApplication: ApplicationLevel;
  lastGrades: SubjectGrade[];
  necessaryAdjustments: string;
  
  // Section 3: Conditions de Travail
  workConditions: MissingConditions;
  
  // Section 4: Implication des Parents
  parentalInvolvement: InvolvementLevel;
  needParentalSupport: boolean;
  parentalSupportDetails?: string;
  
  // Section 5: Assiduité et Engagements
  attendance: MissedSessions;
  
  // Section 6: Appréciation Générale
  generalAppreciation: AppreciationLevel;
  overallGrade: number; // Note sur 20
  generalDescription: string;
  
  // IA Suggestions
  aiSuggestions?: AISuggestions;
}

export interface TeacherStudentReport {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  parentId: string;
  parentName: string;
  month: number; // 0-11 (Janvier = 0)
  year: number;
  content: TeacherStudentReportContent;
  status: ReportStatus;
  createdAt: string;
  submittedAt?: string;
  completedAt?: string;
}

// Rapport Parent vers Enseignant
export interface ParentTeacherReportContent {
  // Questions d'évaluation
  q1_prestation_generale: SatisfactionLevel;
  q1_prestation_details: string;
  
  q2_ponctualite: FrequencyLevel;
  q2_ponctualite_details?: string;
  
  q3_methodes_pedagogiques: SatisfactionLevel;
  q3_methodes_details: string;
  
  q4_communication: SatisfactionLevel;
  q4_communication_details: string;
  
  q5_progres_constates: ProgressLevel;
  q5_progres_details: string;
  
  q6_recommandations: string;
  q6_suggestions_amelioration: string;
  
  q7_satisfaction_globale: number; // Note sur 10
  q7_commentaire_global: string;
  
  // Questions optionnelles
  materiel_fourni_adequat?: boolean;
  environnement_cours_adequat?: boolean;
  frequence_communication_suffisante?: boolean;
  recommanderiez_enseignant?: boolean;
  commentaires_additionnels?: string;
}

export interface ParentTeacherReport {
  id: string;
  parentId: string;
  parentName: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  month: number; // 0-11
  year: number;
  content: ParentTeacherReportContent;
  status: ReportStatus;
  createdAt: string;
  submittedAt?: string;
}

// Interfaces pour les vues agrégées
export interface ReportStats {
  totalReports: number;
  submittedThisMonth: number;
  pendingReports: number;
  completedReports: number;
  averageGrade?: number;
  averageSatisfaction?: number;
}

export interface TeacherReportView {
  id: string;
  studentName: string;
  parentName: string;
  month: number;
  year: number;
  overallGrade: number;
  generalAppreciation: AppreciationLevel;
  status: ReportStatus;
  createdAt: string;
  hasAISuggestions: boolean;
}

export interface ParentReportView {
  id: string;
  teacherName: string;
  studentName: string;
  month: number;
  year: number;
  satisfactionGlobale: number;
  prestationGenerale: SatisfactionLevel;
  status: ReportStatus;
  createdAt: string;
}

export interface DirectionReportSummary {
  // Vue enseignant
  teacherReports: {
    id: string;
    teacherName: string;
    studentName: string;
    parentName: string;
    month: number;
    year: number;
    overallGrade: number;
    status: ReportStatus;
    createdAt: string;
  }[];
  
  // Vue parent
  parentReports: {
    id: string;
    parentName: string;
    teacherName: string;
    studentName: string;
    month: number;
    year: number;
    satisfactionGlobale: number;
    status: ReportStatus;
    createdAt: string;
  }[];
}

// Filtres pour les rapports
export interface ReportFilters {
  month?: number;
  year?: number;
  teacherId?: string;
  parentId?: string;
  studentId?: string;
  status?: ReportStatus[];
  dateFrom?: string;
  dateTo?: string;
}

// Formulaires de création
export interface CreateTeacherReportData {
  studentId: string;
  month: number;
  year: number;
  content: Partial<TeacherStudentReportContent>;
}

export interface CreateParentReportData {
  teacherId: string;
  studentId: string;
  month: number;
  year: number;
  content: Partial<ParentTeacherReportContent>;
}

// Constantes et labels
export const ATTITUDE_LABELS: Record<AttitudeLevel, string> = {
  tres_motive: 'Très motivé(e)',
  motive: 'Motivé(e)',
  peu_motive: 'Peu motivé(e)',
  pas_motive: 'Pas du tout motivé(e)'
};

export const ATTENTION_LABELS: Record<AttentionLevel, string> = {
  toujours: 'Toujours',
  souvent: 'Souvent',
  parfois: 'Parfois',
  jamais: 'Jamais'
};

export const COMPREHENSION_LABELS: Record<ComprehensionLevel, string> = {
  oui: 'Oui',
  non: 'Non',
  je_crois_que_oui: 'Je crois que oui',
  je_ne_sais_pas: 'Je ne sais pas'
};

export const PROGRESS_LABELS: Record<ProgressLevel, string> = {
  forte_amelioration: 'Forte amélioration',
  amelioration: 'Amélioration',
  stable: 'Stable',
  regression: 'Régression',
  forte_baisse: 'Forte baisse'
};

export const APPLICATION_LABELS: Record<ApplicationLevel, string> = {
  oui_toujours: 'Oui, toujours',
  souvent: 'Souvent',
  parfois: 'Parfois',
  non_jamais: 'Non, jamais'
};

export const INVOLVEMENT_LABELS: Record<InvolvementLevel, string> = {
  tres_impliques: 'Très impliqués',
  impliques: 'Impliqués',
  peu_impliques: 'Peu impliqués',
  pas_impliques: 'Pas du tout impliqués'
};

export const APPRECIATION_LABELS: Record<AppreciationLevel, string> = {
  excellent: 'Excellent',
  tres_bien: 'Très bien',
  bien: 'Bien',
  passable: 'Passable',
  insuffisant: 'Insuffisant'
};

export const SATISFACTION_LABELS: Record<SatisfactionLevel, string> = {
  tres_satisfait: 'Très satisfait(e)',
  satisfait: 'Satisfait(e)',
  peu_satisfait: 'Peu satisfait(e)',
  pas_satisfait: 'Pas du tout satisfait(e)'
};

export const FREQUENCY_LABELS: Record<FrequencyLevel, string> = {
  toujours: 'Toujours',
  souvent: 'Souvent',
  parfois: 'Parfois',
  jamais: 'Jamais'
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  draft: 'Brouillon',
  submitted: 'Soumis',
  completed: 'Terminé',
  archived: 'Archivé'
};

export const REPORT_STATUS_COLORS: Record<ReportStatus, string> = {
  draft: '#6B7280',
  submitted: '#F59E0B',
  completed: '#10B981',
  archived: '#8B5CF6'
};

export const MONTHS_LABELS: string[] = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// Fonctions utilitaires
export const generateReportId = (type: ReportType): string => {
  const prefix = type === 'teacher_to_student' ? 'RPT-T' : 'RPT-P';
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}${month}-${random}`;
};

export const getProgressColor = (level: ProgressLevel): string => {
  switch (level) {
    case 'forte_amelioration': return '#10B981';
    case 'amelioration': return '#059669';
    case 'stable': return '#F59E0B';
    case 'regression': return '#EF4444';
    case 'forte_baisse': return '#DC2626';
    default: return '#6B7280';
  }
};

export const getSatisfactionColor = (level: SatisfactionLevel): string => {
  switch (level) {
    case 'tres_satisfait': return '#10B981';
    case 'satisfait': return '#059669';
    case 'peu_satisfait': return '#F59E0B';
    case 'pas_satisfait': return '#EF4444';
    default: return '#6B7280';
  }
};

export const getAppreciationColor = (level: AppreciationLevel): string => {
  switch (level) {
    case 'excellent': return '#10B981';
    case 'tres_bien': return '#059669';
    case 'bien': return '#3B82F6';
    case 'passable': return '#F59E0B';
    case 'insuffisant': return '#EF4444';
    default: return '#6B7280';
  }
};

export const calculateAverageGrade = (grades: SubjectGrade[]): number => {
  if (grades.length === 0) return 0;
  const total = grades.reduce((sum, grade) => {
    const normalizedGrade = (grade.grade / grade.maxGrade) * 20;
    return sum + normalizedGrade;
  }, 0);
  return Math.round((total / grades.length) * 100) / 100;
};

export const formatReportPeriod = (month: number, year: number): string => {
  return `${MONTHS_LABELS[month]} ${year}`;
};

export const validateTeacherReportContent = (content: Partial<TeacherStudentReportContent>): string[] => {
  const errors: string[] = [];
  
  if (!content.attitude) errors.push('Attitude générale requise');
  if (!content.attention) errors.push('Niveau d\'attention requis');
  if (!content.difficulties || content.difficulties.length < 10) {
    errors.push('Principales difficultés requises (min. 10 caractères)');
  }
  if (!content.strengths || content.strengths.trim().length === 0) {
    errors.push('Points forts requis');
  }
  if (!content.comprehension) errors.push('Compréhension des méthodes requise');
  if (!content.progressEvolution) errors.push('Évolution des résultats requise');
  if (!content.classApplication) errors.push('Application en classe requise');
  if (!content.parentalInvolvement) errors.push('Implication des parents requise');
  if (!content.generalAppreciation) errors.push('Appréciation générale requise');
  if (content.overallGrade === undefined || content.overallGrade < 0 || content.overallGrade > 20) {
    errors.push('Note sur 20 requise (0-20)');
  }
  if (!content.generalDescription || content.generalDescription.trim().length === 0) {
    errors.push('Description générale requise');
  }
  
  return errors;
};

export const validateParentReportContent = (content: Partial<ParentTeacherReportContent>): string[] => {
  const errors: string[] = [];
  
  if (!content.q1_prestation_generale) errors.push('Évaluation de la prestation générale requise');
  if (!content.q1_prestation_details || content.q1_prestation_details.trim().length === 0) {
    errors.push('Détails sur la prestation générale requis');
  }
  if (!content.q2_ponctualite) errors.push('Évaluation de la ponctualité requise');
  if (!content.q3_methodes_pedagogiques) errors.push('Évaluation des méthodes pédagogiques requise');
  if (!content.q4_communication) errors.push('Évaluation de la communication requise');
  if (!content.q5_progres_constates) errors.push('Évaluation des progrès constatés requise');
  if (content.q7_satisfaction_globale === undefined || content.q7_satisfaction_globale < 0 || content.q7_satisfaction_globale > 10) {
    errors.push('Note de satisfaction globale requise (0-10)');
  }
  
  return errors;
}; 