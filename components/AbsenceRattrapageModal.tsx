import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

// Configuration de dayjs
dayjs.extend(localizedFormat);
import {
  X,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Bell,
  Send,
  Calendar as CalendarIcon,
  Home,
  AlertCircle,
} from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

const { width, height } = Dimensions.get('window');

interface AbsenceData {
  studentName: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  subjects: string[];
  absenceDate: string;
  absenceTime: string;
  reason: string;
  makeUpDate: string;
  makeUpTime: string;
  makeUpDuration: string;
  location: string;
  notes: string;
}

interface AbsenceRattrapageModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (absenceData: AbsenceData) => void;
}

type Step = 'student' | 'absence' | 'rattrapage' | 'confirmation';

export default function AbsenceRattrapageModal({ visible, onClose, onSubmit }: AbsenceRattrapageModalProps) {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState<Step>('student');
  const [absenceData, setAbsenceData] = useState<AbsenceData>({
    studentName: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    subjects: [],
    absenceDate: '',
    absenceTime: '',
    reason: '',
    makeUpDate: '',
    makeUpTime: '',
    makeUpDuration: '',
    location: 'Domicile',
    notes: '',
  });

  // États pour les sélecteurs de date/heure
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [pickerType, setPickerType] = useState<'absence' | 'makeup'>('absence');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Données fictives pour la démonstration
  const students = [
    { name: 'Marie Kouassi', parent: 'Jean Kouassi', phone: '+225 0701234567', email: 'jean.kouassi@email.com' },
    { name: 'Pierre Yao', parent: 'Sophie Yao', phone: '+225 0702345678', email: 'sophie.yao@email.com' },
    { name: 'Anna Traoré', parent: 'Paul Traoré', phone: '+225 0703456789', email: 'paul.traore@email.com' },
  ];

  const subjects = ['Mathématiques', 'Physique', 'Chimie', 'Biologie', 'Français', 'Anglais', 'Histoire', 'Géographie'];
  const reasons = ['Maladie', 'Rendez-vous médical', 'Voyage familial', 'Autre'];
  const durations = ['1h', '1h30', '2h', '2h30', '3h'];
  const locations = ['Domicile', 'Autre famille', 'Centre AS-Training', 'Bibliothèque', 'Autre'];

  const resetForm = () => {
    setCurrentStep('student');
    setAbsenceData({
      studentName: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      subjects: [],
      absenceDate: '',
      absenceTime: '',
      reason: '',
      makeUpDate: '',
      makeUpTime: '',
      makeUpDuration: '',
      location: 'Domicile',
      notes: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    // Validation selon l'étape
    if (currentStep === 'student') {
      if (!absenceData.studentName || absenceData.subjects.length === 0) {
        Alert.alert('Champs requis', 'Veuillez sélectionner un étudiant et au moins une matière.');
        return;
      }
    } else if (currentStep === 'absence') {
      if (!absenceData.absenceDate || !absenceData.absenceTime || !absenceData.reason || !absenceData.notes.trim()) {
        Alert.alert('Champs requis', 'Veuillez remplir tous les champs obligatoires, y compris les détails supplémentaires.');
        return;
      }
    } else if (currentStep === 'rattrapage') {
      if (!absenceData.makeUpDate || !absenceData.makeUpTime || !absenceData.makeUpDuration) {
        Alert.alert('Champs requis', 'Veuillez remplir tous les champs du rattrapage.');
        return;
      }
    }

    const steps: Step[] = ['student', 'absence', 'rattrapage', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const steps: Step[] = ['student', 'absence', 'rattrapage', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = () => {
    Alert.alert(
      'Signalement envoyé',
             'Le signalement d&apos;absence a été envoyé avec succès. La direction et le parent ont été notifiés.',
      [
        {
          text: 'OK',
          onPress: () => {
            onSubmit(absenceData);
            handleClose();
          }
        }
      ]
    );
  };

  const updateAbsenceData = (field: keyof AbsenceData, value: any) => {
    setAbsenceData(prev => ({ ...prev, [field]: value }));
  };

  const handleStudentSelect = (studentName: string) => {
    const student = students.find(s => s.name === studentName);
    if (student) {
      setAbsenceData(prev => ({
        ...prev,
        studentName,
        parentName: student.parent,
        parentPhone: student.phone,
        parentEmail: student.email,
      }));
    }
  };

  const handleSubjectToggle = (subject: string) => {
    setAbsenceData(prev => {
      const newSubjects = prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject];
      return { ...prev, subjects: newSubjects };
    });
  };

  const handleChildChoice = () => {
    setAbsenceData(prev => ({
      ...prev,
             subjects: ['Choix de l&apos;enfant']
    }));
  };

  // Fonctions pour les sélecteurs de date/heure
  const showDateSelector = (type: 'absence' | 'makeup') => {
    setPickerType(type);
    setPickerMode('date');
    setSelectedDate(new Date());
    if (Platform.OS === 'web') {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(true);
    }
  };

  const showTimeSelector = (type: 'absence' | 'makeup') => {
    setPickerType(type);
    setPickerMode('time');
    setSelectedDate(new Date());
    if (Platform.OS === 'web') {
      setShowTimePicker(true);
    } else {
      setShowTimePicker(true);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }
    
    if (selectedDate) {
      setSelectedDate(selectedDate);
      
      if (pickerMode === 'date') {
        const formattedDate = dayjs(selectedDate).format('DD/MM/YYYY');
        if (pickerType === 'absence') {
          updateAbsenceData('absenceDate', formattedDate);
        } else {
          updateAbsenceData('makeUpDate', formattedDate);
        }
      } else {
        const formattedTime = dayjs(selectedDate).format('HH:mm');
        if (pickerType === 'absence') {
          updateAbsenceData('absenceTime', formattedTime);
        } else {
          updateAbsenceData('makeUpTime', formattedTime);
        }
      }
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${((['student', 'absence', 'rattrapage', 'confirmation'].indexOf(currentStep) + 1) / 4) * 100}%`,
              backgroundColor: colors.primary 
            }
          ]} 
        />
      </View>
      <Text style={[styles.progressText, { color: colors.text }]}>
        Étape {['student', 'absence', 'rattrapage', 'confirmation'].indexOf(currentStep) + 1} sur 4
      </Text>
    </View>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {['student', 'absence', 'rattrapage', 'confirmation'].map((step, index) => (
        <View key={step} style={styles.stepItem}>
          <View 
            style={[
              styles.stepDot,
              { 
                backgroundColor: currentStep === step ? colors.primary : colors.border,
                borderColor: currentStep === step ? colors.primary : colors.border
              }
            ]}
          >
            {index + 1}
          </View>
          <Text style={[
            styles.stepLabel,
            { color: currentStep === step ? colors.primary : colors.text + '60' }
          ]}>
            {step === 'student' ? 'Étudiant' : 
             step === 'absence' ? 'Absence' : 
             step === 'rattrapage' ? 'Rattrapage' : 'Confirmation'}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderStudentStep = () => (
    <ScrollView style={styles.stepContent}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          <User size={20} color={colors.primary} /> Sélectionner l'étudiant
        </Text>
        
        <View style={styles.pickerContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Étudiant *</Text>
          <View style={[styles.pickerWrapper, { borderColor: colors.border }]}>
            <Picker
              selectedValue={absenceData.studentName}
              onValueChange={handleStudentSelect}
              style={[styles.picker, { color: colors.text }]}
            >
              <Picker.Item label="Sélectionner un étudiant" value="" />
              {students.map(student => (
                <Picker.Item key={student.name} label={student.name} value={student.name} />
              ))}
            </Picker>
          </View>
        </View>

        {absenceData.studentName && (
          <View style={[styles.studentInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.studentName, { color: colors.text }]}>{absenceData.studentName}</Text>
            <Text style={[styles.parentInfo, { color: colors.text + '60' }]}>
              Parent: {absenceData.parentName}
            </Text>
            <Text style={[styles.contactInfo, { color: colors.text + '60' }]}>
              📞 {absenceData.parentPhone} | 📧 {absenceData.parentEmail}
            </Text>
          </View>
        )}

        <View style={styles.pickerContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Matières *</Text>
          
          <View style={styles.subjectsContainer}>
            {subjects.map(subject => (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.subjectButton,
                  { 
                    backgroundColor: absenceData.subjects.includes(subject) ? '#DC2626' : colors.card,
                    borderColor: absenceData.subjects.includes(subject) ? '#DC2626' : colors.border
                  }
                ]}
                onPress={() => handleSubjectToggle(subject)}
              >
                <Text style={[
                  styles.subjectButtonText,
                  { color: absenceData.subjects.includes(subject) ? '#FFFFFF' : colors.text }
                ]}>
                  {subject}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={handleChildChoice} style={styles.childChoiceButton}>
                         <Text style={[styles.childChoiceText, { color: colors.primary }]}>
               <BookOpen size={16} /> Choix de l&apos;enfant
             </Text>
          </TouchableOpacity>

          {absenceData.subjects.length > 0 && (
            <View style={styles.selectedSubjects}>
              <Text style={[styles.selectedSubjectsLabel, { color: colors.text }]}>
                Matières sélectionnées: <Text style={{ color: '#DC2626', fontWeight: 'bold' }}>{absenceData.subjects.join(', ')}</Text>
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );

  const renderAbsenceStep = () => (
    <ScrollView style={styles.stepContent}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          <AlertTriangle size={20} color="#EF4444" /> Détails de l'absence
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Date de l'absence *</Text>
          <TouchableOpacity 
            style={[styles.inputContainer, { borderColor: colors.border }]}
            onPress={() => showDateSelector('absence')}
          >
            <Calendar size={20} color={colors.text + '60'} />
                                      <Text style={[styles.textInput, { color: colors.text }]}>
                {absenceData.absenceDate ? dayjs(absenceData.absenceDate, 'DD/MM/YYYY').format('DD/MM/YYYY') : 'Sélectionner une date'}
              </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Heure de l'absence *</Text>
          <TouchableOpacity 
            style={[styles.inputContainer, { borderColor: colors.border }]}
            onPress={() => showTimeSelector('absence')}
          >
            <Clock size={20} color={colors.text + '60'} />
                         <Text style={[styles.textInput, { color: colors.text }]}>
               {absenceData.absenceTime ? dayjs(absenceData.absenceTime, 'HH:mm').format('HH:mm') : 'Sélectionner une heure'}
             </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Raison de l'absence *</Text>
          <View style={[styles.pickerWrapper, { borderColor: colors.border }]}>
            <Picker
              selectedValue={absenceData.reason}
              onValueChange={(value) => updateAbsenceData('reason', value)}
              style={[styles.picker, { color: colors.text }]}
            >
              <Picker.Item label="Sélectionner une raison" value="" />
              {reasons.map(reason => (
                <Picker.Item key={reason} label={reason} value={reason} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Détails supplémentaires *</Text>
          <View style={[styles.textAreaContainer, { borderColor: colors.border }]}>
            <TextInput
              style={[styles.textArea, { color: colors.text }]}
              placeholder="Décrivez les circonstances de l'absence..."
              value={absenceData.notes}
              onChangeText={(value) => updateAbsenceData('notes', value)}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderRattrapageStep = () => (
    <ScrollView style={styles.stepContent}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          <CalendarIcon size={20} color="#10B981" /> Programmer le rattrapage
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Date du rattrapage *</Text>
          <TouchableOpacity 
            style={[styles.inputContainer, { borderColor: colors.border }]}
            onPress={() => showDateSelector('makeup')}
          >
            <Calendar size={20} color={colors.text + '60'} />
                                      <Text style={[styles.textInput, { color: colors.text }]}>
                {absenceData.makeUpDate ? dayjs(absenceData.makeUpDate, 'DD/MM/YYYY').format('DD/MM/YYYY') : 'Sélectionner une date'}
              </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Heure du rattrapage *</Text>
          <TouchableOpacity 
            style={[styles.inputContainer, { borderColor: colors.border }]}
            onPress={() => showTimeSelector('makeup')}
          >
            <Clock size={20} color={colors.text + '60'} />
                         <Text style={[styles.textInput, { color: colors.text }]}>
               {absenceData.makeUpTime ? dayjs(absenceData.makeUpTime, 'HH:mm').format('HH:mm') : 'Sélectionner une heure'}
             </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Durée du rattrapage *</Text>
          <View style={[styles.pickerWrapper, { borderColor: colors.border }]}>
            <Picker
              selectedValue={absenceData.makeUpDuration}
              onValueChange={(value) => updateAbsenceData('makeUpDuration', value)}
              style={[styles.picker, { color: colors.text }]}
            >
              <Picker.Item label="Sélectionner la durée" value="" />
              {durations.map(duration => (
                <Picker.Item key={duration} label={duration} value={duration} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Lieu du rattrapage *</Text>
          <View style={[styles.pickerWrapper, { borderColor: colors.border }]}>
            <Picker
              selectedValue={absenceData.location}
              onValueChange={(value) => updateAbsenceData('location', value)}
              style={[styles.picker, { color: colors.text }]}
            >
              {locations.map(location => (
                <Picker.Item key={location} label={location} value={location} />
              ))}
            </Picker>
          </View>
          <View style={styles.locationInfo}>
            <Home size={16} color="#6B7280" />
                         <Text style={[styles.locationInfoText, { color: '#6B7280' }]}>
               Par défaut à domicile. Si l&apos;enfant est chez une autre famille, sélectionnez "Autre famille".
             </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderConfirmationStep = () => (
    <ScrollView style={styles.stepContent}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          <CheckCircle size={20} color="#10B981" /> Confirmation
        </Text>

        <View style={[styles.confirmationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.confirmationTitle, { color: colors.text }]}>Résumé du signalement</Text>
          
          <View style={styles.confirmationSection}>
            <Text style={[styles.confirmationLabel, { color: colors.text }]}>👤 Étudiant</Text>
            <Text style={[styles.confirmationValue, { color: colors.text }]}>{absenceData.studentName}</Text>
          </View>

          <View style={styles.confirmationSection}>
            <Text style={[styles.confirmationLabel, { color: colors.text }]}>📚 Matières</Text>
            <Text style={[styles.confirmationValue, { color: '#DC2626', fontWeight: 'bold' }]}>{absenceData.subjects.join(', ')}</Text>
          </View>

          <View style={styles.confirmationSection}>
            <Text style={[styles.confirmationLabel, { color: colors.text }]}>❌ Absence</Text>
            <Text style={[styles.confirmationValue, { color: colors.text }]}>
              {absenceData.absenceDate} à {absenceData.absenceTime} - {absenceData.reason}
            </Text>
          </View>

          <View style={styles.confirmationSection}>
            <Text style={[styles.confirmationLabel, { color: colors.text }]}>✅ Rattrapage</Text>
            <Text style={[styles.confirmationValue, { color: colors.text }]}>
              {absenceData.makeUpDate} à {absenceData.makeUpTime} ({absenceData.makeUpDuration}) - {absenceData.location}
            </Text>
          </View>

          {absenceData.notes && (
            <View style={styles.confirmationSection}>
              <Text style={[styles.confirmationLabel, { color: colors.text }]}>📝 Notes</Text>
              <Text style={[styles.confirmationValue, { color: colors.text }]}>{absenceData.notes}</Text>
            </View>
          )}
        </View>

        <View style={[styles.notificationCard, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
          <Text style={[styles.notificationTitle, { color: '#92400E' }]}>
            <Bell size={16} color="#F59E0B" /> Notifications automatiques
          </Text>
          <Text style={[styles.notificationText, { color: '#92400E' }]}>
            • Notification push à la direction{'\n'}
            • SMS au parent ({absenceData.parentPhone}){'\n'}
            • Notification push au parent
          </Text>
        </View>

        <View style={[styles.warningCard, { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }]}>
          <Text style={[styles.warningTitle, { color: '#DC2626' }]}>
            <AlertCircle size={16} color="#EF4444" /> Engagement important
          </Text>
          <Text style={[styles.warningText, { color: '#991B1B' }]}>
                         ⚠️ En signalant cette absence, vous vous engagez à effectuer le rattrapage programmé.{'\n\n'}
             📋 La direction sera notifiée et pourra vous interpeller si le rattrapage n&apos;est pas effectué.{'\n\n'}
             ✅ Assurez-vous de respecter votre engagement pour maintenir la qualité de l&apos;enseignement.
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'student':
        return renderStudentStep();
      case 'absence':
        return renderAbsenceStep();
      case 'rattrapage':
        return renderRattrapageStep();
      case 'confirmation':
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  const renderActions = () => (
    <View style={styles.actions}>
      {currentStep !== 'student' && (
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton, { borderColor: colors.border }]}
          onPress={handlePrevious}
        >
          <ChevronLeft size={20} color={colors.text} />
          <Text style={[styles.actionButtonText, { color: colors.text }]}>Précédent</Text>
        </TouchableOpacity>
      )}

      {currentStep !== 'confirmation' ? (
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={handleNext}
        >
          <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Suivant</Text>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton, { backgroundColor: '#10B981' }]}
          onPress={handleSubmit}
        >
          <Send size={20} color="#FFFFFF" />
          <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Envoyer</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <LinearGradient
            colors={['#EF4444', '#F87171', '#FCA5A5']}
            style={styles.modalHeader}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <X color="#FFFFFF" size={24} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Signalement d'absence</Text>
              <View style={styles.headerIcon}>
                <AlertTriangle color="#FFFFFF" size={24} />
              </View>
            </View>
          </LinearGradient>

          {renderProgressBar()}
          {renderStepIndicator()}

          <ScrollView style={styles.modalBody}>
            {renderStepContent()}
          </ScrollView>

                     {renderActions()}
         </View>
       </View>

       {/* DateTimePicker pour mobile */}
       {(showDatePicker || showTimePicker) && Platform.OS !== 'web' && (
         <DateTimePicker
           value={selectedDate}
           mode={pickerMode}
           is24Hour={true}
           display="default"
           onChange={handleDateChange}
         />
       )}

               {/* DateTimePicker pour web */}
        {Platform.OS === 'web' && (showDatePicker || showTimePicker) && (
          <DateTimePicker
            value={selectedDate}
            mode={pickerMode}
            display="inline"
            onChange={handleDateChange}
          />
        )}
     </Modal>
   );
 }

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Platform.OS === 'web' ? Math.min(width * 0.95, 600) : width * 0.92,
    maxHeight: Platform.OS === 'web' ? height * 0.9 : height * 0.75,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: Platform.OS === 'web' ? 20 : 12,
    paddingHorizontal: Platform.OS === 'web' ? 20 : 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: Platform.OS === 'web' ? 20 : 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerIcon: {
    padding: 8,
  },
  progressContainer: {
    paddingHorizontal: Platform.OS === 'web' ? 20 : 12,
    paddingVertical: Platform.OS === 'web' ? 16 : 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Platform.OS === 'web' ? 20 : 12,
    paddingBottom: Platform.OS === 'web' ? 16 : 8,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepDot: {
    width: Platform.OS === 'web' ? 24 : 20,
    height: Platform.OS === 'web' ? 24 : 20,
    borderRadius: Platform.OS === 'web' ? 12 : 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 4,
  },
  stepLabel: {
    fontSize: Platform.OS === 'web' ? 10 : 9,
    textAlign: 'center',
  },
  modalBody: {
    flex: 1,
    padding: Platform.OS === 'web' ? 20 : 12,
  },
  stepContent: {
    flex: 1,
  },
  section: {
    marginBottom: Platform.OS === 'web' ? 24 : 12,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 18 : 14,
    fontWeight: 'bold',
    marginBottom: Platform.OS === 'web' ? 16 : 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputGroup: {
    marginBottom: Platform.OS === 'web' ? 16 : 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  textAreaContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  textArea: {
    fontSize: 14,
    minHeight: Platform.OS === 'web' ? 80 : 60,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginBottom: Platform.OS === 'web' ? 16 : 8,
  },
  pickerWrapper: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  studentInfo: {
    padding: Platform.OS === 'web' ? 16 : 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: Platform.OS === 'web' ? 16 : 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  parentInfo: {
    fontSize: 14,
    marginBottom: 2,
  },
  contactInfo: {
    fontSize: 12,
  },
  confirmationCard: {
    padding: Platform.OS === 'web' ? 16 : 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Platform.OS === 'web' ? 16 : 12,
  },
  confirmationTitle: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: 'bold',
    marginBottom: Platform.OS === 'web' ? 16 : 12,
  },
  confirmationSection: {
    marginBottom: Platform.OS === 'web' ? 12 : 8,
  },
  confirmationLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  confirmationValue: {
    fontSize: 14,
  },
  notificationCard: {
    padding: Platform.OS === 'web' ? 16 : 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificationText: {
    fontSize: 12,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: Platform.OS === 'web' ? 12 : 6,
    padding: Platform.OS === 'web' ? 20 : 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'web' ? 12 : 8,
    paddingHorizontal: Platform.OS === 'web' ? 16 : 10,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    // backgroundColor set inline
  },
  secondaryButton: {
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: Platform.OS === 'web' ? 14 : 12,
    fontWeight: '600',
  },
  childChoiceButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  childChoiceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  locationInfoText: {
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  warningCard: {
    marginTop: Platform.OS === 'web' ? 16 : 12,
    padding: Platform.OS === 'web' ? 16 : 12,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  subjectButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  subjectButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  selectedSubjects: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  selectedSubjectsLabel: {
    fontSize: 12,
    fontStyle: 'italic',
  },
}); 