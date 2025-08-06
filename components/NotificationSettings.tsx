import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { 
  Bell, 
  X, 
  Settings, 
  Mail, 
  MessageSquare, 
  Volume2, 
  Vibrate,
  Clock,
  AlertTriangle,
  Star,
  Users,
  CreditCard,
  Calendar,
  BookOpen
} from 'lucide-react-native';
import { 
  NotificationService, 
  NotificationRule, 
  NotificationType, 
  UserRole,
  DEFAULT_NOTIFICATION_RULES 
} from '../services/NotificationService';

interface NotificationSettingsProps {
  visible: boolean;
  onClose: () => void;
  userRole: UserRole;
  userId: string;
}

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  types: NotificationType[];
}

const NOTIFICATION_CATEGORIES: Record<UserRole, NotificationCategory[]> = {
  enseignant: [
    {
      id: 'contracts',
      name: 'Contrats',
      description: 'Nouveaux contrats, modifications, expirations',
      icon: BookOpen,
      types: ['contract_assigned']
    },
    {
      id: 'sessions',
      name: 'Séances',
      description: 'Validations, rejets, planification',
      icon: Clock,
      types: ['session_validated', 'session_rejected', 'schedule_updated']
    },
    {
      id: 'communication',
      name: 'Messages',
      description: 'Messages des parents et de la direction',
      icon: MessageSquare,
      types: ['parent_message']
    },
    {
      id: 'payments',
      name: 'Paiements',
      description: 'Notifications de rémunération',
      icon: CreditCard,
      types: ['payment_received_teacher']
    },
    {
      id: 'urgent',
      name: 'Urgences',
      description: 'Remplacements urgents, alertes',
      icon: AlertTriangle,
      types: ['urgent_replacement', 'student_absence_alert']
    }
  ],
  parent: [
    {
      id: 'academic',
      name: 'Académique',
      description: 'Bulletins, notes, rapports mensuels',
      icon: Star,
      types: ['monthly_report_ready', 'grade_published', 'bulletin_available']
    },
    {
      id: 'financial',
      name: 'Financier',
      description: 'Factures, paiements, rappels',
      icon: CreditCard,
      types: ['invoice_generated', 'payment_due', 'payment_reminder']
    },
    {
      id: 'scheduling',
      name: 'Planning',
      description: 'Séances, annulations, changements',
      icon: Calendar,
      types: ['session_cancelled', 'schedule_change', 'absence_notification']
    },
    {
      id: 'communication',
      name: 'Communication',
      description: 'Messages des enseignants',
      icon: MessageSquare,
      types: ['teacher_message']
    },
    {
      id: 'system',
      name: 'Système',
      description: 'QR Code, devoirs, notifications système',
      icon: Settings,
      types: ['qr_code_activated', 'homework_assigned']
    }
  ],
  direction: [
    {
      id: 'validation',
      name: 'Validations',
      description: 'Séances à valider, approbations',
      icon: Star,
      types: ['new_session_to_validate', 'new_user_registration', 'pending_reports']
    },
    {
      id: 'financial',
      name: 'Financier',
      description: 'Paiements, objectifs, alertes financières',
      icon: CreditCard,
      types: ['payment_received', 'financial_milestone', 'low_payment_rate']
    },
    {
      id: 'management',
      name: 'Gestion',
      description: 'Contrats, enseignants, planning',
      icon: Users,
      types: ['contract_expiring', 'teacher_absence']
    },
    {
      id: 'monitoring',
      name: 'Surveillance',
      description: 'Performance, réclamations, alertes',
      icon: AlertTriangle,
      types: ['student_performance_alert', 'parent_complaint', 'system_alert']
    }
  ]
};

