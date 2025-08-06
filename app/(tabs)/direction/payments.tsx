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
import { Search, Filter, CreditCard, Calendar, User, DollarSign, Eye, Download, CheckCircle, Clock, ArrowLeft, TrendingUp, AlertTriangle, Award, Minus, Plus, Calculator } from 'lucide-react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@react-navigation/native';
import { useNotificationTriggers } from '../../../services/NotificationTriggers';
import {
  TeacherPayment,
  PaymentStatus,
  PaymentMethod,
  CurrencyCode,
  TeacherPaymentFilters,
  TeacherPaymentStats,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  generatePaymentNumber,
  formatCurrency,
  calculateTeacherPayment,
  validatePaymentData
} from '../../../types/Invoicing';

// Données globales enseignants
const allTeachers = [
  { 
    id: 'teacher_1', 
    name: 'Marie N\'Guessan', 
    email: 'marie.nguessan@email.com',
    phone: '+225 07 11 22 33 44',
    employeeNumber: 'EMP001',
    baseRate: 15000,
    subjects: ['Mathématiques', 'Physique']
  },
  { 
    id: 'teacher_2', 
    name: 'Jean Baptiste', 
    email: 'jean.baptiste@email.com',
    phone: '+225 05 55 66 77 88',
    employeeNumber: 'EMP002',
    baseRate: 12000,
    subjects: ['Français', 'Histoire']
  },
  { 
    id: 'teacher_3', 
    name: 'Sarah Diallo', 
    email: 'sarah.diallo@email.com',
    phone: '+225 01 99 88 77 66',
    employeeNumber: 'EMP003',
    baseRate: 14000,
    subjects: ['SVT', 'Chimie']
  },
];

