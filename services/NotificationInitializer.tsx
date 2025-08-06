import { Platform } from 'react-native';
import { NotificationService } from './NotificationService';
import { NotificationTriggers } from './NotificationTriggers';

export class NotificationInitializer {
  private static instance: NotificationInitializer;
  private isInitialized = false;

  static getInstance(): NotificationInitializer {
    if (!NotificationInitializer.instance) {
      NotificationInitializer.instance = new NotificationInitializer();
    }
    return NotificationInitializer.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialiser le service de notifications
      const notificationService = NotificationService.getInstance();
      await notificationService.initialize();

      // Configurer les déclencheurs automatiques
      const triggers = NotificationTriggers.getInstance();
      await triggers.setupScheduledTriggers();

      // Créer des notifications de démonstration
      await this.createDemoNotifications();

      // Démarrer le nettoyage automatique
      this.startCleanupScheduler();

      this.isInitialized = true;
      console.log('✅ Système de notifications initialisé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des notifications:', error);
    }
  }

  private async createDemoNotifications() {
    const notificationService = NotificationService.getInstance();

    // Notifications pour enseignant
    await notificationService.createNotification(
      'contract_assigned',
      'enseignant',
      'demo_teacher_123',
      {
        contractId: 'CONT-2024-001',
        studentName: 'Marie Diabaté',
        subject: 'Mathématiques',
        directorName: 'Direction AS-TRAINING',
        startDate: new Date().toLocaleDateString('fr-FR'),
        duration: '3 mois'
      }
    );

    await notificationService.createNotification(
      'session_validated',
      'enseignant',
      'demo_teacher_123',
      {
        subject: 'Français',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
        studentName: 'Kevin N\'Dri',
        validator: 'M. Kouassi'
      }
    );

    await notificationService.createNotification(
      'parent_message',
      'enseignant',
      'demo_teacher_123',
      {
        parentName: 'Mme Koné',
        studentName: 'Aminata Traoré',
        preview: 'Bonjour, pouvez-vous me donner des nouvelles des progrès d\'Aminata en mathématiques ?',
        messageId: 'msg_001'
      }
    );

    await notificationService.createNotification(
      'urgent_replacement',
      'enseignant',
      'demo_teacher_123',
      {
        subject: 'Physique-Chimie',
        date: new Date().toLocaleDateString('fr-FR'),
        time: '14h30',
        studentName: 'David Kouassi',
        location: 'Domicile - Cocody',
        duration: '2h',
        compensation: '15 000 F CFA'
      }
    );

    // Notifications pour parent
    await notificationService.createNotification(
      'payment_due',
      'parent',
      'demo_parent_456',
      {
        amount: '45000',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
        studentName: 'Junior Kouassi',
        invoiceId: 'INV-2024-003',
        month: 'Janvier 2024'
      }
    );

    await notificationService.createNotification(
      'monthly_report_ready',
      'parent',
      'demo_parent_456',
      {
        month: 'Décembre 2023',
        studentName: 'Prisca Kouassi',
        sessionsCount: '12',
        averageGrade: '15.5/20',
        teacherComments: 'Excellents progrès en mathématiques'
      }
    );

    await notificationService.createNotification(
      'session_cancelled',
      'parent',
      'demo_parent_456',
      {
        subject: 'Anglais',
        date: new Date().toLocaleDateString('fr-FR'),
        teacherName: 'Mme Johnson',
        studentName: 'David Kouassi',
        reason: 'Enseignant indisponible',
        canReschedule: true
      }
    );

    await notificationService.createNotification(
      'teacher_message',
      'parent',
      'demo_parent_456',
      {
        teacherName: 'M. Diabaté',
        studentName: 'Junior Kouassi',
        preview: 'Félicitations ! Junior a obtenu 18/20 au contrôle de mathématiques.',
        messageId: 'msg_002'
      }
    );

    // Notifications pour direction
    await notificationService.createNotification(
      'new_session_to_validate',
      'direction',
      'direction_admin',
      {
        count: 8,
        teacherName: 'Mme Coulibaly',
        subject: 'Sciences Physiques',
        studentName: 'Salif Traoré',
        date: new Date().toLocaleDateString('fr-FR'),
        sessionId: 'SESSION-001'
      }
    );

    await notificationService.createNotification(
      'payment_received',
      'direction',
      'direction_admin',
      {
        amount: '75000',
        parentName: 'M. Diabaté',
        studentName: 'Marie Diabaté',
        paymentMethod: 'Mobile Money',
        invoiceId: 'INV-2024-001'
      }
    );

    await notificationService.createNotification(
      'new_user_registration',
      'direction',
      'direction_admin',
      {
        userName: 'Fatou Koné',
        userType: 'parent',
        userEmail: 'fatou.kone@gmail.com',
        userPhone: '+225 05 12 34 56 78',
        childrenCount: 2,
        childrenNames: 'Aminata, Moussa'
      }
    );

    await notificationService.createNotification(
      'financial_milestone',
      'direction',
      'direction_admin',
      {
        amount: '2500000',
        period: 'ce mois',
        milestone: 'Objectif mensuel atteint',
        previousAmount: '2200000',
        growthPercentage: '13.6'
      }
    );

    await notificationService.createNotification(
      'student_performance_alert',
      'direction',
      'direction_admin',
      {
        studentName: 'Kevin N\'Dri',
        subject: 'Mathématiques',
        currentGrade: '9.5',
        previousGrade: '14.2',
        teacherName: 'M. Kouadio',
        recommendedAction: 'Séances de soutien recommandées',
        parentId: 'demo_parent_789'
      }
    );

    console.log('📱 Notifications de démonstration créées');
  }

  private startCleanupScheduler() {
    // Nettoyage quotidien des notifications expirées
    const cleanupInterval = 24 * 60 * 60 * 1000; // 24 heures

    const cleanup = async () => {
      try {
        const notificationService = NotificationService.getInstance();
        await notificationService.cleanupExpiredNotifications();
        console.log('🧹 Nettoyage automatique des notifications effectué');
      } catch (error) {
        console.error('Erreur lors du nettoyage:', error);
      }
    };

    // Premier nettoyage après 1 minute
    setTimeout(cleanup, 60 * 1000);

    // Puis nettoyage quotidien
    setInterval(cleanup, cleanupInterval);
  }

  // Créer des notifications de test pour les différents scénarios
  async createTestNotifications(userRole: 'enseignant' | 'parent' | 'direction', userId: string) {
    const notificationService = NotificationService.getInstance();

    switch (userRole) {
      case 'enseignant':
        await this.createTestNotificationsForTeacher(notificationService, userId);
        break;
      case 'parent':
        await this.createTestNotificationsForParent(notificationService, userId);
        break;
      case 'direction':
        await this.createTestNotificationsForDirection(notificationService, userId);
        break;
    }
  }

  private async createTestNotificationsForTeacher(service: NotificationService, userId: string) {
    // Notification urgente
    await service.createNotification(
      'urgent_replacement',
      'enseignant',
      userId,
      {
        subject: 'Mathématiques',
        date: 'Aujourd\'hui',
        time: '16h00',
        studentName: 'Test Student',
        location: 'Cocody',
        duration: '2h',
        compensation: '20 000 F CFA'
      }
    );

    // Notification normale
    await service.createNotification(
      'session_validated',
      'enseignant',
      userId,
      {
        subject: 'Français',
        date: 'Hier',
        studentName: 'Test Student 2',
        validator: 'Direction'
      }
    );
  }

  private async createTestNotificationsForParent(service: NotificationService, userId: string) {
    // Notification de paiement (haute priorité)
    await service.createNotification(
      'payment_reminder',
      'parent',
      userId,
      {
        amount: '25000',
        days: '5',
        studentName: 'Mon Enfant',
        invoiceId: 'TEST-001',
        penaltyAmount: '2500'
      }
    );

    // Notification normale
    await service.createNotification(
      'grade_published',
      'parent',
      userId,
      {
        subject: 'Mathématiques',
        studentName: 'Mon Enfant',
        teacherName: 'Prof Test'
      }
    );
  }

  private async createTestNotificationsForDirection(service: NotificationService, userId: string) {
    // Notification système urgente
    await service.createNotification(
      'system_alert',
      'direction',
      userId,
      {
        alertType: 'Test Système',
        description: 'Notification de test pour vérifier le système',
        severity: 'high',
        actionRequired: true
      }
    );

    // Notification de validation
    await service.createNotification(
      'new_session_to_validate',
      'direction',
      userId,
      {
        count: 3,
        teacherName: 'Enseignant Test'
      }
    );
  }

  // Simuler des événements pour tester les déclencheurs
  async simulateUserActivity(userRole: 'enseignant' | 'parent' | 'direction') {
    const triggers = NotificationTriggers.getInstance();

    switch (userRole) {
      case 'direction':
        // Simuler la création d'un nouveau parent
        setTimeout(async () => {
          await triggers.onParentCreated({
            userId: 'new_parent_simulation',
            userRole: 'parent',
            metadata: {
              prenoms: 'Simulation',
              nom: 'Parent',
              email: 'simulation@test.com',
              telephone: '+225 01 23 45 67 89',
              enfants: ['Enfant Test'],
              codeId: 'SIM-001',
              ville: 'Abidjan'
            }
          });
        }, 30000); // Après 30 secondes

        // Simuler un paiement reçu
        setTimeout(async () => {
          await triggers.onPaymentReceived({
            userId: 'direction_admin',
            userRole: 'direction',
            metadata: {
              amount: '50000',
              parentName: 'Parent Simulation',
              studentName: 'Enfant Test',
              paymentMethod: 'Espèces',
              invoiceId: 'SIM-INV-001'
            }
          });
        }, 60000); // Après 1 minute

        break;

      case 'enseignant':
        // Simuler une soumission de séance
        setTimeout(async () => {
          await triggers.onSessionSubmitted({
            userId: 'teacher_simulation',
            userRole: 'enseignant',
            metadata: {
              teacherName: 'Enseignant Simulation',
              subject: 'Test Subject',
              studentName: 'Élève Test',
              sessionDate: new Date().toLocaleDateString('fr-FR'),
              sessionId: 'SIM-SESSION-001'
            }
          });
        }, 45000); // Après 45 secondes

        break;

      case 'parent':
        // Simuler un paiement en retard
        setTimeout(async () => {
          await triggers.onPaymentOverdue({
            userId: 'parent_simulation',
            userRole: 'parent',
            targetUserId: 'parent_simulation',
            metadata: {
              amount: '30000',
              daysOverdue: 7,
              studentName: 'Mon Enfant',
              invoiceId: 'LATE-001',
              parentName: 'Parent Simulation'
            }
          });
        }, 75000); // Après 1 minute 15

        break;
    }
  }
}

// Fonction helper pour initialiser le système
export const initializeNotificationSystem = async () => {
  const initializer = NotificationInitializer.getInstance();
  await initializer.initialize();
  return initializer;
};

// Hook pour utiliser l'initialisateur
export const useNotificationInitializer = () => {
  const initializer = NotificationInitializer.getInstance();

  return {
    createTestNotifications: (userRole: 'enseignant' | 'parent' | 'direction', userId: string) =>
      initializer.createTestNotifications(userRole, userId),
    simulateUserActivity: (userRole: 'enseignant' | 'parent' | 'direction') =>
      initializer.simulateUserActivity(userRole)
  };
}; 