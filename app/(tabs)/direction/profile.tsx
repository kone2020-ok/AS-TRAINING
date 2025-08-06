import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  ArrowLeft,
  Camera,
  Shield,
  Building,
  Users,
  FileText,
  DollarSign,
  Settings,
  LogOut,
  Eye,
  EyeOff,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  department: string;
  joinDate: string;
  avatar?: string;
  permissions: string[];
  lastLogin: string;
}

export default function DirectionProfileScreen() {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Données du profil Direction
  const [profileData, setProfileData] = useState<ProfileData>({
    id: 'DIR-001',
    name: 'Marie Dubois',
    email: 'direction@astra-training.com',
    phone: '+33 1 23 45 67 89',
    address: '123 Rue de la Formation, 75001 Paris',
    role: 'Directrice Générale',
    department: 'Direction',
    joinDate: '15/01/2020',
    avatar: undefined,
    permissions: ['Gestion complète', 'Accès aux rapports', 'Gestion des utilisateurs'],
    lastLogin: 'Aujourd\'hui à 09:30',
  });

  const [editableData, setEditableData] = useState({
    name: profileData.name,
    email: profileData.email,
    phone: profileData.phone,
    address: profileData.address,
  });

  const handleSaveProfile = () => {
    setProfileData({
      ...profileData,
      ...editableData,
    });
    setIsEditing(false);
    Alert.alert('Succès', 'Profil mis à jour avec succès !');
  };

  const handleCancelEdit = () => {
    setEditableData({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      address: profileData.address,
    });
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    Alert.alert('Succès', 'Mot de passe modifié avec succès !');
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: () => {
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const renderProfileHeader = () => (
    <LinearGradient
      colors={['#1E40AF', '#3B82F6', '#60A5FA']}
      style={styles.profileHeader}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
          <Edit color="#FFFFFF" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.avatarSection}>
        <TouchableOpacity style={styles.avatarContainer} onPress={() => setShowAvatarModal(true)}>
          {profileData.avatar ? (
            <Image source={{ uri: profileData.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User color="#FFFFFF" size={48} />
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Camera color="#FFFFFF" size={16} />
          </View>
        </TouchableOpacity>
        <Text style={styles.profileName}>{profileData.name}</Text>
        <Text style={styles.profileRole}>{profileData.role}</Text>
      </View>
    </LinearGradient>
  );

  const renderProfileInfo = () => (
    <View style={styles.profileInfo}>
      <View style={styles.infoSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations personnelles</Text>
        
        <View style={styles.infoItem}>
          <View style={[styles.infoIcon, { backgroundColor: colors.primary + '20' }]}>
            <User color={colors.primary} size={20} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.text + '60' }]}>Nom complet</Text>
            {isEditing ? (
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={editableData.name}
                onChangeText={(text) => setEditableData({ ...editableData, name: text })}
                placeholder="Nom complet"
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{profileData.name}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={[styles.infoIcon, { backgroundColor: colors.primary + '20' }]}>
            <Mail color={colors.primary} size={20} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.text + '60' }]}>Email</Text>
            {isEditing ? (
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={editableData.email}
                onChangeText={(text) => setEditableData({ ...editableData, email: text })}
                placeholder="Email"
                keyboardType="email-address"
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{profileData.email}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={[styles.infoIcon, { backgroundColor: colors.primary + '20' }]}>
            <Phone color={colors.primary} size={20} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.text + '60' }]}>Téléphone</Text>
            {isEditing ? (
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={editableData.phone}
                onChangeText={(text) => setEditableData({ ...editableData, phone: text })}
                placeholder="Téléphone"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{profileData.phone}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={[styles.infoIcon, { backgroundColor: colors.primary + '20' }]}>
            <MapPin color={colors.primary} size={20} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.text + '60' }]}>Adresse</Text>
            {isEditing ? (
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={editableData.address}
                onChangeText={(text) => setEditableData({ ...editableData, address: text })}
                placeholder="Adresse"
                multiline
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{profileData.address}</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations professionnelles</Text>
        
        <View style={styles.infoItem}>
          <View style={[styles.infoIcon, { backgroundColor: colors.primary + '20' }]}>
            <Building color={colors.primary} size={20} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.text + '60' }]}>Département</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{profileData.department}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={[styles.infoIcon, { backgroundColor: colors.primary + '20' }]}>
            <Calendar color={colors.primary} size={20} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.text + '60' }]}>Date d'entrée</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{profileData.joinDate}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={[styles.infoIcon, { backgroundColor: colors.primary + '20' }]}>
            <Shield color={colors.primary} size={20} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.text + '60' }]}>Dernière connexion</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{profileData.lastLogin}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Permissions</Text>
        {profileData.permissions.map((permission, index) => (
          <View key={index} style={styles.permissionItem}>
            <View style={[styles.permissionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Shield color={colors.primary} size={16} />
            </View>
            <Text style={[styles.permissionText, { color: colors.text }]}>{permission}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      {isEditing ? (
        <View style={styles.editButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleSaveProfile}
          >
            <Save color="#FFFFFF" size={20} />
            <Text style={styles.actionButtonText}>Enregistrer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.border }]}
            onPress={handleCancelEdit}
          >
            <X color={colors.text} size={20} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Annuler</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.normalButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowPasswordModal(true)}
          >
            <Shield color="#FFFFFF" size={20} />
            <Text style={styles.actionButtonText}>Changer mot de passe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#DC2626' }]}
            onPress={handleLogout}
          >
            <LogOut color="#FFFFFF" size={20} />
            <Text style={styles.actionButtonText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderPasswordModal = () => (
    <Modal
      visible={showPasswordModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPasswordModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Changer le mot de passe</Text>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Mot de passe actuel</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <Shield size={20} color={colors.text + '60'} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="Mot de passe actuel"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color={colors.text + '60'} /> : <Eye size={20} color={colors.text + '60'} />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Nouveau mot de passe</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <Shield size={20} color={colors.text + '60'} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Confirmer le mot de passe</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <Shield size={20} color={colors.text + '60'} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleChangePassword}
            >
              <Text style={styles.primaryButtonText}>Modifier le mot de passe</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderProfileHeader()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderProfileInfo()}
      </ScrollView>

      {renderActionButtons()}
      {renderPasswordModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editButton: {
    padding: 8,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileInfo: {
    flex: 1,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  textInput: {
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  permissionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  permissionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    padding: 16,
    paddingBottom: 32,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  normalButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 