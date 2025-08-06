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
import { Search, Filter, Archive, Calendar, User, Download, Eye, Send, FileText, ArrowLeft, Users, BookOpen, CheckCircle, X, AlertTriangle, BarChart, TrendingUp, Shield } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { useNotificationTriggers } from '../../../services/NotificationTriggers';
import {
  Bulletin,
  BulletinValidation,
  BulletinStats,
  BulletinType,
  TrimesterNumber,
  BulletinStatus,
  ValidationLevel,
  BULLETIN_TYPE_LABELS,
  BULLETIN_STATUS_LABELS,
  BULLETIN_STATUS_COLORS,
  VALIDATION_LEVEL_LABELS,
  VALIDATION_LEVEL_COLORS,
  TRIMESTER_LABELS,
  formatBulletinPeriod,
  getBulletinPerformanceColor,
  getBulletinSecurityLevel,
  canUserAccessBulletin,
  canUserModifyBulletin,
  getBulletinCompletionRate
} from '../../../types/Bulletins';

// Données globales pour supervision Direction
const allFamilies = [
  { id: 'parent_1', name: 'M. Diabaté Mamadou', children: ['student_1', 'student_2'] },
  { id: 'parent_2', name: 'Mme Koné Fatou', children: ['student_3'] },
  { id: 'parent_3', name: 'M. N\'Guessan Emmanuel', children: ['student_4', 'student_5'] },
];

const allStudents = [
  { id: 'student_1', name: 'Kouadio Aya', class: '3ème A', parentId: 'parent_1' },
  { id: 'student_2', name: 'N\'Dri Kevin', class: '6ème B', parentId: 'parent_1' },
  { id: 'student_3', name: 'Traoré Aminata', class: '1ère S', parentId: 'parent_2' },
  { id: 'student_4', name: 'Kouassi Junior', class: 'Terminale S', parentId: 'parent_3' },
  { id: 'student_5', name: 'Kouassi Prisca', class: '1ère ES', parentId: 'parent_3' },
];

const allTeachers = [
  { id: 'teacher_1', name: 'Marie N\'Guessan', subjects: ['Mathématiques', 'Physique'] },
  { id: 'teacher_2', name: 'Jean Baptiste', subjects: ['Français', 'Histoire'] },
  { id: 'teacher_3', name: 'Sarah Diallo', subjects: ['SVT', 'Chimie'] },
];

