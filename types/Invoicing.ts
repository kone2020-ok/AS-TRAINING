// Types pour le système complet de facturation et paiements AS-Training

export type InvoiceStatus = 'brouillon' | 'generee' | 'envoyee' | 'en_attente' | 'payee' | 'en_retard' | 'annulee' | 'litige';
export type PaymentStatus = 'calcule' | 'valide' | 'paye' | 'en_attente' | 'rejete' | 'suspendu';
export type PaymentMethod = 'virement' | 'especes' | 'mobile_money' | 'cheque' | 'carte_bancaire' | 'crypto';
export type InvoiceType = 'mensuelle' | 'trimestrielle' | 'ponctuelle' | 'rattrapage' | 'penalite';
export type CurrencyCode = 'XOF' | 'EUR' | 'USD'; // FCFA, Euro, Dollar

// Interface pour une facture parent complète
export interface Invoice {
  id: string;
  invoiceNumber: string; // Format: FACT-{parentId}-{year}{month}-{sequence}
  type: InvoiceType;
  
  // Informations famille
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentAddress: {
    street: string;
    commune: string;
    city: string;
    postalCode?: string;
    country: string;
  };
  studentIds: string[];
  studentNames: string[];
  
  // Période de facturation
  period: string; // "Janvier 2025"
  month: number;
  year: number;
  academicYear: string; // "2024-2025"
  billingPeriodStart: string;
  billingPeriodEnd: string;
  
  // Détails financiers
  currency: CurrencyCode;
  subtotalAmount: number;
  taxRate: number; // Pourcentage TVA
  taxAmount: number;
  discountRate: number; // Pourcentage remise
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  
  // Détails des sessions
  sessionsCount: number;
  totalHours: number;
  sessionDetails: InvoiceSessionDetail[];
  
  // Statut et dates
  status: InvoiceStatus;
  priority: 'normale' | 'urgente' | 'critique';
  dueDate: string;
  gracePeriod: number; // Jours de délai supplémentaire
  
  // Horodatage
  dateCreation: string;
  dateGeneration?: string;
  dateSent?: string;
  dateFirstReminder?: string;
  dateSecondReminder?: string;
  datePaid?: string;
  dateCancelled?: string;
  
  // Paiement
  paymentDetails?: InvoicePayment[];
  paymentInstructions: string;
  bankDetails: BankDetails;
  
  // Métadonnées
  generatedBy: string; // ID utilisateur Direction
  validatedBy?: string;
  notes?: string;
  internalNotes?: string; // Notes privées Direction
  
  // Communication
  remindersSent: number;
  lastReminderDate?: string;
  communicationHistory: InvoiceCommunication[];
  
  // Analytics
  viewCount: number;
  downloadCount: number;
  lastViewedAt?: string;
  lastDownloadedAt?: string;
  
  // Gestion des litiges
  disputeReason?: string;
  disputeDate?: string;
  disputeResolution?: string;
  disputeResolvedAt?: string;
  
  // Archivage
  isArchived: boolean;
  archiveDate?: string;
  fiscalYear: number;
}

// Détail d'une session dans une facture
export interface InvoiceSessionDetail {
  sessionId: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // En minutes
  hourlyRate: number;
  sessionAmount: number;
  sessionType: 'cours' | 'devoir' | 'examen' | 'rattrapage';
  location: 'domicile' | 'centre' | 'en_ligne';
  status: 'completed' | 'cancelled' | 'rescheduled';
  validatedBy?: string;
  validatedAt?: string;
  description?: string;
}

// Informations de paiement d'une facture
export interface InvoicePayment {
  id: string;
  amount: number;
  currency: CurrencyCode;
  method: PaymentMethod;
  reference: string;
  transactionId?: string;
  date: string;
  processedBy?: string;
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  gatewayResponse?: any;
  fees?: number;
  netAmount?: number;
  notes?: string;
}

