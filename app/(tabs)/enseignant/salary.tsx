import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Alert,
  useWindowDimensions,
  Modal,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleCheck as CheckCircle, Clock, TriangleAlert as AlertTriangle, Download, Eye, X, Mail, Phone } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface Contract {
  id: string;
  studentName: string;
  parentName: string;
  subject: string;
  sessionRate: number;
  sessionsCount: number;
  totalAmount: number;
}

interface SalaryDetail {
  month: string;
  year: number;
  validatedSessions: number;
  sessionRate: number; // Ce tarif est basé sur le coût par séance du contrat associé.
  totalAmount: number;
  bonuses?: number;
  deductions?: number;
  finalAmount: number;
  status: 'calculé' | 'validé' | 'payé' | 'disponible';
  paymentDate?: string;
  canDownload: boolean;
  contracts: Contract[];
  sessionDetails: {
    date: string;
    studentName: string;
    subject: string;
    duration: string;
    amount: number;
    status: 'validée';
  }[];
}

// Fonction pour calculer automatiquement le salaire basé sur les séances validées
const calculateSalary = (validatedSessions: number, sessionRate: number, bonuses: number = 0, deductions: number = 0): SalaryDetail => {
  const totalAmount = validatedSessions * sessionRate;
  const finalAmount = totalAmount + bonuses - deductions;
  
  return {
    validatedSessions,
    sessionRate,
    totalAmount,
    bonuses,
    deductions,
    finalAmount,
  } as SalaryDetail;
};

