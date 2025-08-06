import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import React from 'react';

// Check if we're in Expo Go
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Configuration sécurisée pour les notifications
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// Types de notifications avancées
export type NotificationType = 
  // Notifications Enseignant
  | 'contract_assigned' | 'contract_updated' | 'contract_terminated' | 'session_validated' | 'session_rejected' | 'parent_message' 
  | 'schedule_updated' | 'payment_received_teacher' | 'evaluation_request'
  | 'urgent_replacement' | 'student_absence_alert' | 'lesson_material_updated'
  
  // Notifications Parent  
  | 'contract_signed' | 'contract_updated' | 'contract_terminated' | 'monthly_report_ready' | 'invoice_generated' | 'payment_due' | 'payment_reminder'
  | 'session_cancelled' | 'qr_code_activated' | 'grade_published' | 'bulletin_available'
  | 'teacher_message' | 'schedule_change' | 'absence_notification' | 'homework_assigned'
  
  // Notifications Direction
  | 'contract_created' | 'contract_updated' | 'contract_terminated' | 'new_session_to_validate' | 'payment_received' | 'new_user_registration'
  | 'pending_reports' | 'system_alert' | 'contract_expiring' | 'teacher_absence'
  | 'low_payment_rate' | 'student_performance_alert' | 'parent_complaint'
  | 'financial_milestone' | 'equipment_maintenance_due';

export type UserRole = 'enseignant' | 'parent' | 'direction';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationRule {
  type: NotificationType;
  roles: UserRole[];
  priority: NotificationPriority;
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  email: boolean;
  sms: boolean;
  inApp: boolean;
  conditions?: {
    timeWindow?: { start: number; end: number }; // Heures 0-23
    daysOfWeek?: number[]; // 0=dimanche, 1=lundi, etc.
    userStatus?: 'active' | 'inactive' | 'suspended';
    minimumAmount?: number; // Pour notifications financières
    delayBeforeReminder?: number; // En heures
  };
}

export interface NotificationData {
  id: string;
  type: NotificationType;
  role: UserRole;
  userId: string;
  title: string;
  description: string;
  data?: Record<string, any>;
  timestamp: Date;
  isRead: boolean;
  priority: NotificationPriority;
  targetPage: string;
  actionButtons?: {
    label: string;
    action: string;
    style: 'default' | 'destructive' | 'cancel';
  }[];
  expiresAt?: Date;
  category?: string;
}

export interface NotificationTemplate {
  type: NotificationType;
  titleTemplate: string;
  descriptionTemplate: string;
  targetPageTemplate: string;
  category: string;
}

