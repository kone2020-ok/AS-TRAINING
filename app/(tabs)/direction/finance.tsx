import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  useWindowDimensions,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  PieChart,
  BarChart3,
  CreditCard,
  Wallet,
  FileText,
  Download,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Building2,
  Users,
  GraduationCap,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Receipt,
  BookOpen,
  Settings,
  Search,
  RefreshCw
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

// Types pour la comptabilité
interface Transaction {
  id: string;
  date: string;
  type: 'revenus' | 'depenses';
  category: string;
  subcategory: string;
  description: string;
  amount: number;
  paymentMethod: 'especes' | 'virement' | 'mobile_money' | 'cheque';
  reference?: string;
  status: 'valide' | 'en_attente' | 'annule';
  attachments?: string[];
  notes?: string;
  createdBy: string;
  validatedBy?: string;
  validatedAt?: string;
}

interface FinancialKPI {
  period: string;
  totalRevenues: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  cashFlow: number;
  studentPayments: number;
  teacherPayments: number;
  operatingExpenses: number;
  averageMonthlyRevenue: number;
  revenueGrowth: number;
  expenseGrowth: number;
}

interface Budget {
  id: string;
  category: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  period: string;
  status: 'sous_budget' | 'dans_budget' | 'depassement';
}

interface CashFlowData {
  month: string;
  revenus: number;
  depenses: number;
  solde: number;
  cumulatif: number;
}