export default function NotificationSettings({ visible, onClose, userRole, userId }: NotificationSettingsProps) {
  const { colors } = useTheme();
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    if (visible) {
      loadNotificationRules();
    }
  }, [visible, userRole]);

  const loadNotificationRules = async () => {
    setLoading(true);
    try {
      // Dans un vrai projet, charger depuis l'API
      // Pour la démo, utiliser les règles par défaut
      const userRules = DEFAULT_NOTIFICATION_RULES.filter(rule => 
        rule.roles.includes(userRole)
      );
      setRules(userRules);
    } catch (error) {
      console.error('Erreur lors du chargement des règles:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRule = async (type: NotificationType, field: keyof NotificationRule, value: any) => {
    const updatedRules = rules.map(rule => 
      rule.type === type ? { ...rule, [field]: value } : rule
    );
    setRules(updatedRules);

    try {
      await notificationService.updateNotificationRule(type, userRole, { [field]: value });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les paramètres');
    }
  };

  const toggleGlobalNotifications = async (enabled: boolean) => {
    const updatedRules = rules.map(rule => ({ ...rule, enabled }));
    setRules(updatedRules);

    try {
      for (const rule of rules) {
        await notificationService.updateNotificationRule(rule.type, userRole, { enabled });
      }
      Alert.alert(
        'Notifications ' + (enabled ? 'activées' : 'désactivées'),
        enabled 
          ? 'Vous recevrez maintenant toutes les notifications selon vos préférences'
          : 'Vous ne recevrez plus aucune notification'
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier les paramètres globaux');
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Réinitialiser les paramètres',
      'Voulez-vous restaurer les paramètres de notification par défaut ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          onPress: async () => {
            const defaultRules = DEFAULT_NOTIFICATION_RULES.filter(rule => 
              rule.roles.includes(userRole)
            );
            setRules(defaultRules);
            
            try {
              for (const rule of defaultRules) {
                await notificationService.updateNotificationRule(rule.type, userRole, rule);
              }
              Alert.alert('Succès', 'Paramètres réinitialisés aux valeurs par défaut');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de réinitialiser les paramètres');
            }
          }
        }
      ]
    );
  };

  const getRuleForType = (type: NotificationType): NotificationRule | undefined => {
    return rules.find(rule => rule.type === type);
  };

  const categories = NOTIFICATION_CATEGORIES[userRole] || [];
  const globalEnabled = rules.some(rule => rule.enabled);

  if (loading) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { backgroundColor: colors.primary }]}>
            <Text style={[styles.headerTitle, { color: colors.background }]}>
              Paramètres de notification
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color={colors.background} size={24} />
            </TouchableOpacity>
          </View>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Chargement des paramètres...
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={[styles.headerTitle, { color: colors.background }]}>
            Paramètres de notification
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color={colors.background} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Contrôle global */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Bell color={colors.primary} size={24} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Notifications générales
              </Text>
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Activer les notifications
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Recevoir toutes les notifications push
                </Text>
              </View>
              <Switch
                value={globalEnabled}
                onValueChange={toggleGlobalNotifications}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={globalEnabled ? colors.primary : colors.textSecondary}
              />
            </View>

            <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
              <Settings color={colors.textSecondary} size={16} />
              <Text style={[styles.resetButtonText, { color: colors.textSecondary }]}>
                Réinitialiser aux valeurs par défaut
              </Text>
            </TouchableOpacity>
          </View>

          {/* Catégories de notifications */}
          {categories.map((category) => (
            <View key={category.id} style={[styles.section, { backgroundColor: colors.card }]}>
              <View style={styles.sectionHeader}>
                <category.icon color={colors.primary} size={20} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {category.name}
                </Text>
              </View>
              
              <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                {category.description}
              </Text>

              {category.types.map((type) => {
                const rule = getRuleForType(type);
                if (!rule) return null;

                return (
                  <View key={type} style={styles.notificationTypeContainer}>
                    <View style={styles.typeHeader}>
                      <Text style={[styles.typeTitle, { color: colors.text }]}>
                        {getTypeDisplayName(type)}
                      </Text>
                      <Switch
                        value={rule.enabled}
                        onValueChange={(value) => updateRule(type, 'enabled', value)}
                        trackColor={{ false: colors.border, true: colors.primary + '40' }}
                        thumbColor={rule.enabled ? colors.primary : colors.textSecondary}
                      />
                    </View>

                    {rule.enabled && (
                      <View style={styles.typeOptions}>
                        <View style={styles.optionRow}>
                          <Volume2 color={colors.textSecondary} size={16} />
                          <Text style={[styles.optionLabel, { color: colors.text }]}>Son</Text>
                          <Switch
                            value={rule.sound}
                            onValueChange={(value) => updateRule(type, 'sound', value)}
                            trackColor={{ false: colors.border, true: colors.primary + '40' }}
                            thumbColor={rule.sound ? colors.primary : colors.textSecondary}
                          />
                        </View>

                        <View style={styles.optionRow}>
                          <Vibrate color={colors.textSecondary} size={16} />
                          <Text style={[styles.optionLabel, { color: colors.text }]}>Vibration</Text>
                          <Switch
                            value={rule.vibration}
                            onValueChange={(value) => updateRule(type, 'vibration', value)}
                            trackColor={{ false: colors.border, true: colors.primary + '40' }}
                            thumbColor={rule.vibration ? colors.primary : colors.textSecondary}
                          />
                        </View>

                        <View style={styles.optionRow}>
                          <Mail color={colors.textSecondary} size={16} />
                          <Text style={[styles.optionLabel, { color: colors.text }]}>Email</Text>
                          <Switch
                            value={rule.email}
                            onValueChange={(value) => updateRule(type, 'email', value)}
                            trackColor={{ false: colors.border, true: colors.primary + '40' }}
                            thumbColor={rule.email ? colors.primary : colors.textSecondary}
                          />
                        </View>

                        <View style={styles.optionRow}>
                          <MessageSquare color={colors.textSecondary} size={16} />
                          <Text style={[styles.optionLabel, { color: colors.text }]}>SMS</Text>
                          <Switch
                            value={rule.sms}
                            onValueChange={(value) => updateRule(type, 'sms', value)}
                            trackColor={{ false: colors.border, true: colors.primary + '40' }}
                            thumbColor={rule.sms ? colors.primary : colors.textSecondary}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function getTypeDisplayName(type: NotificationType): string {
  const displayNames: Record<NotificationType, string> = {
    // Enseignant
    contract_assigned: 'Nouveau contrat assigné',
    session_validated: 'Séance validée',
    session_rejected: 'Séance rejetée',
    parent_message: 'Message de parent',
    schedule_updated: 'Planning mis à jour',
    payment_received_teacher: 'Paiement reçu',
    evaluation_request: 'Demande d\'évaluation',
    urgent_replacement: 'Remplacement urgent',
    student_absence_alert: 'Absence d\'élève',
    lesson_material_updated: 'Matériel de cours',

    // Parent
    monthly_report_ready: 'Rapport mensuel',
    invoice_generated: 'Facture générée',
    payment_due: 'Paiement dû',
    payment_reminder: 'Rappel de paiement',
    session_cancelled: 'Séance annulée',
    qr_code_activated: 'QR Code activé',
    grade_published: 'Notes publiées',
    bulletin_available: 'Bulletin disponible',
    teacher_message: 'Message d\'enseignant',
    schedule_change: 'Changement d\'horaire',
    absence_notification: 'Notification d\'absence',
    homework_assigned: 'Devoirs assignés',

    // Direction
    new_session_to_validate: 'Séances à valider',
    payment_received: 'Paiement reçu',
    new_user_registration: 'Nouvel utilisateur',
    pending_reports: 'Rapports en attente',
    system_alert: 'Alerte système',
    contract_expiring: 'Contrats expirants',
    teacher_absence: 'Absence enseignant',
    low_payment_rate: 'Taux de paiement faible',
    student_performance_alert: 'Alerte performance',
    parent_complaint: 'Réclamation parent',
    financial_milestone: 'Objectif financier',
    equipment_maintenance_due: 'Maintenance équipement'
  };

  return displayNames[type] || type.replace(/_/g, ' ');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 32,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  resetButtonText: {
    fontSize: 14,
    marginLeft: 8,
  },
  notificationTypeContainer: {
    marginBottom: 16,
  },
  typeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  typeOptions: {
    marginTop: 8,
    paddingLeft: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  bottomSpacer: {
    height: 40,
  },
}); 