import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, BookUser, Phone, Mail, MessageCircle, Users, GraduationCap, User, CreditCard as Edit, Trash2, ArrowLeft, Plus, Filter } from 'lucide-react-native';
import { router } from 'expo-router';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'enseignant' | 'parent';
  status: 'actif' | 'inactif';
  location: string;
}

export default function UsersManagement() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'enseignant' | 'parent'>('enseignant');

  const users: User[] = [
    {
      id: 'ENS001',
      name: 'M. Kouassi Jean',
      email: 'kouassi.jean@gmail.com',
      phone: '07 59 63 27 88',
      role: 'enseignant',
      status: 'actif',
      location: 'Cocody',
    },
    {
      id: 'ENS002',
      name: 'Mme N\'Guessan Marie',
      email: 'nguessan.marie@gmail.com',
      phone: '05 67 89 12 34',
      role: 'enseignant',
      status: 'actif',
      location: 'Marcory',
    },
    {
      id: 'PAR001',
      name: 'M. Diabaté Mamadou',
      email: 'diabate.mamadou@gmail.com',
      phone: '07 12 34 56 78',
      role: 'parent',
      status: 'actif',
      location: 'Yopougon',
    },
    {
      id: 'PAR002',
      name: 'Mme Koné Fatou',
      email: 'kone.fatou@gmail.com',
      phone: '05 98 76 54 32',
      role: 'parent',
      status: 'actif',
      location: 'Adjamé',
    },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.role === activeTab &&
      (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.fixedHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ArrowLeft color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Gestion des Utilisateurs</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Gérer les enseignants et parents</Text>
            <Text style={styles.welcomeSubtitle}>Administration des comptes utilisateurs</Text>
          </View>

          {/* Search and Filter */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Search color="#6B7280" size={20} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un utilisateur..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Filter color="#6B7280" size={20} />
            </TouchableOpacity>
          </View>

          {/* Role Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'enseignant' && styles.activeTab,
              ]}
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
                Enseignants
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'parent' && styles.activeTab,
              ]}
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
                Parents
              </Text>
            </TouchableOpacity>
          </View>

          {/* Add Button */}
          <TouchableOpacity style={[styles.addButton, { backgroundColor: getRoleColor(activeTab) }]}>
            <Plus color="#FFFFFF" size={20} />
            <Text style={styles.addButtonText}>
              Ajouter {activeTab === 'enseignant' ? 'un enseignant' : 'un parent'}
            </Text>
          </TouchableOpacity>

          {/* Users List */}
          <View style={styles.usersList}>
            {filteredUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                      {getRoleIcon(user.role)}
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <Text style={styles.userId}>ID: {user.id}</Text>
                      <Text style={styles.userLocation}>📍 {user.location}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: user.status === 'actif' ? '#10B981' : '#6B7280' },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.userContact}>
                  <View style={styles.contactItem}>
                    <Mail color="#6B7280" size={16} />
                    <Text style={styles.contactText}>{user.email}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Phone color="#6B7280" size={16} />
                    <Text style={styles.contactText}>{user.phone}</Text>
                  </View>
                </View>

                <View style={styles.userActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Edit color="#3B82F6" size={18} />
                    <Text style={styles.actionButtonText}>Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Phone color="#10B981" size={18} />
                    <Text style={styles.actionButtonText}>Appeler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Trash2 color="#EF4444" size={18} />
                    <Text style={styles.actionButtonText}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  usersList: {
    minHeight: 400,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  userContact: {
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  userActions: {
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
  },
  actionButtonText: {
    fontSize: 14,
    marginLeft: 4,
    color: '#4B5563',
  },
});