// Types pour le système complet de gestion des bulletins scolaires

export type BulletinType = 'pdf_uploaded' | 'auto_generated';
export type BulletinStatus = 'nouveau' | 'consulte' | 'archive' | 'valide' | 'en_attente' | 'rejete';
export type TrimesterNumber = 1 | 2 | 3;
export type ValidationLevel = 'pending' | 'validated' | 'rejected';
export type GenerationMethod = 'manual' | 'automatic' | 'scheduled';

// Interface pour un bulletin scolaire complet
export interface Bulletin {
  id: string;
  type: BulletinType;
  
  // Informations étudiant/famille
  studentId: string;
  studentName: string;
  parentId: string;
  parentName: string;
  class: string;
  school: string;
  
  // Période et académique
  period: string;
  trimester: TrimesterNumber;
  year: number;
  academicYear: string; // Ex: "2024-2025"
  
  // Données académiques
  averageGrade: number;
  rank: number;
  totalStudents: number;
  subjects: BulletinSubject[];
  generalComment: string;
  conductGrade?: number;
  absences?: number;
  lateArrivals?: number;
  disciplinaryNotes?: string[];
  
  // Fichier et stockage (pour bulletins PDF)
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  originalFileName?: string;
  
  // Métadonnées
  uploadedAt?: string; // Pour bulletins PDF
  generatedAt?: string; // Pour bulletins générés
  uploadedBy?: 'parent' | 'direction';
  generatedBy?: string; // ID enseignant qui a généré
  generationMethod?: GenerationMethod;
  
  // Statut et validation
  status: BulletinStatus;
  validationLevel: ValidationLevel;
  validatedBy?: string;
  validatedAt?: string;
  rejectionReason?: string;
  
  // Enseignants associés
  teacherIds: string[];
  teacherNames: string[];
  mainTeacherId?: string; // Enseignant principal
  
  // Horodatage
  createdAt: string;
  updatedAt?: string;
  
  // Signature numérique et sécurité
  checksum?: string; // Pour vérifier l'intégrité
  digitalSignature?: string;
  isImmutable: boolean; // Empêche les modifications
  
  // Notifications
  notificationsSent: boolean;
  notifiedUsers: string[];
  
  // Analytics
  viewCount: number;
  lastViewedAt?: string;
  downloadCount: number;
  lastDownloadedAt?: string;
}

// Interface pour les matières dans un bulletin
export interface BulletinSubject {
  name: string;
  grade: number;
  coefficient: number;
  teacherId?: string;
  teacherName?: string;
  teacherComment: string;
  classAverage?: number;
  minGrade?: number;
  maxGrade?: number;
  gradeCount?: number; // Nombre de notes utilisées pour la moyenne
  subjectCode?: string; // Code matière standardisé
  competenceAreas?: CompetenceArea[];
}

// Interface pour les domaines de compétence
export interface CompetenceArea {
  name: string;
  level: 'non_acquis' | 'en_cours' | 'acquis' | 'maitre';
  comment?: string;
}

// Interface pour l'upload de bulletin PDF
export interface BulletinUploadData {
  studentId: string;
  trimester: TrimesterNumber;
  year: number;
  academicYear: string;
  file: File | any; // File pour web, asset pour mobile
  fileName: string;
  fileSize: number;
  fileType: string;
  originalFileName: string;
  uploadNotes?: string; // Notes du parent lors de l'upload
}

// Interface pour la génération automatique de bulletin
export interface BulletinGenerationData {
  studentId: string;
  trimester: TrimesterNumber;
  year: number;
  academicYear: string;
  teacherId: string;
  generationMethod: GenerationMethod;
  includeGrades: boolean;
  includeReports: boolean;
  includeAttendance: boolean;
  customTemplate?: string;
  additionalNotes?: string;
}

// Interface pour les statistiques de bulletins
export interface BulletinStats {
  total: number;
  byType: Record<BulletinType, number>;
  byStatus: Record<BulletinStatus, number>;
  byTrimester: Record<TrimesterNumber, number>;
  byYear: Record<number, number>;
  uploadCompletionRate: number; // Pourcentage de bulletins uploadés vs attendus
  validationRate: number; // Pourcentage de bulletins validés
  averageUploadDelay: number; // Délai moyen entre fin trimestre et upload
  topPerformingClasses: Array<{
    class: string;
    averageGrade: number;
    studentCount: number;
  }>;
}

// Interface pour les filtres avancés
export interface BulletinFilters {
  // Filtres principaux
  parentId?: string;
  studentId?: string;
  teacherId?: string;
  class?: string;
  school?: string;
  