// Historique des communications
export interface InvoiceCommunication {
  id: string;
  type: 'email' | 'sms' | 'call' | 'meeting' | 'system';
  direction: 'sent' | 'received';
  subject?: string;
  message: string;
  sentBy: string;
  sentAt: string;
  readAt?: string;
  responseAt?: string;
  status: 'sent' | 'delivered' | 'read' | 'responded' | 'failed';
}

// Détails bancaires pour paiements
export interface BankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  iban?: string;
  swift?: string;
  beneficiaryName: string;
  beneficiaryAddress?: string;
  mobileMoneyNumber?: string;
  mobileMoneyProvider?: 'orange' | 'mtn' | 'moov' | 'wave';
}

// Interface pour un paiement enseignant
export interface TeacherPayment {
  id: string;
  paymentNumber: string; // Format: PAY-{teacherId}-{year}{month}-{sequence}
  
  // Informations enseignant
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  teacherPhone: string;
  employeeNumber?: string;
  
  // Période de calcul
  period: string; // "Janvier 2025"
  month: number;
  year: number;
  academicYear: string;
  calculationPeriodStart: string;
  calculationPeriodEnd: string;
  
  // Calculs des sessions
  validatedSessions: number;
  totalHours: number;
  sessionRate: number; // Taux horaire de base
  sessionDetails: TeacherSessionDetail[];
  
  // Calculs financiers
  currency: CurrencyCode;
  baseAmount: number; // Montant sessions validées
  bonuses: TeacherBonus[];
  totalBonuses: number;
  deductions: TeacherDeduction[];
  totalDeductions: number;
  grossAmount: number;
  taxRate: number;
  taxAmount: number;
  socialContributions: number;
  netAmount: number;
  
  // Statut et dates
  status: PaymentStatus;
  dateCalculation: string;
  dateValidation?: string;
  datePayment?: string;
  dateRejection?: string;
  
  // Paiement effectif
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  transactionId?: string;
  bankDetails?: BankDetails;
  
  // Métadonnées
  calculatedBy: string;
  validatedBy?: string;
  paidBy?: string;
  notes?: string;
  internalNotes?: string;
  
  // Gestion administrative
  payslipGenerated: boolean;
  payslipUrl?: string;
  contractReference?: string;
  
  // Analytics
  viewCount: number;
  downloadCount: number;
  lastViewedAt?: string;
  
  // Archivage fiscal
  fiscalYear: number;
  isArchived: boolean;
  archiveDate?: string;
}

// Détail d'une session dans un paiement enseignant
export interface TeacherSessionDetail {
  sessionId: string;
  studentId: string;
  studentName: string;
  parentId: string;
  parentName: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // En minutes
  hourlyRate: number;
  sessionAmount: number;
  sessionType: 'cours' | 'devoir' | 'examen' | 'rattrapage';
  location: 'domicile' | 'centre' | 'en_ligne';
  validatedBy: string;
  validatedAt: string;
  description?: string;
  qualityRating?: number; // Note de 1 à 5
  studentFeedback?: string;
  parentFeedback?: string;
}

// Bonus enseignant
export interface TeacherBonus {
  id: string;
  type: 'performance' | 'ponctualite' | 'satisfaction' | 'objectif' | 'anciennete' | 'special';
  description: string;
  amount: number;
  currency: CurrencyCode;
  calculationBasis?: string;
  awardedBy: string;
  awardedAt: string;
  validatedBy?: string;
  validatedAt?: string;
}

// Déductions enseignant
export interface TeacherDeduction {
  id: string;
  type: 'retard' | 'absence' | 'penalite' | 'avance' | 'equipement' | 'formation' | 'autre';
  description: string;
  amount: number;
  currency: CurrencyCode;
  reason: string;
  appliedBy: string;
  appliedAt: string;
  validatedBy?: string;
  validatedAt?: string;
  disputeReason?: string;
  disputeStatus?: 'pending' | 'resolved' | 'rejected';
}

// Statistiques de facturation
export interface InvoicingStats {
  totalInvoices: number;
  totalAmount: number;
  currency: CurrencyCode;
  
