import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Trash2, 
  Copy, 
  MessageCircle, 
  QrCode,
  Users,
  Calendar,
  CreditCard,
  Printer,
  FileImage,
  Download
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import PrintableParentProfile from '../../../components/PrintableParentProfile';
import { safeCopyToClipboard } from '../../../utils/PlatformUtils';

interface Parent {
  id: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  codeId: string;
  qrCode: string;
  statut: 'actif' | 'inactif';
  dateCreation: string;
  enfants: string[];
  photo?: string;
}

export default function ParentDetail() {
  const { parentId } = useLocalSearchParams<{ parentId: string }>();
  const { colors } = useTheme();
  
  const [parent, setParent] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfilePreview, setShowProfilePreview] = useState(false);

  // Données de démonstration
  const demoParents: Parent[] = [
    {
      id: 'parent_1',
      nom: 'Diabaté',
      prenoms: 'Mamadou',
      email: 'diabate.mamadou@gmail.com',
      telephone: '+225 07 12 34 56 78',
      adresse: 'Rue des Jardins, Yopougon',
      ville: 'Yopougon',
      codeId: 'PAR-JAN-20240001',
      qrCode: 'QR_PAR_JAN_20240001',
      statut: 'actif',
      dateCreation: '2024-01-15T10:00:00Z',
      enfants: ['Kouadio Aya', 'N\'Dri Kevin'],
    },
    {
      id: 'parent_2',
      nom: 'Koné',
      prenoms: 'Fatou',
      email: 'kone.fatou@gmail.com',
      telephone: '+225 05 98 76 54 32',
      adresse: 'Avenue de la Paix, Adjamé',
      ville: 'Adjamé',
      codeId: 'PAR-JAN-20240002',
      qrCode: 'QR_PAR_JAN_20240002',
      statut: 'actif',
      dateCreation: '2024-01-20T14:30:00Z',
      enfants: ['Traoré Aminata'],
    },
  ];

  useEffect(() => {
    const loadParent = async () => {
      if (!parentId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Simulation d'appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        const foundParent = demoParents.find(p => p.id === parentId);
        setParent(foundParent || null);
      } catch (error) {
        console.error('Erreur lors du chargement du parent:', error);
      } finally {
        setLoading(false);
      }
    };

    loadParent();
  }, [parentId]);

  const handleGoBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push({
      pathname: '/direction/parents',
      params: { editParentId: parentId }
    });
  };

  const handleDelete = () => {
    if (!parent) return;

    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer le parent ${parent.prenoms} ${parent.nom} ?\n\nCette action supprimera définitivement :\n• Toutes les informations personnelles\n• Les données des enfants associés (${parent.enfants.join(', ')})\n• L'historique des cours et paiements\n• Le code QR généré (${parent.codeId})\n\nCette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Succès', `Le parent ${parent.prenoms} ${parent.nom} a été supprimé avec succès.`);
            router.back();
          }
        }
      ]
    );
  };

  const handleCall = async () => {
    if (!parent) return;

    Alert.alert(
      'Appeler le parent',
      `Voulez-vous appeler ${parent.prenoms} ${parent.nom} au ${parent.telephone} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Appeler', 
          onPress: async () => {
            try {
              const phoneUrl = `tel:${parent.telephone}`;
              
              if (Platform.OS === 'web') {
                window.open(phoneUrl, '_self');
              } else {
                const supported = await Linking.canOpenURL(phoneUrl);
                if (supported) {
                  await Linking.openURL(phoneUrl);
                } else {
                  Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application de téléphone sur cet appareil');
                }
              }
            } catch (error) {
              console.error('Erreur lors de l\'appel:', error);
              Alert.alert('Erreur', 'Impossible d\'initier l\'appel');
            }
          }
        }
      ]
    );
  };

  const handleSendMessage = () => {
    if (!parent) return;

    Alert.alert(
      'Envoyer un message',
      `Choisissez le moyen de communication avec ${parent.prenoms} ${parent.nom}`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'SMS', 
          onPress: async () => {
            try {
              const smsUrl = `sms:${parent.telephone}`;
              
              if (Platform.OS === 'web') {
                window.open(smsUrl, '_self');
              } else {
                const supported = await Linking.canOpenURL(smsUrl);
                if (supported) {
                  await Linking.openURL(smsUrl);
                } else {
                  Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application de SMS');
                }
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application de SMS');
            }
          }
        },
        { 
          text: 'WhatsApp', 
          onPress: async () => {
            try {
              const whatsappUrl = `whatsapp://send?phone=${parent.telephone.replace(/\s+/g, '')}`;
              
              if (Platform.OS === 'web') {
                window.open(`https://wa.me/${parent.telephone.replace(/\s+/g, '')}`, '_blank');
              } else {
                const supported = await Linking.canOpenURL(whatsappUrl);
                if (supported) {
                  await Linking.openURL(whatsappUrl);
                } else {
                  Alert.alert('Erreur', 'WhatsApp n\'est pas installé sur cet appareil');
                }
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'ouvrir WhatsApp');
            }
          }
        }
      ]
    );
  };

  const handleGenerateQR = () => {
    if (!parent) return;

    Alert.alert(
      'Code QR',
      `Code QR pour ${parent.prenoms} ${parent.nom}\nCode ID: ${parent.codeId}\n\nQue souhaitez-vous faire ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Voir le QR Code', onPress: () => Alert.alert('QR Code', 'Affichage du QR Code...') },
        { text: 'Imprimer', onPress: () => Alert.alert('Impression', 'Impression du QR Code en cours...') }
      ]
    );
  };

  const handleCopyInfo = async () => {
    if (!parent) return;

    const parentInfo = `Informations Parent - AS-TRAINING
Nom: ${parent.prenoms} ${parent.nom}
Code ID: ${parent.codeId}
Téléphone: ${parent.telephone}
Email: ${parent.email}
Adresse: ${parent.adresse}, ${parent.ville}
Enfants: ${parent.enfants.join(', ')}
Statut: ${parent.statut}
Date de création: ${new Date(parent.dateCreation).toLocaleDateString('fr-FR')}`;

    try {
      if (Platform.OS === 'web') {
        await safeCopyToClipboard(parentInfo);
        Alert.alert('Copié', 'Les informations du parent ont été copiées dans le presse-papiers');
      } else {
        await safeCopyToClipboard(parentInfo);
        Alert.alert('Copié', 'Les informations du parent ont été copiées dans le presse-papiers');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de copier les informations');
    }
  };

  const handlePrintProfile = () => {
    setShowProfilePreview(true);
  };

  const handleExportProfile = () => {
    Alert.alert(
      'Confirmer l\'export',
      `Exporter le profil de ${parent?.prenoms} ${parent?.nom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Exporter', 
          onPress: () => {
            // Simulation de l'export
            if (Platform.OS === 'web') {
              // Web: Créer un lien de téléchargement temporaire
              const link = document.createElement('a');
              link.download = `profil_${parent?.prenoms}_${parent?.nom}.pdf`;
              link.href = '#'; // URL du fichier généré
              link.click();
              Alert.alert('Succès', 'Le profil a été exporté avec succès');
            } else {
              // Mobile: Simulation d'export
              Alert.alert('Succès', 'Le profil a été exporté avec succès dans vos téléchargements');
            }
          }
        }
      ]
    );
  };

  const getInitials = (nom: string, prenoms: string) => {
    return `${prenoms.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <ArrowLeft color="#FFFFFF" size={20} />
            </TouchableOpacity>
            <Text style={[styles.pageTitle, { color: colors.onPrimary }]}>Détail du Parent</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  if (!parent) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <ArrowLeft color="#FFFFFF" size={20} />
            </TouchableOpacity>
            <Text style={[styles.pageTitle, { color: colors.onPrimary }]}>Parent non trouvé</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        
        <View style={styles.errorContainer}>
          <User color="#9CA3AF" size={64} />
          <Text style={styles.errorTitle}>Parent introuvable</Text>
          <Text style={styles.errorSubtitle}>
            Le parent demandé n'existe pas ou a été supprimé.
          </Text>
          <TouchableOpacity style={styles.backToListButton} onPress={handleGoBack}>
            <Text style={styles.backToListText}>Retour à la liste</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ArrowLeft color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: colors.onPrimary }]}>Profil Parent</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {parent.photo ? (
                <Image source={{ uri: parent.photo }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileInitials}>
                    {getInitials(parent.nom, parent.prenoms)}
                  </Text>
                </View>
              )}
              <View style={[styles.statusIndicator, { backgroundColor: parent.statut === 'actif' ? '#10B981' : '#6B7280' }]} />
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {parent.prenoms} {parent.nom}
              </Text>
              <Text style={styles.profileCode}>ID: {parent.codeId}</Text>
              <View style={styles.profileMeta}>
                <View style={[styles.statusBadge, { backgroundColor: parent.statut === 'actif' ? '#10B981' : '#6B7280' }]}>
                  <Text style={styles.statusText}>
                    {parent.statut.charAt(0).toUpperCase() + parent.statut.slice(1)}
                  </Text>
                </View>
                <View style={styles.childrenCount}>
                  <Users color="#3B82F6" size={16} />
                  <Text style={styles.childrenCountText}>
                    {parent.enfants.length} enfant{parent.enfants.length > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <Phone color="#059669" size={20} />
              <Text style={styles.actionButtonText}>Appeler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleSendMessage}>
              <MessageCircle color="#3B82F6" size={20} />
              <Text style={styles.actionButtonText}>Message</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
              <Edit color="#F59E0B" size={20} />
              <Text style={styles.actionButtonText}>Modifier</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleGenerateQR}>
              <QrCode color="#8B5CF6" size={20} />
              <Text style={styles.actionButtonText}>QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.printButton]} onPress={handlePrintProfile}>
              <Printer color="#1E40AF" size={20} />
              <Text style={styles.actionButtonText}>Imprimer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.exportButton]} onPress={handleExportProfile}>
              <FileImage color="#DC2626" size={20} />
              <Text style={styles.actionButtonText}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informations de contact</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Phone color="#6B7280" size={20} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={styles.infoValue}>{parent.telephone}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Mail color="#6B7280" size={20} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{parent.email}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <MapPin color="#6B7280" size={20} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Adresse</Text>
                <Text style={styles.infoValue}>{parent.adresse}</Text>
                <Text style={styles.infoValue}>{parent.ville}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Children Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Enfants inscrits</Text>
          
          <View style={styles.infoCard}>
            {parent.enfants.map((enfant, index) => (
              <View key={index} style={styles.childRow}>
                <View style={styles.childAvatar}>
                  <User color="#3B82F6" size={20} />
                </View>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{enfant}</Text>
                  <Text style={styles.childMeta}>Enfant #{index + 1}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* System Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informations système</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Calendar color="#6B7280" size={20} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date de création</Text>
                <Text style={styles.infoValue}>{formatDate(parent.dateCreation)}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <QrCode color="#6B7280" size={20} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Code QR</Text>
                <Text style={styles.infoValue}>{parent.qrCode}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Zone de danger</Text>
          
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyInfo}>
            <Copy color="#6B7280" size={20} />
            <Text style={styles.copyButtonText}>Copier toutes les informations</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Trash2 color="#FFFFFF" size={20} />
            <Text style={styles.deleteButtonText}>Supprimer ce parent</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Profile Preview Modal */}
      {showProfilePreview && (
        <Modal visible={true} transparent={false} animationType="slide">
          <View style={styles.cvModalContainer}>
            <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.cvModalHeader}>
              <Text style={styles.cvModalTitle}>Aperçu du Profil</Text>
              <View style={styles.cvModalActions}>
                <TouchableOpacity 
                  style={styles.cvModalButton} 
                  onPress={() => {
                    if (Platform.OS === 'web') {
                      window.print();
                    } else {
                      Alert.alert('Impression', 'Envoi vers l\'imprimante...');
                    }
                  }}
                >
                  <Printer color="#FFFFFF" size={20} />
                  <Text style={styles.cvModalButtonText}>Imprimer</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cvModalCloseButton} 
                  onPress={() => setShowProfilePreview(false)}
                >
                  <Text style={styles.cvModalCloseText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
            
            <ScrollView style={styles.cvModalContent}>
              <PrintableParentProfile parent={parent} />
            </ScrollView>
          </View>
        </Modal>
      )}
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
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#EA580C',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileCode: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  childrenCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  childrenCountText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  quickActions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 120,
  },
  printButton: {
    backgroundColor: '#EBF8FF',
    borderColor: '#3B82F6',
  },
  exportButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  childMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  dangerSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 16,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  copyButtonText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 12,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  backToListButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backToListText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cvModalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  cvModalHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cvModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  cvModalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cvModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  cvModalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  cvModalCloseButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cvModalCloseText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cvModalContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
}); 