  // Filtres temporels
  trimester?: TrimesterNumber;
  year?: number;
  academicYear?: string;
  dateFrom?: string;
  dateTo?: string;
  
  // Filtres de type et statut
  type?: BulletinType;
  status?: BulletinStatus;
  validationLevel?: ValidationLevel;
  uploadedBy?: 'parent' | 'direction';
  
  // Filtres de performance
  minAverageGrade?: number;
  maxAverageGrade?: number;
  minRank?: number;
  maxRank?: number;
  
  // Filtres de contenu
  hasComments?: boolean;
  hasAbsences?: boolean;
  hasDisciplinaryNotes?: boolean;
  
  // Tri
  sortBy?: 'date' | 'grade' | 'rank' | 'name' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// Interface pour la validation de bulletin
export interface BulletinValidation {
  bulletinId: string;
  validatorId: string;
  validatorRole: 'direction' | 'enseignant';
  action: 'validate' | 'reject';
  reason?: string;
  notes?: string;
  validatedAt: string;
  corrections?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }>;
}

// Interface pour les notifications de bulletin
export interface BulletinNotification {
  bulletinId: string;
  type: 'uploaded' | 'generated' | 'validated' | 'rejected' | 'reminder';
  recipientId: string;
  recipientRole: 'parent' | 'enseignant' | 'direction';
  title: string;
  message: string;
  metadata: Record<string, any>;
  sentAt: string;
  isRead: boolean;
}

// Interface pour l'intégration avec les notes
export interface BulletinGradeIntegration {
  bulletinId: string;
  gradeIds: string[];
  calculatedAverage: number;
  gradeCount: number;
  calculationMethod: 'weighted' | 'simple' | 'best_grades';
  lastUpdated: string;
  isAutoUpdated: boolean;
}

// Interface pour les modèles de bulletin
export interface BulletinTemplate {
  id: string;
  name: string;
  description: string;
  type: 'official' | 'synthesis' | 'custom';
  htmlTemplate: string;
  cssStyles: string;
  variables: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'boolean';
    required: boolean;
    defaultValue?: any;
  }>;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Interface pour l'historique des modifications
