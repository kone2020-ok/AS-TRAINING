// Types pour le système de suivi des notes et bulletins

export type GradeType = 'devoir' | 'interrogation' | 'examen' | 'controle_continu' | 'projet';
export type GradeScale = 10 | 20 | 40 | 80 | 100;
export type PerformanceLevel = 'excellent' | 'tres_bien' | 'bien' | 'passable' | 'insuffisant';
export type TrimesterNumber = 1 | 2 | 3;
export type BulletinStatus = 'nouveau' | 'consulte' | 'archive' | 'valide';

// Interface pour une note individuelle
export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  parentId: string;
  parentName: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  type: GradeType;
  grade: number;
  maxGrade: GradeScale;
  percentage: number; // Calculé automatiquement
  performanceLevel: PerformanceLevel; // Calculé automatiquement
  date: string;
  month: number;
  year: number;
  comment?: string;
  isRetake: boolean; // Si c'est un rattrapage
  originalGradeId?: string; // Référence vers la note originale
  createdAt: string;
  updatedAt?: string;
}

// Interface pour les données de formulaire de note
export interface GradeFormData {
  parentId: string;
  studentId: string;
  subject: string;
  type: GradeType;
  grade: string;
  maxGrade: GradeScale;
  date: string;
  comment?: string;
  isRetake?: boolean;
  originalGradeId?: string;
}

