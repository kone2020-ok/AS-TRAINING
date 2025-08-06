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
import { Search, Filter, Archive, Calendar, User, Download, Eye, FileText, Plus, Cpu, Send, Target, BookOpen, BarChart } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@react-navigation/native';
import { useNotificationTriggers } from '../../../services/NotificationTriggers';
import {
  Bulletin,
  BulletinGenerationData,
  BulletinType,
  TrimesterNumber,
  GenerationMethod,
  BULLETIN_TYPE_LABELS,
  BULLETIN_STATUS_LABELS,
  BULLETIN_STATUS_COLORS,
  TRIMESTER_LABELS,
  generateBulletinId,
  generateBulletinChecksum,
  formatBulletinPeriod,
  generateAcademicYear,
  getBulletinPerformanceColor,
  getBulletinSecurityLevel,
  calculateBulletinAverage
} from '../../../types/Bulletins';

// Données des élèves assignés à l'enseignant
const teacherStudents = [
  { id: 'student_1', name: 'Kouadio Aya', class: '3ème A', school: 'Collège Moderne', parentId: 'parent_1', parentName: 'M. Diabaté Mamadou' },
  { id: 'student_2', name: 'Traoré Aminata', class: '1ère S', school: 'Lycée Sainte-Marie', parentId: 'parent_2', parentName: 'Mme Koné Fatou' },
  { id: 'student_3', name: 'N\'Dri Kevin', class: '6ème B', school: 'Collège Sainte-Marie', parentId: 'parent_1', parentName: 'M. Diabaté Mamadou' },
];