  // Répartition par statut
  byStatus: Record<InvoiceStatus, {
    count: number;
    amount: number;
    percentage: number;
  }>;
  
  // Répartition par période
  byMonth: Record<string, {
    count: number;
    amount: number;
    averageAmount: number;
  }>;
  
  // Métriques de performance
  averagePaymentDelay: number; // Jours
  paymentRate: number; // Pourcentage
  disputeRate: number; // Pourcentage
  reminderEffectiveness: number; // Pourcentage
  
  // Tendances
  monthlyGrowth: number; // Pourcentage
  seasonalTrends: Array<{
    month: number;
    averageAmount: number;
    paymentRate: number;
  }>;
  
  // Top familles
  topPayingFamilies: Array<{
    parentId: string;
    parentName: string;
    totalAmount: number;
    invoiceCount: number;
    averageAmount: number;
    paymentRate: number;
  }>;
}

// Statistiques des paiements enseignants
export interface TeacherPaymentStats {
  totalTeachers: number;
  totalPayments: number;
  totalAmount: number;
  currency: CurrencyCode;
  
  // Répartition par statut
  byStatus: Record<PaymentStatus, {
    count: number;
    amount: number;
    percentage: number;
  }>;
  
  // Performance enseignants
  topEarningTeachers: Array<{
    teacherId: string;
    teacherName: string;
    totalAmount: number;
    sessionsCount: number;
    averageRate: number;
    bonusesReceived: number;
    performanceRating: number;
  }>;
  
  // Métriques temporelles
  averageProcessingTime: number; // Heures
  paymentPunctuality: number; // Pourcentage
  
  // Coûts opérationnels
  totalBaseSalaries: number;
  totalBonuses: number;
  totalDeductions: number;
  totalTaxes: number;
  totalSocialContributions: number;
}

// Filtres avancés pour factures
export interface InvoiceFilters {
  // Filtres principaux
  parentId?: string;
  studentId?: string;
  teacherId?: string;
  
  // Filtres temporels
  month?: number;
  year?: number;
  academicYear?: string;
  dateFrom?: string;
  dateTo?: string;
  
  // Filtres de statut
  status?: InvoiceStatus;
  type?: InvoiceType;
  priority?: 'normale' | 'urgente' | 'critique';
  
  // Filtres financiers
  minAmount?: number;
  maxAmount?: number;
  currency?: CurrencyCode;
  paymentMethod?: PaymentMethod;
  
  // Filtres de contenu
  hasDispute?: boolean;
  isOverdue?: boolean;
  hasReminders?: boolean;
  
  // Tri
  sortBy?: 'date' | 'amount' | 'status' | 'dueDate' | 'parentName';
  sortOrder?: 'asc' | 'desc';
}

// Filtres pour paiements enseignants
export interface TeacherPaymentFilters {
  // Filtres principaux
  teacherId?: string;
  departmentId?: string;
  
  // Filtres temporels
  month?: number;
  year?: number;
  academicYear?: string;
  dateFrom?: string;
  dateTo?: string;
  
  // Filtres de statut
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  
  // Filtres financiers
  minAmount?: number;
  maxAmount?: number;
  currency?: CurrencyCode;
  
  // Filtres de performance
  minRating?: number;
  hasBonuses?: boolean;
  hasDeductions?: boolean;
  
  // Tri
  sortBy?: 'date' | 'amount' | 'status' | 'teacherName' | 'sessionsCount';
  sortOrder?: 'asc' | 'desc';
}

// Données d'export
export interface InvoiceExportData {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  filters: InvoiceFilters;
  includeDetails: boolean;
  includeSessionDetails: boolean;
  includePaymentHistory: boolean;
  language: 'fr' | 'en';
  currency: CurrencyCode;
  dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
}

// Configuration du système de facturation
export interface InvoicingConfig {
  // Paramètres généraux
  defaultCurrency: CurrencyCode;
  defaultTaxRate: number;
  defaultPaymentTerms: number; // Jours
  defaultGracePeriod: number; // Jours
  
