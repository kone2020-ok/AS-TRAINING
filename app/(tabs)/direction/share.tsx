import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  Switch,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Share2,
  FileText,
  Users,
  Mail,
  Link,
  Download,
  Upload,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Smartphone,
  Monitor,
  X,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Info,
  BarChart3,
  PieChart,
  TrendingUp,
  UserCheck,
  CreditCard,
  BookOpen,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ShareItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  type: 'report' | 'data' | 'user' | 'system';
  lastShared?: string;
  recipients?: string[];
  isPublic?: boolean;
}

export default function DirectionShareScreen() {
  const { colors } = useTheme();
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShareItem | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [isPublicLink, setIsPublicLink] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [linkPassword, setLinkPassword] = useState('');

  const shareItems: ShareItem[] = [
    {
      id: 'reports',
      title: 'Rapports de performance',
      description: 'Rapports mensuels et trimestriels',
      icon: BarChart3,
      type: 'report',
      lastShared: 'Hier à 14:30',
      recipients: ['marie.dubois@astra.com', 'jean.martin@astra.com'],
    },
    {
      id: 'financial',
      title: 'Données financières',
      description: 'Rapports de facturation et paiements',
      icon: CreditCard,
      type: 'data',
      lastShared: 'Aujourd\'hui à 10:15',
      recipients: ['comptabilite@astra.com'],
    },
    {
      id: 'users',
      title: 'Liste des utilisateurs',
      description: 'Données des enseignants et parents',
      icon: Users,
      type: 'user',
      lastShared: 'Lundi à 16:45',
      recipients: ['rh@astra.com'],
    },
    {
      id: 'analytics',
      title: 'Analytics système',
      description: 'Statistiques d\'utilisation',
      icon: TrendingUp,
      type: 'system',
      lastShared: 'Aujourd\'hui à 09:00',
      recipients: ['tech@astra.com'],
    },
    {
      id: 'contracts',
      title: 'Contrats actifs',
      description: 'État des contrats en cours',
      icon: BookOpen,
      type: 'data',
      lastShared: 'Vendredi à 11:20',
      recipients: ['direction@astra.com'],
    },
  ];

  const handleShareItem = (item: ShareItem) => {
    setSelectedItem(item);
    setShowShareModal(true);
  };

  const handleShare = () => {
    if (!shareEmail) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email');
      return;
    }

    if (!shareEmail.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    Alert.alert(
      'Partage réussi',
      `${selectedItem?.title} a été partagé avec ${shareEmail}`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowShareModal(false);
            setShareEmail('');
            setShareMessage('');
            setSelectedItem(null);
          },
        },
      ]
    );
  };

  const handleGenerateLink = () => {
    const link = `https://astra-training.com/share/${selectedItem?.id}/${Date.now()}`;
    Alert.alert(
      'Lien généré',
      `Lien de partage : ${link}`,
      [
        { text: 'Copier', onPress: () => console.log('Lien copié') },
        { text: 'Fermer' },
      ]
    );
  };

  const handleExportData = (item: ShareItem) => {
    Alert.alert(
      'Export des données',
      `Voulez-vous exporter ${item.title} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Exporter',
          onPress: () => {
            Alert.alert('Succès', `${item.title} exporté avec succès !`);
          },
        },
      ]
    );
  };

  const renderShareItem = (item: ShareItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.shareItem, { backgroundColor: colors.card }]}
      onPress={() => handleShareItem(item)}
    >
      <View style={styles.shareItemHeader}>
        <View style={[styles.shareIcon, { backgroundColor: colors.primary + '20' }]}>
          <item.icon size={24} color={colors.primary} />
        </View>
        <View style={styles.shareItemContent}>
          <Text style={[styles.shareItemTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.shareItemDescription, { color: colors.text + '80' }]}>
            {item.description}
          </Text>
          {item.lastShared && (
            <Text style={[styles.shareItemDate, { color: colors.text + '60' }]}>
              Dernier partage : {item.lastShared}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => handleShareItem(item)}
        >
          <Share2 size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {item.recipients && item.recipients.length > 0 && (
        <View style={styles.recipientsContainer}>
          <Text style={[styles.recipientsTitle, { color: colors.text + '60' }]}>
            Destinataires récents :
          </Text>
          <View style={styles.recipientsList}>
            {item.recipients.slice(0, 3).map((recipient, index) => (
              <View key={index} style={styles.recipientItem}>
                <Mail size={12} color={colors.text + '60'} />
                <Text style={[styles.recipientText, { color: colors.text + '80' }]}>
                  {recipient}
                </Text>
              </View>
            ))}
            {item.recipients.length > 3 && (
              <Text style={[styles.recipientText, { color: colors.text + '60' }]}>
                +{item.recipients.length - 3} autres
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.shareActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
          onPress={() => handleExportData(item)}
        >
          <Download size={16} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>Exporter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
          onPress={() => handleGenerateLink()}
        >
          <Link size={16} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>Lien</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderShareModal = () => (
    <Modal
      visible={showShareModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowShareModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Partager {selectedItem?.title}
            </Text>
            <TouchableOpacity onPress={() => setShowShareModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Adresse email</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <Mail size={20} color={colors.text + '60'} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="email@exemple.com"
                  value={shareEmail}
                  onChangeText={setShareEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Message (optionnel)</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="Ajouter un message..."
                  value={shareMessage}
                  onChangeText={setShareMessage}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.switchContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Lien public</Text>
                <Switch
                  value={isPublicLink}
                  onValueChange={setIsPublicLink}
                  trackColor={{ false: colors.border, true: colors.primary + '40' }}
                  thumbColor={isPublicLink ? colors.primary : colors.text + '40'}
                />
              </View>
              {isPublicLink && (
                <View style={styles.inputContainer}>
                  <Lock size={20} color={colors.text + '60'} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Mot de passe pour le lien (optionnel)"
                    value={linkPassword}
                    onChangeText={setLinkPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} color={colors.text + '60'} /> : <Eye size={20} color={colors.text + '60'} />}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.shareOptions}>
              <TouchableOpacity
                style={[styles.shareOption, { backgroundColor: colors.primary }]}
                onPress={handleShare}
              >
                <Mail size={20} color="#FFFFFF" />
                <Text style={styles.shareOptionText}>Partager par email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shareOption, { backgroundColor: colors.primary }]}
                onPress={handleGenerateLink}
              >
                <Link size={20} color="#FFFFFF" />
                <Text style={styles.shareOptionText}>Générer un lien</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#1E40AF', '#3B82F6', '#60A5FA']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Partager</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Éléments partageables
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.text + '80' }]}>
            Sélectionnez un élément pour le partager avec d'autres utilisateurs
          </Text>
        </View>

        <View style={styles.shareItems}>
          {shareItems.map(renderShareItem)}
        </View>

        <View style={styles.infoSection}>
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <Info size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Les éléments partagés sont accessibles selon les permissions des destinataires.
            </Text>
          </View>
        </View>
      </ScrollView>

      {renderShareModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  shareItems: {
    gap: 16,
  },
  shareItem: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  shareIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shareItemContent: {
    flex: 1,
  },
  shareItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  shareItemDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  shareItemDate: {
    fontSize: 12,
  },
  shareButton: {
    padding: 8,
  },
  recipientsContainer: {
    marginBottom: 12,
  },
  recipientsTitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  recipientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipientText: {
    fontSize: 12,
  },
  shareActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoSection: {
    marginTop: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
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
  textInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shareOptions: {
    gap: 12,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  shareOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 