// Templates de notifications
export const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  // Enseignant
  contract_assigned: {
    type: 'contract_assigned',
    titleTemplate: 'Nouveau contrat {contractCode}',
    descriptionTemplate: 'Un contrat pour {studentName} vous a été assigné. Matières: {subjects}',
    targetPageTemplate: '/enseignant/contracts',
    category: 'contrat'
  },
  contract_updated: {
    type: 'contract_updated',
    titleTemplate: 'Contrat mis à jour {contractCode}',
    descriptionTemplate: 'Le contrat de {studentName} a été modifié. Changements: {changes}',
    targetPageTemplate: '/enseignant/contracts',
    category: 'contrat'
  },
  contract_terminated: {
    type: 'contract_terminated',
    titleTemplate: 'Contrat terminé {contractCode}',
    descriptionTemplate: 'Le contrat de {studentName} a été terminé. Raison: {reason}',
    targetPageTemplate: '/enseignant/contracts',
    category: 'contrat'
  },
  session_validated: {
    type: 'session_validated',
    titleTemplate: 'Séance validée ✅',
    descriptionTemplate: 'Votre séance de {subject} du {date} a été validée.',
    targetPageTemplate: '/enseignant/sessions-history',
    category: 'session'
  },
  session_rejected: {
    type: 'session_rejected',
    titleTemplate: 'Séance rejetée ❌',
    descriptionTemplate: 'Votre séance de {subject} du {date} a été rejetée. Raison: {reason}',
    targetPageTemplate: '/enseignant/sessions-history',
    category: 'session'
  },
  parent_message: {
    type: 'parent_message',
    titleTemplate: 'Message de {parentName}',
    descriptionTemplate: 'Nouveau message concernant {studentName}: "{preview}"',
    targetPageTemplate: '/enseignant/contact',
    category: 'communication'
  },
  schedule_updated: {
    type: 'schedule_updated',
    titleTemplate: 'Planning mis à jour 📅',
    descriptionTemplate: 'Votre planning pour {period} a été modifié.',
    targetPageTemplate: '/enseignant/schedule',
    category: 'planning'
  },
  payment_received_teacher: {
    type: 'payment_received_teacher',
    titleTemplate: 'Paiement reçu 💰',
    descriptionTemplate: 'Votre rémunération de {amount} F CFA a été versée.',
    targetPageTemplate: '/enseignant/salary',
    category: 'finance'
  },
  evaluation_request: {
    type: 'evaluation_request',
    titleTemplate: 'Évaluation demandée 📝',
    descriptionTemplate: 'Veuillez évaluer {studentName} pour la période {period}.',
    targetPageTemplate: '/enseignant/grades',
    category: 'evaluation'
  },
  urgent_replacement: {
    type: 'urgent_replacement',
    titleTemplate: '🚨 Remplacement urgent',
    descriptionTemplate: 'Remplacement demandé pour {subject} le {date} à {time}.',
    targetPageTemplate: '/enseignant/schedule',
    category: 'urgent'
  },
  student_absence_alert: {
    type: 'student_absence_alert',
    titleTemplate: 'Absence élève ⚠️',
    descriptionTemplate: '{studentName} absent à {sessionCount} séances consécutives.',
    targetPageTemplate: '/enseignant/students',
    category: 'attendance'
  },
  lesson_material_updated: {
    type: 'lesson_material_updated',
    titleTemplate: 'Nouveau support de cours 📚',
    descriptionTemplate: 'Nouveau matériel disponible pour {subject} - {level}.',
    targetPageTemplate: '/enseignant/lessons',
    category: 'resource'
  },

  // Parent
  contract_signed: {
    type: 'contract_signed',
    titleTemplate: 'Contrat signé {contractCode}',
    descriptionTemplate: 'Nouveau contrat pour {studentName} signé. Montant: {amount} F CFA/mois',
    targetPageTemplate: '/parent/contracts',
    category: 'contrat'
  },
  monthly_report_ready: {
    type: 'monthly_report_ready',
    titleTemplate: 'Rapport mensuel disponible 📊',
    descriptionTemplate: 'Le rapport de {month} pour {studentName} est prêt.',
    targetPageTemplate: '/parent/monthly-reports',
    category: 'rapport'
  },
  invoice_generated: {
    type: 'invoice_generated',
    titleTemplate: 'Facture #{invoiceId} générée 💳',
    descriptionTemplate: 'Votre facture de {month} ({amount} F CFA) est disponible.',
    targetPageTemplate: '/parent/invoices',
    category: 'finance'
  },
  payment_due: {
    type: 'payment_due',
    titleTemplate: 'Échéance de paiement ⏰',
    descriptionTemplate: 'Paiement de {amount} F CFA dû le {dueDate}.',
    targetPageTemplate: '/parent/billing',
    category: 'finance'
  },
  payment_reminder: {
    type: 'payment_reminder',
    titleTemplate: 'Rappel de paiement 🔔',
    descriptionTemplate: 'Paiement en retard: {amount} F CFA (échéance dépassée de {days} jours).',
    targetPageTemplate: '/parent/billing',
    category: 'finance'
  },
  session_cancelled: {
    type: 'session_cancelled',
    titleTemplate: 'Séance annulée ❌',
    descriptionTemplate: 'La séance de {subject} du {date} a été annulée.',
    targetPageTemplate: '/parent/lessons-log',
    category: 'session'
  },
  qr_code_activated: {
    type: 'qr_code_activated',
    titleTemplate: 'QR Code activé ✅',
    descriptionTemplate: 'Votre QR Code a été activé. Vous pouvez maintenant accéder aux services.',
    targetPageTemplate: '/parent/qr-code',
    category: 'system'
  },
  grade_published: {
    type: 'grade_published',
    titleTemplate: 'Nouvelles notes 📝',
    descriptionTemplate: 'Notes de {subject} publiées pour {studentName}.',
    targetPageTemplate: '/parent/grades-reports',
    category: 'evaluation'
  },
  bulletin_available: {
    type: 'bulletin_available',
    titleTemplate: 'Bulletin disponible 🎓',
    descriptionTemplate: 'Le bulletin de {period} pour {studentName} est prêt.',
    targetPageTemplate: '/parent/reports',
    category: 'evaluation'
  },
  teacher_message: {
    type: 'teacher_message',
    titleTemplate: 'Message de {teacherName}',
    descriptionTemplate: 'Nouveau message concernant {studentName}: "{preview}"',
    targetPageTemplate: '/parent/contact',
    category: 'communication'
  },
  schedule_change: {
    type: 'schedule_change',
    titleTemplate: 'Changement d\'horaire 📅',
    descriptionTemplate: 'Modification du planning pour {studentName}: {details}',
    targetPageTemplate: '/parent/lessons-log',
    category: 'planning'
  },
  absence_notification: {
    type: 'absence_notification',
    titleTemplate: 'Absence signalée ⚠️',
    descriptionTemplate: '{studentName} absent(e) à la séance de {subject} du {date}.',
    targetPageTemplate: '/parent/lessons-log',
    category: 'attendance'
  },
  homework_assigned: {
    type: 'homework_assigned',
    titleTemplate: 'Nouveaux devoirs 📚',
    descriptionTemplate: 'Devoirs assignés en {subject} - À rendre le {dueDate}.',
    targetPageTemplate: '/parent/lessons-log',
    category: 'academic'
  },

  // Direction
  contract_created: {
    type: 'contract_created',
    titleTemplate: 'Nouveau contrat créé {contractCode}',
    descriptionTemplate: 'Contrat pour {studentName} créé. Parent: {parentName}, {teachersCount} enseignant(s)',
    targetPageTemplate: '/direction/contracts',
    category: 'contrat'
  },
  new_session_to_validate: {
    type: 'new_session_to_validate',
    titleTemplate: '{count} séance(s) à valider',
    descriptionTemplate: '{count} nouvelles séances soumises par les enseignants.',
    targetPageTemplate: '/direction/sessions',
    category: 'validation'
  },
  payment_received: {
    type: 'payment_received',
    titleTemplate: 'Paiement reçu: {amount} F CFA 💰',
    descriptionTemplate: 'Paiement de {parentName} pour {studentName}.',
    targetPageTemplate: '/direction/payments',
    category: 'finance'
  },
  new_user_registration: {
    type: 'new_user_registration',
    titleTemplate: 'Nouveau {userType} à approuver',
    descriptionTemplate: '{userName} demande l\'accès en tant que {userType}.',
    targetPageTemplate: '/direction/users',
    category: 'administration'
  },
  pending_reports: {
    type: 'pending_reports',
    titleTemplate: '{count} rapport(s) en attente',
    descriptionTemplate: 'Rapports en attente de validation ou publication.',
    targetPageTemplate: '/direction/reports',
    category: 'rapport'
  },
  system_alert: {
    type: 'system_alert',
    titleTemplate: 'Alerte système 🚨',
    descriptionTemplate: '{alertType}: {description}',
    targetPageTemplate: '/direction/settings',
    category: 'system'
  },
  contract_expiring: {
    type: 'contract_expiring',
    titleTemplate: '{count} contrat(s) expirent bientôt ⚠️',
    descriptionTemplate: 'Contrats expirant dans les {days} prochains jours.',
    targetPageTemplate: '/direction/contracts',
    category: 'contrat'
  },
  teacher_absence: {
    type: 'teacher_absence',
    titleTemplate: 'Absence enseignant: {teacherName}',
    descriptionTemplate: '{teacherName} absent(e) - {affectedSessions} séances affectées.',
    targetPageTemplate: '/direction/teachers',
    category: 'planning'
  },
  low_payment_rate: {
    type: 'low_payment_rate',
    titleTemplate: 'Taux de paiement faible 📉',
    descriptionTemplate: 'Taux de paiement de {rate}% pour {month} (objectif: 85%).',
    targetPageTemplate: '/direction/finance',
    category: 'finance'
  },
  student_performance_alert: {
    type: 'student_performance_alert',
    titleTemplate: 'Alerte performance: {studentName}',
    descriptionTemplate: 'Baisse significative des notes en {subject}.',
    targetPageTemplate: '/direction/grades',
    category: 'academic'
  },
  parent_complaint: {
    type: 'parent_complaint',
    titleTemplate: 'Réclamation parent',
    descriptionTemplate: '{parentName} a déposé une réclamation concernant {subject}.',
    targetPageTemplate: '/direction/contact',
    category: 'support'
  },
  financial_milestone: {
    type: 'financial_milestone',
    titleTemplate: 'Objectif financier atteint! 🎉',
    descriptionTemplate: 'Chiffre d\'affaires de {amount} F CFA atteint pour {period}.',
    targetPageTemplate: '/direction/accounting',
    category: 'finance'
  },
  equipment_maintenance_due: {
    type: 'equipment_maintenance_due',
    titleTemplate: 'Maintenance programmée 🔧',
    descriptionTemplate: 'Maintenance de {equipment} prévue le {date}.',
    targetPageTemplate: '/direction/settings',
    category: 'maintenance'
  }
};

