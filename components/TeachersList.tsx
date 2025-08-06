import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Modal,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { MoreVertical, Eye, Edit, Trash2, Phone, User } from 'lucide-react-native';

interface Teacher {
  id: string;
  nom: string;
  prenoms: string;
  profession: string;
  ville: string;
  matieres: string;
  telephone: string;
  email: string;
  formation: string;
  experience: string;
  codeId: string;
  statut: 'actif' | 'inactif';
  dateCreation: string;
  cv?: string;
  photo?: string;
}

interface TeachersListProps {
  teachers: Teacher[];
  loading: boolean;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacherId: string) => void;
  onViewProfile: (teacher: Teacher) => void;
}

interface ActionMenuProps {
  visible: boolean;
  onClose: () => void;
  teacher: Teacher;
  onEdit: () => void;
  onDelete: () => void;
  onViewProfile: () => void;
  onCall: () => void;
}

function ActionMenu({ visible, onClose, teacher, onEdit, onDelete, onViewProfile, onCall }: ActionMenuProps) {
  const handleCall = () => {
    onClose();
    // Délai pour permettre au modal de se fermer avant d'exécuter l'action
    setTimeout(() => {
      onCall();
    }, 100);
  };

  const handleDelete = () => {
    onClose();
    // Délai pour permettre au modal de se fermer avant d'exécuter l'action
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
        
        <TouchableOpacity style={[styles.actionItem, styles.deleteAction]} onPress={handleDelete}>
          <Trash2 color="#EF4444" size={20} />
          <Text style={[styles.actionText, styles.deleteText]}>Supprimer</Text>
        </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function TeacherSkeleton() {
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

export default function TeachersList({ teachers, loading, onEdit, onDelete, onViewProfile }: TeachersListProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleMenuToggle = (teacherId: string) => {
    setActiveMenu(teacherId);
  };

  const handleCall = (teacher: Teacher) => {
    console.log('handleCall appelé pour:', teacher.prenoms, teacher.nom);
    Alert.alert(
      'Appeler l\'enseignant',
      `Voulez-vous appeler ${teacher.prenoms} ${teacher.nom} au ${teacher.telephone} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Appeler', 
          onPress: async () => {
            try {
              const phoneUrl = `tel:${teacher.telephone}`;
              console.log('Tentative d\'appel vers:', phoneUrl);
              
              if (Platform.OS === 'web') {
                // Pour le web
                window.open(phoneUrl, '_self');
              } else {
                // Pour React Native (iOS/Android)
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

  const handleDelete = (teacher: Teacher) => {
    console.log('handleDelete appelé pour:', teacher.prenoms, teacher.nom);
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer l'enseignant ${teacher.prenoms} ${teacher.nom} ?\n\nCette action supprimera définitivement :\n• Toutes les informations personnelles\n• Les documents associés (CV, photo)\n• L'historique des cours\n\nCette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            try {
              onDelete(teacher.id);
              Alert.alert('Succès', `L'enseignant ${teacher.prenoms} ${teacher.nom} a été supprimé avec succès.`);
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'enseignant');
            }
          }
        }
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
          <TeacherSkeleton key={index} />
        ))}
      </ScrollView>
    );
  }

  if (teachers.length === 0) {
    return (
      <View style={styles.emptyState}>
        <User color="#9CA3AF" size={64} />
        <Text style={styles.emptyTitle}>Aucun enseignant</Text>
        <Text style={styles.emptySubtitle}>
          Commencez par créer le profil d'un enseignant
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {teachers.map((teacher) => (
          <View key={teacher.id} style={styles.teacherCard}>
            <View style={styles.teacherHeader}>
              <View style={styles.teacherInfo}>
                <View style={styles.teacherAvatar}>
                  {teacher.photo ? (
                    <Image source={{ uri: teacher.photo }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{getInitials(teacher.nom, teacher.prenoms)}</Text>
                  )}
                </View>
                <View style={styles.teacherDetails}>
                  <Text style={styles.teacherName}>
                    {teacher.prenoms} {teacher.nom}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(teacher.statut) }]}>
                    <Text style={styles.statusText}>
                      {teacher.statut.charAt(0).toUpperCase() + teacher.statut.slice(1)}
                    </Text>
                  </View>
                </View>
                </View>
                
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => handleMenuToggle(teacher.id)}
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
          teacher={teachers.find(t => t.id === activeMenu)!}
          onEdit={() => onEdit(teachers.find(t => t.id === activeMenu)!)}
          onDelete={() => handleDelete(teachers.find(t => t.id === activeMenu)!)}
          onViewProfile={() => onViewProfile(teachers.find(t => t.id === activeMenu)!)}
          onCall={() => handleCall(teachers.find(t => t.id === activeMenu)!)}
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
  teacherCard: {
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
  teacherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teacherInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  teacherAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  teacherDetails: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 12,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
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
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});