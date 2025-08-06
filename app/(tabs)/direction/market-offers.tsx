import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Plus,
  Briefcase,
  Users,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  BookOpen,
  CheckCircle,
  X,
  AlertCircle,
  UserCheck,
  UserX,
  Send,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

const { width, height } = Dimensions.get('window');

interface MarketOffer {
  id: string;
  title: string;
  subject: string;
  studentCount: number;
  classes: string[];
  location: string;
  subjects: string[];
  schedule: {
    sessionsPerWeek: number;
    hoursPerSession: number;
    days: string[];
    timeSlot: string;
    totalHoursPerWeek: number;
  };
  salary: {
    perHour: number;
    perWeek: number;
    perMonth: number;
  };
  startDate: string;
  status: 'available' | 'taken' | 'expired';
  createdAt: string;
  interestedTeachers: string[];
  assignedTeacher?: string;
  description?: string;
}

interface DirectionMarketOffersScreenProps {}

export default function DirectionMarketOffersScreen({}: DirectionMarketOffersScreenProps) {
  const { colors } = useTheme();
  const [offers, setOffers] = useState<MarketOffer[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<MarketOffer | null>(null);
  const [loading, setLoading] = useState(false);

  // États pour le formulaire de création
  const [newOffer, setNewOffer] = useState({
    title: '',
    subject: '',
    studentCount: 1,
    classes: [] as string[],
    location: '',
    subjects: [] as string[],
    sessionsPerWeek: 4,
    hoursPerSession: 2,
    days: [] as string[],
    timeSlot: 'matinée',
    perHour: 2000,
    startDate: '',
    description: '',
  });

  // Données fictives
  const availableClasses = [
    'CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2',
    '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'
  ];

  const availableSubjects = [
    'Français', 'Mathématiques', 'Physique', 'Chimie', 'Biologie',
    'Anglais', 'Histoire', 'Géographie', 'Philosophie', 'SVT'
  ];

  const availableDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const timeSlots = ['matinée', 'après-midi', 'soirée'];

  // Données de démonstration
  const demoOffers: MarketOffer[] = [
    {
      id: '1',
      title: 'Cours de vacances - Français',
      subject: 'Français',
      studentCount: 1,
      classes: ['CM2'],
      location: 'Bassam cité les Rosiers 5',
      subjects: ['Français'],
      schedule: {
        sessionsPerWeek: 4,
        hoursPerSession: 2,
        days: ['Lundi', 'Mardi', 'Jeudi', 'Vendredi'],
        timeSlot: 'matinée',
        totalHoursPerWeek: 8,
      },
      salary: {
        perHour: 2000,
        perWeek: 16000,
        perMonth: 64000,
      },
      startDate: '08 août 2025',
      status: 'available',
      createdAt: '2024-01-15',
      interestedTeachers: ['Marie Kouassi', 'Pierre Yao'],
      description: 'Élève de CM2 qui passe en 6ème. Besoin d\'un formateur très expérimenté.',
    },
    {
      id: '2',
      title: 'Soutien scolaire - Mathématiques',
      subject: 'Mathématiques',
      studentCount: 2,
      classes: ['4ème', '3ème'],
      location: 'Abidjan Plateau',
      subjects: ['Mathématiques'],
      schedule: {
        sessionsPerWeek: 3,
        hoursPerSession: 1.5,
        days: ['Mardi', 'Jeudi', 'Samedi'],
        timeSlot: 'après-midi',
        totalHoursPerWeek: 4.5,
      },
      salary: {
        perHour: 2500,
        perWeek: 11250,
        perMonth: 45000,
      },
      startDate: '15 janvier 2024',
      status: 'taken',
      createdAt: '2024-01-10',
      interestedTeachers: ['Anna Traoré'],
      assignedTeacher: 'Anna Traoré',
      description: 'Soutien scolaire pour deux élèves en difficulté.',
    },
  ];

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = () => {
    setLoading(true);
    // Simulation de chargement
    setTimeout(() => {
      setOffers(demoOffers);
      setLoading(false);
    }, 1000);
  };

  const handleCreateOffer = () => {
    if (!newOffer.title || !newOffer.location || newOffer.subjects.length === 0) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const totalHoursPerWeek = newOffer.sessionsPerWeek * newOffer.hoursPerSession;
    const perWeek = totalHoursPerWeek * newOffer.perHour;
    const perMonth = perWeek * 4;

    const offer: MarketOffer = {
      id: Date.now().toString(),
      title: newOffer.title,
      subject: newOffer.subject,
      studentCount: newOffer.studentCount,
      classes: newOffer.classes,
      location: newOffer.location,
      subjects: newOffer.subjects,
      schedule: {
        sessionsPerWeek: newOffer.sessionsPerWeek,
        hoursPerSession: newOffer.hoursPerSession,
        days: newOffer.days,
        timeSlot: newOffer.timeSlot,
        totalHoursPerWeek,
      },
      salary: {
        perHour: newOffer.perHour,
        perWeek,
        perMonth,
      },
      startDate: newOffer.startDate,
      status: 'available',
      createdAt: new Date().toISOString().split('T')[0],
      interestedTeachers: [],
      description: newOffer.description,
    };

    setOffers(prev => [offer, ...prev]);
    setShowCreateModal(false);
    resetForm();

    Alert.alert(
      'Offre publiée',
      'L\'offre a été publiée avec succès. Les enseignants recevront une notification.',
      [{ text: 'OK' }]
    );
  };

  const resetForm = () => {
    setNewOffer({
      title: '',
      subject: '',
      studentCount: 1,
      classes: [],
      subjects: [],
      sessionsPerWeek: 4,
      hoursPerSession: 2,
      days: [],
      timeSlot: 'matinée',
      perHour: 2000,
      startDate: '',
      description: '',
    });
  };

  const handleAssignTeacher = (offerId: string, teacherName: string) => {
    setOffers(prev => prev.map(offer => 
      offer.id === offerId 
        ? { ...offer, status: 'taken' as const, assignedTeacher: teacherName }
        : offer
    ));

    Alert.alert(
      'Enseignant assigné',
      `${teacherName} a été assigné à cette offre.`,
      [{ text: 'OK' }]
    );
  };

  const handleMarkAsTaken = (offerId: string) => {
    setOffers(prev => prev.map(offer => 
      offer.id === offerId 
        ? { ...offer, status: 'taken' as const }
        : offer
    ));

    Alert.alert(
      'Offre marquée comme prise',
      'Cette offre est maintenant marquée comme prise.',
      [{ text: 'OK' }]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'taken': return '#EF4444';
      case 'expired': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle size={16} color="#10B981" />;
      case 'taken': return <UserCheck size={16} color="#EF4444" />;
      case 'expired': return <X size={16} color="#6B7280" />;
      default: return <AlertCircle size={16} color="#6B7280" />;
    }
  };

  const renderOfferCard = (offer: MarketOffer) => (
    <TouchableOpacity
      key={offer.id}
      style={[styles.offerCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        setSelectedOffer(offer);
        setShowDetailsModal(true);
      }}
    >
      <View style={styles.offerHeader}>
        <View style={styles.offerTitleContainer}>
          <Briefcase size={20} color={colors.primary} />
          <Text style={[styles.offerTitle, { color: colors.text }]}>{offer.title}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(offer.status) + '20' }]}>
          {getStatusIcon(offer.status)}
          <Text style={[styles.statusText, { color: getStatusColor(offer.status) }]}>
            {offer.status === 'available' ? 'Disponible' : 
             offer.status === 'taken' ? 'Pris' : 'Expiré'}
          </Text>
        </View>
      </View>

      <View style={styles.offerDetails}>
        <View style={styles.detailRow}>
          <MapPin size={16} color={colors.text + '60'} />
          <Text style={[styles.detailText, { color: colors.text }]}>{offer.location}</Text>
        </View>

        <View style={styles.detailRow}>
          <Users size={16} color={colors.text + '60'} />
          <Text style={[styles.detailText, { color: colors.text }]}>
            {offer.studentCount} élève(s) - {offer.classes.join(', ')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <BookOpen size={16} color={colors.text + '60'} />
          <Text style={[styles.detailText, { color: colors.text }]}>
            {offer.subjects.join(', ')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Clock size={16} color={colors.text + '60'} />
          <Text style={[styles.detailText, { color: colors.text }]}>
            {offer.schedule.sessionsPerWeek} séances de {offer.schedule.hoursPerSession}h/semaine
          </Text>
        </View>

        <View style={styles.detailRow}>
          <DollarSign size={16} color={colors.text + '60'} />
          <Text style={[styles.detailText, { color: colors.text }]}>
            {offer.salary.perHour.toLocaleString()} F/h - {offer.salary.perMonth.toLocaleString()} F/mois
          </Text>
        </View>

        {offer.interestedTeachers.length > 0 && (
          <View style={styles.interestedContainer}>
            <Text style={[styles.interestedLabel, { color: colors.text }]}>
              {offer.interestedTeachers.length} enseignant(s) intéressé(s)
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <LinearGradient
            colors={['#3B82F6', '#60A5FA', '#93C5FD']}
            style={styles.modalHeader}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowCreateModal(false)}>
                <X color="#FFFFFF" size={24} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Publier une offre</Text>
              <View style={styles.headerIcon}>
                <Plus color="#FFFFFF" size={24} />
              </View>
            </View>
          </LinearGradient>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                <Briefcase size={20} color={colors.primary} /> Informations générales
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Titre de l'offre *</Text>
                <TextInput
                  style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
                  value={newOffer.title}
                  onChangeText={(value) => setNewOffer(prev => ({ ...prev, title: value }))}
                  placeholder="Ex: Cours de vacances - Français"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Lieu *</Text>
                <TextInput
                  style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
                  value={newOffer.location}
                  onChangeText={(value) => setNewOffer(prev => ({ ...prev, location: value }))}
                  placeholder="Ex: Bassam cité les Rosiers 5"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Nombre d'élèves</Text>
                <TextInput
                  style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
                  value={newOffer.studentCount.toString()}
                  onChangeText={(value) => setNewOffer(prev => ({ ...prev, studentCount: parseInt(value) || 1 }))}
                  keyboardType="numeric"
                  placeholder="1"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Classes</Text>
                <View style={[styles.pickerWrapper, { borderColor: colors.border }]}>
                  <Picker
                    selectedValue=""
                    onValueChange={(value) => {
                      if (value && !newOffer.classes.includes(value)) {
                        setNewOffer(prev => ({ ...prev, classes: [...prev.classes, value] }));
                      }
                    }}
                    style={[styles.picker, { color: colors.text }]}
                  >
                    <Picker.Item label="Sélectionner une classe" value="" />
                    {availableClasses.map(cls => (
                      <Picker.Item key={cls} label={cls} value={cls} />
                    ))}
                  </Picker>
                </View>
                {newOffer.classes.length > 0 && (
                  <View style={styles.selectedItems}>
                    {newOffer.classes.map(cls => (
                      <TouchableOpacity
                        key={cls}
                        style={[styles.selectedItem, { backgroundColor: colors.primary }]}
                        onPress={() => setNewOffer(prev => ({
                          ...prev,
                          classes: prev.classes.filter(c => c !== cls)
                        }))}
                      >
                        <Text style={[styles.selectedItemText, { color: '#FFFFFF' }]}>{cls}</Text>
                        <X size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Matières *</Text>
                <View style={[styles.pickerWrapper, { borderColor: colors.border }]}>
                  <Picker
                    selectedValue=""
                    onValueChange={(value) => {
                      if (value && !newOffer.subjects.includes(value)) {
                        setNewOffer(prev => ({ ...prev, subjects: [...prev.subjects, value] }));
                      }
                    }}
                    style={[styles.picker, { color: colors.text }]}
                  >
                    <Picker.Item label="Sélectionner une matière" value="" />
                    {availableSubjects.map(subject => (
                      <Picker.Item key={subject} label={subject} value={subject} />
                    ))}
                  </Picker>
                </View>
                {newOffer.subjects.length > 0 && (
                  <View style={styles.selectedItems}>
                    {newOffer.subjects.map(subject => (
                      <TouchableOpacity
                        key={subject}
                        style={[styles.selectedItem, { backgroundColor: colors.primary }]}
                        onPress={() => setNewOffer(prev => ({
                          ...prev,
                          subjects: prev.subjects.filter(s => s !== subject)
                        }))}
                      >
                        <Text style={[styles.selectedItemText, { color: '#FFFFFF' }]}>{subject}</Text>
                        <X size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                <Clock size={20} color={colors.primary} /> Planning et rémunération
              </Text>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Séances/semaine</Text>
                  <TextInput
                    style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
                    value={newOffer.sessionsPerWeek.toString()}
                    onChangeText={(value) => setNewOffer(prev => ({ ...prev, sessionsPerWeek: parseInt(value) || 4 }))}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Heures/séance</Text>
                  <TextInput
                    style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
                    value={newOffer.hoursPerSession.toString()}
                    onChangeText={(value) => setNewOffer(prev => ({ ...prev, hoursPerSession: parseFloat(value) || 2 }))}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Créneau horaire</Text>
                <View style={[styles.pickerWrapper, { borderColor: colors.border }]}>
                  <Picker
                    selectedValue={newOffer.timeSlot}
                    onValueChange={(value) => setNewOffer(prev => ({ ...prev, timeSlot: value }))}
                    style={[styles.picker, { color: colors.text }]}
                  >
                    {timeSlots.map(slot => (
                      <Picker.Item key={slot} label={slot} value={slot} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Salaire par heure (FCFA)</Text>
                <TextInput
                  style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
                  value={newOffer.perHour.toString()}
                  onChangeText={(value) => setNewOffer(prev => ({ ...prev, perHour: parseInt(value) || 2000 }))}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Date de démarrage</Text>
                <TextInput
                  style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
                  value={newOffer.startDate}
                  onChangeText={(value) => setNewOffer(prev => ({ ...prev, startDate: value }))}
                  placeholder="Ex: 08 août 2025"
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.label, { color: colors.text }]}>Description (optionnel)</Text>
              <TextInput
                style={[styles.textArea, { borderColor: colors.border, color: colors.text }]}
                value={newOffer.description}
                onChangeText={(value) => setNewOffer(prev => ({ ...prev, description: value }))}
                placeholder="Décrivez les détails de l'offre..."
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton, { borderColor: colors.border }]}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateOffer}
            >
              <Send size={20} color="#FFFFFF" />
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Publier</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderDetailsModal = () => (
    <Modal
      visible={showDetailsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowDetailsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <LinearGradient
            colors={['#10B981', '#34D399', '#6EE7B7']}
            style={styles.modalHeader}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowDetailsModal(false)}>
                <X color="#FFFFFF" size={24} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Détails de l'offre</Text>
              <View style={styles.headerIcon}>
                <Eye color="#FFFFFF" size={24} />
              </View>
            </View>
          </LinearGradient>

          {selectedOffer && (
            <ScrollView style={styles.modalBody}>
              <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.detailsTitle, { color: colors.text }]}>{selectedOffer.title}</Text>
                
                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { color: colors.text }]}>📍 Informations générales</Text>
                  <Text style={[styles.detailText, { color: colors.text }]}>
                    <Text style={{ fontWeight: 'bold' }}>Lieu:</Text> {selectedOffer.location}
                  </Text>
                  <Text style={[styles.detailText, { color: colors.text }]}>
                    <Text style={{ fontWeight: 'bold' }}>Élèves:</Text> {selectedOffer.studentCount} - {selectedOffer.classes.join(', ')}
                  </Text>
                  <Text style={[styles.detailText, { color: colors.text }]}>
                    <Text style={{ fontWeight: 'bold' }}>Matières:</Text> {selectedOffer.subjects.join(', ')}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { color: colors.text }]}>⏰ Planning</Text>
                  <Text style={[styles.detailText, { color: colors.text }]}>
                    {selectedOffer.schedule.sessionsPerWeek} séances de {selectedOffer.schedule.hoursPerSession}h/semaine
                  </Text>
                  <Text style={[styles.detailText, { color: colors.text }]}>
                    <Text style={{ fontWeight: 'bold' }}>Jours:</Text> {selectedOffer.schedule.days.join(', ')}
                  </Text>
                  <Text style={[styles.detailText, { color: colors.text }]}>
                    <Text style={{ fontWeight: 'bold' }}>Créneau:</Text> {selectedOffer.schedule.timeSlot}
                  </Text>
                  <Text style={[styles.detailText, { color: colors.text }]}>
                    <Text style={{ fontWeight: 'bold' }}>Total:</Text> {selectedOffer.schedule.totalHoursPerWeek}h/semaine
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { color: colors.text }]}>💰 Rémunération</Text>
                  <Text style={[styles.detailText, { color: colors.text }]}>
                    <Text style={{ fontWeight: 'bold' }}>Par heure:</Text> {selectedOffer.salary.perHour.toLocaleString()} FCFA
                  </Text>
                  <Text style={[styles.detailText, { color: colors.text }]}>
                    <Text style={{ fontWeight: 'bold' }}>Par semaine:</Text> {selectedOffer.salary.perWeek.toLocaleString()} FCFA
                  </Text>
                  <Text style={[styles.detailText, { color: colors.text }]}>
                    <Text style={{ fontWeight: 'bold' }}>Par mois:</Text> {selectedOffer.salary.perMonth.toLocaleString()} FCFA
                  </Text>
                </View>

                {selectedOffer.description && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailSectionTitle, { color: colors.text }]}>📝 Description</Text>
                    <Text style={[styles.detailText, { color: colors.text }]}>{selectedOffer.description}</Text>
                  </View>
                )}

                {selectedOffer.interestedTeachers.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailSectionTitle, { color: colors.text }]}>
                      👥 Enseignants intéressés ({selectedOffer.interestedTeachers.length})
                    </Text>
                    {selectedOffer.interestedTeachers.map((teacher, index) => (
                      <View key={index} style={styles.teacherItem}>
                        <Text style={[styles.teacherName, { color: colors.text }]}>{teacher}</Text>
                        {selectedOffer.status === 'available' && (
                          <TouchableOpacity
                            style={[styles.assignButton, { backgroundColor: colors.primary }]}
                            onPress={() => handleAssignTeacher(selectedOffer.id, teacher)}
                          >
                            <Text style={[styles.assignButtonText, { color: '#FFFFFF' }]}>Assigner</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {selectedOffer.status === 'available' && (
                  <View style={styles.detailSection}>
                    <TouchableOpacity
                      style={[styles.markTakenButton, { backgroundColor: '#EF4444' }]}
                      onPress={() => handleMarkAsTaken(selectedOffer.id)}
                    >
                      <EyeOff size={16} color="#FFFFFF" />
                      <Text style={[styles.markTakenButtonText, { color: '#FFFFFF' }]}>
                        Marquer comme pris
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowDetailsModal(false)}
            >
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#3B82F6', '#60A5FA', '#93C5FD']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Offres de marché</Text>
        <Text style={styles.headerSubtitle}>Gérer les annonces de contrats</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {offers.filter(o => o.status === 'available').length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Disponibles</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>
              {offers.filter(o => o.status === 'taken').length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Prises</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
              {offers.reduce((total, o) => total + o.interestedTeachers.length, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Candidatures</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={[styles.createButtonText, { color: '#FFFFFF' }]}>
            Publier une nouvelle offre
          </Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.text }]}>Chargement...</Text>
          </View>
        ) : (
          <ScrollView style={styles.offersList}>
            {offers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Briefcase size={48} color={colors.text + '40'} />
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  Aucune offre publiée
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.text + '60' }]}>
                  Publiez votre première offre pour commencer
                </Text>
              </View>
            ) : (
              offers.map(renderOfferCard)
            )}
          </ScrollView>
        )}
      </View>

      {renderCreateModal()}
      {renderDetailsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  offersList: {
    flex: 1,
  },
  offerCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  offerDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  interestedContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  interestedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
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
  modalBody: {
    flex: 1,
    padding: Platform.OS === 'web' ? 20 : 12,
  },
  formSection: {
    marginBottom: Platform.OS === 'web' ? 24 : 16,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    fontWeight: 'bold',
    marginBottom: Platform.OS === 'web' ? 16 : 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputGroup: {
    marginBottom: Platform.OS === 'web' ? 16 : 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Platform.OS === 'web' ? 8 : 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  selectedItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  selectedItemText: {
    fontSize: 12,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Platform.OS === 'web' ? 12 : 8,
    padding: Platform.OS === 'web' ? 20 : 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
    paddingHorizontal: Platform.OS === 'web' ? 16 : 12,
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
    fontSize: Platform.OS === 'web' ? 14 : 13,
    fontWeight: '600',
  },
  detailsCard: {
    padding: Platform.OS === 'web' ? 16 : 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailsTitle: {
    fontSize: Platform.OS === 'web' ? 20 : 18,
    fontWeight: 'bold',
    marginBottom: Platform.OS === 'web' ? 16 : 12,
  },
  detailSection: {
    marginBottom: Platform.OS === 'web' ? 20 : 16,
  },
  detailSectionTitle: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: 'bold',
    marginBottom: Platform.OS === 'web' ? 8 : 6,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  teacherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 8,
  },
  teacherName: {
    fontSize: 14,
    fontWeight: '500',
  },
  assignButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  assignButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  markTakenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  markTakenButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 