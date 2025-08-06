import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  RefreshControl,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  CheckCircle,
  XCircle,
  User,
  ArrowLeft,
  Clock,
  AlertCircle,
  Users,
  Camera,
  Star,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface PhotoRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  currentAvatar?: string;
  newAvatarUri: string;
  status: 'pending' | 'approved' | 'rejected';
  submissionDate: string;
  submissionTime: string;
  teacherRating: number;
  teacherSessions: number;
}

export default function PhotoApprovalsScreen() {
  const { colors } = useTheme();
  const [pendingRequests, setPendingRequests] = useState<PhotoRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PhotoRequest | null>(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = () => {
    // Données fictives pour la démonstration
    const demoRequests: PhotoRequest[] = [
      {
        id: 'REQ-001',
        teacherId: 'ENS-001',
        teacherName: 'Pierre Martin',
        teacherEmail: 'pierre.martin@astra-training.com',
        currentAvatar: undefined,
        newAvatarUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        status: 'pending',
        submissionDate: '20/07/2024',
        submissionTime: '14:30',
        teacherRating: 4.8,
        teacherSessions: 156,
      },
      {
        id: 'REQ-002',
        teacherId: 'ENS-002',
        teacherName: 'Sophie Dupont',
        teacherEmail: 'sophie.dupont@astra-training.com',
        currentAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        newAvatarUri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        status: 'pending',
        submissionDate: '19/07/2024',
        submissionTime: '09:15',
        teacherRating: 4.9,
        teacherSessions: 203,
      },
      {
        id: 'REQ-003',
        teacherId: 'ENS-003',
        teacherName: 'Jean-Luc Dubois',
        teacherEmail: 'jeanluc.dubois@astra-training.com',
        currentAvatar: undefined,
        newAvatarUri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        status: 'pending',
        submissionDate: '18/07/2024',
        submissionTime: '16:45',
        teacherRating: 4.7,
        teacherSessions: 89,
      },
    ];
    setPendingRequests(demoRequests);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingRequests();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleApprove = (request: PhotoRequest) => {
    Alert.alert(
      '✅ Approuver la photo',
      `Êtes-vous sûr d'approuver la nouvelle photo de ${request.teacherName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Approuver',
          style: 'default',
          onPress: () => {
            // Simuler la mise à jour du statut côté backend
            setPendingRequests((prev) =>
              prev.filter((req) => req.id !== request.id)
            );
            
            // Notification de succès pour la direction
            Alert.alert(
              '✅ Photo approuvée',
              `La photo de ${request.teacherName} a été approuvée avec succès !`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // Simuler l'envoi de notification push à l'enseignant
                    Alert.alert(
                      '📱 Notification envoyée',
                      `Notification push envoyée à ${request.teacherName} : "Votre photo de profil a été approuvée par la direction !"`
                    );
                  }
                }
              ]
            );

            // Ici, vous enverriez la nouvelle URI de l'avatar au profil de l'enseignant dans la base de données
            // et mettre à jour le statut dans la base de données.
            // Par exemple: updateTeacherAvatar(request.teacherId, request.newAvatarUri, 'approved');
          },
        },
      ]
    );
  };

  const handleReject = (request: PhotoRequest) => {
    Alert.alert(
      '❌ Rejeter la photo',
      `Êtes-vous sûr de rejeter la photo de ${request.teacherName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Rejeter',
          style: 'destructive',
          onPress: () => {
            // Simuler la mise à jour du statut côté backend
            setPendingRequests((prev) =>
              prev.filter((req) => req.id !== request.id)
            );
            
            // Notification de succès pour la direction
            Alert.alert(
              '❌ Photo rejetée',
              `La photo de ${request.teacherName} a été rejetée.`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // Simuler l'envoi de notification push à l'enseignant
                    Alert.alert(
                      '📱 Notification envoyée',
                      `Notification push envoyée à ${request.teacherName} : "Votre photo de profil a été rejetée par la direction. Veuillez en soumettre une nouvelle."`
                    );
                  }
                }
              ]
            );

            // Ici, vous mettriez à jour le statut de la demande dans la base de données à 'rejected'.
            // Par exemple: updatePhotoRequestStatus(request.id, 'rejected');
          },
        },
      ]
    );
  };

  const renderRequestCard = (request: PhotoRequest) => (
    <View key={request.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <LinearGradient
        colors={['#FEF3C7', '#FDE68A', '#FCD34D']}
        style={styles.cardHeader}
      >
        <View style={styles.cardHeaderContent}>
          <View style={styles.teacherInfo}>
            <Text style={styles.cardTitle}>{request.teacherName}</Text>
            <Text style={styles.cardEmail}>{request.teacherEmail}</Text>
          </View>
          <View style={styles.teacherStats}>
            <View style={styles.statItem}>
              <Star color="#F59E0B" size={16} />
              <Text style={styles.statText}>{request.teacherRating}</Text>
            </View>
            <View style={styles.statItem}>
              <Users color="#F59E0B" size={16} />
              <Text style={styles.statText}>{request.teacherSessions}</Text>
            </View>
          </View>
        </View>
        <View style={styles.submissionInfo}>
          <Clock color="#F59E0B" size={14} />
          <Text style={styles.submissionText}>
            Soumise le {request.submissionDate} à {request.submissionTime}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.cardBody}>
        <View style={styles.avatarComparison}>
          <View style={styles.avatarSection}>
            <Text style={[styles.avatarLabel, { color: colors.text }]}>Photo actuelle</Text>
            {request.currentAvatar ? (
              <Image source={{ uri: request.currentAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
                <User color={colors.text + '60'} size={40} />
              </View>
            )}
          </View>
          
          <View style={styles.arrowContainer}>
            <Text style={[styles.arrowText, { color: colors.primary }]}>→</Text>
          </View>
          
          <View style={styles.avatarSection}>
            <Text style={[styles.avatarLabel, { color: colors.text }]}>Nouvelle photo</Text>
            <Image source={{ uri: request.newAvatarUri }} style={[styles.avatar, styles.newAvatar]} />
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NOUVELLE</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApprove(request)}
        >
          <CheckCircle size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Approuver</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReject(request)}
        >
          <XCircle size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Rejeter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={['#059669', '#10B981', '#34D399']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Approbation Photos</Text>
        <View style={styles.headerStats}>
          <AlertCircle color="#FFFFFF" size={20} />
          <Text style={styles.headerStatsText}>{pendingRequests.length}</Text>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {pendingRequests.length > 0 ? (
          <View style={styles.requestsContainer}>
            {pendingRequests.map(renderRequestCard)}
          </View>
        ) : (
          <View style={styles.noRequestsContainer}>
            <View style={[styles.noRequestsIcon, { backgroundColor: colors.card }]}>
              <Camera color={colors.text + '60'} size={60} />
            </View>
            <Text style={[styles.noRequestsTitle, { color: colors.text }]}>
              Aucune demande en attente
            </Text>
            <Text style={[styles.noRequestsText, { color: colors.text + '60' }]}>
              Toutes les photos de profil ont été traitées.
            </Text>
          </View>
        )}
      </ScrollView>
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
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerStatsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  requestsContainer: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    padding: 16,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teacherInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 2,
  },
  cardEmail: {
    fontSize: 12,
    color: '#92400E',
    opacity: 0.8,
  },
  teacherStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  submissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  submissionText: {
    fontSize: 12,
    color: '#92400E',
    opacity: 0.8,
  },
  cardBody: {
    padding: 16,
  },
  avatarComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarSection: {
    alignItems: 'center',
    flex: 1,
  },
  avatarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  newAvatar: {
    borderColor: '#10B981',
    borderWidth: 3,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  arrowContainer: {
    paddingHorizontal: 16,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  newBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingTop: 0,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noRequestsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: height * 0.4,
  },
  noRequestsIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  noRequestsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  noRequestsText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
}); 