  // Numérotation
  invoiceNumberPrefix: string;
  paymentNumberPrefix: string;
  sequenceLength: number;
  
  // Automatisation
  autoGenerateInvoices: boolean;
  autoSendInvoices: boolean;
  autoReminders: boolean;
  reminderSchedule: number[]; // Jours après échéance
  
  // Seuils d'alerte
  overdueThreshold: number; // Jours
  highAmountThreshold: number;
  disputeEscalationDays: number;
  
  // Intégrations
  paymentGateways: string[];
  bankingPartners: string[];
  accountingSystem?: string;
  
  // Notifications
  emailTemplates: Record<string, string>;
  smsTemplates: Record<string, string>;
  notificationChannels: string[];
}

// Constantes et énumérations
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  brouillon: 'Brouillon',
  generee: 'Générée',
  envoyee: 'Envoyée',
  en_attente: 'En attente',
  payee: 'Payée',
  en_retard: 'En retard',
  annulee: 'Annulée',
  litige: 'Litige'
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  brouillon: '#6B7280',
  generee: '#3B82F6',
  envoyee: '#8B5CF6',
  en_attente: '#F59E0B',
  payee: '#10B981',
  en_retard: '#EF4444',
  annulee: '#6B7280',
  litige: '#DC2626'
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  calcule: 'Calculé',
  valide: 'Validé',
  paye: 'Payé',
  en_attente: 'En attente',
  rejete: 'Rejeté',
  suspendu: 'Suspendu'
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  calcule: '#6B7280',
  valide: '#3B82F6',
  paye: '#10B981',
  en_attente: '#F59E0B',
  rejete: '#EF4444',
  suspendu: '#DC2626'
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  virement: 'Virement bancaire',
  especes: 'Espèces',
  mobile_money: 'Mobile Money',
  cheque: 'Chèque',
  carte_bancaire: 'Carte bancaire',
  crypto: 'Cryptomonnaie'
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  XOF: 'FCFA',
  EUR: '€',
  USD: '$'
};

// Fonctions utilitaires
export const generateInvoiceNumber = (parentId: string, year: number, month: number, sequence: number): string => {
  const monthStr = month.toString().padStart(2, '0');
  const sequenceStr = sequence.toString().padStart(3, '0');
  return `FACT-${parentId}-${year}${monthStr}-${sequenceStr}`;
};

export const generatePaymentNumber = (teacherId: string, year: number, month: number, sequence: number): string => {
  const monthStr = month.toString().padStart(2, '0');
  const sequenceStr = sequence.toString().padStart(3, '0');
  return `PAY-${teacherId}-${year}${monthStr}-${sequenceStr}`;
};

export const formatCurrency = (amount: number, currency: CurrencyCode): string => {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formatter = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  if (currency === 'XOF') {
    return `${formatter.format(amount)} ${symbol}`;
  } else {
    return `${symbol}${formatter.format(amount)}`;
  }
};

