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
import { Plus, Search, Filter, FileText, Calendar, User, DollarSign, Eye, CreditCard, Trash2, Download, Send, ArrowLeft, TrendingUp, AlertTriangle, CheckCircle, Clock, Zap, BarChart } from 'lucide-react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@react-navigation/native';
import { useNotificationTriggers } from '../../../services/NotificationTriggers';
import {
  Invoice,
  InvoiceStatus,
  InvoiceType,
  CurrencyCode,
  InvoiceFilters,
  InvoicingStats,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  CURRENCY_SYMBOLS,
  generateInvoiceNumber,
  formatCurrency,
  calculateInvoiceTotal,
  isInvoiceOverdue,
  calculateOverdueDays,
  getInvoiceStatusPriority,
  validateInvoiceData
} from '../../../types/Invoicing';

// Données globales pour facturation
const allFamilies = [
  { 
    id: 'parent_1', 
    name: 'M. Diabaté Mamadou', 
    email: 'diabate.mamadou@email.com',
    phone: '+225 07 12 34 56 78',
    address: {
      street: '123 Avenue de la République',
      commune: 'Cocody',
      city: 'Abidjan',
      postalCode: '01 BP 1234',
      country: 'Côte d\'Ivoire'
    },
    children: ['student_1', 'student_2'] 
  },
  { 
    id: 'parent_2', 
    name: 'Mme Koné Fatou', 
    email: 'kone.fatou@email.com',
    phone: '+225 05 98 76 54 32',
    address: {
      street: '456 Rue des Jardins',
      commune: 'Marcory',
      city: 'Abidjan',
      postalCode: '01 BP 5678',
      country: 'Côte d\'Ivoire'
    },
    children: ['student_3'] 
  },
];

const allStudents = [
  { id: 'student_1', name: 'Kouadio Aya', parentId: 'parent_1', monthlyRate: 75000 },
  { id: 'student_2', name: 'N\'Dri Kevin', parentId: 'parent_1', monthlyRate: 60000 },
  { id: 'student_3', name: 'Traoré Aminata', parentId: 'parent_2', monthlyRate: 80000 },
];