// Interface pour un bulletin scolaire
export interface Bulletin {
  id: string;
  studentId: string;
  studentName: string;
  parentId: string;
  parentName: string;
  teacherId?: string;
  teacherName?: string;
  class: string;
  school: string;
  period: string;
  trimester: TrimesterNumber;
  year: number;
  averageGrade: number;
  rank: number;
  totalStudents: number;
  subjects: BulletinSubject[];
  generalComment: string;
  conductGrade?: number; // Note de conduite
  absences?: number;
  lateArrivals?: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadedAt: string;
  uploadedBy: 'parent' | 'direction';
  status: BulletinStatus;
  validatedBy?: string;
  validatedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// Interface pour les matières dans un bulletin
export interface BulletinSubject {
  name: string;
  grade: number;
  coefficient: number;
  teacherName?: string;
  teacherComment: string;
  classAverage?: number;
  minGrade?: number;
  maxGrade?: number;
}

// Interface pour les données d'upload de bulletin
export interface BulletinUploadData {
  studentId: string;
  trimester: TrimesterNumber;
  year: number;
  file: File | any; // File pour web, asset pour mobile
  fileName: string;
  fileSize: number;
}

// Interface pour les statistiques de notes
export interface GradesStats {
  totalGrades: number;
  averageGrade: number;
  bestGrade: number;
  worstGrade: number;
  passRate: number; // Pourcentage > 10/20
  excellenceRate: number; // Pourcentage > 16/20
  subjectPerformance: Array<{
    subject: string;
    average: number;
    gradeCount: number;
    trend: 'improving' | 'stable' | 'declining';
  }>;
  monthlyEvolution: Array<{
    month: string;
    average: number;
    gradeCount: number;
  }>;
  performanceDistribution: {
    excellent: number;
    tres_bien: number;
    bien: number;
    passable: number;
    insuffisant: number;
  };
}

// Interface pour les statistiques de bulletins
export interface BulletinsStats {
  totalBulletins: number;
  byTrimester: Record<TrimesterNumber, number>;
  byYear: Record<number, number>;
  averageRank: number;
  averageClassSize: number;
  uploadCompletionRate: number; // Pourcentage de bulletins uploadés
}

// Interface pour les alertes de performance
export interface PerformanceAlert {
  id: string;
  studentId: string;
  studentName: string;
  parentId: string;
  teacherId: string;
  subject: string;
  alertType: 'grade_drop' | 'consecutive_fails' | 'improvement_needed' | 'excellence_achieved';
  severity: 'low' | 'medium' | 'high';
  currentGrade: number;
  previousGrades: number[];
  trend: number; // Pourcentage de variation
  message: string;
  recommendations: string[];
  createdAt: string;
  isRead: boolean;
  isResolved: boolean;
}

// Interface pour les filtres de notes
export interface GradesFilters {
  parentId?: string;
  studentId?: string;
  teacherId?: string;
  subject?: string;
  type?: GradeType;
  month?: number;
  year?: number;
  dateFrom?: string;
  dateTo?: string;
  performanceLevel?: PerformanceLevel;
  minGrade?: number;
  maxGrade?: number;
}

// Interface pour les filtres de bulletins
export interface BulletinsFilters {
  parentId?: string;
  studentId?: string;
  teacherId?: string;
  trimester?: TrimesterNumber;
  year?: number;
  status?: BulletinStatus;
  class?: string;
  school?: string;
}

// Interface pour l'analytics de performance
export interface PerformanceAnalytics {
  studentId: string;
  studentName: string;
  overallAverage: number;
  gradesTrend: 'improving' | 'stable' | 'declining';
  strongestSubjects: string[];
  weakestSubjects: string[];
  recentPerformance: {
    lastMonth: number;
    lastTrimester: number;
    improvementNeeded: boolean;
  };
  parentalEngagement: {
    bulletinsUploaded: number;
    expectedBulletins: number;
    engagementRate: number;
  };
  teacherFeedback: {
    positiveComments: number;
    concernComments: number;
    totalComments: number;
  };
}

// Constantes et utilitaires
export const GRADE_SUBJECTS = [
  'Mathématiques',
  'Français',
  'Physique-Chimie',
  'Sciences de la Vie et de la Terre (SVT)',
  'Histoire-Géographie',
  'Anglais',
  'Allemand',
  'Espagnol',
  'Philosophie',
  'Éducation Physique et Sportive (EPS)',
  'Arts Plastiques',
  'Musique',
  'Technologie',
  'Informatique'
] as const;

export const GRADE_TYPE_LABELS: Record<GradeType, string> = {
  devoir: 'Devoir',
  interrogation: 'Interrogation',
  examen: 'Examen',
  controle_continu: 'Contrôle continu',
  projet: 'Projet'
};

export const PERFORMANCE_LEVEL_LABELS: Record<PerformanceLevel, string> = {
  excellent: 'Excellent',
  tres_bien: 'Très bien',
  bien: 'Bien',
  passable: 'Passable',
  insuffisant: 'Insuffisant'
};

export const PERFORMANCE_LEVEL_COLORS: Record<PerformanceLevel, string> = {
  excellent: '#10B981', // Vert foncé
  tres_bien: '#22C55E', // Vert
  bien: '#84CC16', // Vert clair
  passable: '#F59E0B', // Orange
  insuffisant: '#EF4444' // Rouge
};

export const BULLETIN_STATUS_LABELS: Record<BulletinStatus, string> = {
  nouveau: 'Nouveau',
  consulte: 'Consulté',
  archive: 'Archivé',
  valide: 'Validé'
};

export const BULLETIN_STATUS_COLORS: Record<BulletinStatus, string> = {
  nouveau: '#3B82F6', // Bleu
  consulte: '#10B981', // Vert
  archive: '#6B7280', // Gris
  valide: '#22C55E' // Vert foncé
};

// Fonctions utilitaires
export const calculatePercentage = (grade: number, maxGrade: GradeScale): number => {
  return Math.round((grade / maxGrade) * 100);
};

export const getPerformanceLevel = (grade: number, maxGrade: GradeScale): PerformanceLevel => {
  const percentage = calculatePercentage(grade, maxGrade);
  
  if (percentage >= 90) return 'excellent';
  if (percentage >= 80) return 'tres_bien';
  if (percentage >= 65) return 'bien';
  if (percentage >= 50) return 'passable';
  return 'insuffisant';
};

export const getGradeColor = (grade: number, maxGrade: GradeScale): string => {
  const level = getPerformanceLevel(grade, maxGrade);
  return PERFORMANCE_LEVEL_COLORS[level];
};

export const calculateTrend = (recentGrades: number[]): 'improving' | 'stable' | 'declining' => {
  if (recentGrades.length < 2) return 'stable';
  
  const firstHalf = recentGrades.slice(0, Math.floor(recentGrades.length / 2));
  const secondHalf = recentGrades.slice(Math.floor(recentGrades.length / 2));
  
  const firstAverage = firstHalf.reduce((sum, grade) => sum + grade, 0) / firstHalf.length;
  const secondAverage = secondHalf.reduce((sum, grade) => sum + grade, 0) / secondHalf.length;
  
  const difference = secondAverage - firstAverage;
  
  if (difference > 1) return 'improving';
  if (difference < -1) return 'declining';
  return 'stable';
};

export const shouldTriggerPerformanceAlert = (
  newGrade: number,
  maxGrade: GradeScale,
  recentGrades: number[]
): boolean => {
  const percentage = calculatePercentage(newGrade, maxGrade);
  
  // Alerte si note < 50%
  if (percentage < 50) return true;
  
  // Alerte si baisse significative
  if (recentGrades.length >= 2) {
    const lastGrade = recentGrades[recentGrades.length - 1];
    const lastPercentage = calculatePercentage(lastGrade, maxGrade);
    if (percentage < lastPercentage - 20) return true;
  }
  
  return false;
};

export const generateGradeId = (): string => {
  return `grade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateBulletinId = (): string => {
  return `bulletin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatGradeDisplay = (grade: number, maxGrade: GradeScale): string => {
  return `${grade}/${maxGrade}`;
};

export const validateGradeInput = (grade: number, maxGrade: GradeScale): boolean => {
  return grade >= 0 && grade <= maxGrade && !isNaN(grade);
};

export const validateBulletinFile = (file: any): { isValid: boolean; error?: string } => {
  const maxSize = 3 * 1024 * 1024; // 3MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  
  if (!file) {
    return { isValid: false, error: 'Aucun fichier sélectionné' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'Fichier trop volumineux (max 3MB)' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Format non supporté (JPEG, PNG, WebP, PDF uniquement)' };
  }
  
  return { isValid: true };
}; 