import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Database,
  Eye,
  EyeOff,
  Lock,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Volume2,
  Vibrate,
  Smartphone,
  Monitor,
  Globe,
  Download,
  Upload,
  Trash2,
  Save,
  X,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info,
  BookOpen,
  GraduationCap,
  DollarSign,
  Users,
  FileText,
  Moon,
  Sun,
  Monitor as MonitorIcon,
  Type,
  Contrast,
  Eye as EyeIcon,
  Zap,
  Smartphone as SmartphoneIcon,
  Monitor as DesktopIcon,
  RefreshCw,
  RotateCcw,
  Share2,
  Copy,
  Baby,
  Heart,
  CreditCard,
  BookOpen as BookOpenIcon,
} from 'lucide-react-native';
import { useThemeSettings } from '../../../contexts/ThemeContext';
import ColorPicker from '../../../components/ColorPicker';

const { width, height } = Dimensions.get('window');

interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  type: 'toggle' | 'button' | 'modal' | 'input' | 'color' | 'select';
  value?: boolean | string;
  options?: string[];
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  onValueChange?: (value: string) => void;
}

export default function ParentSettingsScreen() {
  const { colors } = useTheme();
  const { settings, updateSettings, resetToDefaults, exportSettings, importSettings } = useThemeSettings();
  
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showAccessibilityModal, setShowAccessibilityModal] = useState(false);
  const [showDisplayModal, setShowDisplayModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleNotificationSettings = () => {
    setShowNotificationsModal(true);
  };

  const handleSecuritySettings = () => {
    setShowSecurityModal(true);
  };

  const handleDataSettings = () => {
    setShowDataModal(true);
  };

  const handleThemeSettings = () => {
    setShowThemeModal(true);
  };

  const handleAccessibilitySettings = () => {
    setShowAccessibilityModal(true);
  };

  const handleDisplaySettings = () => {
    setShowDisplayModal(true);
  };

  const handleFamilySettings = () => {
    setShowFamilyModal(true);
  };

  const handleExportData = () => {
    Alert.alert(
      'Export des données',
      'Voulez-vous exporter vos données personnelles ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Exporter',
          onPress: async () => {
            try {
              const settingsJson = await exportSettings();
              Alert.alert(
                'Export réussi',
                'Vos paramètres ont été exportés avec succès.',
                [
                  {
                    text: 'Copier',
                    onPress: () => {
                      Alert.alert('Copié', 'Les paramètres ont été copiés dans le presse-papiers.');
                    }
                  },
                  { text: 'OK' }
                ]
              );
            } catch (error) {
              Alert.alert('Erreur', 'Erreur lors de l\'export des données.');
            }
          },
        },
      ]
    );
  };

  const handleImportData = () => {
    Alert.alert(
      'Import des données',
      'Voulez-vous importer des paramètres personnalisés ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Importer',
          onPress: () => {
            Alert.alert('Import', 'Fonctionnalité d\'import à implémenter.');
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Effacer les données',
      'Êtes-vous sûr de vouloir effacer toutes vos données personnalisées ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: () => {
            resetToDefaults();
            Alert.alert('Succès', 'Toutes les données ont été effacées.');
          },
        },
      ]
    );
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
    setShowSecurityModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const settingsData: SettingItem[] = [
    {
      id: 'theme',
      title: 'Thème et apparence',
      description: 'Personnalisez les couleurs et le thème de l\'application',
      icon: Palette,
      type: 'button',
      onPress: handleThemeSettings,
    },
    {
      id: 'accessibility',
      title: 'Accessibilité',
      description: 'Paramètres d\'accessibilité et de contraste',
      icon: EyeIcon,
      type: 'button',
      onPress: handleAccessibilitySettings,
    },
    {
      id: 'display',
      title: 'Affichage',
      description: 'Taille de police, animations et mode compact',
      icon: MonitorIcon,
      type: 'button',
      onPress: handleDisplaySettings,
    },
    {
      id: 'family',
      title: 'Paramètres familiaux',
      description: 'Gestion des enfants et préférences familiales',
      icon: Baby,
      type: 'button',
      onPress: handleFamilySettings,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Gérer les notifications et alertes',
      icon: Bell,
      type: 'button',
      onPress: handleNotificationSettings,
    },
    {
      id: 'security',
      title: 'Sécurité',
      description: 'Mot de passe et paramètres de sécurité',
      icon: Shield,
      type: 'button',
      onPress: handleSecuritySettings,
    },
    {
      id: 'data',
      title: 'Données',
      description: 'Export, import et gestion des données',
      icon: Database,
      type: 'button',
      onPress: handleDataSettings,
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={item.onPress}
    >
      <View style={styles.settingHeader}>
        <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
          <item.icon color={colors.primary} size={20} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.settingDescription, { color: colors.text + '60' }]}>
            {item.description}
          </Text>
        </View>
        <ArrowRight color={colors.text + '40'} size={20} />
      </View>
    </TouchableOpacity>
  );

  const renderThemeModal = () => (
    <Modal
      visible={showThemeModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowThemeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Thème et apparence</Text>
            <TouchableOpacity onPress={() => setShowThemeModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Thème général */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Thème général</Text>
              <View style={styles.themeOptions}>
                <TouchableOpacity
                  style={[
                    styles.themeOption,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    settings.theme === 'light' && { borderColor: colors.primary }
                  ]}
                  onPress={() => updateSettings({ theme: 'light' })}
                >
                  <Sun color={settings.theme === 'light' ? colors.primary : colors.text} size={24} />
                  <Text style={[styles.themeOptionText, { color: colors.text }]}>Clair</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.themeOption,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    settings.theme === 'dark' && { borderColor: colors.primary }
                  ]}
                  onPress={() => updateSettings({ theme: 'dark' })}
                >
                  <Moon color={settings.theme === 'dark' ? colors.primary : colors.text} size={24} />
                  <Text style={[styles.themeOptionText, { color: colors.text }]}>Sombre</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.themeOption,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    settings.theme === 'auto' && { borderColor: colors.primary }
                  ]}
                  onPress={() => updateSettings({ theme: 'auto' })}
                >
                  <MonitorIcon color={settings.theme === 'auto' ? colors.primary : colors.text} size={24} />
                  <Text style={[styles.themeOptionText, { color: colors.text }]}>Auto</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Couleurs principales */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Couleurs principales</Text>
              
              <View style={styles.colorSection}>
                <Text style={[styles.colorLabel, { color: colors.text }]}>Couleur primaire</Text>
                <ColorPicker
                  value={settings.primaryColor}
                  onColorChange={(color) => updateSettings({ primaryColor: color })}
                  title="Couleur primaire"
                />
              </View>
              
              <View style={styles.colorSection}>
                <Text style={[styles.colorLabel, { color: colors.text }]}>Couleur secondaire</Text>
                <ColorPicker
                  value={settings.secondaryColor}
                  onColorChange={(color) => updateSettings({ secondaryColor: color })}
                  title="Couleur secondaire"
                />
              </View>
              
              <View style={styles.colorSection}>
                <Text style={[styles.colorLabel, { color: colors.text }]}>Couleur d'accent</Text>
                <ColorPicker
                  value={settings.accentColor}
                  onColorChange={(color) => updateSettings({ accentColor: color })}
                  title="Couleur d'accent"
                />
              </View>
            </View>

            {/* Couleurs par page */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Couleurs par page</Text>
              
              <View style={styles.colorSection}>
                <Text style={[styles.colorLabel, { color: colors.text }]}>Tableau de bord</Text>
                <ColorPicker
                  value={settings.pageColors.dashboard}
                  onColorChange={(color) => updateSettings({ 
                    pageColors: { ...settings.pageColors, dashboard: color } 
                  })}
                  title="Tableau de bord"
                />
              </View>
              
              <View style={styles.colorSection}>
                <Text style={[styles.colorLabel, { color: colors.text }]}>Mes enfants</Text>
                <ColorPicker
                  value={settings.pageColors.sessions}
                  onColorChange={(color) => updateSettings({ 
                    pageColors: { ...settings.pageColors, sessions: color } 
                  })}
                  title="Mes enfants"
                />
              </View>
              
              <View style={styles.colorSection}>
                <Text style={[styles.colorLabel, { color: colors.text }]}>Facturation</Text>
                <ColorPicker
                  value={settings.pageColors.contracts}
                  onColorChange={(color) => updateSettings({ 
                    pageColors: { ...settings.pageColors, contracts: color } 
                  })}
                  title="Facturation"
                />
              </View>
              
              <View style={styles.colorSection}>
                <Text style={[styles.colorLabel, { color: colors.text }]}>Rapports</Text>
                <ColorPicker
                  value={settings.pageColors.salary}
                  onColorChange={(color) => updateSettings({ 
                    pageColors: { ...settings.pageColors, salary: color } 
                  })}
                  title="Rapports"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderFamilyModal = () => (
    <Modal
      visible={showFamilyModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFamilyModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Paramètres familiaux</Text>
            <TouchableOpacity onPress={() => setShowFamilyModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Gestion des enfants</Text>
              
              <View style={styles.toggleSection}>
                <View style={styles.toggleItem}>
                  <View style={styles.toggleInfo}>
                    <Text style={[styles.toggleTitle, { color: colors.text }]}>Notifications enfants</Text>
                    <Text style={[styles.toggleDescription, { color: colors.text + '60' }]}>
                      Recevoir des notifications pour chaque enfant
                    </Text>
                  </View>
                  <Switch
                    value={true}
                    onValueChange={() => {}}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={true ? '#FFFFFF' : colors.text}
                  />
                </View>

                <View style={styles.toggleItem}>
                  <View style={styles.toggleInfo}>
                    <Text style={[styles.toggleTitle, { color: colors.text }]}>Suivi des progrès</Text>
                    <Text style={[styles.toggleDescription, { color: colors.text + '60' }]}>
                      Afficher les progrès de chaque enfant
                    </Text>
                  </View>
                  <Switch
                    value={true}
                    onValueChange={() => {}}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={true ? '#FFFFFF' : colors.text}
                  />
                </View>

                <View style={styles.toggleItem}>
                  <View style={styles.toggleInfo}>
                    <Text style={[styles.toggleTitle, { color: colors.text }]}>Mode famille</Text>
                    <Text style={[styles.toggleDescription, { color: colors.text + '60' }]}>
                      Interface optimisée pour les familles
                    </Text>
                  </View>
                  <Switch
                    value={true}
                    onValueChange={() => {}}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={true ? '#FFFFFF' : colors.text}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Rendu des autres modals (similaires à ceux de l'enseignant)
  const renderAccessibilityModal = () => (
    <Modal
      visible={showAccessibilityModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAccessibilityModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Accessibilité</Text>
            <TouchableOpacity onPress={() => setShowAccessibilityModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Paramètres d'accessibilité</Text>
              <Text style={[styles.sectionDescription, { color: colors.text + '60' }]}>
                Les mêmes options d'accessibilité que pour les enseignants sont disponibles.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderDisplayModal = () => (
    <Modal
      visible={showDisplayModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowDisplayModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Affichage</Text>
            <TouchableOpacity onPress={() => setShowDisplayModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Options d'affichage</Text>
              <Text style={[styles.sectionDescription, { color: colors.text + '60' }]}>
                Les mêmes options d'affichage que pour les enseignants sont disponibles.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderNotificationsModal = () => (
    <Modal
      visible={showNotificationsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowNotificationsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Notifications</Text>
            <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Paramètres de notifications</Text>
              <Text style={[styles.sectionDescription, { color: colors.text + '60' }]}>
                Les mêmes options de notifications que pour les enseignants sont disponibles.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderSecurityModal = () => (
    <Modal
      visible={showSecurityModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSecurityModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Sécurité</Text>
            <TouchableOpacity onPress={() => setShowSecurityModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Changer le mot de passe</Text>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Mot de passe actuel</Text>
                <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                  <Lock size={20} color={colors.text + '60'} />
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
                  <Lock size={20} color={colors.text + '60'} />
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
                  <Lock size={20} color={colors.text + '60'} />
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
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderDataModal = () => (
    <Modal
      visible={showDataModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowDataModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Gestion des données</Text>
            <TouchableOpacity onPress={() => setShowDataModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Paramètres personnalisés</Text>
              
              <View style={styles.dataActions}>
                <TouchableOpacity
                  style={[styles.dataAction, { backgroundColor: colors.primary }]}
                  onPress={handleExportData}
                >
                  <Download size={20} color="#FFFFFF" />
                  <Text style={styles.dataActionText}>Exporter les paramètres</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dataAction, { backgroundColor: colors.primary }]}
                  onPress={handleImportData}
                >
                  <Upload size={20} color="#FFFFFF" />
                  <Text style={styles.dataActionText}>Importer les paramètres</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dataAction, { backgroundColor: '#EF4444' }]}
                  onPress={handleClearData}
                >
                  <Trash2 size={20} color="#FFFFFF" />
                  <Text style={styles.dataActionText}>Réinitialiser les paramètres</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[settings.primaryColor, settings.secondaryColor, settings.accentColor]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paramètres Parent</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerAction} onPress={resetToDefaults}>
              <RotateCcw color="#FFFFFF" size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerAction} onPress={handleExportData}>
              <Share2 color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.settingsContainer}>
          {settingsData.map(renderSettingItem)}
        </View>
      </ScrollView>

      {renderThemeModal()}
      {renderAccessibilityModal()}
      {renderDisplayModal()}
      {renderFamilyModal()}
      {renderNotificationsModal()}
      {renderSecurityModal()}
      {renderDataModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerAction: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  settingsContainer: {
    gap: 12,
  },
  settingItem: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Math.min(width * 0.95, 500),
    maxHeight: height * 0.8,
    borderRadius: 16,
    overflow: 'hidden',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  colorSection: {
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  toggleSection: {
    gap: 16,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
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
  primaryButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dataActions: {
    gap: 12,
  },
  dataAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  dataActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 