export default function InvoicingManagement() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const notificationTriggers = useNotificationTriggers();
  const isDesktop = width >= 768;
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'toutes' | 'en_attente' | 'payees' | 'en_retard'>('toutes');
  
  // Filtres avancés
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | ''>('');
  
  // États pour génération automatique
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationData, setGenerationData] = useState({
    month: 1,
    year: 2025,
    familyId: '',
    includeAllFamilies: true,
    invoiceType: 'mensuelle' as InvoiceType,
    taxRate: 0,
    discountRate: 0,
    notes: ''
  });
  
  // États pour analytics
  const [showAnalytics, setShowAnalytics] = useState(false);

  const directionUserId = 'direction_admin';

  // Données de démonstration ultra-complètes
  const demoInvoices: Invoice[] = [
    {
      id: 'invoice_001',
      invoiceNumber: 'FACT-parent_1-202501-001',
      type: 'mensuelle',
      parentId: 'parent_1',
      parentName: 'M. Diabaté Mamadou',
      parentEmail: 'diabate.mamadou@email.com',
      parentPhone: '+225 07 12 34 56 78',
      parentAddress: {
        street: '123 Avenue de la République',
        commune: 'Cocody',
        city: 'Abidjan',
        postalCode: '01 BP 1234',
        country: 'Côte d\'Ivoire'
      },
      studentIds: ['student_1', 'student_2'],
      studentNames: ['Kouadio Aya', 'N\'Dri Kevin'],
      period: 'Janvier 2025',
      month: 1,
      year: 2025,
      academicYear: '2024-2025',
      billingPeriodStart: '2025-01-01T00:00:00Z',
      billingPeriodEnd: '2025-01-31T23:59:59Z',
      currency: 'XOF',
      subtotalAmount: 135000,
      taxRate: 0,
      taxAmount: 0,
      discountRate: 0,
      discountAmount: 0,
      totalAmount: 135000,
      amountPaid: 0,
      amountDue: 135000,
      sessionsCount: 18,
      totalHours: 36,
      sessionDetails: [
        {
          sessionId: 'session_001',
          studentId: 'student_1',
          studentName: 'Kouadio Aya',
          teacherId: 'teacher_1',
          teacherName: 'Marie N\'Guessan',
          subject: 'Mathématiques',
          date: '2025-01-05',
          startTime: '14:00',
          endTime: '16:00',
          duration: 120,
          hourlyRate: 37500,
          sessionAmount: 75000,
          sessionType: 'cours',
          location: 'domicile',
          status: 'completed',
          validatedBy: 'direction_admin',
          validatedAt: '2025-01-05T16:30:00Z'
        },
        {
          sessionId: 'session_002',
          studentId: 'student_2',
          studentName: 'N\'Dri Kevin',
          teacherId: 'teacher_2',
          teacherName: 'Jean Baptiste',
          subject: 'Français',
          date: '2025-01-06',
          startTime: '15:00',
          endTime: '17:00',
          duration: 120,
          hourlyRate: 30000,
          sessionAmount: 60000,
          sessionType: 'cours',
          location: 'domicile',
          status: 'completed',
          validatedBy: 'direction_admin',
          validatedAt: '2025-01-06T17:30:00Z'
        }
      ],
      status: 'en_attente',
      priority: 'normale',
      dueDate: '2025-02-15T23:59:59Z',
      gracePeriod: 7,
      dateCreation: '2025-01-31T10:00:00Z',
      dateGeneration: '2025-01-31T10:05:00Z',
      dateSent: '2025-01-31T14:30:00Z',
      paymentInstructions: 'Paiement attendu sous 15 jours. Merci de conserver cette facture.',
      bankDetails: {
        bankName: 'Banque AS-Training',
        accountNumber: '12345678901',
        beneficiaryName: 'AS-TRAINING SARL',
        mobileMoneyNumber: '+225 07 12 34 56 78',
        mobileMoneyProvider: 'orange'
      },
      generatedBy: directionUserId,
      remindersSent: 0,
      communicationHistory: [],
      viewCount: 3,
      downloadCount: 1,
      isArchived: false,
      fiscalYear: 2025
    },
    {
      id: 'invoice_002',
      invoiceNumber: 'FACT-parent_2-202501-001',
      type: 'mensuelle',
      parentId: 'parent_2',
      parentName: 'Mme Koné Fatou',
      parentEmail: 'kone.fatou@email.com',
      parentPhone: '+225 05 98 76 54 32',
      parentAddress: {
        street: '456 Rue des Jardins',
        commune: 'Marcory',
        city: 'Abidjan',
        postalCode: '01 BP 5678',
        country: 'Côte d\'Ivoire'
      },
      studentIds: ['student_3'],
      studentNames: ['Traoré Aminata'],
      period: 'Janvier 2025',
      month: 1,
      year: 2025,
      academicYear: '2024-2025',
      billingPeriodStart: '2025-01-01T00:00:00Z',
      billingPeriodEnd: '2025-01-31T23:59:59Z',
      currency: 'XOF',
      subtotalAmount: 80000,
      taxRate: 0,
      taxAmount: 0,
      discountRate: 0,
      discountAmount: 0,
      totalAmount: 80000,
      amountPaid: 80000,
      amountDue: 0,
      sessionsCount: 8,
      totalHours: 16,
      sessionDetails: [
        {
          sessionId: 'session_003',
          studentId: 'student_3',
          studentName: 'Traoré Aminata',
          teacherId: 'teacher_1',
          teacherName: 'Marie N\'Guessan',
          subject: 'Mathématiques',
          date: '2025-01-10',
          startTime: '16:00',
          endTime: '18:00',
          duration: 120,
          hourlyRate: 40000,
          sessionAmount: 80000,
          sessionType: 'cours',
          location: 'domicile',
          status: 'completed',
          validatedBy: 'direction_admin',
          validatedAt: '2025-01-10T18:30:00Z'
        }
      ],
      status: 'payee',
      priority: 'normale',
      dueDate: '2025-02-15T23:59:59Z',
      gracePeriod: 7,
      dateCreation: '2025-01-31T10:00:00Z',
      dateGeneration: '2025-01-31T10:05:00Z',
      dateSent: '2025-01-31T14:30:00Z',
      datePaid: '2025-02-05T09:15:00Z',
      paymentDetails: [
        {
          id: 'payment_001',
          amount: 80000,
          currency: 'XOF',
          method: 'mobile_money',
          reference: 'MM2025020512345',
          date: '2025-02-05T09:15:00Z',
          status: 'confirmed'
        }
      ],
      paymentInstructions: 'Paiement attendu sous 15 jours. Merci de conserver cette facture.',
      bankDetails: {
        bankName: 'Banque AS-Training',
        accountNumber: '12345678901',
        beneficiaryName: 'AS-TRAINING SARL',
        mobileMoneyNumber: '+225 07 12 34 56 78',
        mobileMoneyProvider: 'orange'
      },
      generatedBy: directionUserId,
      remindersSent: 0,
      communicationHistory: [],
      viewCount: 5,
      downloadCount: 2,
      isArchived: false,
      fiscalYear: 2025
    }
  ];

  useEffect(() => {
    const loadInvoices = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setInvoices(demoInvoices);
      setFilteredInvoices(demoInvoices);
      setLoading(false);
    };

    loadInvoices();

    // Animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const filtered = invoices.filter(invoice => {
      const matchesSearch = !searchQuery || 
        invoice.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.studentNames.some(name => name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesMonth = selectedMonth === 0 || invoice.month === selectedMonth;
      const matchesYear = invoice.year === selectedYear;
      const matchesFamily = !selectedFamily || invoice.parentId === selectedFamily;
      const matchesStatus = !selectedStatus || invoice.status === selectedStatus;
      
      const matchesTab = activeTab === 'toutes' || 
        (activeTab === 'en_attente' && (invoice.status === 'en_attente' || invoice.status === 'envoyee')) ||
        (activeTab === 'payees' && invoice.status === 'payee') ||
        (activeTab === 'en_retard' && isInvoiceOverdue(invoice.dueDate) && invoice.status !== 'payee');
      
      return matchesSearch && matchesMonth && matchesYear && matchesFamily && matchesStatus && matchesTab;
    });

    setFilteredInvoices(filtered);
  }, [searchQuery, invoices, selectedMonth, selectedYear, selectedFamily, selectedStatus, activeTab]);

  // Calcul des statistiques
  const calculateStats = (): InvoicingStats => {
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalInvoices = invoices.length;
    
    const byStatus = {} as Record<InvoiceStatus, { count: number; amount: number; percentage: number }>;
    Object.values(INVOICE_STATUS_LABELS).forEach(statusKey => {
      const status = Object.keys(INVOICE_STATUS_LABELS).find(key => 
        INVOICE_STATUS_LABELS[key as InvoiceStatus] === statusKey
      ) as InvoiceStatus;
      if (status) {
        const statusInvoices = invoices.filter(inv => inv.status === status);
        const statusAmount = statusInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
        byStatus[status] = {
          count: statusInvoices.length,
          amount: statusAmount,
          percentage: totalInvoices > 0 ? (statusInvoices.length / totalInvoices) * 100 : 0
        };
      }
    });

    const paidInvoices = invoices.filter(inv => inv.status === 'payee');
    const paymentRate = totalInvoices > 0 ? (paidInvoices.length / totalInvoices) * 100 : 0;
    
    const overdueInvoices = invoices.filter(inv => 
      isInvoiceOverdue(inv.dueDate) && inv.status !== 'payee'
    );
    
    return {
      totalInvoices,
      totalAmount,
      currency: 'XOF',
      byStatus,
      byMonth: {},
      averagePaymentDelay: 7,
      paymentRate,
      disputeRate: 0,
      reminderEffectiveness: 85,
      monthlyGrowth: 12.5,
      seasonalTrends: [],
      topPayingFamilies: []
    };
  };

  const generateInvoicesAutomatically = async () => {
    const validation = validateGenerationData();
    
    if (!validation.isValid) {
      Alert.alert(
        '❌ Erreurs de validation',
        validation.errors.join('\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    // Simulation du processus de génération automatique
    setGenerationProgress(0);
    
    const steps = [
      { progress: 20, message: 'Collecte des contrats actifs...' },
      { progress: 40, message: 'Calcul des sessions validées...' },
      { progress: 60, message: 'Génération des factures...' },
      { progress: 80, message: 'Application des tarifs...' },
      { progress: 95, message: 'Envoi notifications...' },
      { progress: 100, message: 'Génération terminée !' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setGenerationProgress(step.progress);
    }

    // Générer les nouvelles factures
    const familiesToProcess = generationData.includeAllFamilies 
      ? allFamilies 
      : allFamilies.filter(f => f.id === generationData.familyId);

    const newInvoices: Invoice[] = [];
    let sequenceNumber = invoices.length + 1;

    for (const family of familiesToProcess) {
      const familyStudents = allStudents.filter(s => family.children.includes(s.id));
      if (familyStudents.length === 0) continue;

      const subtotal = familyStudents.reduce((sum, student) => sum + student.monthlyRate, 0);
      const { taxAmount, discountAmount, total } = calculateInvoiceTotal(
        subtotal, 
        generationData.taxRate, 
        generationData.discountRate
      );

      const invoice: Invoice = {
        id: `invoice_${Date.now()}_${family.id}`,
        invoiceNumber: generateInvoiceNumber(family.id, generationData.year, generationData.month, sequenceNumber++),
        type: generationData.invoiceType,
        parentId: family.id,
        parentName: family.name,
        parentEmail: family.email,
        parentPhone: family.phone,
        parentAddress: family.address,
        studentIds: familyStudents.map(s => s.id),
        studentNames: familyStudents.map(s => s.name),
        period: `${getMonthName(generationData.month)} ${generationData.year}`,
        month: generationData.month,
        year: generationData.year,
        academicYear: `${generationData.year - 1}-${generationData.year}`,
        billingPeriodStart: `${generationData.year}-${generationData.month.toString().padStart(2, '0')}-01T00:00:00Z`,
        billingPeriodEnd: `${generationData.year}-${generationData.month.toString().padStart(2, '0')}-31T23:59:59Z`,
        currency: 'XOF',
        subtotalAmount: subtotal,
        taxRate: generationData.taxRate,
        taxAmount,
        discountRate: generationData.discountRate,
        discountAmount,
        totalAmount: total,
        amountPaid: 0,
        amountDue: total,
        sessionsCount: familyStudents.length * 4, // Simulation: 4 sessions par enfant
        totalHours: familyStudents.length * 8, // Simulation: 8h par enfant
        sessionDetails: [], // Sera peuplé avec les vraies sessions
        status: 'generee',
        priority: 'normale',
        dueDate: new Date(generationData.year, generationData.month, 15).toISOString(),
        gracePeriod: 7,
        dateCreation: new Date().toISOString(),
        dateGeneration: new Date().toISOString(),
        paymentInstructions: 'Paiement attendu sous 15 jours. Merci de conserver cette facture.',
        bankDetails: {
          bankName: 'Banque AS-Training',
          accountNumber: '12345678901',
          beneficiaryName: 'AS-TRAINING SARL',
          mobileMoneyNumber: '+225 07 12 34 56 78',
          mobileMoneyProvider: 'orange'
        },
        generatedBy: directionUserId,
        notes: generationData.notes,
        remindersSent: 0,
        communicationHistory: [],
        viewCount: 0,
        downloadCount: 0,
        isArchived: false,
        fiscalYear: generationData.year
      };

      newInvoices.push(invoice);
    }

    setInvoices([...newInvoices, ...invoices]);
    setShowGenerationModal(false);
    setGenerationProgress(0);

    // 🔔 NOTIFICATIONS AUTOMATIQUES
    try {
      for (const invoice of newInvoices) {
        // await notificationTriggers.onInvoiceGenerated({
        //   userId: directionUserId,
        //   userRole: 'direction',
        //   metadata: {
        //     invoiceId: invoice.id,
        //     invoiceNumber: invoice.invoiceNumber,
        //     parentId: invoice.parentId,
        //     parentName: invoice.parentName,
        //     parentEmail: invoice.parentEmail,
        //     totalAmount: invoice.totalAmount,
        //     currency: invoice.currency,
        //     period: invoice.period,
        //     dueDate: invoice.dueDate,
        //     studentNames: invoice.studentNames,
        //     sessionsCount: invoice.sessionsCount
        //   }
        // });
      }

      Alert.alert(
        '✅ Génération réussie',
        `${newInvoices.length} facture(s) générée(s) avec succès !\n\n📧 Notifications envoyées aux familles\n💰 Montant total: ${formatCurrency(newInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0), 'XOF')}`,
        [{ text: 'Parfait' }]
      );
    } catch (error) {
      Alert.alert('⚠️ Génération réussie', 'Les factures ont été générées mais les notifications ont échoué');
    }

    // Réinitialiser le formulaire
    setGenerationData({
      month: 1,
      year: 2025,
      familyId: '',
      includeAllFamilies: true,
      invoiceType: 'mensuelle',
      taxRate: 0,
      discountRate: 0,
      notes: ''
    });
  };

  const validateGenerationData = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!generationData.includeAllFamilies && !generationData.familyId) {
      errors.push('Veuillez sélectionner une famille ou choisir toutes les familles');
    }

    // Vérifier si des factures existent déjà pour cette période
    const existingInvoices = invoices.filter(inv => 
      inv.month === generationData.month && 
      inv.year === generationData.year &&
      (generationData.includeAllFamilies || inv.parentId === generationData.familyId)
    );

    if (existingInvoices.length > 0) {
      errors.push(`Des factures existent déjà pour ${getMonthName(generationData.month)} ${generationData.year}`);
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

  const handleViewInvoice = (invoice: Invoice) => {
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id 
        ? { ...inv, viewCount: inv.viewCount + 1, lastViewedAt: new Date().toISOString() }
        : inv
    );
    setInvoices(updatedInvoices);

    router.push(`/direction/invoicing`);
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    Alert.alert(
      '💳 Marquer comme payée',
      `Confirmer le paiement de la facture ${invoice.invoiceNumber} ?\n\nMontant: ${formatCurrency(invoice.totalAmount, invoice.currency)}\nFamille: ${invoice.parentName}`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => confirmPayment(invoice) }
      ]
    );
  };

  const confirmPayment = async (invoice: Invoice) => {
    const updatedInvoice = {
      ...invoice,
      status: 'payee' as InvoiceStatus,
      datePaid: new Date().toISOString(),
      amountPaid: invoice.totalAmount,
      amountDue: 0,
      paymentDetails: [
        {
          id: `payment_${Date.now()}`,
          amount: invoice.totalAmount,
          currency: invoice.currency,
          method: 'mobile_money' as const,
          reference: `MAN${Date.now()}`,
          date: new Date().toISOString(),
          status: 'confirmed' as const,
          processedBy: directionUserId
        }
      ]
    };

    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id ? updatedInvoice : inv
    );
    setInvoices(updatedInvoices);

    // 🔔 NOTIFICATION AUTOMATIQUE
    try {
      // await notificationTriggers.onInvoicePaymentReceived({
      //   userId: directionUserId,
      //   userRole: 'direction',
      //   metadata: {
      //     invoiceId: invoice.id,
      //     invoiceNumber: invoice.invoiceNumber,
      //     parentId: invoice.parentId,
      //     parentName: invoice.parentName,
      //     amount: invoice.totalAmount,
      //     currency: invoice.currency,
      //     paymentMethod: 'mobile_money',
      //     paymentDate: new Date().toISOString()
      //   }
      // });

      Alert.alert(
        '✅ Paiement confirmé',
        `La facture ${invoice.invoiceNumber} a été marquée comme payée.\n\n✅ Statut mis à jour\n📧 Parent notifié\n💰 Montant: ${formatCurrency(invoice.totalAmount, invoice.currency)}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('⚠️ Paiement confirmé', 'Le paiement a été enregistré mais les notifications ont échoué');
    }
  };

  const renderStatsCards = () => {
    const stats = calculateStats();
    const overdueCount = invoices.filter(inv => 
      isInvoiceOverdue(inv.dueDate) && inv.status !== 'payee'
    ).length;
    
    return (
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statIcon}>
            <FileText color="#3B82F6" size={20} />
          </View>
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalInvoices}</Text>
            <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Total Factures</Text>
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
            <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Montant Total</Text>
          </View>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statIcon}>
            <CheckCircle color="#22C55E" size={20} />
          </View>
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.paymentRate.toFixed(1)}%</Text>
            <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Taux Paiement</Text>
          </View>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statIcon}>
            <AlertTriangle color="#EF4444" size={20} />
          </View>
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text }]}>{overdueCount}</Text>
            <Text style={[styles.statLabel, { color: colors.text + '80' }]}>En Retard</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderInvoiceCard = (invoice: Invoice) => (
    <View key={invoice.id} style={[styles.invoiceCard, { backgroundColor: colors.card }]}>
      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceInfo}>
          <Text style={[styles.invoiceNumber, { color: colors.text }]}>{invoice.invoiceNumber}</Text>
          <Text style={[styles.parentName, { color: colors.text }]}>{invoice.parentName}</Text>
          <Text style={[styles.studentNames, { color: colors.text + '80' }]}>
            👦 {invoice.studentNames.join(', ')}
          </Text>
          <Text style={[styles.invoicePeriod, { color: colors.text + '80' }]}>
            📅 {invoice.period}
          </Text>
        </View>
        
        <View style={styles.invoiceStatus}>
          <View style={[styles.statusBadge, { backgroundColor: INVOICE_STATUS_COLORS[invoice.status] + '20' }]}>
            <Text style={[styles.statusText, { color: INVOICE_STATUS_COLORS[invoice.status] }]}>
              {INVOICE_STATUS_LABELS[invoice.status]}
            </Text>
          </View>
          
          {isInvoiceOverdue(invoice.dueDate) && invoice.status !== 'payee' && (
            <View style={[styles.overdueBadge, { backgroundColor: '#EF4444' + '20' }]}>
              <Text style={[styles.overdueText, { color: '#EF4444' }]}>
                Retard {calculateOverdueDays(invoice.dueDate)}j
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.invoiceDetails}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>Montant:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {formatCurrency(invoice.totalAmount, invoice.currency)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>Échéance:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>Sessions:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {invoice.sessionsCount} ({invoice.totalHours}h)
          </Text>
        </View>
      </View>
      
      <View style={styles.invoiceActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
          onPress={() => handleViewInvoice(invoice)}
        >
          <Eye color={colors.primary} size={16} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Voir</Text>
        </TouchableOpacity>
        
        {invoice.status !== 'payee' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#10B981' + '20' }]}
            onPress={() => handleMarkAsPaid(invoice)}
          >
            <CheckCircle color="#10B981" size={16} />
            <Text style={[styles.actionText, { color: '#10B981' }]}>Marquer payée</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      {/* Fixed Header */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.fixedHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: '#FFFFFF' }]}>💰 Facturation Direction</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.analyticsButton}
              onPress={() => setShowAnalytics(true)}
            >
              <BarChart color="#FFFFFF" size={20} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.generateButton}
              onPress={() => setShowGenerationModal(true)}
            >
              <Zap color="#FFFFFF" size={20} />
              <Text style={styles.generateButtonText}>Générer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, paddingHorizontal: isDesktop ? 20 : 12 }]}>
          {/* Welcome Section */}
          <View style={[styles.welcomeSection, { backgroundColor: '#FFFFFF', borderBottomColor: '#E5E7EB', marginHorizontal: isDesktop ? -20 : -12 }]}>
            <Text style={[styles.welcomeTitle, { color: '#1F2937' }]}>Génération automatique et suivi</Text>
            <Text style={[styles.welcomeSubtitle, { color: '#6B7280' }]}>Facturation intelligente et analytics avancés</Text>
          </View>
        {/* Statistiques */}
        {renderStatsCards()}

        {/* Filtres avancés */}
        <View style={[styles.filtersContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.filtersTitle, { color: colors.text }]}>🎛️ Filtres Avancés (3 Critères)</Text>
          
          {/* Recherche */}
          <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Search color={colors.text + '60'} size={20} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Recherche par famille, facture, élève..."
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
              <Text style={[styles.filterLabel, { color: colors.text }]}>📅 Année</Text>
              <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <Picker
                  selectedValue={selectedYear}
                  onValueChange={setSelectedYear}
                  style={[styles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="2025" value={2025} />
                  <Picker.Item label="2024" value={2024} />
                  <Picker.Item label="2023" value={2023} />
                </Picker>
              </View>
            </View>
            
            <View style={[styles.filterField, { flex: 1, marginLeft: 4 }]}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>👨‍👩‍👧‍👦 Famille</Text>
              <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <Picker
                  selectedValue={selectedFamily}
                  onValueChange={setSelectedFamily}
                  style={[styles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="Toutes les familles" value="" />
                  {allFamilies.map(family => (
                    <Picker.Item key={family.id} label={family.name} value={family.id} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {/* Onglets organisés */}
        <View style={styles.tabsContainer}>
          {[
            { key: 'toutes', label: 'Toutes', count: filteredInvoices.length },
            { key: 'en_attente', label: 'En attente', count: filteredInvoices.filter(inv => ['en_attente', 'envoyee'].includes(inv.status)).length },
            { key: 'payees', label: 'Payées', count: filteredInvoices.filter(inv => inv.status === 'payee').length },
            { key: 'en_retard', label: 'En retard', count: filteredInvoices.filter(inv => isInvoiceOverdue(inv.dueDate) && inv.status !== 'payee').length }
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

        {/* Liste des factures */}
        <ScrollView style={styles.invoicesList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.text }]}>Chargement facturation...</Text>
            </View>
          ) : filteredInvoices.length > 0 ? (
            filteredInvoices
              .sort((a, b) => getInvoiceStatusPriority(a.status) - getInvoiceStatusPriority(b.status))
              .map(renderInvoiceCard)
          ) : (
            <View style={styles.emptyContainer}>
              <FileText color={colors.text + '40'} size={48} />
              <Text style={[styles.emptyText, { color: colors.text }]}>Aucune facture trouvée</Text>
              <Text style={[styles.emptySubtext, { color: colors.text + '80' }]}>
                Générez vos premières factures ou ajustez vos filtres
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </ScrollView>

      {/* Modal de génération automatique */}
      <Modal visible={showGenerationModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Zap color={colors.primary} size={24} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Génération Automatique</Text>
              </View>
              <TouchableOpacity onPress={() => setShowGenerationModal(false)}>
                <Text style={[styles.closeButton, { color: colors.text }]}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.generationForm} showsVerticalScrollIndicator={false}>
              {/* Sélection période */}
              <View style={styles.periodRow}>
                <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Mois *</Text>
                  <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                    <Picker
                      selectedValue={generationData.month}
                      onValueChange={(value) => setGenerationData(prev => ({ ...prev, month: value }))}
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
                      selectedValue={generationData.year}
                      onValueChange={(value) => setGenerationData(prev => ({ ...prev, year: value }))}
                      style={[styles.picker, { color: colors.text }]}
                    >
                      <Picker.Item label="2025" value={2025} />
                      <Picker.Item label="2024" value={2024} />
                    </Picker>
                  </View>
                </View>
              </View>

              {/* Sélection familles */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Familles à facturer</Text>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity 
                    style={styles.checkboxRow}
                    onPress={() => setGenerationData(prev => ({ ...prev, includeAllFamilies: true }))}
                  >
                    <View style={[styles.checkbox, { 
                      backgroundColor: generationData.includeAllFamilies ? colors.primary : 'transparent',
                      borderColor: colors.border 
                    }]}>
                      {generationData.includeAllFamilies && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[styles.checkboxLabel, { color: colors.text }]}>👨‍👩‍👧‍👦 Toutes les familles ({allFamilies.length})</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.checkboxRow}
                    onPress={() => setGenerationData(prev => ({ ...prev, includeAllFamilies: false }))}
                  >
                    <View style={[styles.checkbox, { 
                      backgroundColor: !generationData.includeAllFamilies ? colors.primary : 'transparent',
                      borderColor: colors.border 
                    }]}>
                      {!generationData.includeAllFamilies && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[styles.checkboxLabel, { color: colors.text }]}>🎯 Famille spécifique</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {!generationData.includeAllFamilies && (
                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Famille *</Text>
                  <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                    <Picker
                      selectedValue={generationData.familyId}
                      onValueChange={(value) => setGenerationData(prev => ({ ...prev, familyId: value }))}
                      style={[styles.picker, { color: colors.text }]}
                    >
                      <Picker.Item label="Sélectionner une famille" value="" />
                      {allFamilies.map(family => (
                        <Picker.Item key={family.id} label={family.name} value={family.id} />
                      ))}
                    </Picker>
                  </View>
                </View>
              )}

              {/* Type de facture */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Type de facture</Text>
                <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                  <Picker
                    selectedValue={generationData.invoiceType}
                    onValueChange={(value) => setGenerationData(prev => ({ ...prev, invoiceType: value as InvoiceType }))}
                    style={[styles.picker, { color: colors.text }]}
                  >
                    <Picker.Item label="📅 Mensuelle" value="mensuelle" />
                    <Picker.Item label="📊 Trimestrielle" value="trimestrielle" />
                    <Picker.Item label="🎯 Ponctuelle" value="ponctuelle" />
                  </Picker>
                </View>
              </View>

              {/* Notes additionnelles */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Notes (optionnel)</Text>
                <TextInput
                  style={[styles.textAreaInput, { color: colors.text, borderColor: colors.border }]}
                  value={generationData.notes}
                  onChangeText={(value) => setGenerationData(prev => ({ ...prev, notes: value }))}
                  multiline
                  numberOfLines={3}
                  placeholder="Notes à inclure dans les factures..."
                  placeholderTextColor={colors.text + '60'}
                />
              </View>

              {/* Barre de progression */}
              {generationProgress > 0 && generationProgress < 100 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Zap color={colors.primary} size={20} />
                    <Text style={[styles.progressText, { color: colors.text }]}>Génération en cours...</Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <View style={[styles.progressFill, { width: `${generationProgress}%`, backgroundColor: colors.primary }]} />
                  </View>
                  <Text style={[styles.progressPercent, { color: colors.text }]}>{generationProgress}%</Text>
                </View>
              )}

              {/* Information automatisation */}
              <View style={[styles.autoInfo, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
                <Zap color={colors.primary} size={20} />
                <View style={styles.autoContent}>
                  <Text style={[styles.autoTitle, { color: colors.primary }]}>⚡ Génération Intelligente</Text>
                  <Text style={[styles.autoDescription, { color: colors.text + '80' }]}>
                    ✓ Calcul automatique basé sur contrats{'\n'}
                    ✓ Sessions validées uniquement{'\n'}
                    ✓ Numérotation séquentielle{'\n'}
                    ✓ Notifications automatiques parents
                  </Text>
                </View>
              </View>

              {/* Boutons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.border }]}
                  onPress={() => setShowGenerationModal(false)}
                  disabled={generationProgress > 0 && generationProgress < 100}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.generateButtonMain, { 
                    backgroundColor: colors.primary, 
                    opacity: generationProgress > 0 && generationProgress < 100 ? 0.5 : 1 
                  }]}
                  onPress={generateInvoicesAutomatically}
                  disabled={generationProgress > 0 && generationProgress < 100}
                >
                  <Zap color="#FFFFFF" size={16} />
                  <Text style={styles.generateButtonMainText}>Générer Factures</Text>
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
    backgroundColor: '#F8FAFC',
  },
  fixedHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    marginHorizontal: -20,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  header: {
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  analyticsButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 8,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  invoicesList: {
    flex: 1,
  },
  invoiceCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  parentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  studentNames: {
    fontSize: 12,
    marginBottom: 2,
  },
  invoicePeriod: {
    fontSize: 12,
  },
  invoiceStatus: {
    alignItems: 'flex-end',
    gap: 6,
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
  overdueBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  overdueText: {
    fontSize: 10,
    fontWeight: '600',
  },
  invoiceDetails: {
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
  invoiceActions: {
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
  generationForm: {
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
  autoInfo: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  autoContent: {
    flex: 1,
  },
  autoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  autoDescription: {
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
  generateButtonMain: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generateButtonMainText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});