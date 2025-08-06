import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
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
  Eye,
  Heart,
  HeartOff,
  Send,
  Filter,
} from 'lucide-react-native';

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

interface TeacherMarketOffersScreenProps {}

export default function TeacherMarketOffersScreen({}: TeacherMarketOffersScreenProps) {
  const { colors } = useTheme();
  const [offers, setOffers] = useState<MarketOffer[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<MarketOffer | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'taken'>('all');

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
    {
      id: '3',
      title: 'Cours particuliers - Physique',
      subject: 'Physique',
      studentCount: 1,
      classes: ['Terminale'],
      location: 'Cocody',
      subjects: ['Physique'],
      schedule: {
        sessionsPerWeek: 2,
        hoursPerSession: 2,
        days: ['Mercredi', 'Samedi'],
        timeSlot: 'soirée',
        totalHoursPerWeek: 4,
      },
      salary: {
        perHour: 3000,
        perWeek: 12000,
        perMonth: 48000,
      },
      startDate: '20 janvier 2024',
      status: 'available',
      createdAt: '2024-01-18',
      interestedTeachers: [],
      description: 'Préparation au baccalauréat en physique.',
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

  const handleShowInterest = (offerId: string) => {
    setOffers(prev => prev.map(offer => 
      offer.id === offerId 
        ? { ...offer, interestedTeachers: [...offer.interestedTeachers, 'Vous'] }
        : offer
    ));

    Alert.alert(
      'Intérêt exprimé',
      'Votre intérêt a été enregistré. La direction sera notifiée.',
      [{ text: 'OK' }]
    );
  };

  const handleRemoveInterest = (offerId: string) => {
    setOffers(prev => prev.map(offer => 
      offer.id === offerId 
        ? { ...offer, interestedTeachers: offer.interestedTeachers.filter(t => t !== 'Vous') }
        : offer
    ));

    Alert.alert(
      'Intérêt retiré',
      'Votre intérêt a été retiré de cette offre.',
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

  const isInterested = (offer: MarketOffer) => {
    return offer.interestedTeachers.includes('Vous');
  };

  const filteredOffers = offers.filter(offer => {
    if (filter === 'all') return true;
    return offer.status === filter;
  });

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

        {offer.status === 'available' && (
          <View style={styles.actionContainer}>
            {isInterested(offer) ? (
              <TouchableOpacity
                style={[styles.interestButton, { backgroundColor: '#EF4444' }]}
                onPress={() => handleRemoveInterest(offer.id)}
              >
                <HeartOff size={16} color="#FFFFFF" />
                <Text style={[styles.interestButtonText, { color: '#FFFFFF' }]}>
                  Retirer l'intérêt
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.interestButton, { backgroundColor: colors.primary }]}
                onPress={() => handleShowInterest(offer.id)}
              >
                <Heart size={16} color="#FFFFFF" />
                <Text style={[styles.interestButtonText, { color: '#FFFFFF' }]}>
                  Je suis intéressé
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {offer.interestedTeachers.length > 0 && (
          <View style={styles.interestedContainer}>
            <Text style={[styles.interestedLabel, { color: colors.text }]}>
              {offer.interestedTeachers.length} enseignant(s) intéressé(s)
              {isInterested(offer) && ' (dont vous)'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
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

                {selectedOffer.status === 'available' && (
                  <View style={styles.detailSection}>
                    {isInterested(selectedOffer) ? (
                      <TouchableOpacity
                        style={[styles.interestButton, { backgroundColor: '#EF4444' }]}
                        onPress={() => {
                          handleRemoveInterest(selectedOffer.id);
                          setShowDetailsModal(false);
                        }}
                      >
                        <HeartOff size={16} color="#FFFFFF" />
                        <Text style={[styles.interestButtonText, { color: '#FFFFFF' }]}>
                          Retirer mon intérêt
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.interestButton, { backgroundColor: colors.primary }]}
                        onPress={() => {
                          handleShowInterest(selectedOffer.id);
                          setShowDetailsModal(false);
                        }}
                      >
                        <Heart size={16} color="#FFFFFF" />
                        <Text style={[styles.interestButtonText, { color: '#FFFFFF' }]}>
                          Je suis intéressé par cette offre
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {selectedOffer.status === 'taken' && selectedOffer.assignedTeacher && (
                  <View style={styles.detailSection}>
                    <View style={[styles.assignedContainer, { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }]}>
                      <UserCheck size={16} color="#EF4444" />
                      <Text style={[styles.assignedText, { color: '#DC2626' }]}>
                        Assigné à: {selectedOffer.assignedTeacher}
                      </Text>
                    </View>
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
        colors={['#8B5CF6', '#A78BFA', '#C4B5FD']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Offres de marché</Text>
        <Text style={styles.headerSubtitle}>Consultez les offres disponibles</Text>
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
              {offers.filter(o => isInterested(o)).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Mes candidatures</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
              {offers.filter(o => o.status === 'taken').length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Prises</Text>
          </View>
        </View>

        <View style={styles.filterContainer}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Filtrer:</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                { 
                  backgroundColor: filter === 'all' ? colors.primary : colors.card,
                  borderColor: colors.border
                }
              ]}
              onPress={() => setFilter('all')}
            >
              <Text style={[
                styles.filterButtonText,
                { color: filter === 'all' ? '#FFFFFF' : colors.text }
              ]}>
                Toutes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                { 
                  backgroundColor: filter === 'available' ? colors.primary : colors.card,
                  borderColor: colors.border
                }
              ]}
              onPress={() => setFilter('available')}
            >
              <Text style={[
                styles.filterButtonText,
                { color: filter === 'available' ? '#FFFFFF' : colors.text }
              ]}>
                Disponibles
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                { 
                  backgroundColor: filter === 'taken' ? colors.primary : colors.card,
                  borderColor: colors.border
                }
              ]}
              onPress={() => setFilter('taken')}
            >
              <Text style={[
                styles.filterButtonText,
                { color: filter === 'taken' ? '#FFFFFF' : colors.text }
              ]}>
                Prises
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.text }]}>Chargement...</Text>
          </View>
        ) : (
          <ScrollView style={styles.offersList}>
            {filteredOffers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Briefcase size={48} color={colors.text + '40'} />
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  {filter === 'available' ? 'Aucune offre disponible' :
                   filter === 'taken' ? 'Aucune offre prise' :
                   'Aucune offre publiée'}
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.text + '60' }]}>
                  {filter === 'available' ? 'Revenez plus tard pour de nouvelles offres' :
                   filter === 'taken' ? 'Aucune offre n\'a encore été assignée' :
                   'La direction n\'a pas encore publié d\'offres'}
                </Text>
              </View>
            ) : (
              filteredOffers.map(renderOfferCard)
            )}
          </ScrollView>
        )}
      </View>

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
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 12,
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
  actionContainer: {
    marginTop: Platform.OS === 'web' ? 12 : 8,
  },
  interestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
    paddingHorizontal: Platform.OS === 'web' ? 16 : 12,
    borderRadius: 8,
    gap: 8,
  },
  interestButtonText: {
    fontSize: Platform.OS === 'web' ? 14 : 13,
    fontWeight: '600',
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
  assignedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  assignedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    // backgroundColor set inline
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 