// Règles de notifications par défaut
export const DEFAULT_NOTIFICATION_RULES: NotificationRule[] = [
  // Règles Enseignant
  {
    type: 'contract_assigned',
    roles: ['enseignant'],
    priority: 'high',
    enabled: true,
    sound: true,
    vibration: true,
    email: true,
    sms: false,
    inApp: true
  },
  {
    type: 'session_validated',
    roles: ['enseignant'],
    priority: 'normal',
    enabled: true,
    sound: true,
    vibration: false,
    email: false,
    sms: false,
    inApp: true
  },
  {
    type: 'session_rejected',
    roles: ['enseignant'],
    priority: 'high',
    enabled: true,
    sound: true,
    vibration: true,
    email: true,
    sms: false,
    inApp: true
  },
  {
    type: 'urgent_replacement',
    roles: ['enseignant'],
    priority: 'urgent',
    enabled: true,
    sound: true,
    vibration: true,
    email: true,
    sms: true,
    inApp: true
  },

  // Règles Parent
  {
    type: 'payment_due',
    roles: ['parent'],
    priority: 'high',
    enabled: true,
    sound: true,
    vibration: true,
    email: true,
    sms: true,
    inApp: true,
    conditions: {
      delayBeforeReminder: 24 // Rappel après 24h
    }
  },
  {
    type: 'payment_reminder',
    roles: ['parent'],
    priority: 'urgent',
    enabled: true,
    sound: true,
    vibration: true,
    email: true,
    sms: true,
    inApp: true
  },
  {
    type: 'session_cancelled',
    roles: ['parent'],
    priority: 'high',
    enabled: true,
    sound: true,
    vibration: true,
    email: false,
    sms: true,
    inApp: true
  },
  {
    type: 'bulletin_available',
    roles: ['parent'],
    priority: 'normal',
    enabled: true,
    sound: true,
    vibration: false,
    email: true,
    sms: false,
    inApp: true
  },

  // Règles Direction
  {
    type: 'new_session_to_validate',
    roles: ['direction'],
    priority: 'normal',
    enabled: true,
    sound: true,
    vibration: false,
    email: false,
    sms: false,
    inApp: true,
    conditions: {
      timeWindow: { start: 8, end: 18 } // Seulement pendant les heures de bureau
    }
  },
  {
    type: 'payment_received',
    roles: ['direction'],
    priority: 'normal',
    enabled: true,
    sound: false,
    vibration: false,
    email: false,
    sms: false,
    inApp: true,
    conditions: {
      minimumAmount: 10000 // Seulement pour les paiements > 10 000 F CFA
    }
  },
  {
    type: 'system_alert',
    roles: ['direction'],
    priority: 'urgent',
    enabled: true,
    sound: true,
    vibration: true,
    email: true,
    sms: true,
    inApp: true
  },
  {
    type: 'financial_milestone',
    roles: ['direction'],
    priority: 'low',
    enabled: true,
    sound: true,
    vibration: false,
    email: false,
    sms: false,
    inApp: true
  }
];

