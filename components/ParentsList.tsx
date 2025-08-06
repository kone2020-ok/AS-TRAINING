import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { MoreVertical, Eye, Edit, Trash2, Phone, User, QrCode, MessageCircle, MapPin } from 'lucide-react-native';
import { useNotificationTriggers } from '../services/NotificationTriggers';

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

interface ParentsListProps {
  parents: Parent[];
  loading: boolean;
  onEdit: (parent: Parent) => void;
  onDelete: (parentId: string) => void;
  onViewProfile: (parent: Parent) => void;
}

interface ActionMenuProps {
  visible: boolean;
  onClose: () => void;
  parent: Parent;
  onEdit: () => void;
  onDelete: () => void;
  onViewProfile: () => void;
  onCall: () => void;
  onGenerateQR: () => void;
}

function ActionMenu({ visible, onClose, parent, onEdit, onDelete, onViewProfile, onCall, onGenerateQR }: ActionMenuProps) {
  const handleCall = () => {
    onClose();
    setTimeout(() => {
      onCall();
    }, 100);
  };

  const handleDelete = () => {
    onClose();
    setTimeout(() => {
      onDelete();
    }, 100);
  };

  const handleEdit = () => {
    onClose();
    setTimeout(() => {
      onEdit();
    }, 100);
  };

  const handleViewProfile = () => {
    onClose();
    setTimeout(() => {
      onViewProfile();
    }, 100);
  };

  const handleGenerateQR = () => {
    onClose();
    setTimeout(() => {
      onGenerateQR();
    }, 100);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayBackground} onPress={onClose} />
        <View style={styles.actionMenu}>
          <TouchableOpacity style={styles.actionItem} onPress={handleViewProfile}>
            <Eye color="#3B82F6" size={20} />
            <Text style={styles.actionText}>Voir le profil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleEdit}>
            <Edit color="#059669" size={20} />
            <Text style={styles.actionText}>Modifier</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleCall}>
            <Phone color="#F59E0B" size={20} />
            <Text style={styles.actionText}>Appeler</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleGenerateQR}>
            <QrCode color="#8B5CF6" size={20} />
            <Text style={styles.actionText}>Code QR</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionItem, styles.deleteAction]} onPress={handleDelete}>
            <Trash2 color="#EF4444" size={20} />
            <Text style={[styles.actionText, styles.deleteText]}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function ParentSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonInfo}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
        </View>
        <View style={styles.skeletonButton} />
      </View>
    </View>
  );
}

export default function ParentsList({ parents, loading, onEdit, onDelete, onViewProfile }: ParentsListProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const triggers = useNotificationTriggers();

  const handleMenuToggle = (parentId: string) => {
    setActiveMenu(parentId);
  };

  const handleCall = (parent: Parent) => {
    console.log('handleCall appelé pour:', parent.prenoms, parent.nom);
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
              console.log('Tentative d\'appel vers:', phoneUrl);
              
              // Déclencher une notification de message pour traçabilité
              await triggers.onMessageSent({
                userId: 'direction_admin',
                userRole: 'direction',
                targetUserId: parent.id,
                targetUserRole: 'parent',
                metadata: {
                  senderName: 'Direction AS-TRAINING',
                  studentName: parent.enfants[0] || 'Enfant',
                  messagePreview: `Appel téléphonique initié par la direction`,
                  messageId: `call_${Date.now()}`,
                  isUrgent: false
                }
              });
              
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

  const handleDelete = (parent: Parent) => {
    console.log('handleDelete appelé pour:', parent.prenoms, parent.nom);
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer le parent ${parent.prenoms} ${parent.nom} ?\n\nCette action supprimera définitivement :\n• Toutes les informations personnelles\n• Les données des enfants associés\n• L'historique des cours et paiements\n• Le code QR généré\n\nCette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Déclencher la notification de suppression
              await triggers.onParentDeleted({
                userId: parent.id,
                userRole: 'direction',
                metadata: {
                  prenoms: parent.prenoms,
                  nom: parent.nom,
                  contractsCount: parent.enfants.length, // Approximation
                  reason: 'Suppression manuelle par la direction'
                }
              });

              onDelete(parent.id);
              Alert.alert('Succès', `Le parent ${parent.prenoms} ${parent.nom} a été supprimé avec succès.`);
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le parent');
            }
          }
        }
      ]
    );
  };

  const handleGenerateQR = (parent: Parent) => {
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

  const getStatusColor = (status: string) => {
    return status === 'actif' ? '#10B981' : '#6B7280';
  };

  const getInitials = (nom: string, prenoms: string) => {
    return `${prenoms.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {[1, 2, 3, 4, 5].map((index) => (
          <ParentSkeleton key={index} />
        ))}
      </ScrollView>
    );
  }

  if (parents.length === 0) {
    return (
      <View style={styles.emptyState}>
        <User color="#9CA3AF" size={64} />
        <Text style={styles.emptyTitle}>Aucun parent</Text>
        <Text style={styles.emptySubtitle}>
          Commencez par créer le profil d'une famille
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {parents.map((parent) => (
          <View key={parent.id} style={styles.parentCard}>
            <View style={styles.parentHeader}>
              <View style={styles.parentInfo}>
                <View style={styles.parentAvatar}>
                  {parent.photo ? (
                    <Image source={{ uri: parent.photo }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{getInitials(parent.nom, parent.prenoms)}</Text>
                  )}
                </View>
                <View style={styles.parentDetails}>
                  <Text style={styles.parentName}>
                    {parent.prenoms} {parent.nom}
                  </Text>
                  <View style={styles.parentMeta}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(parent.statut) }]}>
                      <Text style={styles.statusText}>
                        {parent.statut.charAt(0).toUpperCase() + parent.statut.slice(1)}
                      </Text>
                    </View>
                    <View style={styles.childrenBadge}>
                      <Text style={styles.childrenText}>
                        {parent.enfants.length} enfant{parent.enfants.length > 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.locationRow}>
                    <MapPin color="#6B7280" size={14} />
                    <Text style={styles.locationText}>{parent.ville}</Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => handleMenuToggle(parent.id)}
              >
                <MoreVertical color="#6B7280" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {activeMenu && (
        <ActionMenu
          visible={true}
          onClose={() => setActiveMenu(null)}
          parent={parents.find(p => p.id === activeMenu)!}
          onEdit={() => onEdit(parents.find(p => p.id === activeMenu)!)}
          onDelete={() => handleDelete(parents.find(p => p.id === activeMenu)!)}
          onViewProfile={() => onViewProfile(parents.find(p => p.id === activeMenu)!)}
          onCall={() => handleCall(parents.find(p => p.id === activeMenu)!)}
          onGenerateQR={() => handleGenerateQR(parents.find(p => p.id === activeMenu)!)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 400,
  },
  parentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  parentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parentInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  parentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EA580C',
  },
  parentDetails: {
    flex: 1,
  },
  parentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  parentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  childrenBadge: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  childrenText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  actionMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 12,
    fontWeight: '500',
  },
  deleteAction: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  deleteText: {
    color: '#EF4444',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    marginRight: 16,
  },
  skeletonInfo: {
    flex: 1,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonLineShort: {
    width: '60%',
  },
  skeletonButton: {
    width: 24,
    height: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
}); 