// Fonction pour générer le HTML du relevé
const generatePayslipHTML = (period: SalaryDetail): string => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Relevé de Salaire - ${period.month} ${period.year}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f8f9fa;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #059669, #10B981);
          color: white;
          padding: 30px;
          text-align: center;
          position: relative;
        }
        .logo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 20px;
          display: block;
          background: white;
          padding: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .company-info {
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .company-info p {
          margin: 5px 0;
          font-size: 14px;
        }
        .content {
          padding: 30px;
        }
        .salary-header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border-radius: 10px;
        }
        .period-title {
          font-size: 24px;
          font-weight: bold;
          color: #059669;
          margin-bottom: 10px;
        }
        .amount {
          font-size: 32px;
          font-weight: bold;
          color: #059669;
          text-align: center;
          margin: 15px 0;
        }
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          margin: 10px 0;
        }
        .status-paid {
          background-color: #10B981;
          color: white;
        }
        .status-available {
          background-color: #3B82F6;
          color: white;
        }
        .status-calculated {
          background-color: #6B7280;
          color: white;
        }
        .contracts-section {
          margin: 30px 0;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-bottom: 15px;
          border-bottom: 2px solid #059669;
          padding-bottom: 5px;
        }
        .contracts-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        .contracts-table th,
        .contracts-table td {
          border: 1px solid #e5e7eb;
          padding: 12px;
          text-align: left;
        }
        .contracts-table th {
          background-color: #059669;
          color: white;
          font-weight: bold;
        }
        .contracts-table tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .contracts-table tr:hover {
          background-color: #f3f4f6;
        }
        .calculation-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
        }
        .calculation-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .calculation-row:last-child {
          border-bottom: none;
          font-weight: bold;
          font-size: 16px;
          color: #059669;
        }
        .sessions-details {
          margin: 20px 0;
        }
        .session-item {
          background: white;
          padding: 12px;
          margin: 8px 0;
          border-radius: 8px;
          border-left: 4px solid #059669;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .session-date {
          font-weight: bold;
          color: #059669;
        }
        .session-info {
          color: #666;
          font-size: 14px;
        }
        .signature-section {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .signature-box {
          width: 200px;
          text-align: center;
        }
        .signature-line {
          border-top: 2px solid #333;
          margin-top: 50px;
          margin-bottom: 10px;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #e5e7eb;
        }
        .payment-info {
          background: #d1fae5;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
          border-left: 4px solid #10B981;
        }
        .payment-date {
          font-weight: bold;
          color: #059669;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiMwNTk2NjkiLz4KPHN2ZyB4PSIyMCIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyTDEzLjA5IDguMjZMMjIgOS4yN0wxNC44MSAxNC4xNEwxNi4xOCAyMUwxMiAxNy43N0w3LjgyIDIxTDkuMTkgMTQuMTRMMiA5LjI3TDEwLjkxIDguMjZMMTIgMloiLz4KPC9zdmc+Cjwvc3ZnPgo=" class="logo" alt="AS-TRAINING Logo">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">AS-TRAINING</h1>
          <div class="company-info">
            <p><strong>Direction AS-TRAINING</strong></p>
            <p>📧 Email : groupeas.infos@yahoo.fr</p>
            <p>📞 Téléphone : 07 59 63 27 88</p>
            <p>📍 Centre de Formation</p>
          </div>
        </div>
        
        <div class="content">
          <div class="salary-header">
            <div class="period-title">Relevé de Salaire - ${period.month} ${period.year}</div>
            <div class="amount">${formatAmount(period.finalAmount)}</div>
            <div class="status-badge ${period.status === 'payé' ? 'status-paid' : period.status === 'disponible' ? 'status-available' : 'status-calculated'}">
              ${period.status === 'payé' ? 'PAYÉ' : period.status === 'disponible' ? 'DISPONIBLE' : 'CALCULÉ'}
            </div>
            ${period.paymentDate ? `<div class="payment-info">
              <span class="payment-date">💳 Payé le ${formatDate(period.paymentDate)}</span>
            </div>` : ''}
          </div>
          
          <div class="contracts-section">
            <div class="section-title">📋 Détail des Contrats</div>
            <table class="contracts-table">
              <thead>
                <tr>
                  <th>Élève</th>
                  <th>Parent</th>
                  <th>Matière</th>
                  <th>Séances</th>
                  <th>Tarif/Séance</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${period.contracts.map(contract => `
                  <tr>
                    <td><strong>${contract.studentName}</strong></td>
                    <td>${contract.parentName}</td>
                    <td>${contract.subject}</td>
                    <td>${contract.sessionsCount}</td>
                    <td>${formatAmount(contract.sessionRate)}</td>
                    <td><strong>${formatAmount(contract.totalAmount)}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="calculation-section">
            <div class="section-title">🧮 Formule de Calcul</div>
            <div class="calculation-row">
              <span>Séances validées :</span>
              <span><strong>${period.validatedSessions}</strong></span>
            </div>
            <div class="calculation-row">
              <span>Tarif par séance :</span>
              <span><strong>${formatAmount(period.sessionRate)}</strong></span>
            </div>
            <div class="calculation-row">
              <span>Montant de base :</span>
              <span><strong>${formatAmount(period.totalAmount)}</strong></span>
            </div>
            ${period.bonuses && period.bonuses > 0 ? `
            <div class="calculation-row">
              <span>➕ Bonus :</span>
              <span><strong>+${formatAmount(period.bonuses)}</strong></span>
            </div>
            ` : ''}
            ${period.deductions && period.deductions > 0 ? `
            <div class="calculation-row">
              <span>➖ Déductions :</span>
              <span><strong>-${formatAmount(period.deductions)}</strong></span>
            </div>
            ` : ''}
            <div class="calculation-row">
              <span>💰 Montant final :</span>
              <span><strong>${formatAmount(period.finalAmount)}</strong></span>
            </div>
          </div>
          
          <div class="sessions-details">
            <div class="section-title">📅 Détail des Séances</div>
            ${period.sessionDetails.map(session => `
              <div class="session-item">
                <div class="session-date">${formatDate(session.date)}</div>
                <div class="session-info">
                  <strong>${session.studentName}</strong> • ${session.subject} • ${session.duration} • ${formatAmount(session.amount)}
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <p>Signature de l'enseignant</p>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <p>Signature de la direction</p>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Document généré automatiquement par AS-TRAINING</strong></p>
          <p>📧 Pour toute question : groupeas.infos@yahoo.fr</p>
          <p>📞 Téléphone : 07 59 63 27 88</p>
          <p>💳 Paiement effectué le 8 de chaque mois pour le salaire du mois précédent</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default function TeacherSalary() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;

  const [fadeAnim] = useState(new Animated.Value(0));
  const [salaryData, setSalaryData] = useState<SalaryDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<SalaryDetail | null>(null);

  // États pour la contestation
  const [showContestModal, setShowContestModal] = useState(false);
  const [showContestConfirmModal, setShowContestConfirmModal] = useState(false);
  const [showContestMethodModal, setShowContestMethodModal] = useState(false);
  const [selectedContestAmount, setSelectedContestAmount] = useState<{amount: number, studentName: string, parentName: string} | null>(null);

  // Données fictives
  const generateDemoSalaryData = (): SalaryDetail[] => {
    const baseSessionRate = 15000; // Coût par séance basé sur le contrat
    
    const januaryData = {
      month: 'Janvier',
      year: 2025,
      validatedSessions: 12,
      sessionRate: baseSessionRate,
      bonuses: 20000,
      deductions: 0,
      status: 'payé' as const,
      paymentDate: '2025-02-08',
      canDownload: true,
      contracts: [
        {
          id: '1',
          studentName: 'Kouadio Aya',
          parentName: 'Kouadio Jean',
          subject: 'Mathématiques',
          sessionRate: baseSessionRate,
          sessionsCount: 6,
          totalAmount: 90000,
        },
        {
          id: '2',
          studentName: 'Traoré Aminata',
          parentName: 'Traoré Moussa',
          subject: 'Physique',
          sessionRate: baseSessionRate,
          sessionsCount: 6,
          totalAmount: 90000,
        },
      ],
      sessionDetails: [
        { date: '2025-01-15', studentName: 'Kouadio Aya', subject: 'Mathématiques', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-01-17', studentName: 'Kouadio Aya', subject: 'Physique', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-01-19', studentName: 'Traoré Aminata', subject: 'Mathématiques', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-01-22', studentName: 'Traoré Aminata', subject: 'Chimie', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-01-24', studentName: 'Kouadio Aya', subject: 'Mathématiques', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-01-26', studentName: 'Traoré Aminata', subject: 'Physique', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-01-28', studentName: 'Kouadio Aya', subject: 'Chimie', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-01-29', studentName: 'Traoré Aminata', subject: 'Mathématiques', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-01-30', studentName: 'Kouadio Aya', subject: 'Physique', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-01-31', studentName: 'Traoré Aminata', subject: 'Chimie', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-01-02', studentName: 'Kouadio Aya', subject: 'Mathématiques', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-01-05', studentName: 'Traoré Aminata', subject: 'Physique', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
      ],
    };

    const februaryData = {
      month: 'Février',
      year: 2025,
      validatedSessions: 8,
      sessionRate: baseSessionRate,
      bonuses: 0,
      deductions: 0,
      status: 'disponible' as const,
      canDownload: true,
      contracts: [
        {
          id: '3',
          studentName: 'Kouadio Aya',
          parentName: 'Kouadio Jean',
          subject: 'Mathématiques',
          sessionRate: baseSessionRate,
          sessionsCount: 4,
          totalAmount: 60000,
        },
        {
          id: '4',
          studentName: 'Traoré Aminata',
          parentName: 'Traoré Moussa',
          subject: 'Chimie',
          sessionRate: baseSessionRate,
          sessionsCount: 4,
          totalAmount: 60000,
        },
      ],
      sessionDetails: [
        { date: '2025-02-02', studentName: 'Kouadio Aya', subject: 'Mathématiques', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-02-05', studentName: 'Traoré Aminata', subject: 'Chimie', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-02-07', studentName: 'Kouadio Aya', subject: 'Physique', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-02-09', studentName: 'Traoré Aminata', subject: 'Mathématiques', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-02-12', studentName: 'Kouadio Aya', subject: 'Chimie', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-02-14', studentName: 'Traoré Aminata', subject: 'Physique', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-02-16', studentName: 'Kouadio Aya', subject: 'Mathématiques', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-02-18', studentName: 'Traoré Aminata', subject: 'Chimie', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
      ],
    };

    const marchData = {
      month: 'Mars',
      year: 2025,
      validatedSessions: 15,
      sessionRate: baseSessionRate,
      bonuses: 25000,
      deductions: 5000,
      status: 'calculé' as const,
      canDownload: false, // Pas encore disponible car mois en cours
      contracts: [
        {
          id: '5',
          studentName: 'Kouadio Aya',
          parentName: 'Kouadio Jean',
          subject: 'Mathématiques',
          sessionRate: baseSessionRate,
          sessionsCount: 8,
          totalAmount: 120000,
        },
        {
          id: '6',
          studentName: 'Traoré Aminata',
          parentName: 'Traoré Moussa',
          subject: 'Physique',
          sessionRate: baseSessionRate,
          sessionsCount: 7,
          totalAmount: 105000,
        },
      ],
      sessionDetails: [
        { date: '2025-03-01', studentName: 'Kouadio Aya', subject: 'Mathématiques', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-03-03', studentName: 'Traoré Aminata', subject: 'Physique', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-03-05', studentName: 'Kouadio Aya', subject: 'Chimie', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-03-07', studentName: 'Traoré Aminata', subject: 'Mathématiques', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-03-09', studentName: 'Kouadio Aya', subject: 'Physique', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-03-11', studentName: 'Traoré Aminata', subject: 'Chimie', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-03-13', studentName: 'Kouadio Aya', subject: 'Mathématiques', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-03-15', studentName: 'Traoré Aminata', subject: 'Physique', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-03-17', studentName: 'Kouadio Aya', subject: 'Chimie', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-03-19', studentName: 'Traoré Aminata', subject: 'Mathématiques', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-03-21', studentName: 'Kouadio Aya', subject: 'Physique', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-03-23', studentName: 'Traoré Aminata', subject: 'Chimie', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-03-25', studentName: 'Kouadio Aya', subject: 'Mathématiques', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-03-27', studentName: 'Traoré Aminata', subject: 'Physique', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
        { date: '2025-03-29', studentName: 'Kouadio Aya', subject: 'Chimie', duration: '2h', amount: baseSessionRate, status: 'validée' as const },
      ],
    };

    // Calcul automatique du salaire pour chaque période
    const januaryCalculated = calculateSalary(
      januaryData.validatedSessions,
      januaryData.sessionRate,
      januaryData.bonuses,
      januaryData.deductions
    );

    const februaryCalculated = calculateSalary(
      februaryData.validatedSessions,
      februaryData.sessionRate,
      februaryData.bonuses,
      februaryData.deductions
    );

    const marchCalculated = calculateSalary(
      marchData.validatedSessions,
      marchData.sessionRate,
      marchData.bonuses,
      marchData.deductions
    );

    return [
      { ...januaryData, ...januaryCalculated },
      { ...februaryData, ...februaryCalculated },
      { ...marchData, ...marchCalculated },
    ];
  };

  useEffect(() => {
    const loadSalaryData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = generateDemoSalaryData();
      
      // Appliquer les vérifications automatiques
      const updatedData = data.map(period => {
        let updatedPeriod = checkPaymentStatus(period);
        updatedPeriod = checkDownloadAvailability(updatedPeriod);
        return updatedPeriod;
      });
      
      setSalaryData(updatedData);
      setSelectedPeriod(updatedData[0]);
      setLoading(false);
    };

    loadSalaryData();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleContestSalary = () => {
    setShowContestModal(true);
  };

  // Fonction pour tester la génération du HTML
  const testHTMLGeneration = (period: SalaryDetail) => {
    try {
      const html = generatePayslipHTML(period);
      console.log('Test HTML généré avec succès');
      console.log('Longueur HTML:', html.length);
      console.log('Début HTML:', html.substring(0, 200));
      return true;
    } catch (error) {
      console.error('Erreur lors de la génération du HTML:', error);
      return false;
    }
  };

  // Fonction pour télécharger le relevé
  const handleDownloadPayslip = async (period: SalaryDetail) => {
    if (!period.canDownload) {
    Alert.alert(
        'Relevé non disponible',
        "Le relevé de salaire n'est disponible qu'à partir du 1er du mois suivant ou pour les salaires déjà payés.",
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      console.log('Génération du relevé pour:', period.month, period.year);
      
      // Tester d'abord la génération du HTML
      if (!testHTMLGeneration(period)) {
        throw new Error('Échec de la génération du HTML');
      }
      
      const html = generatePayslipHTML(period);
      console.log('HTML généré, longueur:', html.length);
      
      // Générer le PDF
      const { uri } = await Print.printToFileAsync({ 
        html,
        base64: false
      });
      
      console.log('PDF généré à:', uri);
      
      // Vérifier si le partage est disponible
      const isSharingAvailable = await Sharing.isAvailableAsync();
      console.log('Partage disponible:', isSharingAvailable);
      
      if (isSharingAvailable) {
        try {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Relevé de salaire - ${period.month} ${period.year}`,
            UTI: 'com.adobe.pdf'
          });
          console.log('Partage réussi');
        } catch (shareError) {
          console.error('Erreur lors du partage:', shareError);
          Alert.alert(
            'Erreur de partage',
            'Le fichier a été généré mais le partage a échoué. Vérifiez les permissions de votre appareil.',
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert(
          'Téléchargement',
          'Fonction de partage non disponible sur cet appareil. Le fichier a été généré.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Erreur lors de la génération du relevé:', error);
      Alert.alert(
        'Erreur',
        'Impossible de générer le relevé de salaire. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    }
  };

  // Fonction pour sélectionner un montant à contester
  const handleSelectContestAmount = (amount: number, studentName: string, parentName: string) => {
    setSelectedContestAmount({ amount, studentName, parentName });
    setShowContestModal(false);
    setShowContestConfirmModal(true);
  };

  // Fonction pour confirmer la contestation
  const handleConfirmContest = () => {
    setShowContestConfirmModal(false);
    setShowContestMethodModal(true);
  };

  // Fonction pour choisir la méthode de contestation
  const handleChooseContestMethod = (method: 'email' | 'sms') => {
    
    if (method === 'email') {
      const subject = encodeURIComponent('Contestation de salaire - AS-TRAINING');
      const body = encodeURIComponent(
        `Bonjour,\n\nJe souhaite contester le calcul de mon salaire pour la séance suivante :\n\n` +
        `- Montant contesté : ${formatAmount(selectedContestAmount?.amount || 0)}\n` +
        `- Élève : ${selectedContestAmount?.studentName}\n` +
        `- Parent : ${selectedContestAmount?.parentName}\n\n` +
        `Merci de bien vouloir examiner cette contestation.\n\nCordialement`
      );
      
      Linking.openURL(`mailto:groupeas.infos@yahoo.fr?subject=${subject}&body=${body}`);
    } else {
      const message = encodeURIComponent(
        `Bonjour, je souhaite contester le calcul de mon salaire pour la séance : ` +
        `${formatAmount(selectedContestAmount?.amount || 0)} - ${selectedContestAmount?.studentName} (${selectedContestAmount?.parentName})`
      );
      
      Linking.openURL(`sms:0759632788&body=${message}`);
    }
    
    // Réinitialiser les états
    setShowContestMethodModal(false);
    setSelectedContestAmount(null);
  };

  // Fonction pour vérifier le salaire
  const handleVerifySalary = () => {
    setShowContestConfirmModal(false);
    setSelectedContestAmount(null);
    // Ici on pourrait rediriger vers la page de détail du salaire
    Alert.alert(
      'Vérification',
      'Vous pouvez maintenant examiner votre relevé de salaire en détail.',
      [{ text: 'OK' }]
    );
  };

  const simulateNewSession = () => {
    if (!selectedPeriod) return;
    
    const newSession = {
      date: new Date().toISOString().split('T')[0],
      studentName: 'Nouvel Étudiant',
      subject: 'Mathématiques',
      duration: '2h',
      amount: selectedPeriod.sessionRate,
      status: 'validée' as const,
    };

    const updatedPeriod = {
      ...selectedPeriod,
      validatedSessions: selectedPeriod.validatedSessions + 1,
      sessionDetails: [...selectedPeriod.sessionDetails, newSession],
    };

    const recalculated = calculateSalary(
      updatedPeriod.validatedSessions,
      updatedPeriod.sessionRate,
      updatedPeriod.bonuses,
      updatedPeriod.deductions
    );

    const finalUpdatedPeriod = { ...updatedPeriod, ...recalculated };
    
    setSelectedPeriod(finalUpdatedPeriod);
    
    setSalaryData(prevData => 
      prevData.map(period => 
        period.month === selectedPeriod.month && period.year === selectedPeriod.year 
          ? finalUpdatedPeriod 
          : period
      )
    );

    Alert.alert(
      'Nouvelle séance ajoutée',
      `Une nouvelle séance validée a été ajoutée. Salaire recalculé : ${formatAmount(finalUpdatedPeriod.finalAmount)}`
    );
  };

  const handleViewDetails = (period: SalaryDetail) => {
    setSelectedPeriod(period);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'calculé':
        return '#6B7280';
      case 'disponible':
        return '#3B82F6';
      case 'validé':
        return '#3B82F6';
      case 'payé':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'calculé':
        return <Clock color="#6B7280" size={16} />;
      case 'disponible':
        return <CheckCircle color="#3B82F6" size={16} />;
      case 'validé':
        return <CheckCircle color="#3B82F6" size={16} />;
      case 'payé':
        return <CheckCircle color="#10B981" size={16} />;
      default:
        return null;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';
  };

  // Fonction pour obtenir le numéro du mois (0-11)
  const getMonthNumber = (monthName: string) => {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return months.indexOf(monthName);
  };

  // Fonction pour vérifier si un salaire doit être marqué comme payé
  const checkPaymentStatus = (period: SalaryDetail): SalaryDetail => {
    const now = new Date();
    const periodDate = new Date(period.year, getMonthNumber(period.month), 1);
    const paymentDate = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 8);
    
    // Si on est après le 8 du mois suivant et que le statut n'est pas encore payé
    if (now >= paymentDate && period.status !== 'payé') {
      return {
        ...period,
        status: 'payé' as const,
        paymentDate: paymentDate.toISOString().split('T')[0],
        canDownload: true,
      };
    }
    
    return period;
  };

  // Fonction pour vérifier la disponibilité du relevé
  const checkDownloadAvailability = (period: SalaryDetail): SalaryDetail => {
    const now = new Date();
    const periodDate = new Date(period.year, getMonthNumber(period.month), 1);
    const nextMonth = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 1);
    
    let canDownload = false;
    let status = period.status;
    
    // Si c'est le mois en cours et qu'on est après le 1er du mois suivant
    if (now >= nextMonth && period.status === 'calculé') {
      status = 'disponible' as const;
      canDownload = true;
    }
    
    // Si c'est un mois passé et payé
    if (period.status === 'payé') {
      canDownload = true;
    }
    
    return {
      ...period,
      status,
      canDownload,
    };
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={['#059669', '#10B981']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Mon Salaire</Text>
            <Text style={styles.headerSubtitle}>Chargement...</Text>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Chargement des données...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={['#059669', '#10B981']} style={styles.header}>
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <Text style={styles.headerTitle}>Mon Salaire</Text>
          <Text style={styles.headerSubtitle}>
            Suivi transparent de vos rémunérations
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim, paddingHorizontal: isMobile ? 16 : 32 }]}>
        {selectedPeriod && (
            <View style={[styles.currentSalaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.salaryHeader}>
                <Text style={[styles.currentPeriod, { color: colors.text }]}>
                {selectedPeriod.month} {selectedPeriod.year}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedPeriod.status) }]}>
                {getStatusIcon(selectedPeriod.status)}
                <Text style={styles.statusText}>
                  {selectedPeriod.status === 'calculé' ? 'Calculé' :
                     selectedPeriod.status === 'disponible' ? 'Disponible' :
                   selectedPeriod.status === 'validé' ? 'Validé' : 'Payé'}
                </Text>
              </View>
            </View>

            <View style={styles.amountDisplay}>
                <Text style={[styles.finalAmountLabel, { color: colors.text }]}>Montant final</Text>
                <Text style={[styles.finalAmountValue, { color: colors.primary }]}>
                {formatAmount(selectedPeriod.finalAmount)}
              </Text>
            </View>

              <View style={[styles.calculationDetails, { backgroundColor: colors.background }]}>
                <Text style={[styles.calculationTitle, { color: colors.text }]}>Calcul du salaire</Text>
              <View style={styles.calculationRow}>
                  <Text style={[styles.calculationLabel, { color: colors.text }]}>Séances validées:</Text>
                  <Text style={[styles.calculationValue, { color: colors.text }]}>{selectedPeriod.validatedSessions}</Text>
              </View>
              <View style={styles.calculationRow}>
                  <Text style={[styles.calculationLabel, { color: colors.text }]}>Tarif par séance:</Text>
                  <Text style={[styles.calculationValue, { color: colors.text }]}>{formatAmount(selectedPeriod.sessionRate)}</Text>
              </View>
              <View style={styles.calculationRow}>
                  <Text style={[styles.calculationLabel, { color: colors.text }]}>Montant de base:</Text>
                  <Text style={[styles.calculationValue, { color: colors.text }]}>{formatAmount(selectedPeriod.totalAmount)}</Text>
              </View>
              {selectedPeriod.bonuses && selectedPeriod.bonuses > 0 && (
                <View style={styles.calculationRow}>
                    <Text style={[styles.calculationLabel, { color: colors.primary }]}>Bonus:</Text>
                    <Text style={[styles.calculationValue, { color: colors.primary }]}>+{formatAmount(selectedPeriod.bonuses)}</Text>
                </View>
              )}
              {selectedPeriod.deductions && selectedPeriod.deductions > 0 && (
                <View style={styles.calculationRow}>
                    <Text style={[styles.calculationLabel, { color: colors.notification }]}>Déductions:</Text>
                    <Text style={[styles.calculationValue, { color: colors.notification }]}>-{formatAmount(selectedPeriod.deductions)}</Text>
                </View>
              )}
                <View style={[styles.calculationFormula, { backgroundColor: colors.card }]}>
                  <Text style={[styles.formulaText, { color: colors.text }]}>
                    Formule: ({selectedPeriod.validatedSessions} × {formatAmount(selectedPeriod.sessionRate)}) 
                    {selectedPeriod.bonuses && selectedPeriod.bonuses > 0 ? ` + ${formatAmount(selectedPeriod.bonuses)}` : ''}
                    {selectedPeriod.deductions && selectedPeriod.deductions > 0 ? ` - ${formatAmount(selectedPeriod.deductions)}` : ''}
                    {' = '}{formatAmount(selectedPeriod.finalAmount)}
                  </Text>
                </View>
            </View>

            {selectedPeriod.paymentDate && (
                <View style={[styles.paymentInfo, { backgroundColor: colors.card }]}>
                  <CheckCircle color={colors.primary} size={16} />
                  <Text style={[styles.paymentText, { color: colors.primary }]}>
                  Payé le {selectedPeriod.paymentDate}
                </Text>
              </View>
            )}

              <View style={[styles.actionButtons, { flexDirection: isMobile ? 'column' : 'row' }]}>
              <TouchableOpacity 
                  style={[
                    styles.downloadButton, 
                    { 
                      backgroundColor: selectedPeriod.canDownload ? colors.card : colors.border,
                      marginBottom: isMobile ? 8 : 0,
                      opacity: selectedPeriod.canDownload ? 1 : 0.5
                    }
                  ]}
                onPress={() => handleDownloadPayslip(selectedPeriod)}
                  disabled={!selectedPeriod.canDownload}
                >
                  <Download color={selectedPeriod.canDownload ? colors.primary : colors.text} size={20} />
                  <Text style={[
                    styles.downloadButtonText, 
                    { color: selectedPeriod.canDownload ? colors.primary : colors.text }
                  ]}>
                    {selectedPeriod.canDownload ? 'Télécharger relevé' : 'Relevé non disponible'}
                  </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                  style={[styles.contestButton, { backgroundColor: colors.card }]}
                onPress={handleContestSalary}
              >
                  <AlertTriangle color={colors.notification} size={20} />
                  <Text style={[styles.contestButtonText, { color: colors.notification }]}>Contester</Text>
              </TouchableOpacity>
            </View>

              {selectedPeriod.status === 'disponible' && (
                <View style={[styles.availabilityInfo, { backgroundColor: colors.card }]}>
                  <Text style={[styles.availabilityText, { color: colors.primary }]}>
                    💰 Salaire disponible ! Vous pouvez télécharger votre relevé et le présenter à la direction pour recevoir votre paiement.
                  </Text>
                </View>
              )}

              <TouchableOpacity 
                style={[styles.simulateButton, { backgroundColor: colors.card }]}
                onPress={simulateNewSession}
              >
                <Text style={[styles.simulateButtonText, { color: colors.primary }]}>
                  🧪 Simuler une nouvelle séance validée
                </Text>
              </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Détail des Séances</Text>
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.infoText, { color: colors.text }]}>
                💡 Le salaire est calculé automatiquement : chaque séance validée ajoute {formatAmount(selectedPeriod?.sessionRate || 15000)} au salaire mensuel.
              </Text>
            </View>
            <ScrollView style={[styles.sessionsList, { maxHeight: isMobile ? 150 : 250 }]} showsVerticalScrollIndicator={false}>
            {selectedPeriod?.sessionDetails.map((session, index) => (
                <View key={index} style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.sessionInfo}>
                    <Text style={[styles.sessionDate, { color: colors.text }]}>{session.date}</Text>
                    <Text style={[styles.sessionStudent, { color: colors.primary }]}>{session.studentName}</Text>
                    <Text style={[styles.sessionSubject, { color: colors.text }]}>{session.subject} • {session.duration}</Text>
                </View>
                  <Text style={[styles.sessionAmount, { color: colors.primary }]}>{formatAmount(session.amount)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Historique des Paiements</Text>
            <ScrollView style={[styles.historyList, { maxHeight: isMobile ? 150 : 200 }]} showsVerticalScrollIndicator={false}>
            {salaryData.map((period, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.historyCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    selectedPeriod?.month === period.month && selectedPeriod?.year === period.year && { borderColor: colors.primary, backgroundColor: colors.card }
                ]}
                  onPress={() => handleViewDetails(period)}
              >
                <View style={styles.historyInfo}>
                    <Text style={[styles.historyPeriod, { color: colors.text }]}>{period.month} {period.year}</Text>
                    <Text style={[styles.historyAmount, { color: colors.primary }]}>{formatAmount(period.finalAmount)}</Text>
                </View>
                  <View style={styles.historyActions}>
                <View style={[styles.historyStatus, { backgroundColor: getStatusColor(period.status) }]}>
                  {getStatusIcon(period.status)}
                    </View>
                    <TouchableOpacity onPress={() => handleViewDetails(period)}>
                      <Eye color={colors.primary} size={20} />
                    </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.View>
      </ScrollView>

      <Modal
        visible={showContestModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowContestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Contester le Calcul</Text>
            <Text style={[styles.modalMessage, { color: colors.text }]}>
              Sélectionnez le montant pour lequel vous n&apos;êtes pas d&apos;accord :
            </Text>
            
            <ScrollView 
              style={{ maxHeight: isMobile ? 300 : 250, width: '100%' }}
              showsVerticalScrollIndicator={false}
            >
              {selectedPeriod?.sessionDetails.map((session, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.contestItem, 
                    { 
                      backgroundColor: colors.background, 
                      borderColor: colors.border,
                      marginHorizontal: isMobile ? 0 : 10
                    }
                  ]}
                  onPress={() => handleSelectContestAmount(session.amount, session.studentName, 'Parent')}
                >
                  <View style={styles.contestItemInfo}>
                    <Text style={[styles.contestItemAmount, { color: colors.primary }]}>
                      {formatAmount(session.amount)}
                    </Text>
                    <Text style={[styles.contestItemStudent, { color: colors.text }]}>
                      {session.studentName}
                    </Text>
                    <Text style={[styles.contestItemDate, { color: colors.text }]}>
                      {session.date} • {session.subject}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.border, marginTop: 16 }]}
              onPress={() => setShowContestModal(false)}
            >
              <X color={colors.text} size={20} />
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showContestConfirmModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowContestConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Confirmation de Contestation</Text>
            <Text style={[styles.modalMessage, { color: colors.text }]}>
              Vous voulez contester ce salaire. Veuillez vérifier bien votre salaire avant de continuer.
            </Text>
            
            {selectedContestAmount && (
              <View style={[styles.contestDetails, { backgroundColor: colors.card, borderColor: colors.notification }]}>
                <Text style={[styles.contestDetailText, { color: colors.text }]}>
                  Montant contesté : {formatAmount(selectedContestAmount.amount)}
                </Text>
                <Text style={[styles.contestDetailText, { color: colors.text }]}>
                  Élève : {selectedContestAmount.studentName}
                </Text>
                <Text style={[styles.contestDetailText, { color: colors.text }]}>
                  Parent : {selectedContestAmount.parentName}
                </Text>
              </View>
            )}
            
            <View style={[styles.modalButtonRow, { flexDirection: isMobile ? 'column' : 'row' }]}>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  { 
                    backgroundColor: colors.primary, 
                    flex: isMobile ? 0 : 1, 
                    marginRight: isMobile ? 0 : 8,
                    marginBottom: isMobile ? 8 : 0,
                    minWidth: isMobile ? 200 : 'auto'
                  }
                ]}
                onPress={handleVerifySalary}
              >
                <CheckCircle color="#FFFFFF" size={20} />
                <Text style={styles.modalButtonText}>Vérifier</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  { 
                    backgroundColor: colors.notification, 
                    flex: isMobile ? 0 : 1, 
                    marginLeft: isMobile ? 0 : 8,
                    minWidth: isMobile ? 200 : 'auto'
                  }
                ]}
                onPress={handleConfirmContest}
              >
                <AlertTriangle color="#FFFFFF" size={20} />
                <Text style={styles.modalButtonText}>Continuer</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.border, marginTop: 16 }]}
              onPress={() => setShowContestConfirmModal(false)}
            >
              <X color={colors.text} size={20} />
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showContestMethodModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowContestMethodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Choisir la Méthode de Contestation</Text>
            <Text style={[styles.modalMessage, { color: colors.text }]}>
              Veuillez choisir la méthode de contestation pour le montant de {formatAmount(selectedContestAmount?.amount || 0)} :
            </Text>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary, marginTop: 16 }]}
              onPress={() => {
                handleChooseContestMethod('email');
              }}
            >
              <Mail color="#FFFFFF" size={20} />
              <Text style={styles.modalButtonText}>Par Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.notification, marginTop: 12 }]}
              onPress={() => {
                handleChooseContestMethod('sms');
              }}
            >
              <Phone color="#FFFFFF" size={20} />
              <Text style={styles.modalButtonText}>Par SMS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.border, marginTop: 16 }]}
              onPress={() => setShowContestMethodModal(false)}
            >
              <X color={colors.text} size={20} />
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  currentSalaryCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  salaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  currentPeriod: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  amountDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  finalAmountLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  finalAmountValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  calculationDetails: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  calculationTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  calculationFormula: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  formulaText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  paymentText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  actionButtons: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  contestButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 8,
  },
  contestButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  simulateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  simulateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  sessionsList: {
    maxHeight: 250,
  },
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  sessionStudent: {
    fontSize: 14,
    marginBottom: 4,
  },
  sessionSubject: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  sessionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyList: {
    maxHeight: 200,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyInfo: {
    flex: 1,
  },
  historyPeriod: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  historyActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  availabilityInfo: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
  },
  availabilityText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  contestItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 280,
  },
  contestItemInfo: {
    marginLeft: 0,
  },
  contestItemAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#059669',
  },
  contestItemStudent: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: '500',
  },
  contestItemDate: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#6b7280',
  },
  contestDetails: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#fbbf24',
    backgroundColor: '#fef3c7',
    minWidth: 280,
  },
  contestDetailText: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
    gap: 12,
  },
});