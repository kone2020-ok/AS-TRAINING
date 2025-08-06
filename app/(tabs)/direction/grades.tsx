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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Filter, GraduationCap, Calendar, User, BookOpen, Star, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react-native';
import { useWindowDimensions } from 'react-native';
import { router } from 'expo-router';

interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  parentName: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  type: 'devoir' | 'interrogation' | 'examen';
  grade: number;
  maxGrade: number;
  date: string;
  month: number;
  year: number;
  comment?: string;
  dateCreation: string;
}

export default function GradesManagement() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [grades, setGrades] = useState<Grade[]>([]);
  const [filteredGrades, setFilteredGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // Données de démonstration
  const demoGrades: Grade[] = [
    {
      id: 'grade_1',
      studentId: 'student_1',
      studentName: 'Kouadio Aya',
      parentName: 'M. Diabaté Mamadou',
      teacherId: 'teacher_1',
      teacherName: 'M. Kouassi Jean',
      subject: 'Mathématiques',
      type: 'devoir',
      grade: 16,
      maxGrade: 20,
      date: '2025-01-15',
      month: 1,
      year: 2025,
      comment: 'Excellent travail sur les équations',
      dateCreation: '2025-01-15T16:00:00Z',
    },
    {
      id: 'grade_2',
      studentId: 'student_1',
      studentName: 'Kouadio Aya',
      parentName: 'M. Diabaté Mamadou',
      teacherId: 'teacher_1',
      teacherName: 'M. Kouassi Jean',
      subject: 'Physique',
      type: 'interrogation',
      grade: 14,
      maxGrade: 20,
      date: '2025-01-12',
      month: 1,
      year: 2025,
      comment: 'Bonne compréhension des concepts',
      dateCreation: '2025-01-12T17:30:00Z',
    },
    {
      id: 'grade_3',
      studentId: 'student_2',
      studentName: 'N\'Dri Kevin',
      parentName: 'M. Diabaté Mamadou',
      teacherId: 'teacher_2',
      teacherName: 'Mme N\'Guessan Marie',
      subject: 'Français',
      type: 'devoir',
      grade: 15,
      maxGrade: 20,
      date: '2025-01-14',
      month: 1,
      year: 2025,
      comment: 'Progrès notable en expression écrite',
      dateCreation: '2025-01-14T18:00:00Z',
    },
    {
      id: 'grade_4',
      studentId: 'student_2',
      studentName: 'N\'Dri Kevin',
      parentName: 'M. Diabaté Mamadou',
      teacherId: 'teacher_2',
      teacherName: 'Mme N\'Guessan Marie',
      subject: 'Histoire-Géographie',
      type: 'interrogation',
      grade: 12,
      maxGrade: 20,
      date: '2025-01-10',
      month: 1,
      year: 2025,
      comment: 'Doit réviser les dates importantes',
      dateCreation: '2025-01-10T16:45:00Z',
    },
  ];

  const months = [
    'Tous les mois', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const subjects = ['Toutes les matières', 'Mathématiques', 'Français', 'Physique', 'Histoire-Géographie', 'Anglais'];

  useEffect(() => {
    const loadGrades = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setGrades(demoGrades);
      setFilteredGrades(demoGrades);
      setLoading(false);
    };

    loadGrades();

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
    let filtered = grades.filter(grade => {
      const matchesSearch = 
        grade.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grade.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grade.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grade.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMonth = selectedMonth === 0 || grade.month === selectedMonth;
      const matchesYear = grade.year === selectedYear;
      const matchesSubject = selectedSubject === '' || selectedSubject === 'Toutes les matières' || grade.subject === selectedSubject;

      return matchesSearch && matchesMonth && matchesYear && matchesSubject;
    });

    setFilteredGrades(filtered);
  }, [searchQuery, grades, selectedMonth, selectedYear, selectedSubject]);

  const handleGoBack = () => {
    router.back();
  };

  const handleViewDetails = (grade: Grade) => {
    Alert.alert(
      `Note - ${grade.studentName}`,
      `Matière: ${grade.subject}\nType: ${grade.type}\nNote: ${grade.grade}/${grade.maxGrade}\nDate: ${grade.date}\nEnseignant: ${grade.teacherName}\n\n${grade.comment ? `Commentaire: ${grade.comment}` : 'Aucun commentaire'}`,
      [{ text: 'Fermer' }]
    );
  };

  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getGradeIcon = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 80) return <TrendingUp color="#10B981" size={16} />;
    if (percentage >= 60) return <Star color="#F59E0B" size={16} />;
    return <TrendingDown color="#EF4444" size={16} />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'devoir':
        return '#3B82F6';
      case 'interrogation':
        return '#F59E0B';
      case 'examen':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const calculateAverage = (studentName: string, subject?: string) => {
    const studentGrades = grades.filter(g => {
      const matchesStudent = g.studentName === studentName;
      const matchesSubject = !subject || g.subject === subject;
      return matchesStudent && matchesSubject;
    });

    if (studentGrades.length === 0) return 0;
    
    const total = studentGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 20, 0);
    return total / studentGrades.length;
  };

  const GradeCard = ({ grade }: { grade: Grade }) => {
    const percentage = (grade.grade / grade.maxGrade) * 100;
    const average = calculateAverage(grade.studentName, grade.subject);
    
    return (
      <View style={styles.gradeCard}>
        <View style={styles.gradeHeader}>
          <View style={styles.gradeInfo}>
            <Text style={styles.studentName}>{grade.studentName}</Text>
            <Text style={styles.subjectName}>{grade.subject}</Text>
            <Text style={styles.teacherName}>Par: {grade.teacherName}</Text>
          </View>
          
          <View style={styles.gradeDisplay}>
            <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(grade.grade, grade.maxGrade) }]}>
              {getGradeIcon(grade.grade, grade.maxGrade)}
              <Text style={styles.gradeText}>{grade.grade}/{grade.maxGrade}</Text>
            </View>
            <Text style={styles.percentageText}>{percentage.toFixed(0)}%</Text>
          </View>
        </View>

        <View style={styles.gradeContent}>
          <View style={styles.gradeDetails}>
            <View style={styles.detailItem}>
              <Calendar color="#6B7280" size={16} />
              <Text style={styles.detailText}>{grade.date}</Text>
            </View>
            <View style={styles.detailItem}>
              <View style={[styles.typeTag, { backgroundColor: getTypeColor(grade.type) }]}>
                <Text style={styles.typeText}>
                  {grade.type.charAt(0).toUpperCase() + grade.type.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          {grade.comment && (
            <View style={styles.commentSection}>
              <Text style={styles.commentLabel}>Commentaire:</Text>
              <Text style={styles.commentText}>{grade.comment}</Text>
            </View>
          )}

          <View style={styles.averageSection}>
            <Text style={styles.averageLabel}>Moyenne en {grade.subject}:</Text>
            <View style={[styles.averageBadge, { backgroundColor: getGradeColor(average, 20) }]}>
              <Text style={styles.averageText}>{average.toFixed(1)}/20</Text>
            </View>
          </View>
        </View>

        <View style={styles.gradeFooter}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleViewDetails(grade)}
          >
            <BookOpen color="#3B82F6" size={18} />
            <Text style={styles.actionButtonText}>Détails</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.fixedHeader}>
          <Text style={styles.pageTitle}>Suivi des Notes</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      {/* Fixed Header */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.fixedHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ArrowLeft color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: '#FFFFFF' }]}>Suivi des Notes</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, paddingHorizontal: isDesktop ? 20 : 12 }]}>
          {/* Welcome Section */}
          <View style={[styles.welcomeSection, { backgroundColor: '#FFFFFF', borderBottomColor: '#E5E7EB', marginHorizontal: isDesktop ? -20 : -12 }]}>
            <Text style={[styles.welcomeTitle, { color: '#1F2937' }]}>Vue globale des performances</Text>
            <Text style={[styles.welcomeSubtitle, { color: '#6B7280' }]}>Suivi détaillé des évaluations</Text>
          </View>

          <View style={styles.filtersContainer}>
            <View style={styles.searchBox}>
              <Search color="#6B7280" size={20} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher une note..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.filterRow}>
              <TouchableOpacity style={styles.subjectSelector}>
                <BookOpen color="#6B7280" size={16} />
                <Text style={styles.selectorText}>{selectedSubject || 'Toutes les matières'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.monthSelector}>
                <Calendar color="#6B7280" size={16} />
                <Text style={styles.selectorText}>{months[selectedMonth]}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.yearSelector}>
                <Text style={styles.yearText}>{selectedYear}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <GraduationCap color="#3B82F6" size={24} />
              <Text style={styles.statNumber}>{filteredGrades.length}</Text>
              <Text style={styles.statLabel}>Notes totales</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingUp color="#10B981" size={24} />
              <Text style={styles.statNumber}>
                {filteredGrades.length > 0 ? 
                  (filteredGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 20, 0) / filteredGrades.length).toFixed(1) : 
                  '0'
                }
              </Text>
              <Text style={styles.statLabel}>Moyenne générale</Text>
            </View>
            <View style={styles.statCard}>
              <Star color="#F59E0B" size={24} />
              <Text style={styles.statNumber}>
                {filteredGrades.filter(g => (g.grade / g.maxGrade) >= 0.8).length}
              </Text>
              <Text style={styles.statLabel}>Excellentes notes</Text>
            </View>
          </View>

          <View style={styles.gradesList}>
            {filteredGrades.map((grade) => (
              <GradeCard key={grade.id} grade={grade} />
            ))}
          </View>
        </Animated.View>
      </ScrollView>
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
    textAlign: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    marginHorizontal: -20,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  filtersContainer: {
    paddingTop: 20,
    marginBottom: 24,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subjectSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  monthSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  yearSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    marginLeft: 6,
  },
  selectorText: {
    fontSize: 12,
    color: '#1F2937',
    marginLeft: 6,
  },
  yearText: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  gradesList: {
    flex: 1,
    minHeight: 400,
  },
  gradeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gradeInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subjectName: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 2,
  },
  teacherName: {
    fontSize: 14,
    color: '#6B7280',
  },
  gradeDisplay: {
    alignItems: 'center',
  },
  gradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  gradeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  percentageText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  gradeContent: {
    marginBottom: 12,
  },
  gradeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  commentSection: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
  },
  averageSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 8,
    borderRadius: 8,
  },
  averageLabel: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
  },
  averageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  averageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gradeFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#4B5563',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});