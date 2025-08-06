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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode, Camera, MapPin, Calendar, Clock, BookOpen, FileText, User, CircleCheck as CheckCircle } from 'lucide-react-native';

interface Student {
  id: string;
  name: string;
  class: string;
  subjects: string[];
}

interface LessonForm {
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
  subjects: string[];
  chapters: string;
  summary: string;
  observations: string;
  behavior: string;
}

export default function NewLesson() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [step, setStep] = useState<'scan' | 'select' | 'form' | 'success'>('scan');
  const [qrScanned, setQrScanned] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [formData, setFormData] = useState<LessonForm>({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    subjects: [],
    chapters: '',
    summary: '',
    observations: '',
    behavior: '',
  });

  // Données de démonstration
  const availableStudents: Student[] = [
    {
      id: 'student_1',
      name: 'Kouadio Aya',
      class: '3ème A',
      subjects: ['Mathématiques', 'Physique'],
    },
    {
      id: 'student_2',
      name: 'Traoré Aminata',
      class: '1ère S',
      subjects: ['Mathématiques', 'Chimie'],
    },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleScanQR = () => {
    // Simulation du scan QR
    Alert.alert(
      'Scanner QR Code',
      'Fonction de scan QR code à implémenter avec expo-camera',
      [
        { text: 'Annuler' },
        { text: 'Simuler scan réussi', onPress: () => {
          setQrScanned(true);
          setLocationVerified(true);
          setStep('select');
        }}
      ]
    );
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setFormData({ ...formData, studentId: student.id });
    setShowStudentModal(false);
    setStep('form');
  };

  const handleSubmitLesson = () => {
    if (!formData.startTime || !formData.endTime || !formData.chapters || !formData.summary) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    Alert.alert(
      'Enregistrer la séance',
      'Confirmer l\'enregistrement de cette séance ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Enregistrer', onPress: () => {
          setStep('success');
          // Simulation de l'envoi des notifications
          setTimeout(() => {
            Alert.alert(
              'Séance enregistrée',
              'Notifications envoyées:\n• Direction (pour validation)\n• Parents (pour information)',
              [{ text: 'OK', onPress: () => {
                setStep('scan');
                setQrScanned(false);
                setLocationVerified(false);
                setSelectedStudent(null);
                setFormData({
                  studentId: '',
                  date: new Date().toISOString().split('T')[0],
                  startTime: '',
                  endTime: '',
                  subjects: [],
                  chapters: '',
                  summary: '',
                  observations: '',
                  behavior: '',
                });
              }}]
            );
          }, 2000);
        }}
      ]
    );
  };

  const renderScanStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepIcon}>
        <QrCode color="#059669" size={64} />
      </View>
      <Text style={styles.stepTitle}>Scanner le QR Code Parent</Text>
      <Text style={styles.stepDescription}>
        Scannez le QR code unique de la famille pour vérifier votre présence au domicile
      </Text>
      
      <TouchableOpacity style={styles.scanButton} onPress={handleScanQR}>
        <Camera color="#FFFFFF" size={24} />
        <Text style={styles.scanButtonText}>Ouvrir la caméra</Text>
      </TouchableOpacity>

      <View style={styles.verificationStatus}>
        <View style={styles.statusItem}>
          <View style={[styles.statusIndicator, { backgroundColor: qrScanned ? '#10B981' : '#E5E7EB' }]} />
          <Text style={styles.statusText}>QR Code scanné</Text>
        </View>
        <View style={styles.statusItem}>
          <View style={[styles.statusIndicator, { backgroundColor: locationVerified ? '#10B981' : '#E5E7EB' }]} />
          <Text style={styles.statusText}>Localisation vérifiée</Text>
        </View>
      </View>
    </View>
  );

  const renderSelectStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepIcon}>
        <User color="#059669" size={64} />
      </View>
      <Text style={styles.stepTitle}>Sélectionner l'Élève</Text>
      <Text style={styles.stepDescription}>
        Choisissez l'élève pour lequel vous allez enregistrer cette séance
      </Text>

      <TouchableOpacity style={styles.selectButton} onPress={() => setShowStudentModal(true)}>
        <User color="#FFFFFF" size={20} />
        <Text style={styles.selectButtonText}>
          {selectedStudent ? selectedStudent.name : 'Choisir un élève'}
        </Text>
      </TouchableOpacity>

      {selectedStudent && (
        <TouchableOpacity style={styles.continueButton} onPress={() => setStep('form')}>
          <Text style={styles.continueButtonText}>Continuer</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFormStep = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.formTitle}>Détails de la Séance</Text>
      <Text style={styles.formSubtitle}>Élève: {selectedStudent?.name}</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Date *</Text>
        <View style={styles.inputContainer}>
          <Calendar color="#6B7280" size={20} />
          <TextInput
            style={styles.textInput}
            value={formData.date}
            onChangeText={(text) => setFormData({ ...formData, date: text })}
            placeholder="YYYY-MM-DD"
          />
        </View>
      </View>

      <View style={styles.timeRow}>
        <View style={styles.timeInput}>
          <Text style={styles.inputLabel}>Heure début *</Text>
          <View style={styles.inputContainer}>
            <Clock color="#6B7280" size={20} />
            <TextInput
              style={styles.textInput}
              value={formData.startTime}
              onChangeText={(text) => setFormData({ ...formData, startTime: text })}
              placeholder="14:00"
            />
          </View>
        </View>
        <View style={styles.timeInput}>
          <Text style={styles.inputLabel}>Heure fin *</Text>
          <View style={styles.inputContainer}>
            <Clock color="#6B7280" size={20} />
            <TextInput
              style={styles.textInput}
              value={formData.endTime}
              onChangeText={(text) => setFormData({ ...formData, endTime: text })}
              placeholder="16:00"
            />
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Matières enseignées</Text>
        <View style={styles.subjectsContainer}>
          {selectedStudent?.subjects.map((subject, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.subjectChip,
                formData.subjects.includes(subject) && styles.subjectChipSelected
              ]}
              onPress={() => {
                const newSubjects = formData.subjects.includes(subject)
                  ? formData.subjects.filter(s => s !== subject)
                  : [...formData.subjects, subject];
                setFormData({ ...formData, subjects: newSubjects });
              }}
            >
              <Text style={[
                styles.subjectChipText,
                formData.subjects.includes(subject) && styles.subjectChipTextSelected
              ]}>
                {subject}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Chapitres abordés *</Text>
        <View style={styles.inputContainer}>
          <BookOpen color="#6B7280" size={20} />
          <TextInput
            style={styles.textInput}
            value={formData.chapters}
            onChangeText={(text) => setFormData({ ...formData, chapters: text })}
            placeholder="Ex: Équations du second degré"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Résumé de la séance *</Text>
        <View style={styles.inputContainer}>
          <FileText color="#6B7280" size={20} />
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.summary}
            onChangeText={(text) => setFormData({ ...formData, summary: text })}
            placeholder="Décrivez le contenu du cours..."
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Observations sur l'interaction</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={formData.observations}
            onChangeText={(text) => setFormData({ ...formData, observations: text })}
            placeholder="Ex: Très attentif, pose de bonnes questions"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Commentaire sur le comportement</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={formData.behavior}
            onChangeText={(text) => setFormData({ ...formData, behavior: text })}
            placeholder="Ex: Motivé, concentré pendant toute la séance"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitLesson}>
        <Text style={styles.submitButtonText}>Enregistrer la Séance</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successIcon}>
        <CheckCircle color="#10B981" size={64} />
      </View>
      <Text style={styles.stepTitle}>Séance Enregistrée !</Text>
      <Text style={styles.stepDescription}>
        Votre séance a été enregistrée avec succès. Les notifications ont été envoyées.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <LinearGradient colors={['#059669', '#10B981']} style={styles.fixedHeader}>
        <Text style={styles.pageTitle}>Nouvelle Séance</Text>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {step !== 'form' && (
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Enregistrement sécurisé des cours</Text>
              <Text style={styles.welcomeSubtitle}>Processus guidé en 3 étapes</Text>
            </View>
          )}

          {step === 'scan' && renderScanStep()}
          {step === 'select' && renderSelectStep()}
          {step === 'form' && renderFormStep()}
          {step === 'success' && renderSuccessStep()}
        </Animated.View>
      </ScrollView>

      {/* Modal de sélection d'élève */}
      <Modal visible={showStudentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionner un Élève</Text>
            {availableStudents.map((student) => (
              <TouchableOpacity
                key={student.id}
                style={styles.studentOption}
                onPress={() => handleSelectStudent(student)}
              >
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentClass}>{student.class}</Text>
                <Text style={styles.studentSubjects}>
                  {student.subjects.join(', ')}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowStudentModal(false)}
            >
              <Text style={styles.modalCloseText}>Annuler</Text>
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
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
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
    textAlign: 'center',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  stepIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  scanButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 32,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  selectButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  verificationStatus: {
    alignItems: 'center',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#4B5563',
  },
  formContainer: {
    flex: 1,
    paddingTop: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#059669',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subjectChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  subjectChipSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  subjectChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  subjectChipTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  studentOption: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  studentClass: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 2,
  },
  studentSubjects: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalCloseButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCloseText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});