export class NotificationService {
  private static instance: NotificationService;
  private notifications: NotificationData[] = [];
  private rules: NotificationRule[] = DEFAULT_NOTIFICATION_RULES;
  private listeners: ((notifications: NotificationData[]) => void)[] = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize() {
    // Demander permissions
    if (Platform.OS !== 'web') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission de notification refusée');
      }
    }

    // Charger les notifications existantes
    await this.loadNotifications();
    await this.loadNotificationRules();
  }

  // Créer une notification
  async createNotification(
    type: NotificationType,
    role: UserRole,
    userId: string,
    data: Record<string, any> = {},
    customTitle?: string,
    customDescription?: string
  ): Promise<string> {
    const template = NOTIFICATION_TEMPLATES[type];
    const rule = this.rules.find(r => r.type === type && r.roles.includes(role));
    
    if (!rule || !rule.enabled) {
      console.log(`Notification ${type} désactivée pour le rôle ${role}`);
      return '';
    }

    // Vérifier les conditions
    if (!this.checkConditions(rule, data)) {
      console.log(`Conditions non remplies pour la notification ${type}`);
      return '';
    }

    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const notification: NotificationData = {
      id,
      type,
      role,
      userId,
      title: customTitle || this.parseTemplate(template.titleTemplate, data),
      description: customDescription || this.parseTemplate(template.descriptionTemplate, data),
      data,
      timestamp: new Date(),
      isRead: false,
      priority: rule.priority,
      targetPage: this.parseTemplate(template.targetPageTemplate, data),
      category: template.category,
      expiresAt: this.calculateExpirationDate(type, rule.priority)
    };

    // Ajouter boutons d'action si nécessaire
    notification.actionButtons = this.getActionButtons(type, data);

    this.notifications.push(notification);
    await this.saveNotifications();

    // Envoyer la notification push
    if (rule.inApp) {
      await this.sendPushNotification(notification, rule);
    }

    // Envoyer par email si configuré
    if (rule.email) {
      await this.sendEmailNotification(notification, data);
    }

    // Envoyer par SMS si configuré
    if (rule.sms) {
      await this.sendSMSNotification(notification, data);
    }

    this.notifyListeners();
    return id;
  }

  // Envoyer notification push native
  private async sendPushNotification(notification: NotificationData, rule: NotificationRule) {
    if (Platform.OS === 'web') {
      // Notification web
      if ('Notification' in window && Notification.permission === 'granted') {
        const notificationOptions: NotificationOptions = {
          body: notification.description,
          icon: '/icon.png',
          badge: '/badge.png',
          tag: notification.type
        };
        
        new Notification(notification.title, notificationOptions);
      }
    } else {
      // Notification mobile Expo
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.description,
          data: {
            notificationId: notification.id,
            targetPage: notification.targetPage,
            ...notification.data
          },
          sound: rule.sound ? 'default' : undefined,
          priority: this.mapPriorityToExpo(notification.priority),
          badge: this.getUnreadCount(notification.role, notification.userId)
        },
        trigger: null // Immédiat
      });
    }
  }

  // Envoyer notification par email (simulation)
  private async sendEmailNotification(notification: NotificationData, data: Record<string, any>) {
    // Simulation d'envoi email
    console.log(`📧 Email envoyé: ${notification.title} à ${data.userEmail || 'email@example.com'}`);
    
    // Dans un vrai projet, intégrer un service comme SendGrid, Mailgun, etc.
    // await emailService.send({
    //   to: data.userEmail,
    //   subject: notification.title,
    //   html: this.generateEmailTemplate(notification, data)
    // });
  }

  // Envoyer notification par SMS (simulation)
  private async sendSMSNotification(notification: NotificationData, data: Record<string, any>) {
    // Simulation d'envoi SMS
    console.log(`📱 SMS envoyé: ${notification.title} au ${data.userPhone || '+225XXXXXXXXXX'}`);
    
    // Dans un vrai projet, intégrer un service comme Twilio, Vonage, etc.
    // await smsService.send({
    //   to: data.userPhone,
    //   message: `${notification.title}\n${notification.description}`
    // });
  }

  // Marquer comme lu
  async markAsRead(notificationId: string) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications[index].isRead = true;
      await this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Marquer toutes comme lues pour un utilisateur
  async markAllAsRead(role: UserRole, userId: string) {
    this.notifications = this.notifications.map(n => 
      n.role === role && n.userId === userId 
        ? { ...n, isRead: true }
        : n
    );
    await this.saveNotifications();
    this.notifyListeners();
  }

  // Obtenir notifications pour un utilisateur
  getNotificationsForUser(role: UserRole, userId: string): NotificationData[] {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    return this.notifications.filter(n => {
      const isRelevantRole = n.role === role && n.userId === userId;
      const isStillVisible = !n.isRead || (n.isRead && n.timestamp > oneDayAgo);
      const notExpired = !n.expiresAt || n.expiresAt > new Date();
      return isRelevantRole && isStillVisible && notExpired;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Obtenir le nombre de notifications non lues
  getUnreadCount(role: UserRole, userId: string): number {
    return this.getNotificationsForUser(role, userId).filter(n => !n.isRead).length;
  }

  // Supprimer les notifications expirées
  async cleanupExpiredNotifications() {
    const now = new Date();
    const initialCount = this.notifications.length;
    
    this.notifications = this.notifications.filter(n => {
      if (n.expiresAt && n.expiresAt < now) {
        return false;
      }
      // Supprimer les notifications lues de plus de 7 jours
      if (n.isRead) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return n.timestamp > sevenDaysAgo;
      }
      return true;
    });

    if (this.notifications.length !== initialCount) {
      await this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Gestion des règles de notification
  async updateNotificationRule(type: NotificationType, role: UserRole, updates: Partial<NotificationRule>) {
    const index = this.rules.findIndex(r => r.type === type && r.roles.includes(role));
    if (index !== -1) {
      this.rules[index] = { ...this.rules[index], ...updates };
      await this.saveNotificationRules();
    }
  }

  // Abonnement aux changements
  subscribe(listener: (notifications: NotificationData[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Méthodes privées utilitaires
  private parseTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  private checkConditions(rule: NotificationRule, data: Record<string, any>): boolean {
    if (!rule.conditions) return true;

    const now = new Date();
    
    // Vérifier fenêtre horaire
    if (rule.conditions.timeWindow) {
      const hour = now.getHours();
      const { start, end } = rule.conditions.timeWindow;
      if (hour < start || hour > end) return false;
    }

    // Vérifier jours de la semaine
    if (rule.conditions.daysOfWeek) {
      const dayOfWeek = now.getDay();
      if (!rule.conditions.daysOfWeek.includes(dayOfWeek)) return false;
    }

    // Vérifier montant minimum
    if (rule.conditions.minimumAmount && data.amount) {
      if (parseFloat(data.amount) < rule.conditions.minimumAmount) return false;
    }

    // Vérifier statut utilisateur
    if (rule.conditions.userStatus && data.userStatus) {
      if (data.userStatus !== rule.conditions.userStatus) return false;
    }

    return true;
  }

  private calculateExpirationDate(type: NotificationType, priority: NotificationPriority): Date {
    const now = new Date();
    const expiration = new Date(now);

    switch (priority) {
      case 'urgent':
        expiration.setHours(now.getHours() + 6); // 6 heures
        break;
      case 'high':
        expiration.setDate(now.getDate() + 1); // 1 jour
        break;
      case 'normal':
        expiration.setDate(now.getDate() + 3); // 3 jours
        break;
      case 'low':
        expiration.setDate(now.getDate() + 7); // 7 jours
        break;
    }

    return expiration;
  }

  private getActionButtons(type: NotificationType, data: Record<string, any>) {
    switch (type) {
      case 'payment_due':
      case 'payment_reminder':
        return [
          { label: 'Payer maintenant', action: 'pay_now', style: 'default' as const },
          { label: 'Voir détails', action: 'view_details', style: 'default' as const }
        ];
      
      case 'session_cancelled':
        return [
          { label: 'Reprogrammer', action: 'reschedule', style: 'default' as const },
          { label: 'OK', action: 'dismiss', style: 'cancel' as const }
        ];
      
      case 'urgent_replacement':
        return [
          { label: 'Accepter', action: 'accept_replacement', style: 'default' as const },
          { label: 'Refuser', action: 'decline_replacement', style: 'destructive' as const }
        ];

      default:
        return undefined;
    }
  }

  private mapPriorityToExpo(priority: NotificationPriority): Notifications.AndroidNotificationPriority {
    switch (priority) {
      case 'urgent': return Notifications.AndroidNotificationPriority.MAX;
      case 'high': return Notifications.AndroidNotificationPriority.HIGH;
      case 'normal': return Notifications.AndroidNotificationPriority.DEFAULT;
      case 'low': return Notifications.AndroidNotificationPriority.LOW;
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  // Persistance des données
  private async saveNotifications() {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notifications:', error);
    }
  }

  private async loadNotifications() {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        this.notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
          expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  }

  private async saveNotificationRules() {
    try {
      await AsyncStorage.setItem('notification_rules', JSON.stringify(this.rules));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des règles:', error);
    }
  }

  private async loadNotificationRules() {
    try {
      const stored = await AsyncStorage.getItem('notification_rules');
      if (stored) {
        this.rules = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des règles:', error);
      this.rules = DEFAULT_NOTIFICATION_RULES;
    }
  }
}

// Hook pour utiliser le service de notifications
export const useNotifications = (role: UserRole, userId: string) => {
  const [notifications, setNotifications] = React.useState<NotificationData[]>([]);
  const service = NotificationService.getInstance();

  React.useEffect(() => {
    const unsubscribe = service.subscribe((allNotifications) => {
      setNotifications(service.getNotificationsForUser(role, userId));
    });

    // Charger les notifications initiales
    setNotifications(service.getNotificationsForUser(role, userId));

    return unsubscribe;
  }, [role, userId]);

  return {
    notifications,
    unreadCount: service.getUnreadCount(role, userId),
    markAsRead: (id: string) => service.markAsRead(id),
    markAllAsRead: () => service.markAllAsRead(role, userId),
    createNotification: (type: NotificationType, data?: Record<string, any>) => 
      service.createNotification(type, role, userId, data)
  };
}; 