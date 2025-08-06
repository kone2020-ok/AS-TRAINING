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
import { Search, BookUser, Phone, Mail, MessageCircle, Users, GraduationCap, User, ArrowLeft } from 'lucide-react-native';
import { useWindowDimensions } from 'react-native';
import { router } from 'expo-router';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'enseignant' | 'parent';
  location: string;
  status: 'actif' | 'inactif';
  lastContact?: string;
  additionalInfo?: string;
}

export default function ContactManagement() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'enseignant' | 'parent'>('enseignant');
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // Données de démonstration
  const demoContacts: Contact[] = [
    {
      id: 'contact_1',
      name: 'M. Kouassi Jean Baptiste',
      email: 'kouassi.jean@gmail.com',
      phone: '+225 07 59 63 27 88',
      role: 'enseignant',
      location: 'Cocody',
      status: 'actif',
      lastContact: '2025-01-15',
      additionalInfo: 'Mathématiques, Physique, Chimie',
    },
    {
      id: 'contact_2',
      name: 'Mme N\'Guessan Marie Antoinette',
      email: 'nguessan.marie@gmail.com',
      phone: '+225 05 67 89 12 34',
      role: 'enseignant',
      location: 'Marcory',
      status: 'actif',
      lastContact: '2025-01-14',
      additionalInfo: 'Français, Littérature, Histoire-Géographie',
    },
    {
      id: 'contact_3',
      name: 'M. Diabaté Mamadou',
      email: 'diabate.mamadou@gmail.com',
      phone: '+225 07 12 34 56 78',
      role: 'parent',
      location: 'Yopougon',
      status: 'actif',
      lastContact: '2025-01-16',
      additionalInfo: '2 enfants: Kouadio Aya, N\'Dri Kevin',
    },
    {
      id: 'contact_4',
      name: 'Mme Koné Fatou',
      email: 'kone.fatou@gmail.com',
      phone: '+225 05 98 76 54 32',
      role: 'parent',
      location: 'Adjamé',
      status: 'actif',
      lastContact: '2025-01-12',
      additionalInfo: '1 enfant: Traoré Aminata',
    },
  ];

  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setContacts(demoContacts);
      setFilteredContacts(demoContacts.filter(c => c.role === 'enseignant'));
      setLoading(false);
    };

    loadContacts();

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
    const filtered = contacts.filter(contact => {
      const matchesRole = contact.role === activeTab;
      const matchesSearch = 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone.includes(searchQuery) ||
        contact.location.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesRole && matchesSearch;
    });

    setFilteredContacts(filtered);
  }, [searchQuery, contacts, activeTab]);

  const handleGoBack = () => {
    router.back();
  };

  const handleCall = (contact: Contact) => {
    Alert.alert(
      'Appeler',
      `Voulez-vous appeler ${contact.name} au ${contact.phone} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Appeler', onPress: () => {
          // Mettre à jour la date du dernier contact
          const updatedContacts = contacts.map(c => 
            c.id === contact.id ? { ...c, lastContact: new Date().toISOString().split('T')[0] } : c
          );
          setContacts(updatedContacts);
          Alert.alert('Appel', 'Fonction d\'appel à implémenter');
        }}
      ]
    );
  };

  const handleSendSMS = (contact: Contact) => {
    Alert.alert(
      'Envoyer un SMS',
      `Envoyer un SMS à ${contact.name} (${contact.phone}) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Envoyer', onPress: () => {
          const updatedContacts = contacts.map(c => 
            c.id === contact.id ? { ...c, lastContact: new Date().toISOString().split('T')[0] } : c
          );
          setContacts(updatedContacts);
          Alert.alert('SMS', 'Fonction d\'envoi SMS à implémenter');
        }}
      ]
    );
  };

  const handleSendEmail = (contact: Contact) => {
    Alert.alert(
      'Envoyer un email',
      `Envoyer un email à ${contact.name} (${contact.email}) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Envoyer', onPress: () => {
          const updatedContacts = contacts.map(c => 
            c.id === contact.id ? { ...c, lastContact: new Date().toISOString().split('T')[0] } : c
          );
          setContacts(updatedContacts);
          Alert.alert('Email', 'Fonction d\'envoi email à implémenter');
        }}
      ]
    );
  };

  const handleSendWhatsApp = (contact: Contact) => {
    Alert.alert(
      'Envoyer un message WhatsApp',
      `Envoyer un message WhatsApp à ${contact.name} (${contact.phone}) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Envoyer', onPress: () => {
          const updatedContacts = contacts.map(c => 
            c.id === contact.id ? { ...c, lastContact: new Date().toISOString().split('T')[0] } : c
          );
          setContacts(updatedContacts);
          Alert.alert('WhatsApp', 'Fonction d\'envoi WhatsApp à implémenter');
        }}
      ]
    );
  };

  const getRoleIcon = (role: string) => {
    return role === 'enseignant' ? (
      <GraduationCap color="#059669" size={20} />
    ) : (
      <Users color="#EA580C" size={20} />
    );
  };

  const getRoleColor = (role: string) => {
    return role === 'enseignant' ? '#059669' : '#EA580C';
  };

  const ContactCard = ({ contact }: { contact: Contact }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <View style={styles.contactInfo}>
          <View style={styles.contactAvatar}>
            {getRoleIcon(contact.role)}
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={[styles.contactRole, { color: getRoleColor(contact.role) }]}>
              {contact.role === 'enseignant' ? 'Enseignant' : 'Parent'}
            </Text>
            <Text style={styles.contactLocation}>📍 {contact.location}</Text>
            {contact.additionalInfo && (
              <Text style={styles.additionalInfo}>{contact.additionalInfo}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.contactStatus}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: contact.status === 'actif' ? '#10B981' : '#6B7280' },
            ]}
          >
            <Text style={styles.statusText}>
              {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
            </Text>
          </View>
          {contact.lastContact && (
            <Text style={styles.lastContactText}>
              Dernier contact: {contact.lastContact}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.contactContent}>
        <View style={styles.contactItem}>
          <Phone color="#6B7280" size={16} />
          <Text style={styles.contactText}>{contact.phone}</Text>
        </View>
        <View style={styles.contactItem}>
          <Mail color="#6B7280" size={16} />
          <Text style={styles.contactText}>{contact.email}</Text>
        </View>
      </View>

      <View style={styles.contactFooter}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.callButton]}
          onPress={() => handleCall(contact)}
        >
          <Phone color="#10B981" size={18} />
          <Text style={[styles.actionButtonText, { color: '#10B981' }]}>Appeler</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.smsButton]}
          onPress={() => handleSendSMS(contact)}
        >
          <MessageCircle color="#3B82F6" size={18} />
          <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>SMS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.emailButton]}
          onPress={() => handleSendEmail(contact)}
        >
          <Mail color="#F59E0B" size={18} />
          <Text style={[styles.actionButtonText, { color: '#F59E0B' }]}>Email</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.whatsappButton]}
          onPress={() => handleSendWhatsApp(contact)}
        >
          <MessageCircle color="#25D366" size={18} />
          <Text style={[styles.actionButtonText, { color: '#25D366' }]}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.fixedHeader}>
          <Text style={styles.pageTitle}>Annuaire Contacts</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.fixedHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ArrowLeft color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Annuaire Contacts</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Communication rapide et centralisée</Text>
            <Text style={styles.welcomeSubtitle}>Annuaire complet des enseignants et parents</Text>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Search color="#6B7280" size={20} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un contact..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'enseignant' && styles.activeTab]}
              onPress={() => setActiveTab('enseignant')}
            >
              <GraduationCap
                color={activeTab === 'enseignant' ? '#FFFFFF' : '#6B7280'}
                size={20}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'enseignant' && styles.activeTabText,
                ]}
              >
                Enseignants ({contacts.filter(c => c.role === 'enseignant').length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'parent' && styles.activeTab]}
              onPress={() => setActiveTab('parent')}
            >
              <Users
                color={activeTab === 'parent' ? '#FFFFFF' : '#6B7280'}
                size={20}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'parent' && styles.activeTabText,
                ]}
              >
                Parents ({contacts.filter(c => c.role === 'parent').length})
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <BookUser color="#3B82F6" size={24} />
              <Text style={styles.statNumber}>{filteredContacts.length}</Text>
              <Text style={styles.statLabel}>Contacts affichés</Text>
            </View>
            <View style={styles.statCard}>
              <Phone color="#10B981" size={24} />
              <Text style={styles.statNumber}>{filteredContacts.filter(c => c.status === 'actif').length}</Text>
              <Text style={styles.statLabel}>Actifs</Text>
            </View>
            <View style={styles.statCard}>
              <MessageCircle color="#F59E0B" size={24} />
              <Text style={styles.statNumber}>
                {filteredContacts.filter(c => c.lastContact).length}
              </Text>
              <Text style={styles.statLabel}>Contactés récemment</Text>
            </View>
          </View>

          <View style={styles.contactsList}>
            {filteredContacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
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
  searchContainer: {
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#1E40AF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#FFFFFF',
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
  contactsList: {
    flex: 1,
    minHeight: 400,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contactInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  contactRole: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  additionalInfo: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  contactStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  lastContactText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'right',
  },
  contactContent: {
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  contactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  callButton: {
    backgroundColor: '#ECFDF5',
  },
  smsButton: {
    backgroundColor: '#EBF8FF',
  },
  emailButton: {
    backgroundColor: '#FFFBEB',
  },
  whatsappButton: {
    backgroundColor: '#F0FDF4',
  },
  actionButtonText: {
    fontSize: 12,
    marginLeft: 4,
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