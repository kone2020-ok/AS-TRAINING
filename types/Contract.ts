export type ContractStatus = 'actif' | 'suspendu' | 'terminé' | 'en_attente';
export type DayOfWeek = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche';

export interface Student {
  id: string;
  nom: string;
  prenoms: string;
  classe: string;
  ecole: string;
  matricule: string;
  dateNaissance: string;
  photo?: string;
}

export interface ContractTeacher {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  teacherPhone: string;
  matieres: string[];
  remunerationParHeure: number;
  totalHeuresParSemaine: number;
  remunerationTotale: number;
}

export interface ContractSchedule {
  jour: DayOfWeek;
  heureDebut: string;
  heureFin: string;
  matiere: string;
  enseignantId: string;
  lieu: string;
}

export interface ContractFinancial {
  coutParent: number;
  remunerationTotaleEnseignants: number;
  fraisAdministratifs: number;
  totalContrat: number;
  modePaiement: 'mensuel' | 'trimestriel' | 'annuel';
  dateEcheance: string;
}

export interface Contract {
  id: string;
  codeContrat: string;
  
  // Élève
  student: Student;
  
  // Parent
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentAddress: string;
  
  // Enseignants
  teachers: ContractTeacher[];
  
  // Aspects financiers
  financial: ContractFinancial;
  
  // Planning
  schedules: ContractSchedule[];
  
  // Métadonnées
  statut: ContractStatus;
  dateCreation: string;
  dateDebut: string;
  dateFin?: string;
  dureeEnMois: number;
  creePar: string; // ID de la direction
  
  // Documents
  documentsAttaches?: string[];
  noteInterne?: string;
}

export interface ContractFormData {
  // Informations élève
  studentNom: string;
  studentPrenoms: string;
  studentClasse: string;
  studentEcole: string;
  studentMatricule: string;
  studentDateNaissance: string;
  studentPhoto?: File | string;
  
  // Parent
  parentId: string;
  
  // Enseignants
  teachers: {
    teacherId: string;
    matieres: string[];
    remunerationParHeure: number;
    heuresParSemaine: number;
  }[];
  
  // Aspects financiers
  coutParent: number;
  fraisAdministratifs: number;
  modePaiement: 'mensuel' | 'trimestriel' | 'annuel';
  
  // Planning
  schedules: {
    jour: DayOfWeek;
    heureDebut: string;
    heureFin: string;
    matiere: string;
    enseignantId: string;
    lieu: string;
  }[];
  
  // Métadonnées
  dateDebut: string;
  dureeEnMois: number;
  noteInterne?: string;
}

export interface ContractListItem {
  id: string;
  codeContrat: string;
  studentName: string;
  studentClasse: string;
  parentName: string;
  teachersCount: number;
  teachersNames: string[];
  statut: ContractStatus;
  coutParent: number;
  dateCreation: string;
  dateDebut: string;
  studentPhoto?: string;
}

export interface ContractStats {
  total: number;
  actifs: number;
  suspendus: number;
  termines: number;
  enAttente: number;
  revenueTotal: number;
  revenueActifs: number;
}

// Types pour les vues spécialisées
export interface ContractTeacherView {
  id: string;
  codeContrat: string;
  studentName: string;
  studentClasse: string;
  studentEcole: string;
  studentPhoto?: string;
  matieres: string[];
  remunerationTotale: number;
  heuresParSemaine: number;
  schedules: ContractSchedule[];
  parentContact: {
    name: string;
    phone: string;
    email: string;
  };
  statut: ContractStatus;
  dateDebut: string;
}

export interface ContractParentView {
  id: string;
  codeContrat: string;
  student: Student;
  teachers: {
    name: string;
    matieres: string[];
    contact: {
      email: string;
      phone: string;
    };
  }[];
  schedules: ContractSchedule[];
  financial: {
    coutTotal: number;
    modePaiement: string;
    prochainePaiement: string;
  };
  statut: ContractStatus;
  dateDebut: string;
  dateFin?: string;
}

// Types pour les filtres et recherche
export interface ContractFilters {
  statut?: ContractStatus[];
  classe?: string[];
  enseignant?: string[];
  parent?: string[];
  dateDebutMin?: string;
  dateDebutMax?: string;
  coutMin?: number;
  coutMax?: number;
}

export interface ContractSearchParams {
  query?: string;
  filters?: ContractFilters;
  sortBy?: 'dateCreation' | 'dateDebut' | 'studentName' | 'coutParent';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Types pour les actions
export interface CreateContractRequest {
  formData: ContractFormData;
}

export interface UpdateContractRequest {
  id: string;
  formData: Partial<ContractFormData>;
}

export interface ContractActionResult {
  success: boolean;
  message: string;
  contract?: Contract;
  errors?: Record<string, string>;
}

// Types pour l'impression
export interface PrintableContract {
  contract: Contract;
  viewType: 'parent' | 'enseignant' | 'direction';
  includeFinancial: boolean;
  includeSchedules: boolean;
  includeTeacherContact: boolean;
  watermark?: string;
}

// Utilitaires de validation
export const VALID_CLASSES = [
  'CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2',
  '6ème', '5ème', '4ème', '3ème',
  '2nde', '1ère', 'Terminale'
] as const;

export const VALID_SUBJECTS = [
  'Mathématiques',
  'Français',
  'Anglais',
  'Sciences Physiques',
  'Sciences de la Vie et de la Terre',
  'Histoire-Géographie',
  'Philosophie',
  'Espagnol',
  'Allemand',
  'Informatique',
  'Arts Plastiques',
  'Musique',
  'Éducation Physique'
] as const;

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  'actif': 'Actif',
  'suspendu': 'Suspendu',
  'terminé': 'Terminé',
  'en_attente': 'En attente'
};

export const CONTRACT_STATUS_COLORS: Record<ContractStatus, string> = {
  'actif': '#10B981',
  'suspendu': '#F59E0B',
  'terminé': '#6B7280',
  'en_attente': '#3B82F6'
};

export const DAYS_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  'lundi': 'Lundi',
  'mardi': 'Mardi',
  'mercredi': 'Mercredi',
  'jeudi': 'Jeudi',
  'vendredi': 'Vendredi',
  'samedi': 'Samedi',
  'dimanche': 'Dimanche'
};

// Fonctions utilitaires
export const generateContractCode = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `CONT-${year}${month}-${random}`;
};

export const calculateContractTotal = (teachers: ContractTeacher[], fraisAdministratifs: number = 0): number => {
  const totalEnseignants = teachers.reduce((sum, teacher) => sum + teacher.remunerationTotale, 0);
  return totalEnseignants + fraisAdministratifs;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount);
};

export const getContractDuration = (dateDebut: string, dateFin?: string): string => {
  const debut = new Date(dateDebut);
  const fin = dateFin ? new Date(dateFin) : new Date();
  const diffInMonths = (fin.getFullYear() - debut.getFullYear()) * 12 + (fin.getMonth() - debut.getMonth());
  return `${diffInMonths} mois`;
}; 