export default function BulletinsManagement() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const notificationTriggers = useNotificationTriggers();
  const isDesktop = width >= 768;
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [filteredBulletins, setFilteredBulletins] = useState<Bulletin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtres ultra-avancés Direction (5 critères)
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedTrimester, setSelectedTrimester] = useState<TrimesterNumber | 0>(0);
  const [selectedType, setSelectedType] = useState<BulletinType | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<BulletinStatus | ''>('');
  const [selectedValidation, setSelectedValidation] = useState<ValidationLevel | ''>('');
  
  // États pour validation et analytics
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState<Bulletin | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [validationAction, setValidationAction] = useState<'validate' | 'reject'>('validate');
  const [validationReason, setValidationReason] = useState('');
  const [validationNotes, setValidationNotes] = useState('');

  const directionUserId = 'direction_admin';

  // Données de démonstration ultra-complètes
  const demoBulletins: Bulletin[] = [
    {
      id: 'BUP_1737890400000_abc123def',
      type: 'pdf_uploaded',
      studentId: 'student_1',
      studentName: 'Kouadio Aya',
      parentId: 'parent_1',
      parentName: 'M. Diabaté Mamadou',
      class: '3ème A',
      school: 'Collège Moderne',
      period: '1er Trimestre 2024-2025',
      trimester: 1,
      year: 2025,
      academicYear: '2024-2025',
      averageGrade: 14.75,
      rank: 3,
      totalStudents: 28,
      subjects: [
        { name: 'Mathématiques', grade: 16.5, coefficient: 4, teacherId: 'teacher_1', teacherName: 'Marie N\'Guessan', teacherComment: 'Très bon niveau' },
        { name: 'Français', grade: 14.0, coefficient: 4, teacherId: 'teacher_2', teacherName: 'Jean Baptiste', teacherComment: 'Peut mieux faire' },
      ],
      generalComment: 'Élève sérieuse et travailleuse.',
      fileUrl: 'bulletins/student_1/bulletin_aya_t1_2025.pdf',
      fileName: 'bulletin_aya_t1_2025.pdf',
      uploadedAt: '2025-01-10T14:00:00Z',
      uploadedBy: 'parent',
      status: 'nouveau',
      validationLevel: 'pending',
      teacherIds: ['teacher_1', 'teacher_2'],
      teacherNames: ['Marie N\'Guessan', 'Jean Baptiste'],
      mainTeacherId: 'teacher_1',
      createdAt: '2025-01-10T14:00:00Z',
      checksum: 'CHK123ABC456DEF',
      isImmutable: false,
      notificationsSent: true,
      notifiedUsers: ['teacher_1', 'teacher_2'],
      viewCount: 2,
      downloadCount: 0,
    },
    {
      id: 'BAG_1737890500000_def456ghi',
      type: 'auto_generated',
      studentId: 'student_2',
      studentName: 'N\'Dri Kevin',
      parentId: 'parent_1',
      parentName: 'M. Diabaté Mamadou',
      class: '6ème B',
      school: 'Collège Sainte-Marie',
      period: '1er Trimestre 2024-2025',
      trimester: 1,
      year: 2025,
      academicYear: '2024-2025',
      averageGrade: 12.25,
      rank: 12,
      totalStudents: 25,
      subjects: [
        { name: 'Français', grade: 13.5, coefficient: 4, teacherId: 'teacher_2', teacherName: 'Jean Baptiste', teacherComment: 'Progrès en lecture' },
        { name: 'Mathématiques', grade: 11.0, coefficient: 4, teacherId: 'teacher_1', teacherName: 'Marie N\'Guessan', teacherComment: 'Difficultés en calcul' },
      ],
      generalComment: 'Élève volontaire mais qui doit fournir plus d\'efforts.',
      generatedAt: '2025-01-08T16:30:00Z',
      generatedBy: 'teacher_1',
      generationMethod: 'automatic',
      status: 'valide',
      validationLevel: 'validated',
      validatedBy: directionUserId,
      validatedAt: '2025-01-09T10:15:00Z',
      teacherIds: ['teacher_1', 'teacher_2'],
      teacherNames: ['Marie N\'Guessan', 'Jean Baptiste'],
      mainTeacherId: 'teacher_1',
      createdAt: '2025-01-08T16:30:00Z',
      checksum: 'CHK789XYZ012ABC',
      isImmutable: true,
      notificationsSent: true,
      notifiedUsers: ['parent_1', 'teacher_1'],
      viewCount: 5,
      downloadCount: 2,
    },
    {
      id: 'BUP_1737890600000_ghi789jkl',
      type: 'pdf_uploaded',
      studentId: 'student_3',
      studentName: 'Traoré Aminata',
      parentId: 'parent_2',
      parentName: 'Mme Koné Fatou',
      class: '1ère S',
      school: 'Lycée Sainte-Marie',
      period: '1er Trimestre 2024-2025',
      trimester: 1,
      year: 2025,
      academicYear: '2024-2025',
      averageGrade: 16.25,
      rank: 2,
      totalStudents: 32,
      subjects: [
        { name: 'Mathématiques', grade: 17.0, coefficient: 4, teacherId: 'teacher_1', teacherName: 'Marie N\'Guessan', teacherComment: 'Excellente élève' },
        { name: 'SVT', grade: 15.5, coefficient: 3, teacherId: 'teacher_3', teacherName: 'Sarah Diallo', teacherComment: 'Très bonne participation' },
      ],
      generalComment: 'Excellente élève, très investie dans ses études.',
      fileUrl: 'bulletins/student_3/bulletin_aminata_t1_2025.pdf',
      fileName: 'bulletin_aminata_t1_2025.pdf',
      uploadedAt: '2025-01-12T09:20:00Z',
      uploadedBy: 'parent',
      status: 'consulte',
      validationLevel: 'validated',
      validatedBy: directionUserId,
      validatedAt: '2025-01-12T15:30:00Z',
      teacherIds: ['teacher_1', 'teacher_3'],
      teacherNames: ['Marie N\'Guessan', 'Sarah Diallo'],
      mainTeacherId: 'teacher_1',
      createdAt: '2025-01-12T09:20:00Z',
      checksum: 'CHK456DEF789ABC',
      isImmutable: true,
      notificationsSent: true,
      notifiedUsers: ['parent_2', 'teacher_1', 'teacher_3'],
      viewCount: 8,
      downloadCount: 3,
    },
  ];

  useEffect(() => {
    const loadBulletins = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBulletins(demoBulletins);
      setFilteredBulletins(demoBulletins);
      setLoading(false);
    };

    loadBulletins();

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
    const filtered = bulletins.filter(bulletin => {
      const matchesSearch = !searchQuery || 
        bulletin.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bulletin.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bulletin.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bulletin.period.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFamily = !selectedFamily || bulletin.parentId === selectedFamily;
      const matchesStudent = !selectedStudent || bulletin.studentId === selectedStudent;
      const matchesTeacher = !selectedTeacher || bulletin.teacherIds.includes(selectedTeacher);
      const matchesYear = bulletin.year === selectedYear;
      const matchesTrimester = selectedTrimester === 0 || bulletin.trimester === selectedTrimester;
      const matchesType = !selectedType || bulletin.type === selectedType;
      const matchesStatus = !selectedStatus || bulletin.status === selectedStatus;
      const matchesValidation = !selectedValidation || bulletin.validationLevel === selectedValidation;
      
      return matchesSearch && matchesFamily && matchesStudent && matchesTeacher && 
             matchesYear && matchesTrimester && matchesType && matchesStatus && matchesValidation;
    });

    setFilteredBulletins(filtered);
  }, [searchQuery, bulletins, selectedFamily, selectedStudent, selectedTeacher, 
      selectedYear, selectedTrimester, selectedType, selectedStatus, selectedValidation]);

  // Calcul des statistiques globales
  const calculateStats = (): BulletinStats => {
    return {
      total: bulletins.length,
      byType: {
        pdf_uploaded: bulletins.filter(b => b.type === 'pdf_uploaded').length,
        auto_generated: bulletins.filter(b => b.type === 'auto_generated').length,
      },
      byStatus: {
        nouveau: bulletins.filter(b => b.status === 'nouveau').length,
        consulte: bulletins.filter(b => b.status === 'consulte').length,
        archive: bulletins.filter(b => b.status === 'archive').length,
        valide: bulletins.filter(b => b.status === 'valide').length,
        en_attente: bulletins.filter(b => b.status === 'en_attente').length,
        rejete: bulletins.filter(b => b.status === 'rejete').length,
      },
      byTrimester: {
        1: bulletins.filter(b => b.trimester === 1).length,
        2: bulletins.filter(b => b.trimester === 2).length,
        3: bulletins.filter(b => b.trimester === 3).length,
      },
      byYear: {
        2025: bulletins.filter(b => b.year === 2025).length,
        2024: bulletins.filter(b => b.year === 2024).length,
      },
      uploadCompletionRate: getBulletinCompletionRate(
        bulletins.filter(b => b.type === 'pdf_uploaded'), 
        allStudents.length * 3 // 3 trimestres par an
      ),
      validationRate: Math.round((bulletins.filter(b => b.validationLevel === 'validated').length / bulletins.length) * 100),
      averageUploadDelay: 5, // Simulation: 5 jours en moyenne
      topPerformingClasses: [
        { class: '1ère S', averageGrade: 16.25, studentCount: 1 },
        { class: '3ème A', averageGrade: 14.75, studentCount: 1 },
        { class: '6ème B', averageGrade: 12.25, studentCount: 1 },
      ],
    };
  };

  const handleValidateBulletin = (bulletin: Bulletin) => {
    setSelectedBulletin(bulletin);
    setValidationAction('validate');
    setValidationReason('');
    setValidationNotes('');
    setShowValidationModal(true);
  };

  const handleRejectBulletin = (bulletin: Bulletin) => {
    setSelectedBulletin(bulletin);
    setValidationAction('reject');
    setValidationReason('');
    setValidationNotes('');
    setShowValidationModal(true);
  };

  const submitValidation = async () => {
    if (!selectedBulletin) return;

    const validation: BulletinValidation = {
      bulletinId: selectedBulletin.id,
      validatorId: directionUserId,
      validatorRole: 'direction',
      action: validationAction,
      reason: validationReason,
      notes: validationNotes,
      validatedAt: new Date().toISOString(),
    };

    const updatedBulletin = {
      ...selectedBulletin,
      validationLevel: validationAction === 'validate' ? 'validated' as ValidationLevel : 'rejected' as ValidationLevel,
      validatedBy: directionUserId,
      validatedAt: new Date().toISOString(),
      status: validationAction === 'validate' ? 'valide' as BulletinStatus : 'rejete' as BulletinStatus,
      isImmutable: validationAction === 'validate',
    };

    const updatedBulletins = bulletins.map(b => 
      b.id === selectedBulletin.id ? updatedBulletin : b
    );
    setBulletins(updatedBulletins);
    setShowValidationModal(false);

    // 🔔 NOTIFICATIONS AUTOMATIQUES
    try {
      if (validationAction === 'validate') {
        // await notificationTriggers.onBulletinValidated({
        //   userId: directionUserId,
        //   userRole: 'direction',
        //   metadata: {
        //     bulletinId: selectedBulletin.id,
        //     bulletinType: selectedBulletin.type,
        //     studentId: selectedBulletin.studentId,
        //     studentName: selectedBulletin.studentName,
        //     parentId: selectedBulletin.parentId,
        //     parentName: selectedBulletin.parentName,
        //     teacherIds: selectedBulletin.teacherIds,
        //     period: selectedBulletin.period,
        //     validatorName: 'Direction AS-Training',
        //     validationNotes: validationNotes
        //   }
        // });
      } else {
        // await notificationTriggers.onBulletinRejected({
        //   userId: directionUserId,
        //   userRole: 'direction',
        //   metadata: {
        //     bulletinId: selectedBulletin.id,
        //     bulletinType: selectedBulletin.type,
        //     studentId: selectedBulletin.studentId,
        //     studentName: selectedBulletin.studentName,
        //     parentId: selectedBulletin.parentId,
        //     parentName: selectedBulletin.parentName,
        //     rejectionReason: validationReason,
        //     correctionNotes: validationNotes
        //   }
        // });
      }

      Alert.alert(
        validationAction === 'validate' ? '✅ Bulletin validé' : '❌ Bulletin rejeté',
        `${selectedBulletin.studentName} - ${selectedBulletin.period}\n\n${validationAction === 'validate' ? 'Le bulletin a été validé et rendu immutable.\nToutes les parties ont été notifiées.' : 'Le bulletin a été rejeté.\nLe parent et les enseignants ont été informés des corrections nécessaires.'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('⚠️ Action effectuée', 'La validation a été effectuée mais les notifications ont échoué');
    }

    setSelectedBulletin(null);
  };

  const handleViewBulletin = (bulletin: Bulletin) => {
    const updatedBulletins = bulletins.map(b => 
      b.id === bulletin.id 
        ? { ...b, viewCount: b.viewCount + 1, lastViewedAt: new Date().toISOString() }
        : b
    );
    setBulletins(updatedBulletins);

    Alert.alert(
      '👁️ Consultation bulletin Direction',
      `${BULLETIN_TYPE_LABELS[bulletin.type]}\n${bulletin.studentName} - ${bulletin.period}\n\n👨‍👩‍👧‍👦 Famille: ${bulletin.parentName}\n📊 Moyenne: ${bulletin.averageGrade}/20\n🏆 Rang: ${bulletin.rank}/${bulletin.totalStudents}\n👨‍🏫 Enseignants: ${bulletin.teacherNames.join(', ')}\n🔒 Sécurité: ${getBulletinSecurityLevel(bulletin)}\n👀 Vues: ${bulletin.viewCount + 1}`,
      [
        { text: 'Fermer', style: 'cancel' },
        ...(bulletin.validationLevel === 'pending' ? [
          { text: '✅ Valider', onPress: () => handleValidateBulletin(bulletin) },
          { text: '❌ Rejeter', onPress: () => handleRejectBulletin(bulletin) }
        ] : []),
        { text: '⬇️ Télécharger', onPress: () => handleDownloadBulletin(bulletin) }
      ]
    );
  };

  const handleDownloadBulletin = (bulletin: Bulletin) => {
    const updatedBulletins = bulletins.map(b => 
      b.id === bulletin.id 
        ? { ...b, downloadCount: b.downloadCount + 1, lastDownloadedAt: new Date().toISOString() }
        : b
    );
    setBulletins(updatedBulletins);

    Alert.alert('⬇️ Téléchargement Direction', 
      `${bulletin.type === 'auto_generated' ? 'Génération PDF Direction en cours...' : `Téléchargement de ${bulletin.fileName} en cours...`}`
    );
  };

  const renderStatsCards = () => {
    const stats = calculateStats();
    
    return (
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statIcon}>
            <Archive color="#3B82F6" size={20} />
          </View>
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Total Bulletins</Text>
          </View>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statIcon}>
            <CheckCircle color="#10B981" size={20} />
          </View>
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.validationRate}%</Text>
            <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Taux Validation</Text>
          </View>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statIcon}>
            <TrendingUp color="#F59E0B" size={20} />
          </View>
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.uploadCompletionRate}%</Text>
            <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Complétude Upload</Text>
          </View>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statIcon}>
            <AlertTriangle color="#EF4444" size={20} />
          </View>
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.byStatus.en_attente}</Text>
            <Text style={[styles.statLabel, { color: colors.text + '80' }]}>En Attente</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderBulletinRow = (bulletin: Bulletin) => {
    if (isDesktop) {
      // Vue table pour desktop
      return (
        <View key={bulletin.id} style={[styles.bulletinRow, { backgroundColor: colors.card }]}>
          <Text style={[styles.cellText, { color: colors.text, flex: 1.5 }]}>{bulletin.parentName}</Text>
          <Text style={[styles.cellText, { color: colors.text, flex: 1.5 }]}>{bulletin.studentName}</Text>
          <Text style={[styles.cellText, { color: colors.text + '80', flex: 2 }]}>{bulletin.teacherNames.join(', ')}</Text>
          <Text style={[styles.cellText, { color: colors.text, flex: 1 }]}>{bulletin.year}</Text>
          <Text style={[styles.cellText, { color: colors.text, flex: 1 }]}>{TRIMESTER_LABELS[bulletin.trimester]}</Text>
          
          <View style={[styles.cellText, { flex: 1.5, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
            <View style={[styles.typeBadge, { 
              backgroundColor: bulletin.type === 'pdf_uploaded' ? '#3B82F6' + '20' : '#10B981' + '20' 
            }]}>
              <Text style={[styles.typeText, { 
                color: bulletin.type === 'pdf_uploaded' ? '#3B82F6' : '#10B981' 
              }]}>
                {bulletin.type === 'pdf_uploaded' ? 'PDF' : 'Généré'}
              </Text>
            </View>
          </View>
          
          <View style={[styles.cellText, { flex: 1.5, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
            <View style={[styles.statusBadge, { backgroundColor: BULLETIN_STATUS_COLORS[bulletin.status] + '20' }]}>
              <Text style={[styles.statusText, { color: BULLETIN_STATUS_COLORS[bulletin.status] }]}>
                {BULLETIN_STATUS_LABELS[bulletin.status]}
              </Text>
            </View>
          </View>
          
          <View style={[styles.cellText, { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
            <TouchableOpacity 
              style={[styles.actionButtonSmall, { backgroundColor: colors.primary + '20' }]}
              onPress={() => handleViewBulletin(bulletin)}
            >
              <Eye color={colors.primary} size={14} />
            </TouchableOpacity>
            
            {bulletin.validationLevel === 'pending' && (
              <>
                <TouchableOpacity 
                  style={[styles.actionButtonSmall, { backgroundColor: '#10B981' + '20' }]}
                  onPress={() => handleValidateBulletin(bulletin)}
                >
                  <CheckCircle color="#10B981" size={14} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButtonSmall, { backgroundColor: '#EF4444' + '20' }]}
                  onPress={() => handleRejectBulletin(bulletin)}
                >
                  <X color="#EF4444" size={14} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      );
    } else {
      // Vue carte pour mobile
      return (
        <View key={bulletin.id} style={[styles.bulletinCard, { backgroundColor: colors.card }]}>
          <View style={styles.bulletinHeader}>
            <View style={styles.bulletinInfo}>
              <Text style={[styles.studentName, { color: colors.text }]}>{bulletin.studentName}</Text>
              <Text style={[styles.parentName, { color: colors.text + '80' }]}>Famille: {bulletin.parentName}</Text>
              <Text style={[styles.bulletinPeriod, { color: colors.text }]}>{bulletin.period}</Text>
              <Text style={[styles.bulletinTeachers, { color: colors.text + '80' }]}>
                👨‍🏫 {bulletin.teacherNames.join(', ')}
              </Text>
            </View>
            
            <View style={styles.bulletinStatus}>
              <View style={[styles.typeBadge, { 
                backgroundColor: bulletin.type === 'pdf_uploaded' ? '#3B82F6' + '20' : '#10B981' + '20' 
              }]}>
                <Text style={[styles.typeText, { 
                  color: bulletin.type === 'pdf_uploaded' ? '#3B82F6' : '#10B981' 
                }]}>
                  {bulletin.type === 'pdf_uploaded' ? '📄 PDF' : '🤖 Généré'}
                </Text>
              </View>
              
              <View style={[styles.statusBadge, { backgroundColor: BULLETIN_STATUS_COLORS[bulletin.status] + '20' }]}>
                <Text style={[styles.statusText, { color: BULLETIN_STATUS_COLORS[bulletin.status] }]}>
                  {BULLETIN_STATUS_LABELS[bulletin.status]}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.bulletinStats}>
            <Text style={[styles.bulletinAverage, { color: getBulletinPerformanceColor(bulletin.averageGrade) }]}>
              📊 {bulletin.averageGrade}/20
            </Text>
            <Text style={[styles.bulletinRank, { color: colors.text + '80' }]}>
              🏆 {bulletin.rank}/{bulletin.totalStudents}
            </Text>
            <Text style={[styles.bulletinSecurity, { color: colors.text + '60' }]}>
              🔒 {getBulletinSecurityLevel(bulletin)}
            </Text>
          </View>
          
          <View style={styles.bulletinActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
              onPress={() => handleViewBulletin(bulletin)}
            >
              <Eye color={colors.primary} size={16} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Voir</Text>
            </TouchableOpacity>
            
            {bulletin.validationLevel === 'pending' && (
              <>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#10B981' + '20' }]}
                  onPress={() => handleValidateBulletin(bulletin)}
                >
                  <CheckCircle color="#10B981" size={16} />
                  <Text style={[styles.actionText, { color: '#10B981' }]}>Valider</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#EF4444' + '20' }]}
                  onPress={() => handleRejectBulletin(bulletin)}
                >
                  <X color="#EF4444" size={16} />
                  <Text style={[styles.actionText, { color: '#EF4444' }]}>Rejeter</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      {/* Fixed Header */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.fixedHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: '#FFFFFF' }]}>📊 Supervision Bulletins</Text>
          <TouchableOpacity 
            style={styles.analyticsButton}
            onPress={() => setShowAnalytics(true)}
          >
            <BarChart color="#FFFFFF" size={20} />
            <Text style={styles.analyticsButtonText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, paddingHorizontal: isDesktop ? 20 : 12 }]}>
          {/* Welcome Section */}
          <View style={[styles.welcomeSection, { backgroundColor: '#FFFFFF', borderBottomColor: '#E5E7EB', marginHorizontal: isDesktop ? -20 : -12 }]}>
            <Text style={[styles.welcomeTitle, { color: '#1F2937' }]}>Gestion complète et validation Direction</Text>
            <Text style={[styles.welcomeSubtitle, { color: '#6B7280' }]}>Supervision des bulletins et analytics avancés</Text>
          </View>
        {/* Statistiques globales */}
        {renderStatsCards()}

        {/* Filtres ultra-avancés Direction */}
        <View style={[styles.filtersContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.filtersTitle, { color: colors.text }]}>🎛️ Filtres Direction (5 Critères)</Text>
          
          {/* Recherche globale */}
          <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Search color={colors.text + '60'} size={20} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Recherche globale (famille, élève, école, période...)"
              placeholderTextColor={colors.text + '60'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Première ligne de filtres */}
          <View style={styles.filterRow}>
            <View style={[styles.filterField, { flex: 1, marginRight: 4 }]}>
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
            
            <View style={[styles.filterField, { flex: 1, marginLeft: 4, marginRight: 4 }]}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>👦 Élève</Text>
              <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <Picker
                  selectedValue={selectedStudent}
                  onValueChange={setSelectedStudent}
                  style={[styles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="Tous les élèves" value="" />
                  {(selectedFamily ? allStudents.filter(s => s.parentId === selectedFamily) : allStudents).map(student => (
                    <Picker.Item key={student.id} label={`${student.name} (${student.class})`} value={student.id} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={[styles.filterField, { flex: 1, marginLeft: 4 }]}>
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
          </View>

          {/* Deuxième ligne de filtres */}
          <View style={styles.filterRow}>
            <View style={[styles.filterField, { flex: 1, marginRight: 4 }]}>
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
            
            <View style={[styles.filterField, { flex: 1, marginLeft: 4, marginRight: 4 }]}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>📊 Trimestre</Text>
              <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <Picker
                  selectedValue={selectedTrimester}
                  onValueChange={setSelectedTrimester}
                  style={[styles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="Tous" value={0} />
                  <Picker.Item label="1er Trimestre" value={1} />
                  <Picker.Item label="2ème Trimestre" value={2} />
                  <Picker.Item label="3ème Trimestre" value={3} />
                </Picker>
              </View>
            </View>
            
            <View style={[styles.filterField, { flex: 1, marginLeft: 4 }]}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>🤖 Type</Text>
              <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <Picker
                  selectedValue={selectedType}
                  onValueChange={setSelectedType}
                  style={[styles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="Tous types" value="" />
                  <Picker.Item label="📄 PDF École" value="pdf_uploaded" />
                  <Picker.Item label="🤖 Généré AS-Training" value="auto_generated" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Troisième ligne de filtres */}
          <View style={styles.filterRow}>
            <View style={[styles.filterField, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>📋 Statut</Text>
              <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <Picker
                  selectedValue={selectedStatus}
                  onValueChange={setSelectedStatus}
                  style={[styles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="Tous statuts" value="" />
                  <Picker.Item label="Nouveau" value="nouveau" />
                  <Picker.Item label="Consulté" value="consulte" />
                  <Picker.Item label="Validé" value="valide" />
                  <Picker.Item label="En attente" value="en_attente" />
                  <Picker.Item label="Rejeté" value="rejete" />
                </Picker>
              </View>
            </View>
            
            <View style={[styles.filterField, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>✅ Validation</Text>
              <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <Picker
                  selectedValue={selectedValidation}
                  onValueChange={setSelectedValidation}
                  style={[styles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="Tous niveaux" value="" />
                  <Picker.Item label="En attente" value="pending" />
                  <Picker.Item label="Validé" value="validated" />
                  <Picker.Item label="Rejeté" value="rejected" />
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {/* En-têtes table desktop */}
        {isDesktop && (
          <View style={[styles.tableHeader, { backgroundColor: colors.card }]}>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>Famille</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>Élève</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>Enseignant(s)</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Année</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Trimestre</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>Type</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>Statut</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Actions</Text>
          </View>
        )}

        {/* Liste des bulletins */}
        <ScrollView style={styles.bulletinsList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.text }]}>Chargement supervision...</Text>
            </View>
          ) : filteredBulletins.length > 0 ? (
            filteredBulletins.map(renderBulletinRow)
          ) : (
            <View style={styles.emptyContainer}>
              <Archive color={colors.text + '40'} size={48} />
              <Text style={[styles.emptyText, { color: colors.text }]}>Aucun bulletin trouvé</Text>
              <Text style={[styles.emptySubtext, { color: colors.text + '80' }]}>
                Ajustez vos filtres pour voir plus de résultats
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </ScrollView>

      {/* Modal de validation */}
      <Modal visible={showValidationModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                {validationAction === 'validate' ? 
                  <CheckCircle color="#10B981" size={24} /> : 
                  <X color="#EF4444" size={24} />
                }
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {validationAction === 'validate' ? 'Valider Bulletin' : 'Rejeter Bulletin'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowValidationModal(false)}>
                <Text style={[styles.closeButton, { color: colors.text }]}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.validationForm} showsVerticalScrollIndicator={false}>
              {selectedBulletin && (
                <View style={styles.bulletinSummary}>
                  <Text style={[styles.summaryTitle, { color: colors.text }]}>📄 Bulletin à {validationAction === 'validate' ? 'valider' : 'rejeter'}</Text>
                  <Text style={[styles.summaryText, { color: colors.text }]}>
                    👦 {selectedBulletin.studentName} ({selectedBulletin.class}){'\n'}
                    👨‍👩‍👧‍👦 {selectedBulletin.parentName}{'\n'}
                    📅 {selectedBulletin.period}{'\n'}
                    🤖 {BULLETIN_TYPE_LABELS[selectedBulletin.type]}
                  </Text>
                </View>
              )}

              {validationAction === 'reject' && (
                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Raison du rejet *</Text>
                  <TextInput
                    style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                    value={validationReason}
                    onChangeText={setValidationReason}
                    placeholder="Indiquez pourquoi ce bulletin est rejeté..."
                    placeholderTextColor={colors.text + '60'}
                  />
                </View>
              )}

              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {validationAction === 'validate' ? 'Notes de validation (optionnel)' : 'Instructions de correction'}
                </Text>
                <TextInput
                  style={[styles.textAreaInput, { color: colors.text, borderColor: colors.border }]}
                  value={validationNotes}
                  onChangeText={setValidationNotes}
                  multiline
                  numberOfLines={4}
                  placeholder={validationAction === 'validate' ? 
                    'Ajoutez des commentaires sur cette validation...' : 
                    'Indiquez les corrections à apporter...'}
                  placeholderTextColor={colors.text + '60'}
                />
              </View>

              <View style={[styles.warningContainer, { 
                backgroundColor: validationAction === 'validate' ? '#10B981' + '10' : '#EF4444' + '10',
                borderColor: validationAction === 'validate' ? '#10B981' + '30' : '#EF4444' + '30'
              }]}>
                <Shield color={validationAction === 'validate' ? '#10B981' : '#EF4444'} size={20} />
                <View style={styles.warningContent}>
                  <Text style={[styles.warningTitle, { 
                    color: validationAction === 'validate' ? '#10B981' : '#EF4444' 
                  }]}>
                    {validationAction === 'validate' ? '✅ Validation Direction' : '❌ Rejet Direction'}
                  </Text>
                  <Text style={[styles.warningDescription, { color: colors.text + '80' }]}>
                    {validationAction === 'validate' ? 
                      'La validation rendra ce bulletin immutable et notifiera toutes les parties concernées.' :
                      'Le rejet notifiera le parent et les enseignants des corrections nécessaires.'}
                  </Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.border }]}
                  onPress={() => setShowValidationModal(false)}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.validateButton, { 
                    backgroundColor: validationAction === 'validate' ? '#10B981' : '#EF4444' 
                  }]}
                  onPress={submitValidation}
                >
                  {validationAction === 'validate' ? 
                    <CheckCircle color="#FFFFFF" size={16} /> : 
                    <X color="#FFFFFF" size={16} />
                  }
                  <Text style={styles.validateButtonText}>
                    {validationAction === 'validate' ? 'Valider Définitivement' : 'Rejeter Bulletin'}
                  </Text>
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
    paddingTop: 60,
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
    paddingTop: 60,
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
  analyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  analyticsButtonText: {
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
    marginBottom: 12,
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
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  bulletinsList: {
    flex: 1,
  },
  bulletinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cellText: {
    fontSize: 12,
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionButtonSmall: {
    padding: 6,
    borderRadius: 6,
  },
  bulletinCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bulletinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bulletinInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  parentName: {
    fontSize: 12,
    marginBottom: 2,
  },
  bulletinPeriod: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  bulletinTeachers: {
    fontSize: 12,
  },
  bulletinStatus: {
    alignItems: 'flex-end',
    gap: 6,
  },
  bulletinStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bulletinAverage: {
    fontSize: 14,
    fontWeight: '600',
  },
  bulletinRank: {
    fontSize: 12,
  },
  bulletinSecurity: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
  bulletinActions: {
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
    maxHeight: '80%',
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
  validationForm: {
    padding: 20,
  },
  bulletinSummary: {
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
  textInput: {
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  warningContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  warningDescription: {
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
  validateButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  validateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});