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
import { Plus, Search, Filter, Archive, GraduationCap, Star, TrendingUp, TrendingDown, Upload, X, Calendar, FileText, Shield, Eye, Download, AlertTriangle } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@react-navigation/native';
import { useNotificationTriggers } from '../../../services/NotificationTriggers';
import * as DocumentPicker from 'expo-document-picker';
import {
  Grade,
  GRADE_SUBJECTS,
  getGradeColor,
  calculatePercentage
} from '../../../types/Grades';
import {
  Bulletin,
  BulletinUploadData,
  BulletinType,
  TrimesterNumber,
  BULLETIN_TYPE_LABELS,
  BULLETIN_STATUS_LABELS,
  BULLETIN_STATUS_COLORS,
  TRIMESTER_LABELS,
  validateBulletinFile,
  checkBulletinDuplicate,
  generateBulletinId,
  generateBulletinChecksum,
  formatBulletinPeriod,
  generateAcademicYear,
  getBulletinPerformanceColor,
  getBulletinSecurityLevel
} from '../../../types/Bulletins';

type TabType = 'grades' | 'bulletins';

// Données des enfants du parent connecté
const parentChildren = [
  { id: 'student_1', name: 'Kouadio Aya', class: '3ème A', school: 'Collège Moderne' },
  { id: 'student_2', name: 'N\'Dri Kevin', class: '6ème B', school: 'Collège Sainte-Marie' }
];

// Enseignants associés aux enfants
const childrenTeachers = {
  'student_1': [
    { id: 'teacher_1', name: 'Marie N\'Guessan', subjects: ['Mathématiques', 'Physique'] },
    { id: 'teacher_2', name: 'Jean Baptiste', subjects: ['Français', 'Histoire'] }
  ],
  'student_2': [
    { id: 'teacher_1', name: 'Marie N\'Guessan', subjects: ['Mathématiques'] },
    { id: 'teacher_3', name: 'Sarah Diallo', subjects: ['Français', 'SVT'] }
  ]
};

