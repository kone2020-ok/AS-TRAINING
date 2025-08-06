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
import { Search, Phone, Mail, MessageCircle, GraduationCap, User, MapPin } from 'lucide-react-native';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'enseignant' | 'direction';
  subjects?: string[];
  students?: string[];
  location?: string;
  lastContact?: string;
}

export default function ParentContact() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'enseignants' | 'direction'>('enseignants');

  // Données de démonstration
  const demoContacts: Contact[] = [
    {
      id: 'teacher_1',
      name: 'M. Kouassi Jean Baptiste',
      email: 'kouassi.jean@gmail.com',
      phone: '+225 07 59 63 27 88',
      role: 'enseignant',
      subjects: ['Mathématiques', 'Physique'],
      students: ['Kouadio Aya'],
      location: 'Cocody',
      lastContact: '2025-01-15',
    },
    {
      id: 'teacher_2',
      name: 'Mme N\'Guessan Marie Antoinette',
      email: 'nguessan.marie@gmail.com',
      phone: '+225 05 67 89 12 34',
      role: 'enseignant',
      subjects: ['Français', 'Histoire-Géographie'],
      students: ['N\'Dri Kevin'],
      location: 'Marcory',
      lastContact: '2025-01-14',
    },
    {
      id: 'direction_1',
      name: 'Direction AS-TRAINING',
      email: 'groupeas.infos@yahoo.fr',
      phone: '+225 07 59 63 27 88',
      role: 'direction',
      location: 'Abidjan Cocody',
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

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const filtered = contacts.filter(contact => {
      const matchesTab = contact.role === activeTab || (activeTab === 'direction' && contact.role === 'direction');
      const matchesSearch = 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone.includes(searchQuery);

      return matchesTab && matchesSearch;
    });

    setFilteredContacts(filtered);
  }, [searchQuery, contacts, activeTab]);

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

  const ContactCard = ({ contact }: { contact: Contact }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <View style={styles.contactInfo}>
          <View style={styles.contactAvatar}>
            {contact.role === 'enseignant' ? (
              <GraduationCap color="#059669" size={20} />
            ) : (
              <User color="#1E40AF" size={20} />
            )}
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactName}>{contact.name}</Text>
            {contact.subjects && (
              <Text style={styles.contactSubjects}>
                Matières: {contact.subjects.join(', ')}
              </Text>
            )}
            {contact.students && (
              <Text style={styles.contactStudents}>
                Élèves: {contact.students.join(', ')}
              </Text>
            )}
            {contact.location && (
              <Text style={styles.contactLocation}>📍 {contact.location}</Text>
            )}
          </View>
        </View>
        
        {contact.lastContact && (
          <Text style={styles.lastContactText}>
            Dernier contact: {contact.lastContact}
          </Text>
        )}
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
        <LinearGradient colors={['#EA580C', '#F97316']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Mes Contacts</Text>
            <Text style={styles.headerSubtitle}>Chargement...</Text>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#EA580C', '#F97316']} style={styles.header}>
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <Text style={styles.headerTitle}>Mes Contacts</Text>
          <Text style={styles.headerSubtitle}>
            Communication directe et rapide
          </Text>
        </Animated.View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
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
            style={[styles.tab, activeTab === 'enseignants' && styles.activeTab]}
            onPress={() => setActiveTab('enseignants')}
          >
            <GraduationCap
              color={activeTab === 'enseignants' ? '#FFFFFF' : '#6B7280'}
              size={20}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'enseignants' && styles.activeTabText,
              ]}
            >
              Enseignants ({contacts.filter(c => c.role === 'enseignant').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'direction' && styles.activeTab]}
            onPress={() => setActiveTab('direction')}
          >
            <User
              color={activeTab === 'direction' ? '#FFFFFF' : '#6B7280'}
              size={20}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'direction' && styles.activeTabText,
              ]}
            >
              Direction
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.contactsList} showsVerticalScrollIndicator={false}>
          {filteredContacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </ScrollView>
      </Animated.View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    backgroundColor: '#EA580C',
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
  contactSubjects: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    marginBottom: 2,
  },
  contactStudents: {
    fontSize: 12,
    color: '#EA580C',
    fontWeight: '500',
    marginBottom: 2,
  },
  contactLocation: {
    fontSize: 12,
    color: '#6B7280',
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