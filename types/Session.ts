// Types pour le système de validation des séances

export type SessionStatus = 'pending' | 'validated' | 'rejected';

export type SessionSubject = 
  | 'Mathématiques' | 'Physique' | 'Chimie' | 'SVT' | 'Français' 
  | 'Anglais' | 'Espagnol' | 'Histoire' | 'Géographie' | 'Philosophie'
  | 'Économie' | 'Comptabilité' | 'Informatique' | 'Autres';

// Interface pour la géolocalisation
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  address?: string;
}

// Interface pour les données QR du parent
export interface ParentQRData {
  parentId: string;
  parentName: string;
  familyCode: string;
  children: {
    id: string;
    nom: string;
    prenoms: string;
    classe: string;
  }[];
  homeLocation: {
    latitude: number;
    longitude: number;
  };
  generatedAt: string;
  expiresAt: string;
}

// Interface pour l'enregistrement de séance
export interface SessionFormData {
  studentId: string;
  studentName: string;
  parentId: string;
  dateSeance: string;
  heureDebut: string;
  heureFin: string;
  matieres: SessionSubject[];
  chapitres: string;
  objetSeance: string;
  observations: string;
  commentaires: string;
  dureeMinutes: number;
}

// Interface pour une séance complète
export interface Session {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  parentId: string;
  parentName: string;
  contractId?: string;
  
  // Informations temporelles
  dateSeance: string;
  heureDebut: string;
  heureFin: string;
  dureeMinutes: number;
  
  // Contenu pédagogique
  matieres: SessionSubject[];
  chapitres: string;
  objetSeance: string;
  observations: string;
  commentaires: string;
  
  // Données anti-fraude
  location: LocationData;
  qrData: ParentQRData;
  distanceFromHome: number; // en mètres
  
  // Statut et validation
  statut: SessionStatus;
  dateCreation: string;
  dateValidation?: string;
  motifRejet?: string;
  validateurId?: string;
  validateurName?: string;
  
  // Flags de sécurité
  anomalies: string[];
  flagged: boolean;
  autoValidated: boolean;
}

// Interface pour les statistiques des séances
export interface SessionStats {
  total: number;
  pending: number;
  validated: number;
  rejected: number;
  thisMonth: number;
  thisWeek: number;
  averageDuration: number;
  totalHours: number;
}

// Interface pour les filtres
export interface SessionFilters {
  dateDebut?: string;
  dateFin?: string;
  teacherId?: string;
  studentId?: string;
  parentId?: string;
  statut?: SessionStatus[];
  matieres?: SessionSubject[];
  flagged?: boolean;
}

// Interface pour la vue enseignant
export interface TeacherSessionView {
  id: string;
  studentName: string;
  parentName: string;
  dateSeance: string;
  heureDebut: string;
  heureFin: string;
  dureeMinutes: number;
  matieres: SessionSubject[];
  statut: SessionStatus;
  dateCreation: string;
  motifRejet?: string;
}

// Interface pour la vue parent
export interface ParentSessionView {
  id: string;
  teacherName: string;
  studentName: string;
  dateSeance: string;
  heureDebut: string;
  heureFin: string;
  dureeMinutes: number;
  matieres: SessionSubject[];
  chapitres: string;
  objetSeance: string;
  observations: string;
  commentaires: string;
  statut: SessionStatus;
  dateCreation: string;
  dateValidation?: string;
  motifRejet?: string;
}

// Interface pour la vue direction
export interface DirectionSessionView {
  id: string;
  teacherName: string;
  teacherId: string;
  studentName: string;
  parentName: string;
  dateSeance: string;
  heureDebut: string;
  heureFin: string;
  dureeMinutes: number;
  matieres: SessionSubject[];
  chapitres: string;
  objetSeance: string;
  observations: string;
  commentaires: string;
  location: LocationData;
  distanceFromHome: number;
  statut: SessionStatus;
  dateCreation: string;
  anomalies: string[];
  flagged: boolean;
}