export const calculateInvoiceTotal = (
  subtotal: number,
  taxRate: number,
  discountRate: number
): { taxAmount: number; discountAmount: number; total: number } => {
  const discountAmount = subtotal * (discountRate / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (taxRate / 100);
  const total = taxableAmount + taxAmount;
  
  return {
    taxAmount: Math.round(taxAmount),
    discountAmount: Math.round(discountAmount),
    total: Math.round(total)
  };
};

export const calculateTeacherPayment = (
  baseAmount: number,
  bonuses: number,
  deductions: number,
  taxRate: number,
  socialRate: number
): { grossAmount: number; taxAmount: number; socialAmount: number; netAmount: number } => {
  const grossAmount = baseAmount + bonuses - deductions;
  const taxAmount = grossAmount * (taxRate / 100);
  const socialAmount = grossAmount * (socialRate / 100);
  const netAmount = grossAmount - taxAmount - socialAmount;
  
  return {
    grossAmount: Math.round(grossAmount),
    taxAmount: Math.round(taxAmount),
    socialAmount: Math.round(socialAmount),
    netAmount: Math.round(netAmount)
  };
};

export const getInvoiceStatusPriority = (status: InvoiceStatus): number => {
  const priorities = {
    litige: 0,
    en_retard: 1,
    en_attente: 2,
    envoyee: 3,
    generee: 4,
    brouillon: 5,
    payee: 6,
    annulee: 7
  };
  return priorities[status];
};

export const isInvoiceOverdue = (dueDate: string): boolean => {
  return new Date() > new Date(dueDate);
};

export const calculateOverdueDays = (dueDate: string): number => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const getNextReminderDate = (dueDate: string, remindersSent: number, schedule: number[]): string | null => {
  if (remindersSent >= schedule.length) return null;
  
  const due = new Date(dueDate);
  const reminderDays = schedule[remindersSent];
  const reminderDate = new Date(due.getTime() + (reminderDays * 24 * 60 * 60 * 1000));
  
  return reminderDate.toISOString();
};

export const validateInvoiceData = (invoice: Partial<Invoice>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!invoice.parentId) errors.push('Parent requis');
  if (!invoice.period) errors.push('Période requise');
  if (!invoice.totalAmount || invoice.totalAmount <= 0) errors.push('Montant invalide');
  if (!invoice.dueDate) errors.push('Date d\'échéance requise');
  if (!invoice.sessionDetails || invoice.sessionDetails.length === 0) errors.push('Aucune session facturée');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePaymentData = (payment: Partial<TeacherPayment>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!payment.teacherId) errors.push('Enseignant requis');
  if (!payment.period) errors.push('Période requise');
  if (!payment.netAmount || payment.netAmount <= 0) errors.push('Montant invalide');
  if (!payment.sessionDetails || payment.sessionDetails.length === 0) errors.push('Aucune session validée');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getInvoiceAging = (createdDate: string): number => {
  const created = new Date(createdDate);
  const today = new Date();
  const diffTime = today.getTime() - created.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateCollectionMetrics = (invoices: Invoice[]): {
  totalOutstanding: number;
  averagePaymentTime: number;
  collectionRate: number;
  agingBuckets: Record<string, { count: number; amount: number }>;
} => {
  const totalOutstanding = invoices
    .filter(inv => inv.status !== 'payee' && inv.status !== 'annulee')
    .reduce((sum, inv) => sum + inv.amountDue, 0);
  
  const paidInvoices = invoices.filter(inv => inv.status === 'payee' && inv.datePaid);
  const averagePaymentTime = paidInvoices.length > 0 
    ? paidInvoices.reduce((sum, inv) => {
        const created = new Date(inv.dateCreation);
        const paid = new Date(inv.datePaid!);
        return sum + Math.floor((paid.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / paidInvoices.length
    : 0;
  
  const collectionRate = invoices.length > 0 
    ? (paidInvoices.length / invoices.length) * 100 
    : 0;
  
  const agingBuckets = {
    '0-30': { count: 0, amount: 0 },
    '31-60': { count: 0, amount: 0 },
    '61-90': { count: 0, amount: 0 },
    '90+': { count: 0, amount: 0 }
  };
  
  invoices
    .filter(inv => inv.status !== 'payee' && inv.status !== 'annulee')
    .forEach(inv => {
      const age = getInvoiceAging(inv.dateCreation);
      if (age <= 30) {
        agingBuckets['0-30'].count++;
        agingBuckets['0-30'].amount += inv.amountDue;
      } else if (age <= 60) {
        agingBuckets['31-60'].count++;
        agingBuckets['31-60'].amount += inv.amountDue;
      } else if (age <= 90) {
        agingBuckets['61-90'].count++;
        agingBuckets['61-90'].amount += inv.amountDue;
      } else {
        agingBuckets['90+'].count++;
        agingBuckets['90+'].amount += inv.amountDue;
      }
    });
  
  return {
    totalOutstanding,
    averagePaymentTime,
    collectionRate,
    agingBuckets
  };
}; 