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
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
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
  GraduationCap,
  Award,
  DollarSign,
  Clock,
  Star,
  LogOut,
  Eye,
  EyeOff,
  Users,
  Bell,
  Upload,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

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
  specializations: string[];
  experience: string;
  rating: number;
  totalSessions: number;
  totalStudents: number;
  lastLogin: string;
  salary: string;
  notificationsEnabled: boolean;
  avatarUploadStatus: 'none' | 'pending' | 'approved' | 'rejected';
}

export default function EnseignantProfileScreen() {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newAvatar, setNewAvatar] = useState<string | undefined>(undefined);

  const [profileData, setProfileData] = useState<ProfileData>({
    id: 'ENS-001',
    name: 'Pierre Martin',
    email: 'pierre.martin@astra-training.com',
    phone: '+33 6 12 34 56 78',
    address: '456 Avenue des Études, 75002 Paris',
    role: 'Enseignant',
    department: 'Formation',
    joinDate: '10/03/2021',
    avatar: undefined,
    specializations: ['Mathématiques', 'Physique', 'Chimie'],
    experience: '5 ans',
    rating: 4.8,
    totalSessions: 156,
    totalStudents: 23,
    lastLogin: 'Aujourd\'hui à 08:45',
    salary: '2 800€/mois',
    notificationsEnabled: true,
    avatarUploadStatus: 'none',
  });

  const [editableData, setEditableData] = useState({
    name: profileData.name,
    email: profileData.email,
    phone: profileData.phone,
    address: profileData.address,
    notificationsEnabled: profileData.notificationsEnabled,
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
      notificationsEnabled: profileData.notificationsEnabled,
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à votre galerie pour choisir une photo.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setNewAvatar(result.assets[0].uri);
    }
  };

  const handleAvatarUpload = () => {
    if (!newAvatar) {
      Alert.alert('Erreur', 'Veuillez d\'abord choisir une photo.');
      return;
    }
    setProfileData({
      ...profileData,
      avatarUploadStatus: 'pending',
      avatar: newAvatar, // Set the new avatar immediately for display
    });
    setShowAvatarModal(false);
    
    // Notification de succès pour l'enseignant
    Alert.alert(
      '✅ Photo soumise avec succès',
      'Votre nouvelle photo de profil a été soumise pour approbation par la direction.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Simuler l'envoi de notification à la direction
            Alert.alert(
              '📱 Notification envoyée',
              'Notification push envoyée à la direction : "Nouvelle photo de profil soumise par Pierre Martin pour approbation."'
            );
          }
        }
      ]
    );
  };

  const renderAvatarStatus = () => {
    if (profileData.avatarUploadStatus === 'none') return null;
    
    const statusConfig = {
      pending: { text: 'En attente d\'approbation', color: '#F59E0B' },
      approved: { text: 'Photo approuvée', color: '#10B981' },
      rejected: { text: 'Photo rejetée', color: '#EF4444' },
    };

    const { text, color } = statusConfig[profileData.avatarUploadStatus];

    return (
      <View style={[styles.avatarStatus, { backgroundColor: color + '20' }]}>
        <Text style={[styles.avatarStatusText, { color }]}>{text}</Text>
        {profileData.avatarUploadStatus === 'pending' && (
          <TouchableOpacity
            style={styles.simulateButton}
            onPress={() => simulateDirectionResponse()}
          >
            <Text style={styles.simulateButtonText}>Simuler réponse direction</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const simulateDirectionResponse = () => {
    Alert.alert(
      'Simuler réponse de la direction',
      'Choisissez la réponse de la direction :',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Approuver',
          style: 'default',
          onPress: () => {
            setProfileData({
              ...profileData,
              avatarUploadStatus: 'approved',
            });
            Alert.alert(
              '✅ Photo approuvée !',
              'Notification push reçue : "Votre photo de profil a été approuvée par la direction !"'
            );
          }
        },
        {
          text: 'Rejeter',
          style: 'destructive',
          onPress: () => {
            setProfileData({
              ...profileData,
              avatarUploadStatus: 'rejected',
            });
            Alert.alert(
              '❌ Photo rejetée',
              'Notification push reçue : "Votre photo de profil a été rejetée par la direction. Veuillez en soumettre une nouvelle."'
            );
          }
        }
      ]
    );
  };

  const renderProfileHeader = () => (
    <LinearGradient
      colors={['#059669', '#10B981', '#34D399']}
      style={[styles.profileHeader, { paddingTop: Platform.OS === 'ios' ? 30 : 20, paddingBottom: 10 }]}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={18} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: 16 }]}>Mon Profil</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
          <Edit color="#FFFFFF" size={16} />
        </TouchableOpacity>
      </View>

      <View style={styles.avatarSection}>
        <TouchableOpacity style={styles.avatarContainer} onPress={() => setShowAvatarModal(true)}>
          {profileData.avatar ? (
            <Image source={{ uri: profileData.avatar }} style={[styles.avatar, { width: 120, height: 120, borderRadius: 60 }]} />
          ) : (
            <View style={[styles.avatarPlaceholder, { width: 120, height: 120, borderRadius: 60 }]}>
              <User color="#FFFFFF" size={60} />
            </View>
          )}
          <View style={[styles.cameraIcon, { width: 32, height: 32, borderRadius: 16 }]}>
            <Camera color="#FFFFFF" size={18} />
          </View>
        </TouchableOpacity>
        {renderAvatarStatus()}
        <Text style={[styles.profileName, { fontSize: 22 }]}>{profileData.name}</Text>
      </View>
    </LinearGradient>
  );

  const renderProfileInfo = () => (
    <View style={styles.profileInfo}>
      <View style={styles.infoSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations personnelles</Text>
        
        <View style={styles.infoItem}>
          <View style={[styles.infoIcon, { backgroundColor: colors.primary + '20' }]}>
            <User color={colors.primary} size={16} />
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
            <Mail color={colors.primary} size={16} />
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
            <Phone color={colors.primary} size={16} />
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
            <MapPin color={colors.primary} size={16} />
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

        <View style={styles.infoItem}>
          <View style={[styles.infoIcon, { backgroundColor: colors.primary + '20' }]}>
            <Bell color={colors.primary} size={16} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.text + '60' }]}>Notifications</Text>
            {isEditing ? (
              <TouchableOpacity
                onPress={() =>
                  setEditableData({
                    ...editableData,
                    notificationsEnabled: !editableData.notificationsEnabled,
                  })
                }
              >
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {editableData.notificationsEnabled ? 'Activées' : 'Désactivées'}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {profileData.notificationsEnabled ? 'Activées' : 'Désactivées'}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations professionnelles</Text>
        
        <View style={styles.infoItem}>
          <View style={[styles.infoIcon, { backgroundColor: colors.primary + '20' }]}>
            <GraduationCap color={colors.primary} size={16} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.text + '60' }]}>Spécialisations</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {profileData.specializations.join(', ')}
            </Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={[styles.infoIcon, { backgroundColor: colors.primary + '20' }]}>
            <Award color={colors.primary} size={16} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.text + '60' }]}>Expérience</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{profileData.experience}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={[styles.infoIcon, { backgroundColor: colors.primary + '20' }]}>
            <DollarSign color={colors.primary} size={16} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.text + '60' }]}>Salaire</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{profileData.salary}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={[styles.infoIcon, { backgroundColor: colors.primary + '20' }]}>
            <Calendar color={colors.primary} size={16} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: colors.text + '60' }]}>Date d&apos;entrée</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{profileData.joinDate}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistiques</Text>
        
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Clock color={colors.primary} size={18} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{profileData.totalSessions}</Text>
            <Text style={[styles.statLabel, { color: colors.text + '60' }]}>Séances</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Users color={colors.primary} size={18} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{profileData.totalStudents}</Text>
            <Text style={[styles.statLabel, { color: colors.text + '60' }]}>Élèves</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Star color={colors.primary} size={18} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{profileData.rating}</Text>
            <Text style={[styles.statLabel, { color: colors.text + '60' }]}>Note</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={[styles.actionButtons, { paddingHorizontal: 10, paddingBottom: 20 }]}>
      {isEditing ? (
        <View style={[styles.editButtons, { flexDirection: width < 360 ? 'column' : 'row' }]}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 12 }]}
            onPress={handleSaveProfile}
          >
            <Save color="#FFFFFF" size={16} />
            <Text style={[styles.actionButtonText, { fontSize: 13 }]}>Enregistrer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.border, paddingVertical: 10, paddingHorizontal: 12 }]}
            onPress={handleCancelEdit}
          >
            <X color={colors.text} size={16} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Annuler</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.normalButtons, { flexDirection: width < 360 ? 'column' : 'row' }]}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 12 }]}
            onPress={() => setShowPasswordModal(true)}
          >
            <Shield color="#FFFFFF" size={16} />
            <Text style={[styles.actionButtonText, { fontSize: 13 }]}>Mot de passe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#DC2626', paddingVertical: 10, paddingHorizontal: 12 }]}
            onPress={handleLogout}
          >
            <LogOut color="#FFFFFF" size={16} />
            <Text style={[styles.actionButtonText, { fontSize: 13 }]}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderPasswordModal = () => (
    <Modal
      visible={showPasswordModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowPasswordModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent,
          { backgroundColor: colors.card,
            width: Math.min(width * 0.9, 400),
            marginHorizontal: 'auto',
            marginTop: height * 0.15,
            maxHeight: height * 0.7,
          }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Changer le mot de passe</Text>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <X size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Mot de passe actuel</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <Shield size={16} color={colors.text + '60'} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="Mot de passe actuel"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} color={colors.text + '60'} /> : <Eye size={16} color={colors.text + '60'} />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Nouveau mot de passe</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <Shield size={16} color={colors.text + '60'} />
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
                <Shield size={16} color={colors.text + '60'} />
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

  const renderAvatarModal = () => (
    <Modal
      visible={showAvatarModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowAvatarModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent,
          { backgroundColor: colors.card,
            width: Math.min(width * 0.9, 400),
            marginHorizontal: 'auto',
            marginTop: height * 0.15,
            maxHeight: height * 0.7,
          }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Changer la photo de profil</Text>
            <TouchableOpacity onPress={() => setShowAvatarModal(false)}>
              <X size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={[styles.modalText, { color: colors.text + '80' }]}>
              Votre nouvelle photo de profil doit être approuvée par la direction avant d&apos;être affichée.
            </Text>
            
            {newAvatar && (
              <Image
                source={{ uri: newAvatar }}
                style={[styles.avatar, { marginVertical: 12, width: 100, height: 100, borderRadius: 50, alignSelf: 'center' }]} // Ajustement de la taille de l'image dans la modale
              />
            )}

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={pickImage}
            >
              <Upload size={16} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Choisir une nouvelle photo</Text>
            </TouchableOpacity>

            {newAvatar && ( // Afficher le bouton Soumettre seulement si une nouvelle photo a été choisie
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: 10 }]} // Ajout de marge supérieure pour séparer les boutons
                onPress={handleAvatarUpload}
              >
                <Text style={styles.primaryButtonText}>Soumettre pour approbation</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={() => {
                setShowAvatarModal(false);
                setNewAvatar(undefined); // Réinitialiser la photo choisie lors de la fermeture
              }}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Annuler</Text>
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
      {renderAvatarModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    paddingHorizontal: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editButton: {
    padding: 4,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 6,
  },
  avatarStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  profileName: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  profileInfo: {
    flex: 1,
  },
  infoSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  infoIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  textInput: {
    fontSize: 13,
    fontWeight: '500',
    padding: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  actionButtons: {
    padding: 10,
  },
  editButtons: {
    gap: 8,
  },
  normalButtons: {
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 12,
  },
  modalText: {
    fontSize: 13,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
  },
  primaryButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  simulateButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    alignSelf: 'center',
  },
  simulateButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});