// Interface pour la validation par la direction
export interface SessionValidationData {
  sessionId: string;
  action: 'validate' | 'reject';
  motif?: string;
  validateurId: string;
  validateurName: string;
}

// Constantes
export const SESSION_SUBJECTS: SessionSubject[] = [
  'Mathématiques', 'Physique', 'Chimie', 'SVT', 'Français', 
  'Anglais', 'Espagnol', 'Histoire', 'Géographie', 'Philosophie',
  'Économie', 'Comptabilité', 'Informatique', 'Autres'
];

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  pending: 'En attente',
  validated: 'Validée',
  rejected: 'Rejetée'
};

export const SESSION_STATUS_COLORS: Record<SessionStatus, string> = {
  pending: '#F59E0B',
  validated: '#10B981',
  rejected: '#EF4444'
};

export const MAX_SESSION_DURATION = 4 * 60; // 4 heures en minutes
export const MIN_SESSION_DURATION = 60; // 1 heure en minutes
export const MAX_DISTANCE_FROM_HOME = 500; // 500 mètres
export const FRAUD_DETECTION_RADIUS = 30; // 30 mètres pour la détection de fraude
export const QR_CODE_VALIDITY_HOURS = 24; // 24 heures

// Fonctions utilitaires
export const calculateSessionDuration = (heureDebut: string, heureFin: string): number => {
  const [startHour, startMin] = heureDebut.split(':').map(Number);
  const [endHour, endMin] = heureFin.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return endMinutes - startMinutes;
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}min`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h${mins}min`;
  }
};

export const validateSessionTime = (heureDebut: string, heureFin: string): string[] => {
  const errors: string[] = [];
  const duration = calculateSessionDuration(heureDebut, heureFin);
  
  if (duration < MIN_SESSION_DURATION) {
    errors.push(`Durée minimale: ${MIN_SESSION_DURATION / 60}h`);
  }
  
  if (duration > MAX_SESSION_DURATION) {
    errors.push(`Durée maximale: ${MAX_SESSION_DURATION / 60}h`);
  }
  
  const [startHour] = heureDebut.split(':').map(Number);
  const [endHour] = heureFin.split(':').map(Number);
  
  if (startHour < 8 || endHour > 20) {
    errors.push('Horaires autorisés: 8h - 20h');
  }
  
  return errors;
};

export const detectAnomalies = (session: Partial<Session>): string[] => {
  const anomalies: string[] = [];
  
  // Vérification distance et détection de fraude
  if (session.distanceFromHome) {
    if (session.distanceFromHome > FRAUD_DETECTION_RADIUS) {
      anomalies.push(`🚨 TENTATIVE DE FRAUDE: ${Math.round(session.distanceFromHome)}m du domicile`);
    } else if (session.distanceFromHome > MAX_DISTANCE_FROM_HOME) {
      anomalies.push(`Distance excessive: ${Math.round(session.distanceFromHome)}m`);
    }
  }
  
  // Vérification durée
  if (session.dureeMinutes) {
    if (session.dureeMinutes < MIN_SESSION_DURATION) {
      anomalies.push('Durée trop courte');
    }
    if (session.dureeMinutes > MAX_SESSION_DURATION) {
      anomalies.push('Durée excessive');
    }
  }
  
  // Vérification horaires
  if (session.heureDebut && session.heureFin) {
    const timeErrors = validateSessionTime(session.heureDebut, session.heureFin);
    anomalies.push(...timeErrors);
  }
  
  // Vérification QR code
  if (session.qrData) {
    const now = new Date();
    const expires = new Date(session.qrData.expiresAt);
    if (now > expires) {
      anomalies.push('QR code expiré');
    }
  }
  
  return anomalies;
};

export const generateSessionId = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SES-${year}${month}-${random}`;
}; 