export interface BulletinHistory {
  bulletinId: string;
  action: 'created' | 'updated' | 'uploaded' | 'validated' | 'downloaded' | 'viewed';
  userId: string;
  userRole: 'parent' | 'enseignant' | 'direction';
  details: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// Constantes et énumérations
export const BULLETIN_TYPE_LABELS: Record<BulletinType, string> = {
  pdf_uploaded: 'Bulletin PDF (École)',
  auto_generated: 'Bulletin Généré (AS-Training)'
};

export const BULLETIN_STATUS_LABELS: Record<BulletinStatus, string> = {
  nouveau: 'Nouveau',
  consulte: 'Consulté',
  archive: 'Archivé',
  valide: 'Validé',
  en_attente: 'En attente',
  rejete: 'Rejeté'
};

export const BULLETIN_STATUS_COLORS: Record<BulletinStatus, string> = {
  nouveau: '#3B82F6',
  consulte: '#10B981',
  archive: '#6B7280',
  valide: '#22C55E',
  en_attente: '#F59E0B',
  rejete: '#EF4444'
};

export const VALIDATION_LEVEL_LABELS: Record<ValidationLevel, string> = {
  pending: 'En attente',
  validated: 'Validé',
  rejected: 'Rejeté'
};

export const VALIDATION_LEVEL_COLORS: Record<ValidationLevel, string> = {
  pending: '#F59E0B',
  validated: '#22C55E',
  rejected: '#EF4444'
};

export const TRIMESTER_LABELS: Record<TrimesterNumber, string> = {
  1: '1er Trimestre',
  2: '2ème Trimestre',
  3: '3ème Trimestre'
};

export const COMPETENCE_LEVEL_LABELS = {
  non_acquis: 'Non acquis',
  en_cours: 'En cours d\'acquisition',
  acquis: 'Acquis',
  maitre: 'Maîtrisé'
} as const;

export const COMPETENCE_LEVEL_COLORS = {
  non_acquis: '#EF4444',
  en_cours: '#F59E0B',
  acquis: '#22C55E',
  maitre: '#10B981'
} as const;

// Fonctions utilitaires
export const generateBulletinId = (type: BulletinType): string => {
  const prefix = type === 'pdf_uploaded' ? 'BUP' : 'BAG';
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateAcademicYear = (year: number, trimester: TrimesterNumber): string => {
  if (trimester === 1) {
    return `${year-1}-${year}`;
  }
  return `${year-1}-${year}`;
};

export const calculateBulletinAverage = (subjects: BulletinSubject[]): number => {
  if (subjects.length === 0) return 0;
  
  const totalPoints = subjects.reduce((sum, subject) => {
    return sum + (subject.grade * subject.coefficient);
  }, 0);
  
  const totalCoefficient = subjects.reduce((sum, subject) => {
    return sum + subject.coefficient;
  }, 0);
  
  return totalCoefficient > 0 ? Number((totalPoints / totalCoefficient).toFixed(2)) : 0;
};

export const getBulletinPerformanceLevel = (averageGrade: number): string => {
  if (averageGrade >= 16) return 'Excellent';
  if (averageGrade >= 14) return 'Très bien';
  if (averageGrade >= 12) return 'Bien';
  if (averageGrade >= 10) return 'Passable';
  return 'Insuffisant';
};

export const getBulletinPerformanceColor = (averageGrade: number): string => {
  if (averageGrade >= 16) return '#10B981';
  if (averageGrade >= 14) return '#22C55E';
  if (averageGrade >= 12) return '#84CC16';
  if (averageGrade >= 10) return '#F59E0B';
  return '#EF4444';
};

export const validateBulletinFile = (file: any): { isValid: boolean; error?: string } => {
  const maxSize = 3 * 1024 * 1024; // 3MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  
  if (!file) {
    return { isValid: false, error: 'Aucun fichier sélectionné' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'Fichier trop volumineux (maximum 3MB)' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Format non supporté. Utilisez JPEG, PNG, WebP ou PDF uniquement' };
  }
  
  return { isValid: true };
};

export const checkBulletinDuplicate = (
  bulletins: Bulletin[],
  studentId: string,
  trimester: TrimesterNumber,
  year: number,
  type: BulletinType
): boolean => {
  return bulletins.some(bulletin => 
    bulletin.studentId === studentId &&
    bulletin.trimester === trimester &&
    bulletin.year === year &&
    bulletin.type === type
  );
};

export const generateBulletinChecksum = (bulletin: Partial<Bulletin>): string => {
  const data = `${bulletin.studentId}-${bulletin.trimester}-${bulletin.year}-${bulletin.averageGrade}-${Date.now()}`;
  return btoa(data).substr(0, 16);
};

export const formatBulletinPeriod = (trimester: TrimesterNumber, year: number): string => {
  const trimesterLabel = TRIMESTER_LABELS[trimester];
  const academicYear = generateAcademicYear(year, trimester);
  return `${trimesterLabel} ${academicYear}`;
};

export const getBulletinSecurityLevel = (bulletin: Bulletin): 'low' | 'medium' | 'high' => {
  let score = 0;
  
  if (bulletin.checksum) score += 1;
  if (bulletin.digitalSignature) score += 2;
  if (bulletin.isImmutable) score += 1;
  if (bulletin.validationLevel === 'validated') score += 1;
  
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
};

export const canUserAccessBulletin = (
  bulletin: Bulletin,
  userId: string,
  userRole: 'parent' | 'enseignant' | 'direction'
): boolean => {
  switch (userRole) {
    case 'parent':
      return bulletin.parentId === userId;
    case 'enseignant':
      return bulletin.teacherIds.includes(userId);
    case 'direction':
      return true;
    default:
      return false;
  }
};

export const canUserModifyBulletin = (
  bulletin: Bulletin,
  userId: string,
  userRole: 'parent' | 'enseignant' | 'direction'
): boolean => {
  if (bulletin.isImmutable) return false;
  if (bulletin.validationLevel === 'validated') return userRole === 'direction';
  
  switch (userRole) {
    case 'direction':
      return true;
    case 'enseignant':
      return bulletin.type === 'auto_generated' && bulletin.generatedBy === userId;
    case 'parent':
      return bulletin.type === 'pdf_uploaded' && bulletin.uploadedBy === 'parent' && bulletin.parentId === userId;
    default:
      return false;
  }
};

export const shouldSendBulletinReminder = (bulletin: Bulletin): boolean => {
  if (bulletin.status === 'valide') return false;
  
  const uploadDate = new Date(bulletin.uploadedAt || bulletin.generatedAt || bulletin.createdAt);
  const daysSinceUpload = Math.floor((Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysSinceUpload >= 7; // Rappel après 7 jours
};

export const getBulletinCompletionRate = (bulletins: Bulletin[], expectedCount: number): number => {
  const uploadedCount = bulletins.filter(b => b.status !== 'en_attente').length;
  return expectedCount > 0 ? Math.round((uploadedCount / expectedCount) * 100) : 0;
}; 