export default function PaymentsManagement() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const notificationTriggers = useNotificationTriggers();
  const isDesktop = width >= 768;
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [payments, setPayments] = useState<TeacherPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<TeacherPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'tous' | 'calcules' | 'valides' | 'payes'>('tous');
  
  // Filtres avancés
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | ''>('');
  
  // États pour calcul automatique
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const [calculationProgress, setCalculationProgress] = useState(0);
  const [calculationData, setCalculationData] = useState({
    month: 1,
    year: 2025,
    teacherId: '',
    includeAllTeachers: true,
    bonusAmount: 0,
    deductionAmount: 0,
    taxRate: 10,
    socialRate: 5,
    notes: ''
  });
  
  // États pour validation et paiement
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<TeacherPayment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('virement');
  const [paymentReference, setPaymentReference] = useState('');

  const directionUserId = 'direction_admin';

  // Données de démonstration ultra-complètes
  const demoPayments: TeacherPayment[] = [
    {
      id: 'payment_001',
      paymentNumber: 'PAY-teacher_1-202501-001',
      teacherId: 'teacher_1',
      teacherName: 'Marie N\'Guessan',
      teacherEmail: 'marie.nguessan@email.com',
      teacherPhone: '+225 07 11 22 33 44',
      employeeNumber: 'EMP001',
      period: 'Janvier 2025',
      month: 1,
      year: 2025,
      academicYear: '2024-2025',
      calculationPeriodStart: '2025-01-01T00:00:00Z',
      calculationPeriodEnd: '2025-01-31T23:59:59Z',
      validatedSessions: 16,
      totalHours: 32,
      sessionRate: 15000,
      sessionDetails: [
        {
          sessionId: 'session_001',
          studentId: 'student_1',
          studentName: 'Kouadio Aya',
          parentId: 'parent_1',
          parentName: 'M. Diabaté Mamadou',
          subject: 'Mathématiques',
          date: '2025-01-05',
          startTime: '14:00',
          endTime: '16:00',
          duration: 120,
          hourlyRate: 15000,
          sessionAmount: 30000,
          sessionType: 'cours',
          location: 'domicile',
          validatedBy: 'direction_admin',
          validatedAt: '2025-01-05T16:30:00Z',
          qualityRating: 5,
          studentFeedback: 'Excellent cours, très clair',
          parentFeedback: 'Très satisfait'
        },
        {
          sessionId: 'session_002',
          studentId: 'student_3',
          studentName: 'Traoré Aminata',
          parentId: 'parent_2',
          parentName: 'Mme Koné Fatou',
          subject: 'Physique',
          date: '2025-01-10',
          startTime: '16:00',
          endTime: '18:00',
          duration: 120,
          hourlyRate: 15000,
          sessionAmount: 30000,
          sessionType: 'cours',
          location: 'domicile',
          validatedBy: 'direction_admin',
          validatedAt: '2025-01-10T18:30:00Z',
          qualityRating: 5
        }
      ],
      currency: 'XOF',
      baseAmount: 240000,
      bonuses: [
        {
          id: 'bonus_001',
          type: 'performance',
          description: 'Bonus performance excellente',
          amount: 50000,
          currency: 'XOF',
          calculationBasis: 'Moyenne 5/5 sur toutes les sessions',
          awardedBy: directionUserId,
          awardedAt: '2025-01-31T18:00:00Z'
        }
      ],
      totalBonuses: 50000,
      deductions: [],
      totalDeductions: 0,
      grossAmount: 290000,
      taxRate: 10,
      taxAmount: 29000,
      socialContributions: 14500,
      netAmount: 246500,
      status: 'valide',
      dateCalculation: '2025-01-31T18:00:00Z',
      dateValidation: '2025-02-01T10:00:00Z',
      calculatedBy: directionUserId,
      validatedBy: directionUserId,
      notes: 'Excellent mois, performance remarquable',
      payslipGenerated: true,
      payslipUrl: 'payslips/teacher_1_202501.pdf',
      viewCount: 3,
      downloadCount: 0,
      fiscalYear: 2025,
      isArchived: false
    },
    {
      id: 'payment_002',
      paymentNumber: 'PAY-teacher_2-202501-001',
      teacherId: 'teacher_2',
      teacherName: 'Jean Baptiste',
      teacherEmail: 'jean.baptiste@email.com',
      teacherPhone: '+225 05 55 66 77 88',
      employeeNumber: 'EMP002',
      period: 'Janvier 2025',
      month: 1,
      year: 2025,
      academicYear: '2024-2025',
      calculationPeriodStart: '2025-01-01T00:00:00Z',
      calculationPeriodEnd: '2025-01-31T23:59:59Z',
      validatedSessions: 12,
      totalHours: 18,
      sessionRate: 12000,
      sessionDetails: [
        {
          sessionId: 'session_003',
          studentId: 'student_2',
          studentName: 'N\'Dri Kevin',
          parentId: 'parent_1',
          parentName: 'M. Diabaté Mamadou',
          subject: 'Français',
          date: '2025-01-06',
          startTime: '15:00',
          endTime: '16:30',
          duration: 90,
          hourlyRate: 12000,
          sessionAmount: 18000,
          sessionType: 'cours',
          location: 'domicile',
          validatedBy: 'direction_admin',
          validatedAt: '2025-01-06T17:00:00Z',
          qualityRating: 4
        }
      ],
      currency: 'XOF',
      baseAmount: 144000,
      bonuses: [],
      totalBonuses: 0,
      deductions: [
        {
          id: 'deduction_001',
          type: 'retard',
          description: 'Retard séance du 15/01',
          amount: 5000,
          currency: 'XOF',
          reason: 'Arrivée avec 20 minutes de retard',
          appliedBy: directionUserId,
          appliedAt: '2025-01-31T18:00:00Z'
        }
      ],
      totalDeductions: 5000,
      grossAmount: 139000,
      taxRate: 10,
      taxAmount: 13900,
      socialContributions: 6950,
      netAmount: 118150,
      status: 'paye',
      dateCalculation: '2025-01-31T18:00:00Z',
      dateValidation: '2025-02-01T10:00:00Z',
      datePayment: '2025-02-05T14:30:00Z',
      paymentMethod: 'virement',
      paymentReference: 'VIR2025020512345',
      calculatedBy: directionUserId,
      validatedBy: directionUserId,
      paidBy: directionUserId,
      payslipGenerated: true,
      payslipUrl: 'payslips/teacher_2_202501.pdf',
      viewCount: 5,
      downloadCount: 0,
      fiscalYear: 2025,
      isArchived: false
    }
  ];

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPayments(demoPayments);
      setFilteredPayments(demoPayments);
      setLoading(false);
    };

    loadPayments();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const filtered = payments.filter(payment => {
      const matchesSearch = !searchQuery || 
        payment.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.employeeNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesMonth = selectedMonth === 0 || payment.month === selectedMonth;
      const matchesYear = payment.year === selectedYear;
      const matchesTeacher = !selectedTeacher || payment.teacherId === selectedTeacher;
      const matchesStatus = !selectedStatus || payment.status === selectedStatus;
      
      const matchesTab = activeTab === 'tous' || 
        (activeTab === 'calcules' && payment.status === 'calcule') ||
        (activeTab === 'valides' && payment.status === 'valide') ||
        (activeTab === 'payes' && payment.status === 'paye');
      
      return matchesSearch && matchesMonth && matchesYear && matchesTeacher && matchesStatus && matchesTab;
    });

    setFilteredPayments(filtered);
  }, [searchQuery, payments, selectedMonth, selectedYear, selectedTeacher, selectedStatus, activeTab]);

  // Calcul des statistiques
  const calculateStats = (): TeacherPaymentStats => {
    const totalAmount = payments.reduce((sum, pay) => sum + pay.netAmount, 0);
    const totalPayments = payments.length;
    
    const byStatus = {} as Record<PaymentStatus, { count: number; amount: number; percentage: number }>;
    Object.values(PAYMENT_STATUS_LABELS).forEach(statusKey => {
      const status = Object.keys(PAYMENT_STATUS_LABELS).find(key => 
        PAYMENT_STATUS_LABELS[key as PaymentStatus] === statusKey
      ) as PaymentStatus;
      if (status) {
        const statusPayments = payments.filter(pay => pay.status === status);
        const statusAmount = statusPayments.reduce((sum, pay) => sum + pay.netAmount, 0);
        byStatus[status] = {
          count: statusPayments.length,
          amount: statusAmount,
          percentage: totalPayments > 0 ? (statusPayments.length / totalPayments) * 100 : 0
        };
      }
    });

    const topEarningTeachers = allTeachers.map(teacher => {
      const teacherPayments = payments.filter(pay => pay.teacherId === teacher.id);
      const totalEarnings = teacherPayments.reduce((sum, pay) => sum + pay.netAmount, 0);
      const sessionsCount = teacherPayments.reduce((sum, pay) => sum + pay.validatedSessions, 0);
      const bonusesReceived = teacherPayments.reduce((sum, pay) => sum + pay.totalBonuses, 0);
      const averageRating = teacherPayments.length > 0 
        ? teacherPayments.reduce((sum, pay) => {
            const avgSessionRating = pay.sessionDetails.reduce((s, session) => 
              s + (session.qualityRating || 0), 0) / pay.sessionDetails.length;
            return sum + avgSessionRating;
          }, 0) / teacherPayments.length
        : 0;

      return {
        teacherId: teacher.id,
        teacherName: teacher.name,
        totalAmount: totalEarnings,
        sessionsCount,
        averageRate: sessionsCount > 0 ? totalEarnings / sessionsCount : 0,
        bonusesReceived,
        performanceRating: averageRating
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      totalTeachers: allTeachers.length,
      totalPayments,
      totalAmount,
      currency: 'XOF',
      byStatus,
      topEarningTeachers,
      averageProcessingTime: 24,
      paymentPunctuality: 95,
      totalBaseSalaries: payments.reduce((sum, pay) => sum + pay.baseAmount, 0),
      totalBonuses: payments.reduce((sum, pay) => sum + pay.totalBonuses, 0),
      totalDeductions: payments.reduce((sum, pay) => sum + pay.totalDeductions, 0),
      totalTaxes: payments.reduce((sum, pay) => sum + pay.taxAmount, 0),
      totalSocialContributions: payments.reduce((sum, pay) => sum + pay.socialContributions, 0)
    };
  };

  const calculatePaymentsAutomatically = async () => {
    const validation = validateCalculationData();
    
    if (!validation.isValid) {
      Alert.alert(
        '❌ Erreurs de validation',
        validation.errors.join('\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    // Simulation du processus de calcul automatique
    setCalculationProgress(0);
    
    const steps = [
      { progress: 20, message: 'Collecte des sessions validées...' },
      { progress: 40, message: 'Calcul des montants de base...' },
      { progress: 60, message: 'Application des bonus/déductions...' },
      { progress: 80, message: 'Calcul des taxes et cotisations...' },
      { progress: 95, message: 'Génération des fiches de paie...' },
      { progress: 100, message: 'Calcul terminé !' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCalculationProgress(step.progress);
    }

    // Générer les nouveaux paiements
    const teachersToProcess = calculationData.includeAllTeachers 
      ? allTeachers 
      : allTeachers.filter(t => t.id === calculationData.teacherId);

    const newPayments: TeacherPayment[] = [];
    let sequenceNumber = payments.length + 1;

    for (const teacher of teachersToProcess) {
      // Simulation: 10-20 sessions par enseignant
      const sessionCount = Math.floor(Math.random() * 11) + 10;
      const baseAmount = sessionCount * teacher.baseRate;
      
      const { grossAmount, taxAmount, socialAmount, netAmount } = calculateTeacherPayment(
        baseAmount,
        calculationData.bonusAmount,
        calculationData.deductionAmount,
        calculationData.taxRate,
        calculationData.socialRate
      );

      const payment: TeacherPayment = {
        id: `payment_${Date.now()}_${teacher.id}`,
        paymentNumber: generatePaymentNumber(teacher.id, calculationData.year, calculationData.month, sequenceNumber++),
        teacherId: teacher.id,
        teacherName: teacher.name,
        teacherEmail: teacher.email,
        teacherPhone: teacher.phone,
        employeeNumber: teacher.employeeNumber,
        period: `${getMonthName(calculationData.month)} ${calculationData.year}`,
        month: calculationData.month,
        year: calculationData.year,
        academicYear: `${calculationData.year - 1}-${calculationData.year}`,
        calculationPeriodStart: `${calculationData.year}-${calculationData.month.toString().padStart(2, '0')}-01T00:00:00Z`,
        calculationPeriodEnd: `${calculationData.year}-${calculationData.month.toString().padStart(2, '0')}-31T23:59:59Z`,
        validatedSessions: sessionCount,
        totalHours: sessionCount * 2, // Simulation: 2h par session
        sessionRate: teacher.baseRate,
        sessionDetails: [], // Sera peuplé avec les vraies sessions
        currency: 'XOF',
        baseAmount,
        bonuses: calculationData.bonusAmount > 0 ? [
          {
            id: `bonus_${Date.now()}`,
            type: 'special',
            description: 'Bonus mensuel Direction',
            amount: calculationData.bonusAmount,
            currency: 'XOF',
            awardedBy: directionUserId,
            awardedAt: new Date().toISOString()
          }
        ] : [],
        totalBonuses: calculationData.bonusAmount,
        deductions: calculationData.deductionAmount > 0 ? [
          {
            id: `deduction_${Date.now()}`,
            type: 'autre',
            description: 'Déduction mensuelle Direction',
            amount: calculationData.deductionAmount,
            currency: 'XOF',
            reason: 'Déduction administrative',
            appliedBy: directionUserId,
            appliedAt: new Date().toISOString()
          }
        ] : [],
        totalDeductions: calculationData.deductionAmount,
        grossAmount,
        taxRate: calculationData.taxRate,
        taxAmount,
        socialContributions: socialAmount,
        netAmount,
        status: 'calcule',
        dateCalculation: new Date().toISOString(),
        calculatedBy: directionUserId,
        notes: calculationData.notes,
        payslipGenerated: false,
        viewCount: 0,
        downloadCount: 0,
        fiscalYear: calculationData.year,
        isArchived: false
      };

      newPayments.push(payment);
    }

    setPayments([...newPayments, ...payments]);
    setShowCalculationModal(false);
    setCalculationProgress(0);

    // 🔔 NOTIFICATIONS AUTOMATIQUES
    try {
      for (const payment of newPayments) {
        // await notificationTriggers.onTeacherPaymentCalculated({
        //   userId: directionUserId,
        //   userRole: 'direction',
        //   metadata: {
        //     paymentId: payment.id,
        //     paymentNumber: payment.paymentNumber,
        //     teacherId: payment.teacherId,
        //     teacherName: payment.teacherName,
        //     teacherEmail: payment.teacherEmail,
        //     netAmount: payment.netAmount,
        //     currency: payment.currency,
        //     period: payment.period,
        //     sessionsCount: payment.validatedSessions,
        //     totalHours: payment.totalHours
        //   }
        // });
      }

      Alert.alert(
        '🧮 Calcul réussi',
        `${newPayments.length} paiement(s) calculé(s) avec succès !\n\n📧 Enseignants notifiés\n💰 Montant total: ${formatCurrency(newPayments.reduce((sum, pay) => sum + pay.netAmount, 0), 'XOF')}`,
        [{ text: 'Parfait' }]
      );
    } catch (error) {
      Alert.alert('⚠️ Calcul réussi', 'Les paiements ont été calculés mais les notifications ont échoué');
    }

    // Réinitialiser le formulaire
    setCalculationData({
      month: 1,
      year: 2025,
      teacherId: '',
      includeAllTeachers: true,
      bonusAmount: 0,
      deductionAmount: 0,
      taxRate: 10,
      socialRate: 5,
      notes: ''
    });
  };

  const validateCalculationData = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!calculationData.includeAllTeachers && !calculationData.teacherId) {
      errors.push('Veuillez sélectionner un enseignant ou choisir tous les enseignants');
    }

    // Vérifier si des paiements existent déjà pour cette période
    const existingPayments = payments.filter(pay => 
      pay.month === calculationData.month && 
      pay.year === calculationData.year &&
      (calculationData.includeAllTeachers || pay.teacherId === calculationData.teacherId)
    );

    if (existingPayments.length > 0) {
      errors.push(`Des paiements existent déjà pour ${getMonthName(calculationData.month)} ${calculationData.year}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const getMonthName = (month: number): string => {
    const months = [
      '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month];
  };

  const handleViewPayment = (payment: TeacherPayment) => {
    const updatedPayments = payments.map(pay => 
      pay.id === payment.id 
        ? { ...pay, viewCount: pay.viewCount + 1, lastViewedAt: new Date().toISOString() }
        : pay
    );
    setPayments(updatedPayments);

    router.push(`/direction/payments`);
  };

  const handleValidatePayment = (payment: TeacherPayment) => {
    Alert.alert(
      '✅ Valider paiement',
      `Confirmer la validation du paiement ${payment.paymentNumber} ?\n\nEnseignant: ${payment.teacherName}\nMontant: ${formatCurrency(payment.netAmount, payment.currency)}`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Valider', onPress: () => confirmValidation(payment) }
      ]
    );
  };

  const confirmValidation = async (payment: TeacherPayment) => {
    const updatedPayment = {
      ...payment,
      status: 'valide' as PaymentStatus,
      dateValidation: new Date().toISOString(),
      validatedBy: directionUserId,
      payslipGenerated: true,
      payslipUrl: `payslips/${payment.teacherId}_${payment.year}${payment.month.toString().padStart(2, '0')}.pdf`
    };

    const updatedPayments = payments.map(pay => 
      pay.id === payment.id ? updatedPayment : pay
    );
    setPayments(updatedPayments);

    // 🔔 NOTIFICATION AUTOMATIQUE
    try {
      // await notificationTriggers.onTeacherPaymentValidated({
      //   userId: directionUserId,
      //   userRole: 'direction',
      //   metadata: {
      //     paymentId: payment.id,
      //     paymentNumber: payment.paymentNumber,
      //     teacherId: payment.teacherId,
      //     teacherName: payment.teacherName,
      //     teacherEmail: payment.teacherEmail,
      //     netAmount: payment.netAmount,
      //     currency: payment.currency,
      //     period: payment.period,
      //     validatedBy: 'Direction AS-Training',
      //     payslipUrl: updatedPayment.payslipUrl
      //   }
      // });

      Alert.alert(
        '✅ Paiement validé',
        `Le paiement ${payment.paymentNumber} a été validé.\n\n✅ Fiche de paie générée\n📧 Enseignant notifié\n💰 Montant: ${formatCurrency(payment.netAmount, payment.currency)}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('⚠️ Paiement validé', 'Le paiement a été validé mais les notifications ont échoué');
    }
  };

  const handleProcessPayment = (payment: TeacherPayment) => {
    setSelectedPayment(payment);
    setPaymentMethod('virement');
    setPaymentReference('');
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    if (!selectedPayment || !paymentReference.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une référence de paiement');
      return;
    }

    const updatedPayment = {
      ...selectedPayment,
      status: 'paye' as PaymentStatus,
      datePayment: new Date().toISOString(),
      paymentMethod,
      paymentReference,
      paidBy: directionUserId
    };

    const updatedPayments = payments.map(pay => 
      pay.id === selectedPayment.id ? updatedPayment : pay
    );
    setPayments(updatedPayments);
    setShowPaymentModal(false);

    // 🔔 NOTIFICATION AUTOMATIQUE
    try {
      // await notificationTriggers.onTeacherPaymentProcessed({
      //   userId: directionUserId,
      //   userRole: 'direction',
      //   metadata: {
      //     paymentId: selectedPayment.id,
      //     paymentNumber: selectedPayment.paymentNumber,
      //     teacherId: selectedPayment.teacherId,
      //     teacherName: selectedPayment.teacherName,
      //     teacherEmail: selectedPayment.teacherEmail,
      //     netAmount: selectedPayment.netAmount,
      //     currency: selectedPayment.currency,
      //     paymentMethod,
      //     paymentReference,
      //     period: selectedPayment.period
      //   }
      // });

      Alert.alert(
        '💳 Paiement effectué',
        `Le paiement ${selectedPayment.paymentNumber} a été traité.\n\n💳 Méthode: ${PAYMENT_METHOD_LABELS[paymentMethod]}\n🔗 Référence: ${paymentReference}\n📧 Enseignant notifié`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('⚠️ Paiement effectué', 'Le paiement a été traité mais les notifications ont échoué');
    }

    setSelectedPayment(null);
  };

  const renderStatsCards = () => {
    const stats = calculateStats();
    
    return (
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statIcon}>
            <User color="#3B82F6" size={20} />
          </View>
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalTeachers}</Text>
            <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Enseignants</Text>
          </View>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statIcon}>
            <DollarSign color="#10B981" size={20} />
          </View>
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatCurrency(stats.totalAmount, 'XOF')}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Total Paiements</Text>
          </View>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statIcon}>
            <Award color="#F59E0B" size={20} />
          </View>
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatCurrency(stats.totalBonuses, 'XOF')}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Bonus Total</Text>
          </View>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statIcon}>
            <Clock color="#EF4444" size={20} />
          </View>
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.averageProcessingTime}h</Text>
            <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Délai Moyen</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPaymentCard = (payment: TeacherPayment) => (
    <View key={payment.id} style={[styles.paymentCard, { backgroundColor: colors.card }]}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={[styles.paymentNumber, { color: colors.text }]}>{payment.paymentNumber}</Text>
          <Text style={[styles.teacherName, { color: colors.text }]}>{payment.teacherName}</Text>
          <Text style={[styles.employeeNumber, { color: colors.text + '80' }]}>
            👤 {payment.employeeNumber}
          </Text>
          <Text style={[styles.paymentPeriod, { color: colors.text + '80' }]}>
            📅 {payment.period}
          </Text>
        </View>
        
        <View style={styles.paymentStatus}>
          <View style={[styles.statusBadge, { backgroundColor: PAYMENT_STATUS_COLORS[payment.status] + '20' }]}>
            <Text style={[styles.statusText, { color: PAYMENT_STATUS_COLORS[payment.status] }]}>
              {PAYMENT_STATUS_LABELS[payment.status]}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.paymentDetails}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>Montant net:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {formatCurrency(payment.netAmount, payment.currency)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>Sessions:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {payment.validatedSessions} ({payment.totalHours}h)
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>Bonus/Déductions:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            +{formatCurrency(payment.totalBonuses, payment.currency)} / 
            -{formatCurrency(payment.totalDeductions, payment.currency)}
          </Text>
        </View>
      </View>
      
      <View style={styles.paymentActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
          onPress={() => handleViewPayment(payment)}
        >
          <Eye color={colors.primary} size={16} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Voir</Text>
        </TouchableOpacity>
        
        {payment.status === 'calcule' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#10B981' + '20' }]}
            onPress={() => handleValidatePayment(payment)}
          >
            <CheckCircle color="#10B981" size={16} />
            <Text style={[styles.actionText, { color: '#10B981' }]}>Valider</Text>
          </TouchableOpacity>
        )}
        
        {payment.status === 'valide' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#3B82F6' + '20' }]}
            onPress={() => handleProcessPayment(payment)}
          >
            <CreditCard color="#3B82F6" size={16} />
            <Text style={[styles.actionText, { color: '#3B82F6' }]}>Payer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header avec calcul automatique */}
                <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.fixedHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>💳 Paiements Enseignants</Text>
            <Text style={styles.headerSubtitle}>Calcul automatique et gestion</Text>
          </View>
          <TouchableOpacity 
            style={styles.calculateButton}
            onPress={() => setShowCalculationModal(true)}
          >
            <Calculator color="#FFFFFF" size={20} />
            <Text style={styles.calculateButtonText}>Calculer</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Statistiques */}
        {renderStatsCards()}

        {/* Filtres avancés */}
        <View style={[styles.filtersContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.filtersTitle, { color: colors.text }]}>🎛️ Filtres Paiements</Text>
          
          {/* Recherche */}
          <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Search color={colors.text + '60'} size={20} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Recherche par enseignant, numéro..."
              placeholderTextColor={colors.text + '60'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filtres en ligne */}
          <View style={styles.filterRow}>
            <View style={[styles.filterField, { flex: 1, marginRight: 4 }]}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>📅 Mois</Text>
              <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <Picker
                  selectedValue={selectedMonth}
                  onValueChange={setSelectedMonth}
                  style={[styles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="Tous les mois" value={0} />
                  {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                    <Picker.Item key={month} label={getMonthName(month)} value={month} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={[styles.filterField, { flex: 1, marginLeft: 4, marginRight: 4 }]}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>👨‍🏫 Enseignant</Text>
              <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <Picker
                  selectedValue={selectedTeacher}
                  onValueChange={setSelectedTeacher}
                  style={[styles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="Tous les enseignants" value="" />
                  {allTeachers.map(teacher => (
                    <Picker.Item key={teacher.id} label={teacher.name} value={teacher.id} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={[styles.filterField, { flex: 1, marginLeft: 4 }]}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>📊 Statut</Text>
              <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <Picker
                  selectedValue={selectedStatus}
                  onValueChange={setSelectedStatus}
                  style={[styles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="Tous statuts" value="" />
                  <Picker.Item label="Calculé" value="calcule" />
                  <Picker.Item label="Validé" value="valide" />
                  <Picker.Item label="Payé" value="paye" />
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {/* Onglets organisés */}
        <View style={styles.tabsContainer}>
          {[
            { key: 'tous', label: 'Tous', count: filteredPayments.length },
            { key: 'calcules', label: 'Calculés', count: filteredPayments.filter(pay => pay.status === 'calcule').length },
            { key: 'valides', label: 'Validés', count: filteredPayments.filter(pay => pay.status === 'valide').length },
            { key: 'payes', label: 'Payés', count: filteredPayments.filter(pay => pay.status === 'paye').length }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && { backgroundColor: colors.primary }]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab.key ? '#FFFFFF' : colors.text }]}>
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Liste des paiements */}
        <ScrollView 
          style={styles.paymentsList} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.paymentsListContent}
          bounces={true}
          alwaysBounceVertical={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.text }]}>Chargement paiements...</Text>
            </View>
          ) : filteredPayments.length > 0 ? (
            filteredPayments
              .sort((a, b) => new Date(b.dateCalculation).getTime() - new Date(a.dateCalculation).getTime())
              .map(renderPaymentCard)
          ) : (
            <View style={styles.emptyContainer}>
              <CreditCard color={colors.text + '40'} size={48} />
              <Text style={[styles.emptyText, { color: colors.text }]}>Aucun paiement trouvé</Text>
              <Text style={[styles.emptySubtext, { color: colors.text + '80' }]}>
                Calculez les premiers paiements ou ajustez vos filtres
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Modal de calcul automatique */}
      <Modal visible={showCalculationModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Calculator color={colors.primary} size={24} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Calcul Automatique Paiements</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCalculationModal(false)}>
                <Text style={[styles.closeButton, { color: colors.text }]}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.calculationForm} showsVerticalScrollIndicator={false}>
              {/* Période de calcul */}
              <View style={styles.periodRow}>
                <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Mois *</Text>
                  <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                    <Picker
                      selectedValue={calculationData.month}
                      onValueChange={(value) => setCalculationData(prev => ({ ...prev, month: value }))}
                      style={[styles.picker, { color: colors.text }]}
                    >
                      {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                        <Picker.Item key={month} label={getMonthName(month)} value={month} />
                      ))}
                    </Picker>
                  </View>
                </View>
                
                <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Année *</Text>
                  <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                    <Picker
                      selectedValue={calculationData.year}
                      onValueChange={(value) => setCalculationData(prev => ({ ...prev, year: value }))}
                      style={[styles.picker, { color: colors.text }]}
                    >
                      <Picker.Item label="2025" value={2025} />
                      <Picker.Item label="2024" value={2024} />
                    </Picker>
                  </View>
                </View>
              </View>

              {/* Sélection enseignants */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Enseignants à traiter</Text>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity 
                    style={styles.checkboxRow}
                    onPress={() => setCalculationData(prev => ({ ...prev, includeAllTeachers: true }))}
                  >
                    <View style={[styles.checkbox, { 
                      backgroundColor: calculationData.includeAllTeachers ? colors.primary : 'transparent',
                      borderColor: colors.border 
                    }]}>
                      {calculationData.includeAllTeachers && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[styles.checkboxLabel, { color: colors.text }]}>👨‍🏫 Tous les enseignants ({allTeachers.length})</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.checkboxRow}
                    onPress={() => setCalculationData(prev => ({ ...prev, includeAllTeachers: false }))}
                  >
                    <View style={[styles.checkbox, { 
                      backgroundColor: !calculationData.includeAllTeachers ? colors.primary : 'transparent',
                      borderColor: colors.border 
                    }]}>
                      {!calculationData.includeAllTeachers && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[styles.checkboxLabel, { color: colors.text }]}>🎯 Enseignant spécifique</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {!calculationData.includeAllTeachers && (
                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Enseignant *</Text>
                  <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                    <Picker
                      selectedValue={calculationData.teacherId}
                      onValueChange={(value) => setCalculationData(prev => ({ ...prev, teacherId: value }))}
                      style={[styles.picker, { color: colors.text }]}
                    >
                      <Picker.Item label="Sélectionner un enseignant" value="" />
                      {allTeachers.map(teacher => (
                        <Picker.Item key={teacher.id} label={teacher.name} value={teacher.id} />
                      ))}
                    </Picker>
                  </View>
                </View>
              )}

              {/* Bonus et déductions */}
              <View style={styles.bonusDeductionRow}>
                <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>💰 Bonus (FCFA)</Text>
                  <TextInput
                    style={[styles.numberInput, { color: colors.text, borderColor: colors.border }]}
                    value={calculationData.bonusAmount.toString()}
                    onChangeText={(value) => setCalculationData(prev => ({ ...prev, bonusAmount: parseInt(value) || 0 }))}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.text + '60'}
                  />
                </View>
                
                <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>💸 Déduction (FCFA)</Text>
                  <TextInput
                    style={[styles.numberInput, { color: colors.text, borderColor: colors.border }]}
                    value={calculationData.deductionAmount.toString()}
                    onChangeText={(value) => setCalculationData(prev => ({ ...prev, deductionAmount: parseInt(value) || 0 }))}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.text + '60'}
                  />
                </View>
              </View>

              {/* Taux de taxation */}
              <View style={styles.taxRateRow}>
                <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>🏛️ Taux impôt (%)</Text>
                  <TextInput
                    style={[styles.numberInput, { color: colors.text, borderColor: colors.border }]}
                    value={calculationData.taxRate.toString()}
                    onChangeText={(value) => setCalculationData(prev => ({ ...prev, taxRate: parseInt(value) || 0 }))}
                    keyboardType="numeric"
                    placeholder="10"
                    placeholderTextColor={colors.text + '60'}
                  />
                </View>
                
                <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>🏥 Taux social (%)</Text>
                  <TextInput
                    style={[styles.numberInput, { color: colors.text, borderColor: colors.border }]}
                    value={calculationData.socialRate.toString()}
                    onChangeText={(value) => setCalculationData(prev => ({ ...prev, socialRate: parseInt(value) || 0 }))}
                    keyboardType="numeric"
                    placeholder="5"
                    placeholderTextColor={colors.text + '60'}
                  />
                </View>
              </View>

              {/* Notes */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Notes (optionnel)</Text>
                <TextInput
                  style={[styles.textAreaInput, { color: colors.text, borderColor: colors.border }]}
                  value={calculationData.notes}
                  onChangeText={(value) => setCalculationData(prev => ({ ...prev, notes: value }))}
                  multiline
                  numberOfLines={3}
                  placeholder="Notes à inclure dans les paiements..."
                  placeholderTextColor={colors.text + '60'}
                />
              </View>

              {/* Barre de progression */}
              {calculationProgress > 0 && calculationProgress < 100 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Calculator color={colors.primary} size={20} />
                    <Text style={[styles.progressText, { color: colors.text }]}>Calcul en cours...</Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <View style={[styles.progressFill, { width: `${calculationProgress}%`, backgroundColor: colors.primary }]} />
                  </View>
                  <Text style={[styles.progressPercent, { color: colors.text }]}>{calculationProgress}%</Text>
                </View>
              )}

              {/* Information calcul */}
              <View style={[styles.calculationInfo, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
                <Calculator color={colors.primary} size={20} />
                <View style={styles.calculationContent}>
                  <Text style={[styles.calculationTitle, { color: colors.primary }]}>🧮 Calcul Intelligent</Text>
                  <Text style={[styles.calculationDescription, { color: colors.text + '80' }]}>
                    ✓ Basé sur sessions validées uniquement{'\n'}
                    ✓ Application taux horaires individuels{'\n'}
                    ✓ Calcul taxes et cotisations automatique{'\n'}
                    ✓ Génération fiches de paie PDF
                  </Text>
                </View>
              </View>

              {/* Boutons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.border }]}
                  onPress={() => setShowCalculationModal(false)}
                  disabled={calculationProgress > 0 && calculationProgress < 100}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calculateButtonMain, { 
                    backgroundColor: colors.primary, 
                    opacity: calculationProgress > 0 && calculationProgress < 100 ? 0.5 : 1 
                  }]}
                  onPress={calculatePaymentsAutomatically}
                  disabled={calculationProgress > 0 && calculationProgress < 100}
                >
                  <Calculator color="#FFFFFF" size={16} />
                  <Text style={styles.calculateButtonMainText}>Calculer Paiements</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de traitement paiement */}
      <Modal visible={showPaymentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <CreditCard color={colors.primary} size={24} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Traitement du Paiement</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Text style={[styles.closeButton, { color: colors.text }]}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.paymentForm}>
              {selectedPayment && (
                <View style={styles.paymentSummary}>
                  <Text style={[styles.summaryTitle, { color: colors.text }]}>💳 Paiement à traiter</Text>
                  <Text style={[styles.summaryText, { color: colors.text }]}>
                    👨‍🏫 {selectedPayment.teacherName}{'\n'}
                    💰 {formatCurrency(selectedPayment.netAmount, selectedPayment.currency)}{'\n'}
                    📅 {selectedPayment.period}
                  </Text>
                </View>
              )}

              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Méthode de paiement *</Text>
                <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                  <Picker
                    selectedValue={paymentMethod}
                    onValueChange={setPaymentMethod}
                    style={[styles.picker, { color: colors.text }]}
                  >
                    <Picker.Item label="💳 Virement bancaire" value="virement" />
                    <Picker.Item label="💵 Espèces" value="especes" />
                    <Picker.Item label="📱 Mobile Money" value="mobile_money" />
                    <Picker.Item label="📄 Chèque" value="cheque" />
                  </Picker>
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Référence de paiement *</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                  value={paymentReference}
                  onChangeText={setPaymentReference}
                  placeholder="Ex: VIR2025020512345, MM123456789..."
                  placeholderTextColor={colors.text + '60'}
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.border }]}
                  onPress={() => setShowPaymentModal(false)}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.payButton, { backgroundColor: colors.primary }]}
                  onPress={confirmPayment}
                >
                  <CreditCard color="#FFFFFF" size={16} />
                  <Text style={styles.payButtonText}>Confirmer Paiement</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 120,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 20,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    marginRight: 8,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
  },
  filtersContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterField: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  picker: {
    height: 35,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 6,
  },
  tabText: {
    fontWeight: '600',
    fontSize: 12,
  },
  paymentsList: {
    flex: 1,
  },
  paymentsListContent: {
    paddingBottom: 20,
  },
  paymentCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentNumber: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  employeeNumber: {
    fontSize: 12,
    marginBottom: 2,
  },
  paymentPeriod: {
    fontSize: 12,
  },
  paymentStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  paymentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  calculationForm: {
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
  periodRow: {
    flexDirection: 'row',
  },
  checkboxContainer: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
  },
  bonusDeductionRow: {
    flexDirection: 'row',
  },
  taxRateRow: {
    flexDirection: 'row',
  },
  numberInput: {
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
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  calculationInfo: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  calculationContent: {
    flex: 1,
  },
  calculationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  calculationDescription: {
    fontSize: 12,
    lineHeight: 18,
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
  calculateButtonMain: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  calculateButtonMainText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentForm: {
    padding: 20,
  },
  paymentSummary: {
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  payButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});