export default function ComptabiliteDirection() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'budgets' | 'reports'>('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<'tous' | 'revenus' | 'depenses'>('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Données de démonstration
  const currentKPIs: FinancialKPI = {
    period: 'Janvier 2025',
    totalRevenues: 2450000,
    totalExpenses: 1680000,
    netProfit: 770000,
    profitMargin: 31.4,
    cashFlow: 770000,
    studentPayments: 1980000,
    teacherPayments: 920000,
    operatingExpenses: 760000,
    averageMonthlyRevenue: 2200000,
    revenueGrowth: 12.5,
    expenseGrowth: 8.3
  };

  const cashFlowData: CashFlowData[] = [
    { month: 'Jan', revenus: 2450000, depenses: 1680000, solde: 770000, cumulatif: 770000 },
    { month: 'Fév', revenus: 2380000, depenses: 1720000, solde: 660000, cumulatif: 1430000 },
    { month: 'Mar', revenus: 2520000, depenses: 1650000, solde: 870000, cumulatif: 2300000 },
    { month: 'Avr', revenus: 2440000, depenses: 1700000, solde: 740000, cumulatif: 3040000 },
    { month: 'Mai', revenus: 2600000, depenses: 1750000, solde: 850000, cumulatif: 3890000 },
    { month: 'Juin', revenus: 2350000, depenses: 1680000, solde: 670000, cumulatif: 4560000 },
  ];

  const budgets: Budget[] = [
    {
      id: 'budget_1',
      category: 'Salaires Enseignants',
      budgetedAmount: 1000000,
      actualAmount: 920000,
      variance: 80000,
      variancePercentage: 8.0,
      period: 'Janvier 2025',
      status: 'sous_budget'
    },
    {
      id: 'budget_2', 
      category: 'Frais Administratifs',
      budgetedAmount: 300000,
      actualAmount: 320000,
      variance: -20000,
      variancePercentage: -6.7,
      period: 'Janvier 2025',
      status: 'depassement'
    },
    {
      id: 'budget_3',
      category: 'Marketing & Communication',
      budgetedAmount: 150000,
      actualAmount: 145000,
      variance: 5000,
      variancePercentage: 3.3,
      period: 'Janvier 2025', 
      status: 'dans_budget'
    },
    {
      id: 'budget_4',
      category: 'Équipements & Fournitures',
      budgetedAmount: 200000,
      actualAmount: 185000,
      variance: 15000,
      variancePercentage: 7.5,
      period: 'Janvier 2025',
      status: 'sous_budget'
    },
    {
      id: 'budget_5',
      category: 'Charges Locatives',
      budgetedAmount: 80000,
      actualAmount: 110000,
      variance: -30000,
      variancePercentage: -37.5,
      period: 'Janvier 2025',
      status: 'depassement'
    }
  ];

  const recentTransactions: Transaction[] = [
    {
      id: 'trans_1',
      date: '2025-01-15',
      type: 'revenus',
      category: 'Scolarité',
      subcategory: 'Paiements Parents',
      description: 'Paiement famille Diabaté - Janvier 2025',
      amount: 45000,
      paymentMethod: 'virement',
      reference: 'VIR-FAM-001-012025',
      status: 'valide',
      createdBy: 'direction_admin',
      validatedBy: 'direction_admin',
      validatedAt: '2025-01-15T14:30:00Z'
    },
    {
      id: 'trans_2',
      date: '2025-01-14',
      type: 'depenses',
      category: 'Salaires',
      subcategory: 'Enseignants',
      description: 'Salaire Marie N\'Guessan - Janvier 2025',
      amount: 246500,
      paymentMethod: 'virement',
      reference: 'PAY-TEACH-001-012025',
      status: 'valide',
      createdBy: 'direction_admin',
      validatedBy: 'direction_admin',
      validatedAt: '2025-01-14T16:45:00Z'
    },
    {
      id: 'trans_3',
      date: '2025-01-13',
      type: 'depenses',
      category: 'Administratif',
      subcategory: 'Fournitures Bureau',
      description: 'Achat matériel bureau - papeterie',
      amount: 35000,
      paymentMethod: 'especes',
      status: 'en_attente',
      createdBy: 'direction_admin'
    },
    {
      id: 'trans_4',
      date: '2025-01-12',
      type: 'revenus',
      category: 'Scolarité',
      subcategory: 'Nouveaux Contrats',
      description: 'Nouveau contrat famille Koné',
      amount: 60000,
      paymentMethod: 'mobile_money',
      reference: 'MM-123456789',
      status: 'valide',
      createdBy: 'direction_admin',
      validatedBy: 'direction_admin',
      validatedAt: '2025-01-12T11:20:00Z'
    },
    {
      id: 'trans_5',
      date: '2025-01-11',
      type: 'depenses',
      category: 'Opérationnel',
      subcategory: 'Transport',
      description: 'Frais déplacement enseignants',
      amount: 25000,
      paymentMethod: 'especes',
      status: 'valide',
      createdBy: 'direction_admin',
      validatedBy: 'direction_admin',
      validatedAt: '2025-01-11T09:15:00Z'
    }
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount).replace('FCFA', 'FCFA');
  };

  const getKPIIcon = (type: string) => {
    switch (type) {
      case 'revenue': return <DollarSign color="#10B981" size={24} />;
      case 'expense': return <CreditCard color="#EF4444" size={24} />;
      case 'profit': return <TrendingUp color="#3B82F6" size={24} />;
      case 'margin': return <Target color="#8B5CF6" size={24} />;
      default: return <BarChart3 color="#6B7280" size={24} />;
    }
  };

  const getBudgetStatusColor = (status: Budget['status']) => {
    switch (status) {
      case 'sous_budget': return '#10B981';
      case 'dans_budget': return '#3B82F6';
      case 'depassement': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getBudgetStatusIcon = (status: Budget['status']) => {
    switch (status) {
      case 'sous_budget': return <CheckCircle color="#10B981" size={16} />;
      case 'dans_budget': return <Target color="#3B82F6" size={16} />;
      case 'depassement': return <AlertTriangle color="#EF4444" size={16} />;
      default: return <Clock color="#6B7280" size={16} />;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
    Alert.alert('✅ Actualisé', 'Les données ont été mises à jour');
  };

  const handleExportReport = () => {
    Alert.alert(
      '📊 Export de Rapport',
      'Sélectionnez le format d\'export :\n\n📄 PDF - Rapport complet\n📈 Excel - Données détaillées\n📧 Email - Envoi automatique',
      [
        { text: 'PDF', onPress: () => exportToPDF() },
        { text: 'Excel', onPress: () => exportToExcel() },
        { text: 'Email', onPress: () => sendByEmail() },
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const exportToPDF = () => {
    Alert.alert('📄 Export PDF', 'Rapport financier exporté en PDF avec succès !');
  };

  const exportToExcel = () => {
    Alert.alert('📈 Export Excel', 'Données comptables exportées en Excel avec succès !');
  };

  const sendByEmail = () => {
    Alert.alert('📧 Envoi Email', 'Rapport envoyé par email aux destinataires configurés');
  };

  const filteredTransactions = recentTransactions.filter(transaction => {
    const matchesType = filterType === 'tous' || transaction.type === filterType;
    const matchesSearch = !searchQuery || 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const renderDashboardTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* KPIs Cards */}
      <View style={styles.kpiContainer}>
        <View style={[styles.kpiCard, { backgroundColor: colors.card }]}>
          <View style={styles.kpiHeader}>
            {getKPIIcon('revenue')}
            <Text style={[styles.kpiTitle, { color: colors.text }]}>Revenus Total</Text>
          </View>
          <Text style={[styles.kpiValue, { color: '#10B981' }]}>
            {formatCurrency(currentKPIs.totalRevenues)}
          </Text>
          <View style={styles.kpiChange}>
            <TrendingUp color="#10B981" size={16} />
            <Text style={[styles.kpiChangeText, { color: '#10B981' }]}>
              +{currentKPIs.revenueGrowth}% vs mois dernier
            </Text>
          </View>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: colors.card }]}>
          <View style={styles.kpiHeader}>
            {getKPIIcon('expense')}
            <Text style={[styles.kpiTitle, { color: colors.text }]}>Dépenses Total</Text>
          </View>
          <Text style={[styles.kpiValue, { color: '#EF4444' }]}>
            {formatCurrency(currentKPIs.totalExpenses)}
          </Text>
          <View style={styles.kpiChange}>
            <TrendingUp color="#EF4444" size={16} />
            <Text style={[styles.kpiChangeText, { color: '#EF4444' }]}>
              +{currentKPIs.expenseGrowth}% vs mois dernier
            </Text>
          </View>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: colors.card }]}>
          <View style={styles.kpiHeader}>
            {getKPIIcon('profit')}
            <Text style={[styles.kpiTitle, { color: colors.text }]}>Bénéfice Net</Text>
          </View>
          <Text style={[styles.kpiValue, { color: '#3B82F6' }]}>
            {formatCurrency(currentKPIs.netProfit)}
          </Text>
          <View style={styles.kpiChange}>
            <Target color="#3B82F6" size={16} />
            <Text style={[styles.kpiChangeText, { color: '#3B82F6' }]}>
              Marge: {currentKPIs.profitMargin}%
            </Text>
          </View>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: colors.card }]}>
          <View style={styles.kpiHeader}>
            {getKPIIcon('margin')}
            <Text style={[styles.kpiTitle, { color: colors.text }]}>Flux de Trésorerie</Text>
          </View>
          <Text style={[styles.kpiValue, { color: '#8B5CF6' }]}>
            {formatCurrency(currentKPIs.cashFlow)}
          </Text>
          <View style={styles.kpiChange}>
            <Zap color="#8B5CF6" size={16} />
            <Text style={[styles.kpiChangeText, { color: '#8B5CF6' }]}>
              Situation positive
            </Text>
          </View>
        </View>
      </View>

      {/* Cash Flow Chart */}
      <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
        <View style={styles.chartHeader}>
          <View style={styles.chartTitleContainer}>
            <BarChart3 color={colors.primary} size={20} />
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              Évolution Flux de Trésorerie
            </Text>
          </View>
          <TouchableOpacity onPress={() => Alert.alert('📊 Graphique', 'Affichage graphique détaillé')}>
            <Eye color={colors.primary} size={16} />
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chartContent}>
            {cashFlowData.map((data, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.revenueBar, 
                      { 
                        height: (data.revenus / 3000000) * 120,
                        backgroundColor: '#10B981' 
                      }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.expenseBar, 
                      { 
                        height: (data.depenses / 3000000) * 120,
                        backgroundColor: '#EF4444' 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.chartLabel, { color: colors.text }]}>{data.month}</Text>
                <Text style={[styles.chartValue, { color: colors.text + '80' }]}>
                  {formatCurrency(data.solde)}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
        
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Revenus</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Dépenses</Text>
          </View>
        </View>
      </View>

      {/* Analyse Rapide */}
      <View style={[styles.analysisContainer, { backgroundColor: colors.card }]}>
        <View style={styles.analysisHeader}>
          <Calculator color={colors.primary} size={20} />
          <Text style={[styles.analysisTitle, { color: colors.text }]}>
            Analyse Financière Rapide
          </Text>
        </View>

        <View style={styles.analysisGrid}>
          <View style={[styles.analysisCard, { backgroundColor: '#10B981' + '10' }]}>
            <Text style={[styles.analysisLabel, { color: '#10B981' }]}>
              💰 Paiements Étudiants
            </Text>
            <Text style={[styles.analysisValue, { color: colors.text }]}>
              {formatCurrency(currentKPIs.studentPayments)}
            </Text>
            <Text style={[styles.analysisPercentage, { color: '#10B981' }]}>
              80.8% du CA total
            </Text>
          </View>

          <View style={[styles.analysisCard, { backgroundColor: '#EF4444' + '10' }]}>
            <Text style={[styles.analysisLabel, { color: '#EF4444' }]}>
              👨‍🏫 Salaires Enseignants
            </Text>
            <Text style={[styles.analysisValue, { color: colors.text }]}>
              {formatCurrency(currentKPIs.teacherPayments)}
            </Text>
            <Text style={[styles.analysisPercentage, { color: '#EF4444' }]}>
              54.8% des dépenses
            </Text>
          </View>

          <View style={[styles.analysisCard, { backgroundColor: '#3B82F6' + '10' }]}>
            <Text style={[styles.analysisLabel, { color: '#3B82F6' }]}>
              🏢 Charges Opérationnelles
            </Text>
            <Text style={[styles.analysisValue, { color: colors.text }]}>
              {formatCurrency(currentKPIs.operatingExpenses)}
            </Text>
            <Text style={[styles.analysisPercentage, { color: '#3B82F6' }]}>
              45.2% des dépenses
            </Text>
          </View>

          <View style={[styles.analysisCard, { backgroundColor: '#8B5CF6' + '10' }]}>
            <Text style={[styles.analysisLabel, { color: '#8B5CF6' }]}>
              📈 Revenus Moyens/Mois
            </Text>
            <Text style={[styles.analysisValue, { color: colors.text }]}>
              {formatCurrency(currentKPIs.averageMonthlyRevenue)}
            </Text>
            <Text style={[styles.analysisPercentage, { color: '#8B5CF6' }]}>
              Croissance stable
            </Text>
          </View>
        </View>
      </View>

      {/* Actions Rapides */}
      <View style={styles.quickActionsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>⚡ Actions Rapides</Text>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={[styles.quickActionCard, { backgroundColor: colors.card }]}
            onPress={() => setActiveTab('transactions')}
          >
            <Plus color={colors.primary} size={24} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Nouvelle Transaction
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionCard, { backgroundColor: colors.card }]}
            onPress={handleExportReport}
          >
            <Download color={colors.primary} size={24} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Exporter Rapport
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionCard, { backgroundColor: colors.card }]}
            onPress={() => setActiveTab('budgets')}
          >
            <Target color={colors.primary} size={24} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Gérer Budgets
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionCard, { backgroundColor: colors.card }]}
            onPress={handleRefresh}
          >
            <RefreshCw color={colors.primary} size={24} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Actualiser
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderTransactionsTab = () => (
    <View style={styles.tabContent}>
      {/* Filtres et recherche */}
      <View style={[styles.filtersContainer, { backgroundColor: colors.card }]}>
        <View style={styles.searchContainer}>
          <Search color={colors.text + '60'} size={20} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Rechercher une transaction..."
            placeholderTextColor={colors.text + '60'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterRow}>
          <View style={[styles.filterField, { flex: 1, marginRight: 8 }]}>
            <Picker
              selectedValue={filterType}
              onValueChange={setFilterType}
              style={[styles.picker, { color: colors.text }]}
            >
              <Picker.Item label="Tous types" value="tous" />
              <Picker.Item label="Revenus" value="revenus" />
              <Picker.Item label="Dépenses" value="depenses" />
            </Picker>
          </View>
          
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowTransactionModal(true)}
          >
            <Plus color="#FFFFFF" size={16} />
            <Text style={styles.addButtonText}>Nouvelle</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Liste des transactions */}
      <ScrollView style={styles.transactionsList} showsVerticalScrollIndicator={false}>
        {filteredTransactions.map((transaction) => (
          <View key={transaction.id} style={[styles.transactionCard, { backgroundColor: colors.card }]}>
            <View style={styles.transactionHeader}>
              <View style={styles.transactionInfo}>
                <View style={styles.transactionTop}>
                  <Text style={[styles.transactionDescription, { color: colors.text }]}>
                    {transaction.description}
                  </Text>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'revenus' ? '#10B981' : '#EF4444' }
                  ]}>
                    {transaction.type === 'revenus' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </Text>
                </View>
                
                <View style={styles.transactionDetails}>
                  <Text style={[styles.transactionCategory, { color: colors.text + '80' }]}>
                    📂 {transaction.category} › {transaction.subcategory}
                  </Text>
                  <Text style={[styles.transactionDate, { color: colors.text + '80' }]}>
                    📅 {new Date(transaction.date).toLocaleDateString('fr-FR')}
                  </Text>
                </View>

                <View style={styles.transactionMeta}>
                  <View style={styles.paymentMethod}>
                    <CreditCard color={colors.primary} size={14} />
                    <Text style={[styles.paymentMethodText, { color: colors.primary }]}>
                      {transaction.paymentMethod.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                  
                  {transaction.reference && (
                    <Text style={[styles.transactionReference, { color: colors.text + '60' }]}>
                      🔗 {transaction.reference}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.transactionStatus}>
                <View style={[
                  styles.statusBadge,
                  { 
                    backgroundColor: transaction.status === 'valide' ? '#10B981' + '20' : 
                                   transaction.status === 'en_attente' ? '#F59E0B' + '20' : '#EF4444' + '20'
                  }
                ]}>
                  {transaction.status === 'valide' ? <CheckCircle color="#10B981" size={14} /> :
                   transaction.status === 'en_attente' ? <Clock color="#F59E0B" size={14} /> :
                   <AlertTriangle color="#EF4444" size={14} />}
                  <Text style={[
                    styles.statusText,
                    { 
                      color: transaction.status === 'valide' ? '#10B981' : 
                            transaction.status === 'en_attente' ? '#F59E0B' : '#EF4444'
                    }
                  ]}>
                    {transaction.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>

                <View style={styles.transactionActions}>
                  <TouchableOpacity onPress={() => Alert.alert('👁️ Voir', 'Détails de la transaction')}>
                    <Eye color={colors.primary} size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Alert.alert('✏️ Modifier', 'Modification de la transaction')}>
                    <Edit color="#F59E0B" size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Alert.alert('🗑️ Supprimer', 'Suppression de la transaction')}>
                    <Trash2 color="#EF4444" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderBudgetsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.budgetHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          🎯 Gestion des Budgets - {currentKPIs.period}
        </Text>
        <TouchableOpacity 
          style={[styles.addBudgetButton, { backgroundColor: colors.primary }]}
          onPress={() => Alert.alert('➕ Nouveau Budget', 'Création d\'un nouveau budget')}
        >
          <Plus color="#FFFFFF" size={16} />
          <Text style={styles.addBudgetText}>Nouveau Budget</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {budgets.map((budget) => (
          <View key={budget.id} style={[styles.budgetCard, { backgroundColor: colors.card }]}>
            <View style={styles.budgetCardHeader}>
              <View style={styles.budgetInfo}>
                <Text style={[styles.budgetCategory, { color: colors.text }]}>
                  {budget.category}
                </Text>
                <Text style={[styles.budgetPeriod, { color: colors.text + '80' }]}>
                  {budget.period}
                </Text>
              </View>
              
              <View style={styles.budgetStatus}>
                {getBudgetStatusIcon(budget.status)}
                <Text style={[
                  styles.budgetStatusText,
                  { color: getBudgetStatusColor(budget.status) }
                ]}>
                  {budget.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.budgetAmounts}>
              <View style={styles.budgetAmountRow}>
                <Text style={[styles.budgetLabel, { color: colors.text + '80' }]}>
                  💰 Budget Prévu:
                </Text>
                <Text style={[styles.budgetValue, { color: colors.text }]}>
                  {formatCurrency(budget.budgetedAmount)}
                </Text>
              </View>
              
              <View style={styles.budgetAmountRow}>
                <Text style={[styles.budgetLabel, { color: colors.text + '80' }]}>
                  💸 Montant Réel:
                </Text>
                <Text style={[styles.budgetValue, { color: colors.text }]}>
                  {formatCurrency(budget.actualAmount)}
                </Text>
              </View>

              <View style={styles.budgetAmountRow}>
                <Text style={[styles.budgetLabel, { color: colors.text + '80' }]}>
                  📊 Écart:
                </Text>
                <Text style={[
                  styles.budgetVariance,
                  { color: budget.variance >= 0 ? '#10B981' : '#EF4444' }
                ]}>
                  {budget.variance >= 0 ? '+' : ''}{formatCurrency(budget.variance)}
                  ({budget.variancePercentage >= 0 ? '+' : ''}{budget.variancePercentage.toFixed(1)}%)
                </Text>
              </View>
            </View>

            {/* Barre de progression */}
            <View style={styles.budgetProgress}>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${Math.min((budget.actualAmount / budget.budgetedAmount) * 100, 100)}%`,
                      backgroundColor: getBudgetStatusColor(budget.status)
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: colors.text + '80' }]}>
                {((budget.actualAmount / budget.budgetedAmount) * 100).toFixed(1)}% utilisé
              </Text>
            </View>

            <View style={styles.budgetActions}>
              <TouchableOpacity 
                style={[styles.budgetActionButton, { backgroundColor: colors.primary + '20' }]}
                onPress={() => Alert.alert('👁️ Détails', `Détails du budget ${budget.category}`)}
              >
                <Eye color={colors.primary} size={14} />
                <Text style={[styles.budgetActionText, { color: colors.primary }]}>Détails</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.budgetActionButton, { backgroundColor: '#F59E0B' + '20' }]}
                onPress={() => Alert.alert('✏️ Modifier', `Modification du budget ${budget.category}`)}
              >
                <Edit color="#F59E0B" size={14} />
                <Text style={[styles.budgetActionText, { color: '#F59E0B' }]}>Modifier</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderReportsTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        📊 Rapports Financiers
      </Text>
      
      <View style={styles.reportsGrid}>
        <TouchableOpacity 
          style={[styles.reportCard, { backgroundColor: colors.card }]}
          onPress={() => Alert.alert('📈 Rapport Mensuel', 'Génération du rapport mensuel')}
        >
          <BarChart3 color="#10B981" size={32} />
          <Text style={[styles.reportTitle, { color: colors.text }]}>
            Rapport Mensuel
          </Text>
          <Text style={[styles.reportDescription, { color: colors.text + '80' }]}>
            Analyse détaillée du mois en cours
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.reportCard, { backgroundColor: colors.card }]}
          onPress={() => Alert.alert('📊 Bilan Annuel', 'Génération du bilan annuel')}
        >
          <PieChart color="#3B82F6" size={32} />
          <Text style={[styles.reportTitle, { color: colors.text }]}>
            Bilan Annuel
          </Text>
          <Text style={[styles.reportDescription, { color: colors.text + '80' }]}>
            Vue d'ensemble de l'année
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.reportCard, { backgroundColor: colors.card }]}
          onPress={() => Alert.alert('💰 Cash Flow', 'Analyse des flux de trésorerie')}
        >
          <TrendingUp color="#8B5CF6" size={32} />
          <Text style={[styles.reportTitle, { color: colors.text }]}>
            Analyse Cash Flow
          </Text>
          <Text style={[styles.reportDescription, { color: colors.text + '80' }]}>
            Flux de trésorerie détaillés
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.reportCard, { backgroundColor: colors.card }]}
          onPress={() => Alert.alert('🎯 Budgets vs Réel', 'Comparaison budgets/réel')}
        >
          <Target color="#F59E0B" size={32} />
          <Text style={[styles.reportTitle, { color: colors.text }]}>
            Budgets vs Réel
          </Text>
          <Text style={[styles.reportDescription, { color: colors.text + '80' }]}>
            Comparaison et variances
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.reportCard, { backgroundColor: colors.card }]}
          onPress={() => Alert.alert('📋 Journal Comptable', 'Consultation du journal')}
        >
          <BookOpen color="#EF4444" size={32} />
          <Text style={[styles.reportTitle, { color: colors.text }]}>
            Journal Comptable
          </Text>
          <Text style={[styles.reportDescription, { color: colors.text + '80' }]}>
            Toutes les écritures comptables
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.reportCard, { backgroundColor: colors.card }]}
          onPress={() => Alert.alert('🧾 Factures & Reçus', 'Gestion des documents')}
        >
          <Receipt color="#10B981" size={32} />
          <Text style={[styles.reportTitle, { color: colors.text }]}>
            Factures & Reçus
          </Text>
          <Text style={[styles.reportDescription, { color: colors.text + '80' }]}>
            Documents comptables
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>💰 Comptabilité</Text>
            <Text style={styles.headerSubtitle}>Gestion financière avancée</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw color="#FFFFFF" size={20} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={handleExportReport}
            >
              <Download color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { key: 'dashboard', label: 'Tableau de Bord', icon: <BarChart3 size={16} /> },
          { key: 'transactions', label: 'Transactions', icon: <CreditCard size={16} /> },
          { key: 'budgets', label: 'Budgets', icon: <Target size={16} /> },
          { key: 'reports', label: 'Rapports', icon: <FileText size={16} /> }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && { backgroundColor: colors.primary }
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            {React.cloneElement(tab.icon, { 
              color: activeTab === tab.key ? '#FFFFFF' : colors.text + '80' 
            })}
            <Text style={[
              styles.tabText,
              { color: activeTab === tab.key ? '#FFFFFF' : colors.text + '80' }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'transactions' && renderTransactionsTab()}
        {activeTab === 'budgets' && renderBudgetsTab()}
        {activeTab === 'reports' && renderReportsTab()}
      </Animated.View>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerActionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    marginTop: -12,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    minWidth: 160,
    padding: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  kpiTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  kpiChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kpiChangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartContent: {
    flexDirection: 'row',
    paddingVertical: 20,
    gap: 20,
  },
  chartBar: {
    alignItems: 'center',
    gap: 8,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 4,
  },
  revenueBar: {
    width: 12,
    borderRadius: 6,
  },
  expenseBar: {
    width: 12,
    borderRadius: 6,
  },
  chartLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartValue: {
    fontSize: 10,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  analysisContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analysisCard: {
    flex: 1,
    minWidth: 140,
    padding: 12,
    borderRadius: 8,
  },
  analysisLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  analysisValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  analysisPercentage: {
    fontSize: 11,
    fontWeight: '500',
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: 140,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tabContent: {
    flex: 1,
  },
  filtersContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterField: {
    flex: 1,
  },
  picker: {
    height: 40,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  transactionsList: {
    flex: 1,
  },
  transactionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 16,
  },
  transactionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDetails: {
    marginBottom: 8,
    gap: 4,
  },
  transactionCategory: {
    fontSize: 12,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paymentMethodText: {
    fontSize: 11,
    fontWeight: '600',
  },
  transactionReference: {
    fontSize: 10,
  },
  transactionStatus: {
    alignItems: 'flex-end',
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  transactionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addBudgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addBudgetText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  budgetCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  budgetPeriod: {
    fontSize: 12,
  },
  budgetStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  budgetStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  budgetAmounts: {
    marginBottom: 16,
    gap: 8,
  },
  budgetAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 14,
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  budgetVariance: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  budgetProgress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  budgetActions: {
    flexDirection: 'row',
    gap: 12,
  },
  budgetActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  budgetActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
  },
  reportCard: {
    flex: 1,
    minWidth: 150,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  reportDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
});