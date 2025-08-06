import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, Pressable, Modal, Animated, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Bell, 
  X, 
  CheckCircle, 
  Settings, 
  User as UserIcon, 
  Share2, 
  LogOut,
  AlertTriangle,
  Clock,
  Star,
  MessageSquare,
  Phone,
  CreditCard,
  Calendar
} from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotificationService, NotificationData, NotificationPriority, useNotifications } from '../services/NotificationService';

interface NotificationBellProps {
  userRole: 'enseignant' | 'parent' | 'direction';
  userId?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ 
  userRole, 
  userId = 'demo_user_123' 
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Utiliser le nouveau hook de notifications
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userRole, userId);

  // Filtrer les notifications selon le filtre sélectionné
  const filteredNotifications = useMemo(() => {
    switch (selectedFilter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'urgent':
        return notifications.filter(n => n.priority === 'urgent' || n.priority === 'high');
      default:
        return notifications;
    }
  }, [notifications, selectedFilter]);

  // Animation du badge
  useEffect(() => {
    if (unreadCount > 0) {
      fadeAnim.setValue(1);
      
      // Animation de pulsation pour les notifications urgentes
      const hasUrgent = notifications.some(n => !n.isRead && (n.priority === 'urgent' || n.priority === 'high'));
      if (hasUrgent) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        ).start();
      } else {
        pulseAnim.setValue(1);
      }
    } else {
      fadeAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [unreadCount, notifications, fadeAnim, pulseAnim]);

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " ans";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " mois";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " jours";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " heures";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes";
    return Math.floor(seconds) + " secondes";
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent': return '#EF4444'; // Rouge
      case 'high': return '#F59E0B';   // Orange
      case 'normal': return '#3B82F6'; // Bleu
      case 'low': return '#6B7280';    // Gris
    }
  };

  const getPriorityIcon = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent': return AlertTriangle;
      case 'high': return Star;
      case 'normal': return Bell;
      case 'low': return Clock;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'communication': return MessageSquare;
      case 'finance': return CreditCard;
      case 'planning': return Calendar;
      case 'urgent': return AlertTriangle;
      case 'session': return Clock;
      case 'evaluation': return Star;
      default: return Bell;
    }
  };

  const handleNotificationPress = async (notification: NotificationData) => {
    await markAsRead(notification.id);
    setPanelOpen(false);
    
    // Gérer les boutons d'action si présents
    if (notification.actionButtons && notification.actionButtons.length > 0) {
      Alert.alert(
        notification.title,
        notification.description,
        [
          ...notification.actionButtons.map(button => ({
            text: button.label,
            style: button.style,
            onPress: () => handleActionButton(notification, button.action)
          })),
          {
            text: 'Voir détails',
            onPress: () => router.push(notification.targetPage)
          }
        ]
      );
    } else {
      router.push(notification.targetPage);
    }
  };

  const handleActionButton = async (notification: NotificationData, action: string) => {
    switch (action) {
      case 'pay_now':
        router.push('/parent/billing');
        break;
      case 'view_details':
        router.push(notification.targetPage);
        break;
      case 'reschedule':
        Alert.alert('Reprogrammation', 'Fonctionnalité de reprogrammation à implémenter');
        break;
      case 'accept_replacement':
        Alert.alert('Remplacement accepté', 'Vous avez accepté le remplacement. La direction sera notifiée.');
        break;
      case 'decline_replacement':
        Alert.alert('Remplacement refusé', 'Vous avez refusé le remplacement.');
        break;
      case 'dismiss':
        // Ne rien faire, juste fermer
        break;
      default:
        console.log(`Action non gérée: ${action}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const getFilterCount = (filter: 'all' | 'unread' | 'urgent') => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead).length;
      case 'urgent':
        return notifications.filter(n => n.priority === 'urgent' || n.priority === 'high').length;
      default:
        return notifications.length;
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setPanelOpen(true)} style={styles.bellButton}>
        <Bell size={24} color={colors.text} />
        {unreadCount > 0 && (
          <Animated.View style={[
            styles.badgeContainer,
            { backgroundColor: '#EF4444' }, // Rouge pour les notifications non lues
            { 
              opacity: fadeAnim,
              transform: [{ scale: pulseAnim }]
            }
          ]}>
            <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </Animated.View>
        )}
      </Pressable>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isPanelOpen}
        onRequestClose={() => setPanelOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPanelOpen(false)}>
          <View style={[
            styles.panelContainer, 
            { backgroundColor: colors.card, borderColor: colors.border, paddingTop: insets.top }
          ]}>
            <View style={styles.panelHeader}>
              <Text style={[styles.panelTitle, { color: colors.text }]}>
                Notifications {userRole === 'direction' ? '(Direction)' : userRole === 'enseignant' ? '(Enseignant)' : '(Parent)'}
              </Text>
              <Pressable onPress={() => setPanelOpen(false)} style={styles.closeButton}>
                <X size={24} color={colors.text} />
              </Pressable>
            </View>

            {/* Filtres */}
            <View style={styles.filtersContainer}>
              {[
                { key: 'all', label: 'Toutes', count: getFilterCount('all') },
                { key: 'unread', label: 'Non lues', count: getFilterCount('unread') },
                { key: 'urgent', label: 'Urgentes', count: getFilterCount('urgent') }
              ].map((filter) => (
                <Pressable
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter.key && { backgroundColor: colors.primary },
                    { borderColor: colors.border }
                  ]}
                  onPress={() => setSelectedFilter(filter.key as any)}
                >
                  <Text style={[
                    styles.filterText,
                    { color: selectedFilter === filter.key ? colors.background : colors.text }
                  ]}>
                    {filter.label} ({filter.count})
                  </Text>
                </Pressable>
              ))}
            </View>

            {filteredNotifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Bell size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  {selectedFilter === 'unread' ? 'Aucune notification non lue' :
                   selectedFilter === 'urgent' ? 'Aucune notification urgente' :
                   'Aucune notification pour le moment'}
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.notificationsList}>
                {unreadCount > 0 && (
                  <Pressable onPress={handleMarkAllAsRead} style={styles.markAllReadButton}>
                    <CheckCircle size={16} color={colors.primary} />
                    <Text style={[styles.markAllReadText, { color: colors.primary }]}>
                      Tout marquer comme lu ({unreadCount})
                    </Text>
                  </Pressable>
                )}
                
                {filteredNotifications.map((notif) => {
                  const PriorityIcon = getPriorityIcon(notif.priority);
                  const CategoryIcon = getCategoryIcon(notif.category || '');
                  
                  return (
                    <Pressable
                      key={notif.id}
                      style={[
                        styles.notificationItem,
                        {
                          backgroundColor: notif.isRead ? colors.card : colors.notificationBackground,
                          borderColor: notif.isRead ? colors.border : getPriorityColor(notif.priority),
                          borderLeftWidth: notif.isRead ? 1 : 4
                        }
                      ]}
                      onPress={() => handleNotificationPress(notif)}
                    >
                      <View style={styles.notificationIconContainer}>
                        <CategoryIcon 
                          size={20} 
                          color={getPriorityColor(notif.priority)} 
                        />
                        {!notif.isRead && (
                          <View style={[
                            styles.priorityIndicator,
                            { backgroundColor: getPriorityColor(notif.priority) }
                          ]} />
                        )}
                      </View>

                      <View style={styles.notificationContent}>
                        <View style={styles.notificationHeader}>
                          <Text style={[
                            styles.notificationTitle,
                            { color: notif.isRead ? colors.textSecondary : colors.text }
                          ]}>
                            {notif.title}
                          </Text>
                          <View style={styles.notificationMeta}>
                            <PriorityIcon 
                              size={12} 
                              color={getPriorityColor(notif.priority)} 
                            />
                            <Text style={[
                              styles.priorityText,
                              { color: getPriorityColor(notif.priority) }
                            ]}>
                              {notif.priority.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                        
                        <Text style={[
                          styles.notificationDescription,
                          { color: notif.isRead ? colors.textSecondary : colors.text }
                        ]}>
                          {notif.description}
                        </Text>
                        
                        <View style={styles.notificationFooter}>
                          <Text style={[styles.notificationTimestamp, { color: colors.textSecondary }]}>
                            Il y a {getTimeAgo(notif.timestamp)}
                          </Text>
                          {notif.category && (
                            <View style={[
                              styles.categoryBadge,
                              { backgroundColor: `${getPriorityColor(notif.priority)}20` }
                            ]}>
                              <Text style={[
                                styles.categoryText,
                                { color: getPriorityColor(notif.priority) }
                              ]}>
                                {notif.category}
                              </Text>
                            </View>
                          )}
                        </View>

                        {notif.actionButtons && notif.actionButtons.length > 0 && (
                          <View style={styles.actionButtonsContainer}>
                            {notif.actionButtons.slice(0, 2).map((button, index) => (
                              <Pressable
                                key={index}
                                style={[
                                  styles.actionButton,
                                  {
                                    backgroundColor: button.style === 'destructive' ? '#FEF2F2' :
                                                     button.style === 'cancel' ? colors.card :
                                                     colors.primary + '20'
                                  }
                                ]}
                                onPress={() => handleActionButton(notif, button.action)}
                              >
                                <Text style={[
                                  styles.actionButtonText,
                                  {
                                    color: button.style === 'destructive' ? '#EF4444' :
                                           button.style === 'cancel' ? colors.textSecondary :
                                           colors.primary
                                  }
                                ]}>
                                  {button.label}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  bellButton: {
    padding: 8,
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  panelContainer: {
    width: 350,
    height: '100%',
    borderLeftWidth: 1,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notificationsList: {
    flex: 1,
    padding: 16,
  },
  markAllReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  markAllReadText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  notificationIconContainer: {
    position: 'relative',
    marginRight: 12,
    paddingTop: 2,
  },
  priorityIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  notificationDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTimestamp: {
    fontSize: 11,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
}); 