export default function ParentGradesReports() {
  const { colors } = useTheme();
  const { triggers } = useNotificationTriggers();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [activeTab, setActiveTab] = useState<TabType>('grades');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Filtres pour les notes
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  
  // Filtres pour les bulletins
  const [bulletinSelectedChild, setBulletinSelectedChild] = useState<string>('');
  const [bulletinSelectedType, setBulletinSelectedType] = useState<BulletinType | ''>('');
  const [bulletinSelectedTrimester, setBulletinSelectedTrimester] = useState<TrimesterNumber | 0>(0);
  const [bulletinSelectedYear, setBulletinSelectedYear] = useState<number>(2025);
  
  // Formulaire upload bulletin avec validation anti-fraude
  const [uploadData, setUploadData] = useState<Partial<BulletinUploadData>>({
    studentId: '',
    trimester: 1,
    year: 2025,
    academicYear: '',
    file: null,
    fileName: '',
    fileSize: 0,
    fileType: '',
    originalFileName: '',
    uploadNotes: ''
  });

  const parentId = 'parent_1';
  const parentName = 'M. Diabaté Mamadou';

  // Données de démonstration améliorées avec les deux types de bulletins
  const demoGrades: Grade[] = [
    {
      id: 'grade_1',
      studentId: 'student_1',
      studentName: 'Kouadio Aya',
      parentId: parentId,
      parentName: parentName,
      teacherId: 'teacher_1',
      teacherName: 'Marie N\'Guessan',
      subject: 'Mathématiques',
      type: 'devoir',
      grade: 16,
      maxGrade: 20,
      percentage: 80,
      performanceLevel: 'tres_bien',
      date: '2025-01-15',
      month: 0,
      year: 2025,
      comment: 'Excellent travail sur les équations',
      isRetake: false,
      createdAt: '2025-01-15T10:30:00Z',
    },
    {
      id: 'grade_2',
      studentId: 'student_2',
      studentName: 'N\'Dri Kevin',
      parentId: parentId,
      parentName: parentName,
      teacherId: 'teacher_3',
      teacherName: 'Sarah Diallo',
      subject: 'Français',
      type: 'interrogation',
      grade: 12,
      maxGrade: 20,
      percentage: 60,
      performanceLevel: 'passable',
      date: '2025-01-14',
      month: 0,
      year: 2025,
      comment: 'Peut mieux faire en expression',
      isRetake: false,
      createdAt: '2025-01-14T14:15:00Z',
    },
  ];

  const demoBulletins: Bulletin[] = [
    {
      id: 'BUP_1737890400000_abc123def',
      type: 'pdf_uploaded',
      studentId: 'student_1',
      studentName: 'Kouadio Aya',
      parentId: parentId,
      parentName: parentName,
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
        { name: 'Mathématiques', grade: 16.5, coefficient: 4, teacherComment: 'Très bon niveau' },
        { name: 'Français', grade: 14.0, coefficient: 4, teacherComment: 'Peut mieux faire' },
      ],
      generalComment: 'Élève sérieuse et travailleuse.',
      fileUrl: 'bulletins/student_1/bulletin_aya_t1_2025.pdf',
      fileName: 'bulletin_aya_t1_2025.pdf',
      fileSize: 1024000,
      fileType: 'application/pdf',
      originalFileName: 'bulletin_original_aya.pdf',
      uploadedAt: '2025-01-10T14:00:00Z',
      uploadedBy: 'parent',
      status: 'valide',
      validationLevel: 'validated',
      validatedBy: 'direction_admin',
      validatedAt: '2025-01-11T09:00:00Z',
      teacherIds: ['teacher_1', 'teacher_2'],
      teacherNames: ['Marie N\'Guessan', 'Jean Baptiste'],
      mainTeacherId: 'teacher_1',
      createdAt: '2025-01-10T14:00:00Z',
      checksum: 'CHK123ABC456DEF',
      isImmutable: true,
      notificationsSent: true,
      notifiedUsers: ['teacher_1', 'teacher_2', 'direction_admin'],
      viewCount: 5,
      downloadCount: 2,
    },
    {
      id: 'BAG_1737890500000_def456ghi',
      type: 'auto_generated',
      studentId: 'student_2',
      studentName: 'N\'Dri Kevin',
      parentId: parentId,
      parentName: parentName,
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
        { name: 'Français', grade: 13.5, coefficient: 4, teacherComment: 'Progrès en lecture' },
        { name: 'Mathématiques', grade: 11.0, coefficient: 4, teacherComment: 'Difficultés en calcul' },
      ],
      generalComment: 'Élève volontaire mais qui doit fournir plus d\'efforts.',
      generatedAt: '2025-01-08T16:30:00Z',
      generatedBy: 'teacher_3',
      generationMethod: 'automatic',
      status: 'consulte',
      validationLevel: 'validated',
      validatedBy: 'direction_admin',
      validatedAt: '2025-01-09T10:15:00Z',
      teacherIds: ['teacher_1', 'teacher_3'],
      teacherNames: ['Marie N\'Guessan', 'Sarah Diallo'],
      mainTeacherId: 'teacher_3',
      createdAt: '2025-01-08T16:30:00Z',
      checksum: 'CHK789XYZ012ABC',
      isImmutable: true,
      notificationsSent: true,
      notifiedUsers: ['parent_1', 'direction_admin'],
      viewCount: 3,
      downloadCount: 1,
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGrades(demoGrades);
      setBulletins(demoBulletins);
      setLoading(false);
    };

    loadData();

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

  // Obtenir les enseignants d'un enfant
  const getTeachersForChild = (childId: string) => {
    return childrenTeachers[childId as keyof typeof childrenTeachers] || [];
  };

  // Filtrer les notes selon les critères
  const getFilteredGrades = () => {
    return grades.filter(grade => {
      const matchesChild = !selectedChild || grade.studentId === selectedChild;
      const matchesTeacher = !selectedTeacher || grade.teacherId === selectedTeacher;
      const matchesMonth = selectedMonth === 0 || grade.month === selectedMonth - 1;
      const matchesYear = grade.year === selectedYear;
      const matchesSearch = !searchQuery || 
        grade.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grade.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grade.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesChild && matchesTeacher && matchesMonth && matchesYear && matchesSearch;
    });
  };

  // Filtrer les bulletins selon les critères
  const getFilteredBulletins = () => {
    return bulletins.filter(bulletin => {
      const matchesChild = !bulletinSelectedChild || bulletin.studentId === bulletinSelectedChild;
      const matchesType = !bulletinSelectedType || bulletin.type === bulletinSelectedType;
      const matchesTrimester = bulletinSelectedTrimester === 0 || bulletin.trimester === bulletinSelectedTrimester;
      const matchesYear = bulletin.year === bulletinSelectedYear;
      const matchesSearch = !searchQuery || 
        bulletin.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bulletin.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bulletin.period.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesChild && matchesType && matchesTrimester && matchesYear && matchesSearch;
    });
  };

  const handleUploadBulletin = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        const validation = validateBulletinFile(file);
        
        if (!validation.isValid) {
          Alert.alert('❌ Erreur de validation', validation.error);
          return;
        }

        // Calcul de l'année académique
        const academicYear = generateAcademicYear(uploadData.year || 2025, uploadData.trimester || 1);

        setUploadData(prev => ({
          ...prev,
          file: file,
          fileName: file.name,
          fileSize: file.size || 0,
          fileType: file.mimeType || 'application/octet-stream',
          originalFileName: file.name,
          academicYear: academicYear
        }));
      }
    } catch (error) {
      Alert.alert('❌ Erreur', 'Impossible de sélectionner le fichier');
    }
  };

  const validateUploadData = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!uploadData.studentId) {
      errors.push('Veuillez sélectionner un élève');
    }

    if (!uploadData.file) {
      errors.push('Veuillez sélectionner un fichier');
    }

    // Vérification anti-doublons
    if (uploadData.studentId && uploadData.trimester && uploadData.year) {
      const isDuplicate = checkBulletinDuplicate(
        bulletins,
        uploadData.studentId,
        uploadData.trimester,
        uploadData.year,
        'pdf_uploaded'
      );

      if (isDuplicate) {
        errors.push(`Un bulletin PDF existe déjà pour ${TRIMESTER_LABELS[uploadData.trimester!]} ${uploadData.year}`);
      }
    }

    // Vérification appartenance élève
    const studentBelongsToParent = parentChildren.some(child => child.id === uploadData.studentId);
    if (uploadData.studentId && !studentBelongsToParent) {
      errors.push('Élève non autorisé pour ce parent');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleSubmitBulletin = async () => {
    const validation = validateUploadData();
    
    if (!validation.isValid) {
      Alert.alert(
        '❌ Erreurs de validation',
        validation.errors.join('\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    const student = parentChildren.find(c => c.id === uploadData.studentId);
    if (!student) return;

    // Simulation du processus d'upload avec barre de progression
    setUploadProgress(0);
    
    // Simulation upload
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(uploadInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    await new Promise(resolve => setTimeout(resolve, 2000));
    clearInterval(uploadInterval);
    setUploadProgress(100);

    // Génération des métadonnées sécurisées
    const bulletinId = generateBulletinId('pdf_uploaded');
    const checksum = generateBulletinChecksum({
      studentId: uploadData.studentId,
      trimester: uploadData.trimester,
      year: uploadData.year,
      averageGrade: 0
    });

    const newBulletin: Bulletin = {
      id: bulletinId,
      type: 'pdf_uploaded',
      studentId: uploadData.studentId!,
      studentName: student.name,
      parentId: parentId,
      parentName: parentName,
      class: student.class,
      school: student.school,
      period: formatBulletinPeriod(uploadData.trimester!, uploadData.year!),
      trimester: uploadData.trimester!,
      year: uploadData.year!,
      academicYear: uploadData.academicYear!,
      averageGrade: 0, // À remplir lors de la validation Direction
      rank: 0,
      totalStudents: 0,
      subjects: [],
      generalComment: uploadData.uploadNotes || '',
      fileUrl: `bulletins/${uploadData.studentId}/${Date.now()}-${uploadData.fileName}`,
      fileName: uploadData.fileName,
      fileSize: uploadData.fileSize,
      fileType: uploadData.fileType,
      originalFileName: uploadData.originalFileName,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'parent',
      status: 'nouveau',
      validationLevel: 'pending',
      teacherIds: getTeachersForChild(uploadData.studentId!).map(t => t.id),
      teacherNames: getTeachersForChild(uploadData.studentId!).map(t => t.name),
      mainTeacherId: getTeachersForChild(uploadData.studentId!)[0]?.id,
      createdAt: new Date().toISOString(),
      checksum: checksum,
      isImmutable: false, // Devient immutable après validation
      notificationsSent: false,
      notifiedUsers: [],
      viewCount: 0,
      downloadCount: 0,
    };

    setBulletins([newBulletin, ...bulletins]);
    setShowUploadModal(false);
    setUploadProgress(0);

    // 🔔 NOTIFICATIONS AUTOMATIQUES AVEC ANTI-FRAUDE
    try {
      const teacherIds = getTeachersForChild(uploadData.studentId!).map(t => t.id);
      
      await triggers.onBulletinUploaded({
        userId: parentId,
        userRole: 'parent',
        metadata: {
          bulletinId: bulletinId,
          bulletinType: 'pdf_uploaded',
          studentId: uploadData.studentId,
          studentName: student.name,
          parentName: parentName,
          period: newBulletin.period,
          trimester: uploadData.trimester,
          year: uploadData.year,
          academicYear: uploadData.academicYear,
          fileSize: uploadData.fileSize,
          fileType: uploadData.fileType,
          checksum: checksum,
          securityLevel: 'medium',
          teacherIds: teacherIds,
          uploadNotes: uploadData.uploadNotes
        }
      });

      Alert.alert(
        '✅ Upload réussi',
        `Bulletin uploadé avec succès !\n\n🔐 Sécurité: Checksum généré\n📤 Notifications envoyées\n⏳ En attente de validation Direction`,
        [{ text: 'Parfait' }]
      );
    } catch (error) {
      Alert.alert('⚠️ Upload réussi', 'Le bulletin a été uploadé mais les notifications ont échoué');
    }

    // Réinitialiser le formulaire
    setUploadData({
      studentId: '',
      trimester: 1,
      year: 2025,
      academicYear: '',
      file: null,
      fileName: '',
      fileSize: 0,
      fileType: '',
      originalFileName: '',
      uploadNotes: ''
    });
  };

  const handleViewBulletin = (bulletin: Bulletin) => {
    // Incrémenter le compteur de vues
    const updatedBulletins = bulletins.map(b => 
      b.id === bulletin.id 
        ? { ...b, viewCount: b.viewCount + 1, lastViewedAt: new Date().toISOString() }
        : b
    );
    setBulletins(updatedBulletins);

    Alert.alert(
      '👁️ Consultation bulletin',
      `${BULLETIN_TYPE_LABELS[bulletin.type]}\n${bulletin.studentName} - ${bulletin.period}\n\n📊 Moyenne: ${bulletin.averageGrade}/20\n🏆 Rang: ${bulletin.rank}/${bulletin.totalStudents}\n🔒 Sécurité: ${getBulletinSecurityLevel(bulletin)}\n👀 Vues: ${bulletin.viewCount + 1}`,
      [
        { text: 'Fermer', style: 'cancel' },
        { text: '⬇️ Télécharger', onPress: () => handleDownloadBulletin(bulletin) }
      ]
    );
  };

  const handleDownloadBulletin = (bulletin: Bulletin) => {
    // Incrémenter le compteur de téléchargements
    const updatedBulletins = bulletins.map(b => 
      b.id === bulletin.id 
        ? { ...b, downloadCount: b.downloadCount + 1, lastDownloadedAt: new Date().toISOString() }
        : b
    );
    setBulletins(updatedBulletins);

    Alert.alert('⬇️ Téléchargement', `Téléchargement de ${bulletin.fileName} en cours...`);
  };

  const renderGradeCard = (grade: Grade) => (
    <View key={grade.id} style={[styles.gradeCard, { backgroundColor: colors.card }]}>
      <View style={styles.gradeHeader}>
        <View style={styles.gradeInfo}>
          <Text style={[styles.studentName, { color: colors.text }]}>{grade.studentName}</Text>
          <Text style={[styles.subjectText, { color: colors.text }]}>{grade.subject}</Text>
          <Text style={[styles.teacherName, { color: colors.text + '80' }]}>Par {grade.teacherName}</Text>
        </View>
        <View style={styles.gradeValue}>
          <Text style={[styles.gradeNumber, { color: getGradeColor(grade.grade, grade.maxGrade) }]}>
            {grade.grade}/{grade.maxGrade}
          </Text>
          <Text style={[styles.gradePercentage, { color: colors.text + '80' }]}>
            {grade.percentage}%
          </Text>
        </View>
      </View>
      
      <View style={styles.gradeDetails}>
        <View style={[styles.typeBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.typeText, { color: colors.primary }]}>
            {grade.type === 'devoir' ? 'Devoir' : 'Interrogation'}
          </Text>
        </View>
        <Text style={[styles.gradeDate, { color: colors.text + '60' }]}>
          {new Date(grade.date).toLocaleDateString('fr-FR')}
        </Text>
      </View>
      
      {grade.comment && (
        <Text style={[styles.gradeComment, { color: colors.text + '80' }]}>
          💬 {grade.comment}
        </Text>
      )}
    </View>
  );

  const renderBulletinCard = (bulletin: Bulletin) => (
    <View key={bulletin.id} style={[styles.bulletinCard, { backgroundColor: colors.card }]}>
      <View style={styles.bulletinHeader}>
        <View style={styles.bulletinInfo}>
          <View style={styles.bulletinTitleRow}>
            <Text style={[styles.studentName, { color: colors.text }]}>{bulletin.studentName}</Text>
            <View style={styles.bulletinTypeBadge}>
              <Text style={[styles.bulletinTypeText, { 
                color: bulletin.type === 'pdf_uploaded' ? '#3B82F6' : '#10B981' 
              }]}>
                {bulletin.type === 'pdf_uploaded' ? 'PDF École' : 'Généré AS-Training'}
              </Text>
            </View>
          </View>
          <Text style={[styles.bulletinPeriod, { color: colors.text }]}>{bulletin.period}</Text>
          <Text style={[styles.bulletinSchool, { color: colors.text + '80' }]}>{bulletin.school}</Text>
          
          {/* Indicateur de sécurité */}
          <View style={styles.securityIndicator}>
            <Shield color={getBulletinSecurityLevel(bulletin) === 'high' ? '#10B981' : 
                          getBulletinSecurityLevel(bulletin) === 'medium' ? '#F59E0B' : '#EF4444'} size={14} />
            <Text style={[styles.securityText, { color: colors.text + '60' }]}>
              Sécurité: {getBulletinSecurityLevel(bulletin)}
            </Text>
          </View>
        </View>
        
        <View style={styles.bulletinStatus}>
          <View style={[styles.statusBadge, { backgroundColor: BULLETIN_STATUS_COLORS[bulletin.status] + '20' }]}>
            <Text style={[styles.statusText, { color: BULLETIN_STATUS_COLORS[bulletin.status] }]}>
              {BULLETIN_STATUS_LABELS[bulletin.status]}
            </Text>
          </View>
          
          {bulletin.validationLevel === 'validated' && (
            <View style={[styles.validationBadge, { backgroundColor: '#10B981' + '20' }]}>
              <Text style={[styles.validationText, { color: '#10B981' }]}>✓ Validé</Text>
            </View>
          )}
        </View>
      </View>
      
      {bulletin.averageGrade > 0 && (
        <View style={styles.bulletinStats}>
          <Text style={[styles.bulletinAverage, { color: getBulletinPerformanceColor(bulletin.averageGrade) }]}>
            Moyenne: {bulletin.averageGrade}/20
          </Text>
          <Text style={[styles.bulletinRank, { color: colors.text + '80' }]}>
            Rang: {bulletin.rank}/{bulletin.totalStudents}
          </Text>
          <Text style={[styles.bulletinViews, { color: colors.text + '60' }]}>
            👀 {bulletin.viewCount} vues
          </Text>
        </View>
      )}
      
      <View style={styles.bulletinActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
          onPress={() => handleViewBulletin(bulletin)}
        >
          <Eye color={colors.primary} size={16} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Consulter</Text>
        </TouchableOpacity>
        
        {bulletin.fileUrl && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#10B981' + '20' }]}
            onPress={() => handleDownloadBulletin(bulletin)}
          >
            <Download color="#10B981" size={16} />
            <Text style={[styles.actionText, { color: '#10B981' }]}>Télécharger</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderGradesTab = () => (
    <View style={styles.tabContent}>
      {/* Filtres avancés pour les notes */}
      <View style={[styles.filtersContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.filtersTitle, { color: colors.text }]}>Filtres Notes</Text>
        
        <View style={styles.filterRow}>
          <View style={[styles.filterField, { flex: 1, marginRight: 8 }]}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Enfant</Text>
            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
              <Picker
                selectedValue={selectedChild}
                onValueChange={setSelectedChild}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Tous mes enfants" value="" />
                {parentChildren.map(child => (
                  <Picker.Item key={child.id} label={child.name} value={child.id} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={[styles.filterField, { flex: 1, marginLeft: 8 }]}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Enseignant</Text>
            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
              <Picker
                selectedValue={selectedTeacher}
                onValueChange={setSelectedTeacher}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Tous" value="" />
                {selectedChild 
                  ? getTeachersForChild(selectedChild).map(teacher => (
                      <Picker.Item key={teacher.id} label={teacher.name} value={teacher.id} />
                    ))
                  : [...new Set(grades.map(g => ({ id: g.teacherId, name: g.teacherName })))].map(teacher => (
                      <Picker.Item key={teacher.id} label={teacher.name} value={teacher.id} />
                    ))
                }
              </Picker>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.gradesList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={[styles.loadingText, { color: colors.text }]}>Chargement...</Text>
        ) : getFilteredGrades().length > 0 ? (
          getFilteredGrades().map(renderGradeCard)
        ) : (
          <Text style={[styles.emptyText, { color: colors.text }]}>Aucune note trouvée</Text>
        )}
      </ScrollView>
    </View>
  );

  const renderBulletinsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.bulletinHeaderSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Bulletins Scolaires</Text>
        <TouchableOpacity 
          style={[styles.uploadButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowUploadModal(true)}
        >
          <Upload color="#FFFFFF" size={16} />
          <Text style={styles.uploadButtonText}>Upload PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Filtres avancés pour les bulletins */}
      <View style={[styles.filtersContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.filtersTitle, { color: colors.text }]}>Filtres Bulletins</Text>
        
        <View style={styles.filterRow}>
          <View style={[styles.filterField, { flex: 1, marginRight: 4 }]}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Enfant</Text>
            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
              <Picker
                selectedValue={bulletinSelectedChild}
                onValueChange={setBulletinSelectedChild}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Tous" value="" />
                {parentChildren.map(child => (
                  <Picker.Item key={child.id} label={child.name} value={child.id} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={[styles.filterField, { flex: 1, marginLeft: 4, marginRight: 4 }]}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Type</Text>
            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
              <Picker
                selectedValue={bulletinSelectedType}
                onValueChange={setBulletinSelectedType}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Tous types" value="" />
                <Picker.Item label="PDF École" value="pdf_uploaded" />
                <Picker.Item label="Généré AS-Training" value="auto_generated" />
              </Picker>
            </View>
          </View>
          
          <View style={[styles.filterField, { flex: 1, marginLeft: 4 }]}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Trimestre</Text>
            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
              <Picker
                selectedValue={bulletinSelectedTrimester}
                onValueChange={setBulletinSelectedTrimester}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Tous" value={0} />
                <Picker.Item label="1er Trimestre" value={1} />
                <Picker.Item label="2ème Trimestre" value={2} />
                <Picker.Item label="3ème Trimestre" value={3} />
              </Picker>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.bulletinsList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={[styles.loadingText, { color: colors.text }]}>Chargement...</Text>
        ) : getFilteredBulletins().length > 0 ? (
          getFilteredBulletins().map(renderBulletinCard)
        ) : (
          <Text style={[styles.emptyText, { color: colors.text }]}>Aucun bulletin trouvé</Text>
        )}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header fixe */}
      <LinearGradient colors={['#EA580C', '#F97316']} style={styles.fixedHeader}>
        <Text style={styles.pageTitle}>📚 Notes & Bulletins</Text>
        <View style={styles.headerBadge}>
          <Shield color="#FFFFFF" size={16} />
          <Text style={styles.headerBadgeText}>Sécurisé</Text>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Recherche globale */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Search color={colors.text + '60'} size={20} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Rechercher notes ou bulletins..."
            placeholderTextColor={colors.text + '60'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Onglets améliorés */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'grades' && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('grades')}
          >
            <Star color={activeTab === 'grades' ? '#FFFFFF' : colors.text} size={20} />
            <Text style={[styles.tabText, { color: activeTab === 'grades' ? '#FFFFFF' : colors.text }]}>
              Notes ({getFilteredGrades().length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'bulletins' && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('bulletins')}
          >
            <Archive color={activeTab === 'bulletins' ? '#FFFFFF' : colors.text} size={20} />
            <Text style={[styles.tabText, { color: activeTab === 'bulletins' ? '#FFFFFF' : colors.text }]}>
              Bulletins ({getFilteredBulletins().length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenu des onglets */}
        {activeTab === 'grades' ? renderGradesTab() : renderBulletinsTab()}
      </Animated.View>

      {/* Modal d'upload de bulletin avec validation anti-fraude */}
      <Modal visible={showUploadModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Shield color={colors.primary} size={24} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Upload Bulletin Sécurisé</Text>
              </View>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.uploadForm} showsVerticalScrollIndicator={false}>
              {/* Sélection élève */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Élève *</Text>
                <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                  <Picker
                    selectedValue={uploadData.studentId}
                    onValueChange={(value) => {
                      const academicYear = generateAcademicYear(uploadData.year || 2025, uploadData.trimester || 1);
                      setUploadData(prev => ({ ...prev, studentId: value, academicYear }));
                    }}
                    style={[styles.picker, { color: colors.text }]}
                  >
                    <Picker.Item label="Sélectionner un élève" value="" />
                    {parentChildren.map(child => (
                      <Picker.Item
                        key={child.id}
                        label={`${child.name} (${child.class})`}
                        value={child.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Trimestre et Année */}
              <View style={styles.periodRow}>
                <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Trimestre *</Text>
                  <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                    <Picker
                      selectedValue={uploadData.trimester}
                      onValueChange={(value) => {
                        const academicYear = generateAcademicYear(uploadData.year || 2025, value as TrimesterNumber);
                        setUploadData(prev => ({ ...prev, trimester: value as TrimesterNumber, academicYear }));
                      }}
                      style={[styles.picker, { color: colors.text }]}
                    >
                      <Picker.Item label="1er Trimestre" value={1} />
                      <Picker.Item label="2ème Trimestre" value={2} />
                      <Picker.Item label="3ème Trimestre" value={3} />
                    </Picker>
                  </View>
                </View>
                
                <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Année *</Text>
                  <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                    <Picker
                      selectedValue={uploadData.year}
                      onValueChange={(value) => {
                        const academicYear = generateAcademicYear(value, uploadData.trimester || 1);
                        setUploadData(prev => ({ ...prev, year: value, academicYear }));
                      }}
                      style={[styles.picker, { color: colors.text }]}
                    >
                      <Picker.Item label="2025" value={2025} />
                      <Picker.Item label="2024" value={2024} />
                      <Picker.Item label="2023" value={2023} />
                    </Picker>
                  </View>
                </View>
              </View>

              {/* Affichage année académique calculée */}
              {uploadData.academicYear && (
                <View style={styles.infoContainer}>
                  <Calendar color={colors.primary} size={16} />
                  <Text style={[styles.infoText, { color: colors.text }]}>
                    Année scolaire: {uploadData.academicYear}
                  </Text>
                </View>
              )}

              {/* Upload de fichier sécurisé */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Fichier bulletin *</Text>
                <TouchableOpacity
                  style={[styles.uploadArea, { borderColor: uploadData.file ? '#10B981' : colors.border }]}
                  onPress={handleUploadBulletin}
                >
                  <Upload color={uploadData.file ? '#10B981' : colors.text + '60'} size={24} />
                  <Text style={[styles.uploadText, { color: uploadData.file ? '#10B981' : colors.text }]}>
                    {uploadData.fileName || 'Cliquer pour sélectionner'}
                  </Text>
                  {uploadData.file && (
                    <View style={styles.fileInfo}>
                      <Text style={[styles.fileSize, { color: colors.text + '80' }]}>
                        📁 {(uploadData.fileSize! / 1024).toFixed(1)} KB - {uploadData.fileType}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.uploadHint, { color: colors.text + '60' }]}>
                    🔒 JPEG, PNG, WebP, PDF (max 3MB) - Upload sécurisé
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Notes d'upload optionnelles */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Notes (optionnel)</Text>
                <TextInput
                  style={[styles.textAreaInput, { color: colors.text, borderColor: colors.border }]}
                  value={uploadData.uploadNotes}
                  onChangeText={(value) => setUploadData(prev => ({ ...prev, uploadNotes: value }))}
                  multiline
                  numberOfLines={3}
                  placeholder="Informations complémentaires sur ce bulletin..."
                  placeholderTextColor={colors.text + '60'}
                />
              </View>

              {/* Barre de progression */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <View style={styles.progressContainer}>
                  <Text style={[styles.progressText, { color: colors.text }]}>Upload en cours...</Text>
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <View style={[styles.progressFill, { width: `${uploadProgress}%`, backgroundColor: colors.primary }]} />
                  </View>
                  <Text style={[styles.progressPercent, { color: colors.text }]}>{uploadProgress}%</Text>
                </View>
              )}

              {/* Validation anti-fraude */}
              <View style={[styles.securityInfo, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
                <Shield color={colors.primary} size={20} />
                <View style={styles.securityContent}>
                  <Text style={[styles.securityTitle, { color: colors.primary }]}>Sécurité Anti-Fraude</Text>
                  <Text style={[styles.securityDescription, { color: colors.text + '80' }]}>
                    ✓ Vérification appartenance élève{'\n'}
                    ✓ Contrôle anti-doublons{'\n'}
                    ✓ Validation format et taille{'\n'}
                    ✓ Génération checksum automatique
                  </Text>
                </View>
              </View>

              {/* Boutons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.border }]}
                  onPress={() => setShowUploadModal(false)}
                  disabled={uploadProgress > 0 && uploadProgress < 100}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: colors.primary, opacity: uploadProgress > 0 && uploadProgress < 100 ? 0.5 : 1 }]}
                  onPress={handleSubmitBulletin}
                  disabled={uploadProgress > 0 && uploadProgress < 100}
                >
                  <Shield color="#FFFFFF" size={16} />
                  <Text style={styles.submitButtonText}>Upload Sécurisé</Text>
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
  },
  fixedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
  },
  tabText: {
    fontWeight: '600',
    fontSize: 14,
  },
  tabContent: {
    flex: 1,
  },
  filtersContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterField: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
  },
  gradesList: {
    flex: 1,
  },
  gradeCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gradeInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  teacherName: {
    fontSize: 12,
  },
  gradeValue: {
    alignItems: 'flex-end',
  },
  gradeNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  gradePercentage: {
    fontSize: 12,
    marginTop: 2,
  },
  gradeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  gradeDate: {
    fontSize: 12,
  },
  gradeComment: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  bulletinHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  bulletinsList: {
    flex: 1,
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
  bulletinTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bulletinTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  bulletinTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  bulletinPeriod: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  bulletinSchool: {
    fontSize: 12,
    marginBottom: 4,
  },
  securityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  securityText: {
    fontSize: 10,
    textTransform: 'capitalize',
  },
  bulletinStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  validationBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  validationText: {
    fontSize: 10,
    fontWeight: '600',
  },
  bulletinStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  bulletinAverage: {
    fontSize: 14,
    fontWeight: '600',
  },
  bulletinRank: {
    fontSize: 14,
  },
  bulletinViews: {
    fontSize: 12,
  },
  bulletinActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
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
  uploadForm: {
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
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
  },
  fileInfo: {
    marginTop: 4,
  },
  fileSize: {
    fontSize: 12,
  },
  uploadHint: {
    fontSize: 12,
    textAlign: 'center',
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
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 12,
    textAlign: 'center',
  },
  securityInfo: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  securityDescription: {
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
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});