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
import { Search, Filter, Wallet, Calendar, DollarSign, Eye, Download, CreditCard, CheckCircle, Clock, FileText, AlertTriangle, TrendingUp, BarChart } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@react-navigation/native';
import { useNotificationTriggers } from '../../../services/NotificationTriggers';
import {
  Invoice,
  InvoiceStatus,
  PaymentMethod,
  CurrencyCode,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  formatCurrency,
  isInvoiceOverdue,
  calculateOverdueDays,
  getInvoiceAging
} from '../../../types/Invoicing';

export default function ParentInvoices() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { triggers } = useNotificationTriggers();
  const isDesktop = width >= 768;
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | ''>('');
  
  // États pour détail facture et paiement
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money');
  const [paymentAmount, setPaymentAmount] = useState('');

  const parentId = 'parent_1';
  const parentName = 'M. Diabaté Mamadou';

  // Génération automatique historique 12 mois
  const generateLast12MonthsInvoices = (): Invoice[] => {
    const invoices: Invoice[] = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const invoiceDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const month = invoiceDate.getMonth() + 1;
      const year = invoiceDate.getFullYear();
      
      // Simulation: alternance de statuts pour réalisme
      const statuses: InvoiceStatus[] = ['payee', 'en_attente', 'payee', 'en_retard'];
      const status = statuses[i % statuses.length];
      
      // Montants variables selon période
      const baseAmount = 135000 + (Math.random() * 50000); // 135k à 185k
      const isOverdue = status === 'en_retard';
      const isPaid = status === 'payee';
      
      const invoice: Invoice = {
        id: `invoice_${year}_${month.toString().padStart(2, '0')}`,
        invoiceNumber: `FACT-${parentId}-${year}${month.toString().padStart(2, '0')}-001`,
        type: 'mensuelle',
        parentId,
        parentName,
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
        period: `${getMonthName(month)} ${year}`,
        month,
        year,
        academicYear: `${year - (month <= 6 ? 1 : 0)}-${year + (month > 6 ? 1 : 0)}`,
        billingPeriodStart: `${year}-${month.toString().padStart(2, '0')}-01T00:00:00Z`,
        billingPeriodEnd: `${year}-${month.toString().padStart(2, '0')}-31T23:59:59Z`,
        currency: 'XOF',
        subtotalAmount: Math.round(baseAmount),
        taxRate: 0,
        taxAmount: 0,
        discountRate: 0,
        discountAmount: 0,
        totalAmount: Math.round(baseAmount),
        amountPaid: isPaid ? Math.round(baseAmount) : 0,
        amountDue: isPaid ? 0 : Math.round(baseAmount),
        sessionsCount: Math.floor(Math.random() * 10) + 15, // 15-25 sessions
        totalHours: Math.floor(Math.random() * 20) + 30, // 30-50 heures
        sessionDetails: [
          {
            sessionId: `session_${year}_${month}_1`,
            studentId: 'student_1',
            studentName: 'Kouadio Aya',
            teacherId: 'teacher_1',
            teacherName: 'Marie N\'Guessan',
            subject: 'Mathématiques',
            date: `${year}-${month.toString().padStart(2, '0')}-05`,
            startTime: '14:00',
            endTime: '16:00',
            duration: 120,
            hourlyRate: 37500,
            sessionAmount: 75000,
            sessionType: 'cours',
            location: 'domicile',
            status: 'completed',
            validatedBy: 'direction_admin',
            validatedAt: `${year}-${month.toString().padStart(2, '0')}-05T16:30:00Z`
          },
          {
            sessionId: `session_${year}_${month}_2`,
            studentId: 'student_2',
            studentName: 'N\'Dri Kevin',
            teacherId: 'teacher_2',
            teacherName: 'Jean Baptiste',
            subject: 'Français',
            date: `${year}-${month.toString().padStart(2, '0')}-10`,
            startTime: '15:00',
            endTime: '17:00',
            duration: 120,
            hourlyRate: 30000,
            sessionAmount: 60000,
            sessionType: 'cours',
            location: 'domicile',
            status: 'completed',
            validatedBy: 'direction_admin',
            validatedAt: `${year}-${month.toString().padStart(2, '0')}-10T17:30:00Z`
          }
        ],
        status,
        priority: isOverdue ? 'urgente' : 'normale',
        dueDate: new Date(year, month, 15).toISOString(),
        gracePeriod: 7,
        dateCreation: new Date(year, month - 1, 31, 10, 0, 0).toISOString(),
        dateGeneration: new Date(year, month - 1, 31, 10, 5, 0).toISOString(),
        dateSent: new Date(year, month - 1, 31, 14, 30, 0).toISOString(),
        ...(isPaid && {
          datePaid: new Date(year, month, Math.floor(Math.random() * 10) + 5, 9, 15, 0).toISOString(),
          paymentDetails: [
            {
              id: `payment_${year}_${month}`,
              amount: Math.round(baseAmount),
              currency: 'XOF',
              method: 'mobile_money',
              reference: `MM${year}${month.toString().padStart(2, '0')}${Math.floor(Math.random() * 100000)}`,
              date: new Date(year, month, Math.floor(Math.random() * 10) + 5, 9, 15, 0).toISOString(),
              status: 'confirmed'
            }
          ]
        }),
        paymentInstructions: 'Paiement attendu sous 15 jours. Merci de conserver cette facture.',
        bankDetails: {
          bankName: 'Banque AS-Training',
          accountNumber: '12345678901',
          beneficiaryName: 'AS-TRAINING SARL',
          mobileMoneyNumber: '+225 07 12 34 56 78',
          mobileMoneyProvider: 'orange'
        },
        generatedBy: 'direction_admin',
        remindersSent: isOverdue ? Math.floor(Math.random() * 3) + 1 : 0,
        communicationHistory: [],
        viewCount: Math.floor(Math.random() * 5) + 1,
        downloadCount: isPaid ? Math.floor(Math.random() * 3) + 1 : 0,
        isArchived: false,
        fiscalYear: year
      };

      invoices.push(invoice);
    }

    return invoices.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
  };

  useEffect(() => {
    const loadInvoices = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const generated12MonthsInvoices = generateLast12MonthsInvoices();
      setInvoices(generated12MonthsInvoices);
      setFilteredInvoices(generated12MonthsInvoices);
      setLoading(false);
    };

    loadInvoices();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const filtered = invoices.filter(invoice => {
      const matchesSearch = !searchQuery || 
        invoice.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.studentNames.some(name => name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesYear = invoice.year === selectedYear;
      const matchesStatus = !selectedStatus || invoice.status === selectedStatus;
      
      return matchesSearch && matchesYear && matchesStatus;
    });

    setFilteredInvoices(filtered);
  }, [searchQuery, invoices, selectedYear, selectedStatus]);

  const getMonthName = (month: number): string => {
    const months = [
      '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month];
  };

  // Calcul des statistiques parent
  const calculateParentStats = () => {
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidAmount = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const pendingAmount = invoices.reduce((sum, inv) => sum + inv.amountDue, 0);
    const overdueInvoices = invoices.filter(inv => isInvoiceOverdue(inv.dueDate) && inv.status !== 'payee');
    const paymentRate = invoices.length > 0 ? (invoices.filter(inv => inv.status === 'payee').length / invoices.length) * 100 : 0;

    return {
      totalInvoices: invoices.length,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueCount: overdueInvoices.length,
      overdueAmount: overdueInvoices.reduce((sum, inv) => sum + inv.amountDue, 0),
      paymentRate,
      averageInvoiceAmount: invoices.length > 0 ? totalAmount / invoices.length : 0
    };
  };

  const handleViewInvoice = (invoice: Invoice) => {
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id 
        ? { ...inv, viewCount: inv.viewCount + 1, lastViewedAt: new Date().toISOString() }
        : inv
    );
    setInvoices(updatedInvoices);

    setSelectedInvoice(invoice);
    setShowInvoiceDetail(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id 
        ? { ...inv, downloadCount: inv.downloadCount + 1, lastDownloadedAt: new Date().toISOString() }
        : inv
    );
    setInvoices(updatedInvoices);

    Alert.alert(
      '⬇️ Téléchargement',
      `Téléchargement de la facture ${invoice.invoiceNumber} en cours...\n\n📄 Format PDF\n💾 Sauvegarde automatique`,
      [{ text: 'OK' }]
    );
  };

  const handlePayInvoice = (invoice: Invoice) => {
    if (invoice.status === 'payee') {
      Alert.alert('ℹ️ Information', 'Cette facture est déjà payée');
      return;
    }

    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.amountDue.toString());
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedInvoice || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      Alert.alert('❌ Erreur', 'Veuillez saisir un montant valide');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount > selectedInvoice.amountDue) {
      Alert.alert('❌ Erreur', 'Le montant ne peut pas dépasser le montant dû');
      return;
    }

    // Simulation du processus de paiement
    Alert.alert(
      '💳 Paiement en cours',
      'Traitement de votre paiement...',
      [{ text: 'OK' }]
    );

    // Attendre 2 secondes pour simuler le traitement
    setTimeout(async () => {
      const updatedInvoice = {
        ...selectedInvoice,
        status: 'payee' as InvoiceStatus,
        amountPaid: selectedInvoice.amountPaid + amount,
        amountDue: selectedInvoice.amountDue - amount,
        datePaid: new Date().toISOString(),
        paymentDetails: [
          ...(selectedInvoice.paymentDetails || []),
          {
            id: `payment_${Date.now()}`,
            amount,
            currency: selectedInvoice.currency,
            method: paymentMethod,
            reference: `${paymentMethod.toUpperCase()}${Date.now()}`,
            date: new Date().toISOString(),
            status: 'confirmed' as const
          }
        ]
      };

      const updatedInvoices = invoices.map(inv => 
        inv.id === selectedInvoice.id ? updatedInvoice : inv
      );
      setInvoices(updatedInvoices);
      setShowPaymentModal(false);

      // 🔔 NOTIFICATION AUTOMATIQUE
      try {
        await triggers.onInvoicePaymentMade({
          userId: parentId,
          userRole: 'parent',
          metadata: {
            invoiceId: selectedInvoice.id,
            invoiceNumber: selectedInvoice.invoiceNumber,
            parentName: selectedInvoice.parentName,
            amount: amount,
            currency: selectedInvoice.currency,
            paymentMethod,
            paymentReference: `${paymentMethod.toUpperCase()}${Date.now()}`,
            totalAmount: selectedInvoice.totalAmount,
            period: selectedInvoice.period
          }
        });

        Alert.alert(
          '✅ Paiement réussi',
          `Votre paiement de ${formatCurrency(amount, selectedInvoice.currency)} a été confirmé !\n\n📧 Confirmation envoyée\n📄 Reçu de paiement disponible\n✅ Facture mise à jour`,
          [{ text: 'Parfait' }]
        );
      } catch (error) {
        Alert.alert('⚠️ Paiement réussi', 'Le paiement a été traité mais les notifications ont échoué');
      }

      setSelectedInvoice(null);
    }, 2000);
  };

  const renderStatsCards = () => {
    const stats = calculateParentStats();
    
    return (
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statIcon}>
            <FileText color="#3B82F6" size={20} />
          </View>
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalInvoices}</Text>
            <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Factures Total</Text>
          </View>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statIcon}>
            <CheckCircle color="#10B981" size={20} />
          </View>
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatCurrency(stats.paidAmount, 'XOF')}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Montant Payé</Text>
          </View>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statIcon}>
            <Clock color="#F59E0B" size={20} />
          </View>
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatCurrency(stats.pendingAmount, 'XOF')}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text + '80' }]}>En Attente</Text>
          </View>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statIcon}>
            <AlertTriangle color="#EF4444" size={20} />
          </View>
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.overdueCount}</Text>
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
          <Text style={[styles.invoicePeriod, { color: colors.text }]}>{invoice.period}</Text>
          <Text style={[styles.invoiceNumber, { color: colors.text + '80' }]}>{invoice.invoiceNumber}</Text>
          <Text style={[styles.studentNames, { color: colors.text + '80' }]}>
            👦 {invoice.studentNames.join(', ')}
          </Text>
          <Text style={[styles.invoiceSessions, { color: colors.text + '80' }]}>
            📚 {invoice.sessionsCount} sessions ({invoice.totalHours}h)
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
      
      <View style={styles.invoiceAmounts}>
        <View style={styles.amountRow}>
          <Text style={[styles.amountLabel, { color: colors.text + '80' }]}>Montant total:</Text>
          <Text style={[styles.amountValue, { color: colors.text }]}>
            {formatCurrency(invoice.totalAmount, invoice.currency)}
          </Text>
        </View>
        
        {invoice.amountPaid > 0 && (
          <View style={styles.amountRow}>
            <Text style={[styles.amountLabel, { color: colors.text + '80' }]}>Payé:</Text>
            <Text style={[styles.amountValue, { color: '#10B981' }]}>
              {formatCurrency(invoice.amountPaid, invoice.currency)}
            </Text>
          </View>
        )}
        
        {invoice.amountDue > 0 && (
          <View style={styles.amountRow}>
            <Text style={[styles.amountLabel, { color: colors.text + '80' }]}>Reste à payer:</Text>
            <Text style={[styles.amountValue, { color: '#EF4444' }]}>
              {formatCurrency(invoice.amountDue, invoice.currency)}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.invoiceDetails}>
        <Text style={[styles.invoiceDueDate, { color: colors.text + '80' }]}>
          📅 Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
        </Text>
        {invoice.datePaid && (
          <Text style={[styles.invoicePaidDate, { color: '#10B981' }]}>
            ✅ Payé le: {new Date(invoice.datePaid).toLocaleDateString('fr-FR')}
          </Text>
        )}
      </View>
      
      <View style={styles.invoiceActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
          onPress={() => handleViewInvoice(invoice)}
        >
          <Eye color={colors.primary} size={16} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Détail</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#6B7280' + '20' }]}
          onPress={() => handleDownloadInvoice(invoice)}
        >
          <Download color="#6B7280" size={16} />
          <Text style={[styles.actionText, { color: '#6B7280' }]}>PDF</Text>
        </TouchableOpacity>
        
        {invoice.status !== 'payee' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#10B981' + '20' }]}
            onPress={() => handlePayInvoice(invoice)}
          >
            <CreditCard color="#10B981" size={16} />
            <Text style={[styles.actionText, { color: '#10B981' }]}>Payer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Parent */}
      <LinearGradient colors={['#EA580C', '#F97316']} style={styles.header}>
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>💰 Mes Factures</Text>
            <Text style={styles.headerSubtitle}>Historique 12 mois et paiements</Text>
          </View>
          <View style={styles.headerBadge}>
            <Wallet color="#FFFFFF" size={16} />
            <Text style={styles.headerBadgeText}>Parent</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Statistiques */}
        {renderStatsCards()}

        {/* Filtres */}
        <View style={[styles.filtersContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.filtersTitle, { color: colors.text }]}>🔍 Recherche et Filtres</Text>
          
          {/* Recherche */}
          <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Search color={colors.text + '60'} size={20} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Recherche par période, numéro, élève..."
              placeholderTextColor={colors.text + '60'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filtres en ligne */}
          <View style={styles.filterRow}>
            <View style={[styles.filterField, { flex: 1, marginRight: 8 }]}>
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
            
            <View style={[styles.filterField, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>📊 Statut</Text>
              <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <Picker
                  selectedValue={selectedStatus}
                  onValueChange={setSelectedStatus}
                  style={[styles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="Tous statuts" value="" />
                  <Picker.Item label="✅ Payées" value="payee" />
                  <Picker.Item label="⏳ En attente" value="en_attente" />
                  <Picker.Item label="⚠️ En retard" value="en_retard" />
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {/* Liste des factures */}
        <ScrollView style={styles.invoicesList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.text }]}>Chargement factures...</Text>
            </View>
          ) : filteredInvoices.length > 0 ? (
            filteredInvoices.map(renderInvoiceCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Wallet color={colors.text + '40'} size={48} />
              <Text style={[styles.emptyText, { color: colors.text }]}>Aucune facture trouvée</Text>
              <Text style={[styles.emptySubtext, { color: colors.text + '80' }]}>
                Ajustez vos filtres pour voir plus de résultats
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Modal détail facture */}
      <Modal visible={showInvoiceDetail} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <FileText color={colors.primary} size={24} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Détail Facture</Text>
              </View>
              <TouchableOpacity onPress={() => setShowInvoiceDetail(false)}>
                <Text style={[styles.closeButton, { color: colors.text }]}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.invoiceDetailContent} showsVerticalScrollIndicator={false}>
              {selectedInvoice && (
                <>
                  <View style={styles.invoiceDetailHeader}>
                    <Text style={[styles.detailInvoiceNumber, { color: colors.text }]}>
                      {selectedInvoice.invoiceNumber}
                    </Text>
                    <Text style={[styles.detailPeriod, { color: colors.text + '80' }]}>
                      {selectedInvoice.period}
                    </Text>
                    <View style={[styles.detailStatusBadge, { backgroundColor: INVOICE_STATUS_COLORS[selectedInvoice.status] + '20' }]}>
                      <Text style={[styles.detailStatusText, { color: INVOICE_STATUS_COLORS[selectedInvoice.status] }]}>
                        {INVOICE_STATUS_LABELS[selectedInvoice.status]}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>💰 Montants</Text>
                    <View style={styles.detailAmounts}>
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>Sous-total:</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>
                          {formatCurrency(selectedInvoice.subtotalAmount, selectedInvoice.currency)}
                        </Text>
                      </View>
                      {selectedInvoice.discountAmount > 0 && (
                        <View style={styles.detailRow}>
                          <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>Remise ({selectedInvoice.discountRate}%):</Text>
                          <Text style={[styles.detailValue, { color: '#10B981' }]}>
                            -{formatCurrency(selectedInvoice.discountAmount, selectedInvoice.currency)}
                          </Text>
                        </View>
                      )}
                      {selectedInvoice.taxAmount > 0 && (
                        <View style={styles.detailRow}>
                          <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>TVA ({selectedInvoice.taxRate}%):</Text>
                          <Text style={[styles.detailValue, { color: colors.text }]}>
                            {formatCurrency(selectedInvoice.taxAmount, selectedInvoice.currency)}
                          </Text>
                        </View>
                      )}
                      <View style={[styles.detailRow, styles.totalRow]}>
                        <Text style={[styles.detailLabel, { color: colors.text, fontWeight: 'bold' }]}>Total:</Text>
                        <Text style={[styles.detailValue, { color: colors.text, fontWeight: 'bold', fontSize: 18 }]}>
                          {formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>📚 Sessions</Text>
                    <Text style={[styles.sessionsSummary, { color: colors.text + '80' }]}>
                      {selectedInvoice.sessionsCount} sessions • {selectedInvoice.totalHours} heures
                    </Text>
                    {selectedInvoice.sessionDetails.map((session, index) => (
                      <View key={session.sessionId} style={styles.sessionCard}>
                        <View style={styles.sessionHeader}>
                          <Text style={[styles.sessionStudent, { color: colors.text }]}>{session.studentName}</Text>
                          <Text style={[styles.sessionAmount, { color: colors.primary }]}>
                            {formatCurrency(session.sessionAmount, selectedInvoice.currency)}
                          </Text>
                        </View>
                        <Text style={[styles.sessionDetails, { color: colors.text + '80' }]}>
                          👨‍🏫 {session.teacherName} • {session.subject}
                        </Text>
                        <Text style={[styles.sessionDateTime, { color: colors.text + '80' }]}>
                          📅 {new Date(session.date).toLocaleDateString('fr-FR')} • {session.startTime}-{session.endTime}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>📅 Dates importantes</Text>
                    <View style={styles.datesList}>
                      <View style={styles.dateRow}>
                        <Text style={[styles.dateLabel, { color: colors.text + '80' }]}>Création:</Text>
                        <Text style={[styles.dateValue, { color: colors.text }]}>
                          {new Date(selectedInvoice.dateCreation).toLocaleDateString('fr-FR')}
                        </Text>
                      </View>
                      <View style={styles.dateRow}>
                        <Text style={[styles.dateLabel, { color: colors.text + '80' }]}>Échéance:</Text>
                        <Text style={[styles.dateValue, { color: colors.text }]}>
                          {new Date(selectedInvoice.dueDate).toLocaleDateString('fr-FR')}
                        </Text>
                      </View>
                      {selectedInvoice.datePaid && (
                        <View style={styles.dateRow}>
                          <Text style={[styles.dateLabel, { color: colors.text + '80' }]}>Paiement:</Text>
                          <Text style={[styles.dateValue, { color: '#10B981' }]}>
                            {new Date(selectedInvoice.datePaid).toLocaleDateString('fr-FR')}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {selectedInvoice.paymentDetails && selectedInvoice.paymentDetails.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>💳 Historique paiements</Text>
                      {selectedInvoice.paymentDetails.map((payment, index) => (
                        <View key={payment.id} style={styles.paymentHistoryCard}>
                          <View style={styles.paymentHistoryHeader}>
                            <Text style={[styles.paymentHistoryAmount, { color: '#10B981' }]}>
                              {formatCurrency(payment.amount, payment.currency)}
                            </Text>
                            <Text style={[styles.paymentHistoryDate, { color: colors.text + '80' }]}>
                              {new Date(payment.date).toLocaleDateString('fr-FR')}
                            </Text>
                          </View>
                          <Text style={[styles.paymentHistoryMethod, { color: colors.text }]}>
                            💳 {PAYMENT_METHOD_LABELS[payment.method]}
                          </Text>
                          <Text style={[styles.paymentHistoryReference, { color: colors.text + '80' }]}>
                            Réf: {payment.reference}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de paiement */}
      <Modal visible={showPaymentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <CreditCard color={colors.primary} size={24} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Effectuer un Paiement</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Text style={[styles.closeButton, { color: colors.text }]}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.paymentForm}>
              {selectedInvoice && (
                <View style={styles.paymentSummary}>
                  <Text style={[styles.summaryTitle, { color: colors.text }]}>💰 Facture à payer</Text>
                  <Text style={[styles.summaryText, { color: colors.text }]}>
                    📄 {selectedInvoice.invoiceNumber}{'\n'}
                    📅 {selectedInvoice.period}{'\n'}
                    💰 Montant dû: {formatCurrency(selectedInvoice.amountDue, selectedInvoice.currency)}
                  </Text>
                </View>
              )}

              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Montant à payer *</Text>
                <TextInput
                  style={[styles.numberInput, { color: colors.text, borderColor: colors.border }]}
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.text + '60'}
                />
                <Text style={[styles.currencyHint, { color: colors.text + '60' }]}>Montant en FCFA</Text>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Méthode de paiement *</Text>
                <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                  <Picker
                    selectedValue={paymentMethod}
                    onValueChange={setPaymentMethod}
                    style={[styles.picker, { color: colors.text }]}
                  >
                    <Picker.Item label="📱 Mobile Money" value="mobile_money" />
                    <Picker.Item label="💳 Virement bancaire" value="virement" />
                    <Picker.Item label="💵 Espèces" value="especes" />
                    <Picker.Item label="💳 Carte bancaire" value="carte_bancaire" />
                  </Picker>
                </View>
              </View>

              <View style={[styles.paymentInfo, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
                <CreditCard color={colors.primary} size={20} />
                <View style={styles.paymentInfoContent}>
                  <Text style={[styles.paymentInfoTitle, { color: colors.primary }]}>💳 Paiement Sécurisé</Text>
                  <Text style={[styles.paymentInfoDescription, { color: colors.text + '80' }]}>
                    🔒 Transaction sécurisée SSL{'\n'}
                    📧 Confirmation par email{'\n'}
                    📄 Reçu de paiement automatique
                  </Text>
                </View>
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
                  onPress={processPayment}
                >
                  <CreditCard color="#FFFFFF" size={16} />
                  <Text style={styles.payButtonText}>Payer Maintenant</Text>
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
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
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
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 14,
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
  invoicePeriod: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 12,
    marginBottom: 2,
  },
  studentNames: {
    fontSize: 12,
    marginBottom: 2,
  },
  invoiceSessions: {
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
  invoiceAmounts: {
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  amountLabel: {
    fontSize: 12,
  },
  amountValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  invoiceDetails: {
    marginBottom: 12,
  },
  invoiceDueDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  invoicePaidDate: {
    fontSize: 12,
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
  invoiceDetailContent: {
    padding: 20,
  },
  invoiceDetailHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  detailInvoiceNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailPeriod: {
    fontSize: 16,
    marginBottom: 12,
  },
  detailStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  detailStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailAmounts: {
    paddingVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 8,
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  sessionsSummary: {
    fontSize: 14,
    marginBottom: 12,
  },
  sessionCard: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sessionStudent: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionDetails: {
    fontSize: 12,
    marginBottom: 2,
  },
  sessionDateTime: {
    fontSize: 12,
  },
  datesList: {
    paddingVertical: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dateLabel: {
    fontSize: 14,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  paymentHistoryCard: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  paymentHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  paymentHistoryAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentHistoryDate: {
    fontSize: 12,
  },
  paymentHistoryMethod: {
    fontSize: 14,
    marginBottom: 2,
  },
  paymentHistoryReference: {
    fontSize: 12,
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
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  numberInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  currencyHint: {
    fontSize: 12,
    marginTop: 4,
  },
  paymentInfo: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  paymentInfoContent: {
    flex: 1,
  },
  paymentInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentInfoDescription: {
    fontSize: 12,
    lineHeight: 16,
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