export default function TeacherBulletins() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { triggers } = useNotificationTriggers();
  const isDesktop = width >= 768;
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [filteredBulletins, setFilteredBulletins] = useState<Bulletin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrimester, setSelectedTrimester] = useState<TrimesterNumber | 0>(0);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedType, setSelectedType] = useState<BulletinType | ''>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  
  // États pour la génération de bulletin
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationData, setGenerationData] = useState<Partial<BulletinGenerationData>>({
    studentId: '',
    trimester: 1,
    year: 2025,
    academicYear: '',
    teacherId: 'teacher_1',
    generationMethod: 'manual',
    includeGrades: true,
    includeReports: true,
    includeAttendance: false,
    customTemplate: '',
    additionalNotes: ''
  });

  const teacherId = 'teacher_1';
  const teacherName = 'Marie N\'Guessan';

  // Données de démonstration avec les deux types de bulletins
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
        { name: 'Mathématiques', grade: 16.5, coefficient: 4, teacherId: teacherId, teacherName: teacherName, teacherComment: 'Très bon niveau, continue ainsi' },
        { name: 'Français', grade: 14.0, coefficient: 4, teacherId: 'teacher_2', teacherName: 'Jean Baptiste', teacherComment: 'Peut mieux faire en expression écrite' },
      ],
      generalComment: 'Élève sérieuse et travailleuse. Très bon trimestre avec des résultats encourageants.',
      fileUrl: 'bulletins/student_1/bulletin_aya_t1_2025.pdf',
      fileName: 'bulletin_aya_t1_2025.pdf',
      uploadedAt: '2025-01-10T14:00:00Z',
      uploadedBy: 'parent',
      status: 'valide',
      validationLevel: 'validated',
      teacherIds: [teacherId, 'teacher_2'],
      teacherNames: [teacherName, 'Jean Baptiste'],
      mainTeacherId: teacherId,
      createdAt: '2025-01-10T14:00:00Z',
      checksum: 'CHK123ABC456DEF',
      isImmutable: true,
      notificationsSent: true,
      notifiedUsers: [teacherId, 'teacher_2', 'direction_admin'],
      viewCount: 5,
      downloadCount: 2,
    },
    {
      id: 'BAG_1737890500000_def456ghi',
      type: 'auto_generated',
      studentId: 'student_2',
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
        { name: 'Mathématiques', grade: 17.0, coefficient: 4, teacherId: teacherId, teacherName: teacherName, teacherComment: 'Excellente élève, très rigoureuse' },
        { name: 'Physique-Chimie', grade: 16.5, coefficient: 4, teacherId: teacherId, teacherName: teacherName, teacherComment: 'Très bonne maîtrise des concepts' },
        { name: 'SVT', grade: 15.5, coefficient: 3, teacherId: 'teacher_3', teacherName: 'Sarah Diallo', teacherComment: 'Bonne participation en classe' },
      ],
      generalComment: 'Excellente élève, très investie dans ses études. Félicitations pour ce trimestre.',
      generatedAt: '2025-01-08T16:30:00Z',
      generatedBy: teacherId,
      generationMethod: 'automatic',
      status: 'valide',
      validationLevel: 'validated',
      teacherIds: [teacherId, 'teacher_3'],
      teacherNames: [teacherName, 'Sarah Diallo'],
      mainTeacherId: teacherId,
      createdAt: '2025-01-08T16:30:00Z',
      checksum: 'CHK789XYZ012ABC',
      isImmutable: true,
      notificationsSent: true,
      notifiedUsers: ['parent_2', 'direction_admin'],
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

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const filtered = bulletins.filter(bulletin => {
      const matchesSearch = !searchQuery || 
        bulletin.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bulletin.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bulletin.period.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTrimester = selectedTrimester === 0 || bulletin.trimester === selectedTrimester;
      const matchesYear = bulletin.year === selectedYear;
      const matchesType = !selectedType || bulletin.type === selectedType;
      const matchesStudent = !selectedStudent || bulletin.studentId === selectedStudent;
      
      // Filtrer uniquement les bulletins où l'enseignant est impliqué
      const isTeacherInvolved = bulletin.teacherIds.includes(teacherId);
      
      return matchesSearch && matchesTrimester && matchesYear && matchesType && matchesStudent && isTeacherInvolved;
    });

    setFilteredBulletins(filtered);
  }, [searchQuery, bulletins, selectedTrimester, selectedYear, selectedType, selectedStudent]);

  const validateGenerationData = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!generationData.studentId) {
      errors.push('Veuillez sélectionner un élève');
    }

    // Vérifier si l'élève est assigné à l'enseignant
    const studentAssigned = teacherStudents.some(s => s.id === generationData.studentId);
    if (generationData.studentId && !studentAssigned) {
      errors.push('Élève non assigné à cet enseignant');
    }

    // Vérifier si un bulletin auto-généré existe déjà
    if (generationData.studentId && generationData.trimester && generationData.year) {
      const existingBulletin = bulletins.find(b => 
        b.studentId === generationData.studentId &&
        b.trimester === generationData.trimester &&
        b.year === generationData.year &&
        b.type === 'auto_generated'
      );
      
      if (existingBulletin) {
        errors.push(`Un bulletin généré existe déjà pour ${TRIMESTER_LABELS[generationData.trimester!]} ${generationData.year}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const generateBulletinSynthesis = async () => {
    const validation = validateGenerationData();
    
    if (!validation.isValid) {
      Alert.alert(
        '❌ Erreurs de validation',
        validation.errors.join('\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    const student = teacherStudents.find(s => s.id === generationData.studentId);
    if (!student) return;

    // Simulation du processus de génération avec IA
    setGenerationProgress(0);
    
    const steps = [
      { progress: 20, message: 'Collecte des notes...' },
      { progress: 40, message: 'Analyse des rapports...' },
      { progress: 60, message: 'Calculs moyennes...' },
      { progress: 80, message: 'Génération AI commentaires...' },
      { progress: 95, message: 'Finalisation PDF...' },
      { progress: 100, message: 'Bulletin généré !' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setGenerationProgress(step.progress);
    }

    // Simulation des données calculées automatiquement
    const generatedSubjects = [
      { name: 'Mathématiques', grade: 15.8, coefficient: 4, teacherId: teacherId, teacherName: teacherName, teacherComment: 'Très bon niveau en résolution de problèmes. Continue ses efforts.' },
      { name: 'Physique-Chimie', grade: 14.2, coefficient: 3, teacherId: teacherId, teacherName: teacherName, teacherComment: 'Compréhension correcte des concepts. Peut progresser en méthodologie.' },
    ];

    const calculatedAverage = calculateBulletinAverage(generatedSubjects);
    const bulletinId = generateBulletinId('auto_generated');
    const checksum = generateBulletinChecksum({
      studentId: generationData.studentId,
      trimester: generationData.trimester,
      year: generationData.year,
      averageGrade: calculatedAverage
    });

    const newBulletin: Bulletin = {
      id: bulletinId,
      type: 'auto_generated',
      studentId: generationData.studentId!,
      studentName: student.name,
      parentId: student.parentId,
      parentName: student.parentName,
      class: student.class,
      school: student.school,
      period: formatBulletinPeriod(generationData.trimester!, generationData.year!),
      trimester: generationData.trimester!,
      year: generationData.year!,
      academicYear: generationData.academicYear!,
      averageGrade: calculatedAverage,
      rank: Math.floor(Math.random() * 15) + 1, // Simulation du rang
      totalStudents: Math.floor(Math.random() * 20) + 25, // Simulation effectif classe
      subjects: generatedSubjects,
      generalComment: generationData.additionalNotes || 
        `Élève ${calculatedAverage >= 14 ? 'sérieux(se) et motivé(e)' : 'qui doit fournir plus d\'efforts'}. ` +
        `Moyenne de ${calculatedAverage}/20 ce trimestre. ` +
        `${calculatedAverage >= 16 ? 'Excellent travail, félicitations !' : 
          calculatedAverage >= 14 ? 'Bon travail, continuez ainsi.' : 
          calculatedAverage >= 12 ? 'Résultats corrects, peut mieux faire.' : 
          'Difficultés identifiées, soutien recommandé.'}`,
      generatedAt: new Date().toISOString(),
      generatedBy: teacherId,
      generationMethod: generationData.generationMethod!,
      status: 'nouveau',
      validationLevel: 'pending',
      teacherIds: [teacherId],
      teacherNames: [teacherName],
      mainTeacherId: teacherId,
      createdAt: new Date().toISOString(),
      checksum: checksum,
      isImmutable: false, // Devient immutable après validation Direction
      notificationsSent: false,
      notifiedUsers: [],
      viewCount: 0,
      downloadCount: 0,
    };

    setBulletins([newBulletin, ...bulletins]);
    setShowGenerationModal(false);
    setGenerationProgress(0);

    // 🔔 NOTIFICATIONS AUTOMATIQUES
    try {
      await triggers.onBulletinGenerated({
        userId: teacherId,
        userRole: 'enseignant',
        metadata: {
          bulletinId: bulletinId,
          bulletinType: 'auto_generated',
          studentId: generationData.studentId,
          studentName: student.name,
          parentId: student.parentId,
          parentName: student.parentName,
          teacherName: teacherName,
          period: newBulletin.period,
          trimester: generationData.trimester,
          year: generationData.year,
          academicYear: generationData.academicYear,
          averageGrade: calculatedAverage,
          generationMethod: generationData.generationMethod,
          checksum: checksum,
          includeGrades: generationData.includeGrades,
          includeReports: generationData.includeReports
        }
      });

      Alert.alert(
        '🤖 Génération réussie',
        `Bulletin synthèse généré avec succès !\n\n📊 Moyenne calculée: ${calculatedAverage}/20\n🔐 Checksum: ${checksum.substr(0, 8)}...\n📤 Notifications envoyées\n⏳ En attente de validation Direction`,
        [{ text: 'Excellent' }]
      );
    } catch (error) {
      Alert.alert('⚠️ Génération réussie', 'Le bulletin a été généré mais les notifications ont échoué');
    }

    // Réinitialiser le formulaire
    setGenerationData({
      studentId: '',
      trimester: 1,
      year: 2025,
      academicYear: '',
      teacherId: teacherId,
      generationMethod: 'manual',
      includeGrades: true,
      includeReports: true,
      includeAttendance: false,
      customTemplate: '',
      additionalNotes: ''
    });
  };

  const handleViewBulletin = (bulletin: Bulletin) => {
    const updatedBulletins = bulletins.map(b => 
      b.id === bulletin.id 
        ? { ...b, viewCount: b.viewCount + 1, lastViewedAt: new Date().toISOString() }
        : b
    );
    setBulletins(updatedBulletins);

    Alert.alert(
      '👁️ Consultation bulletin',
      `${BULLETIN_TYPE_LABELS[bulletin.type]}\n${bulletin.studentName} - ${bulletin.period}\n\n📊 Moyenne: ${bulletin.averageGrade}/20\n🏆 Rang: ${bulletin.rank}/${bulletin.totalStudents}\n🔒 Sécurité: ${getBulletinSecurityLevel(bulletin)}\n👀 Vues: ${bulletin.viewCount + 1}\n${bulletin.type === 'auto_generated' ? `🤖 Généré par: ${bulletin.generatedBy === teacherId ? 'Vous' : bulletin.teacherNames.join(', ')}` : '📄 Uploadé par: Parent'}`,
      [
        { text: 'Fermer', style: 'cancel' },
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

    Alert.alert('⬇️ Téléchargement', 
      `${bulletin.type === 'auto_generated' ? 'Génération PDF en cours...' : `Téléchargement de ${bulletin.fileName} en cours...`}`
    );
  };

  const renderBulletinCard = (bulletin: Bulletin) => (
    <View key={bulletin.id} style={[styles.bulletinCard, { backgroundColor: colors.card }]}>
      <View style={styles.bulletinHeader}>
        <View style={styles.bulletinInfo}>
          <View style={styles.bulletinTitleRow}>
            <Text style={[styles.studentName, { color: colors.text }]}>{bulletin.studentName}</Text>
            <View style={[styles.bulletinTypeBadge, { 
              backgroundColor: bulletin.type === 'pdf_uploaded' ? '#3B82F6' + '20' : '#10B981' + '20' 
            }]}>
              <Text style={[styles.bulletinTypeText, { 
                color: bulletin.type === 'pdf_uploaded' ? '#3B82F6' : '#10B981' 
              }]}>
                {bulletin.type === 'pdf_uploaded' ? '📄 PDF École' : '🤖 Généré AS-Training'}
              </Text>
            </View>
          </View>
          <Text style={[styles.bulletinPeriod, { color: colors.text }]}>{bulletin.period}</Text>
          <Text style={[styles.bulletinSchool, { color: colors.text + '80' }]}>{bulletin.school}</Text>
          
          <View style={styles.bulletinMeta}>
            <Text style={[styles.bulletinDate, { color: colors.text + '60' }]}>
              {bulletin.type === 'auto_generated' 
                ? `🤖 Généré: ${new Date(bulletin.generatedAt!).toLocaleDateString('fr-FR')}`
                : `📤 Uploadé: ${new Date(bulletin.uploadedAt!).toLocaleDateString('fr-FR')}`}
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
      
      <View style={styles.bulletinStats}>
        <Text style={[styles.bulletinAverage, { color: getBulletinPerformanceColor(bulletin.averageGrade) }]}>
          📊 Moyenne: {bulletin.averageGrade}/20
        </Text>
        <Text style={[styles.bulletinRank, { color: colors.text + '80' }]}>
          🏆 Rang: {bulletin.rank}/{bulletin.totalStudents}
        </Text>
        <Text style={[styles.bulletinViews, { color: colors.text + '60' }]}>
          👀 {bulletin.viewCount} vues
        </Text>
      </View>
      
      <View style={styles.bulletinActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
          onPress={() => handleViewBulletin(bulletin)}
        >
          <Eye color={colors.primary} size={16} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Consulter</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#10B981' + '20' }]}
          onPress={() => handleDownloadBulletin(bulletin)}
        >
          <Download color="#10B981" size={16} />
          <Text style={[styles.actionText, { color: '#10B981' }]}>
            {bulletin.type === 'auto_generated' ? 'Générer PDF' : 'Télécharger'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { backgroundColor: colors.card }]}>
        <View style={styles.statIcon}>
          <Archive color="#3B82F6" size={20} />
        </View>
        <View style={styles.statContent}>
          <Text style={[styles.statValue, { color: colors.text }]}>{filteredBulletins.length}</Text>
          <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Bulletins</Text>
        </View>
      </View>
      
      <View style={[styles.statCard, { backgroundColor: colors.card }]}>
        <View style={styles.statIcon}>
          <Cpu color="#10B981" size={20} />
        </View>
        <View style={styles.statContent}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {filteredBulletins.filter(b => b.type === 'auto_generated').length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text + '80' }]}>Générés</Text>
        </View>
      </View>
      
      <View style={[styles.statCard, { backgroundColor: colors.card }]}>
        <View style={styles.statIcon}>
          <FileText color="#F59E0B" size={20} />
        </View>
        <View style={styles.statContent}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {filteredBulletins.filter(b => b.type === 'pdf_uploaded').length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text + '80' }]}>PDF École</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header avec génération */}
      <LinearGradient colors={['#059669', '#10B981']} style={styles.header}>
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>📚 Bulletins de mes Élèves</Text>
            <Text style={styles.headerSubtitle}>Consultation et génération automatique</Text>
          </View>
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={() => setShowGenerationModal(true)}
          >
            <Cpu color="#FFFFFF" size={20} />
            <Text style={styles.generateButtonText}>Générer</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Statistiques */}
        {renderStatsCards()}

        {/* Filtres avancés */}
        <View style={[styles.filtersContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.filtersTitle, { color: colors.text }]}>Filtres Avancés</Text>
          
          {/* Recherche */}
          <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Search color={colors.text + '60'} size={20} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Rechercher par élève, école..."
              placeholderTextColor={colors.text + '60'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filtres en ligne */}
          <View style={styles.filterRow}>
            <View style={[styles.filterField, { flex: 1, marginRight: 4 }]}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Élève</Text>
              <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <Picker
                  selectedValue={selectedStudent}
                  onValueChange={setSelectedStudent}
                  style={[styles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="Tous mes élèves" value="" />
                  {teacherStudents.map(student => (
                    <Picker.Item key={student.id} label={student.name} value={student.id} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={[styles.filterField, { flex: 1, marginLeft: 4, marginRight: 4 }]}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Type</Text>
              <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <Picker
                  selectedValue={selectedType}
                  onValueChange={setSelectedType}
                  style={[styles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="Tous types" value="" />
                  <Picker.Item label="🤖 Générés" value="auto_generated" />
                  <Picker.Item label="📄 PDF École" value="pdf_uploaded" />
                </Picker>
              </View>
            </View>
            
            <View style={[styles.filterField, { flex: 1, marginLeft: 4 }]}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Trimestre</Text>
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
          </View>
        </View>

        {/* Liste des bulletins */}
        <ScrollView style={styles.bulletinsList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.text }]}>Chargement des bulletins...</Text>
            </View>
          ) : filteredBulletins.length > 0 ? (
            filteredBulletins.map(renderBulletinCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Archive color={colors.text + '40'} size={48} />
              <Text style={[styles.emptyText, { color: colors.text }]}>Aucun bulletin trouvé</Text>
              <Text style={[styles.emptySubtext, { color: colors.text + '80' }]}>
                Générez un bulletin synthèse ou attendez qu'un parent uploade un bulletin PDF
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Modal de génération de bulletin */}
      <Modal visible={showGenerationModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Cpu color={colors.primary} size={24} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Génération Bulletin Synthèse</Text>
              </View>
              <TouchableOpacity onPress={() => setShowGenerationModal(false)}>
                <Text style={[styles.closeButton, { color: colors.text }]}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.generationForm} showsVerticalScrollIndicator={false}>
              {/* Sélection élève */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Élève *</Text>
                <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                  <Picker
                    selectedValue={generationData.studentId}
                    onValueChange={(value) => {
                      const academicYear = generateAcademicYear(generationData.year || 2025, generationData.trimester || 1);
                      setGenerationData(prev => ({ ...prev, studentId: value, academicYear }));
                    }}
                    style={[styles.picker, { color: colors.text }]}
                  >
                    <Picker.Item label="Sélectionner un élève assigné" value="" />
                    {teacherStudents.map(student => (
                      <Picker.Item
                        key={student.id}
                        label={`${student.name} (${student.class})`}
                        value={student.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Période */}
              <View style={styles.periodRow}>
                <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Trimestre *</Text>
                  <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                    <Picker
                      selectedValue={generationData.trimester}
                      onValueChange={(value) => {
                        const academicYear = generateAcademicYear(generationData.year || 2025, value as TrimesterNumber);
                        setGenerationData(prev => ({ ...prev, trimester: value as TrimesterNumber, academicYear }));
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
                      selectedValue={generationData.year}
                      onValueChange={(value) => {
                        const academicYear = generateAcademicYear(value, generationData.trimester || 1);
                        setGenerationData(prev => ({ ...prev, year: value, academicYear }));
                      }}
                      style={[styles.picker, { color: colors.text }]}
                    >
                      <Picker.Item label="2025" value={2025} />
                      <Picker.Item label="2024" value={2024} />
                    </Picker>
                  </View>
                </View>
              </View>

              {/* Méthode de génération */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Méthode de génération</Text>
                <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                  <Picker
                    selectedValue={generationData.generationMethod}
                    onValueChange={(value) => setGenerationData(prev => ({ ...prev, generationMethod: value as GenerationMethod }))}
                    style={[styles.picker, { color: colors.text }]}
                  >
                    <Picker.Item label="🤖 Automatique (IA)" value="automatic" />
                    <Picker.Item label="✋ Manuelle" value="manual" />
                  </Picker>
                </View>
              </View>

              {/* Options d'inclusion */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Données à inclure</Text>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity 
                    style={styles.checkboxRow}
                    onPress={() => setGenerationData(prev => ({ ...prev, includeGrades: !prev.includeGrades }))}
                  >
                    <View style={[styles.checkbox, { 
                      backgroundColor: generationData.includeGrades ? colors.primary : 'transparent',
                      borderColor: colors.border 
                    }]}>
                      {generationData.includeGrades && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[styles.checkboxLabel, { color: colors.text }]}>📊 Notes saisies</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.checkboxRow}
                    onPress={() => setGenerationData(prev => ({ ...prev, includeReports: !prev.includeReports }))}
                  >
                    <View style={[styles.checkbox, { 
                      backgroundColor: generationData.includeReports ? colors.primary : 'transparent',
                      borderColor: colors.border 
                    }]}>
                      {generationData.includeReports && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[styles.checkboxLabel, { color: colors.text }]}>📋 Rapports mensuels</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.checkboxRow}
                    onPress={() => setGenerationData(prev => ({ ...prev, includeAttendance: !prev.includeAttendance }))}
                  >
                    <View style={[styles.checkbox, { 
                      backgroundColor: generationData.includeAttendance ? colors.primary : 'transparent',
                      borderColor: colors.border 
                    }]}>
                      {generationData.includeAttendance && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[styles.checkboxLabel, { color: colors.text }]}>📅 Assiduité</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Commentaires additionnels */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Commentaires additionnels</Text>
                <TextInput
                  style={[styles.textAreaInput, { color: colors.text, borderColor: colors.border }]}
                  value={generationData.additionalNotes}
                  onChangeText={(value) => setGenerationData(prev => ({ ...prev, additionalNotes: value }))}
                  multiline
                  numberOfLines={4}
                  placeholder="Ajoutez des commentaires personnalisés qui seront intégrés au bulletin..."
                  placeholderTextColor={colors.text + '60'}
                />
              </View>

              {/* Barre de progression */}
              {generationProgress > 0 && generationProgress < 100 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Cpu color={colors.primary} size={20} />
                    <Text style={[styles.progressText, { color: colors.text }]}>Génération IA en cours...</Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <View style={[styles.progressFill, { width: `${generationProgress}%`, backgroundColor: colors.primary }]} />
                  </View>
                  <Text style={[styles.progressPercent, { color: colors.text }]}>{generationProgress}%</Text>
                </View>
              )}

              {/* Information IA */}
              <View style={[styles.aiInfo, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
                <Cpu color={colors.primary} size={20} />
                <View style={styles.aiContent}>
                  <Text style={[styles.aiTitle, { color: colors.primary }]}>🤖 Génération Intelligente</Text>
                  <Text style={[styles.aiDescription, { color: colors.text + '80' }]}>
                    ✓ Analyse automatique des notes{'\n'}
                    ✓ Calcul moyennes et statistiques{'\n'}
                    ✓ Génération commentaires IA{'\n'}
                    ✓ Formatage professionnel PDF
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
                  onPress={generateBulletinSynthesis}
                  disabled={generationProgress > 0 && generationProgress < 100}
                >
                  <Cpu color="#FFFFFF" size={16} />
                  <Text style={styles.generateButtonText}>Générer avec IA</Text>
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
  header: {
    paddingTop: 60,
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
    padding: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
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
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
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
    marginBottom: 6,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  bulletinTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bulletinTypeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bulletinPeriod: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  bulletinSchool: {
    fontSize: 12,
    marginBottom: 6,
  },
  bulletinMeta: {
    marginTop: 4,
  },
  bulletinDate: {
    fontSize: 11,
  },
  bulletinStatus: {
    alignItems: 'flex-end',
    gap: 6,
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
    marginBottom: 12,
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
    minHeight: 100,
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
  aiInfo: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  aiContent: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  aiDescription: {
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
});