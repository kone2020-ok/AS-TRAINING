import { NotificationService, NotificationType, UserRole } from './NotificationService';

export interface TriggerContext {
  userId: string;
  userRole: UserRole;
  targetUserId?: string;
  targetUserRole?: UserRole;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, any>;
}

export class NotificationTriggers {
  private static instance: NotificationTriggers;
  private notificationService: NotificationService;

  static getInstance(): NotificationTriggers {
    if (!NotificationTriggers.instance) {
      NotificationTriggers.instance = new NotificationTriggers();
    }
    return NotificationTriggers.instance;
  }

  constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  // Déclencheurs pour la gestion des parents
  async onParentCreated(context: TriggerContext) {
    const { userId, userRole, metadata } = context;
    
    // Notification à la direction
    await this.notificationService.createNotification(
      'new_user_registration',
      'direction',
      'direction_admin',
      {
        userName: `${metadata?.prenoms} ${metadata?.nom}`,
        userType: 'parent',
        userEmail: metadata?.email,
        userPhone: metadata?.telephone,
        childrenCount: metadata?.enfants?.length || 0,
        childrenNames: metadata?.enfants?.join(', ') || '',
        codeId: metadata?.codeId
      }
    );

    // Notification de bienvenue au parent (après activation)
    setTimeout(async () => {
      await this.notificationService.createNotification(
        'qr_code_activated',
        'parent',
        userId,
        {
          parentName: `${metadata?.prenoms} ${metadata?.nom}`,
          codeId: metadata?.codeId
        }
      );
    }, 5000); // 5 secondes de délai pour simulation d'activation
  }

  async onParentUpdated(context: TriggerContext) {
    const { userId, userRole, metadata } = context;
    
    // Notification à la direction pour modification importante
    if (metadata?.significantChange) {
      await this.notificationService.createNotification(
        'system_alert',
        'direction',
        'direction_admin',
        {
          alertType: 'Modification parent',
          description: `${metadata?.prenoms} ${metadata?.nom} a modifié ses informations`,
          details: metadata?.changedFields?.join(', ') || ''
        }
      );
    }
  }

  async onParentDeleted(context: TriggerContext) {
    const { userId, userRole, metadata } = context;
    
    // Notification à la direction
    await this.notificationService.createNotification(
      'system_alert',
      'direction',
      'direction_admin',
      {
        alertType: 'Suppression parent',
        description: `Parent ${metadata?.prenoms} ${metadata?.nom} supprimé`,
        affectedContracts: metadata?.contractsCount || 0,
        reason: metadata?.reason || 'Non spécifiée'
      }
    );
  }

  // Déclencheurs pour la gestion des enseignants
  async onTeacherCreated(context: TriggerContext) {
    const { userId, userRole, metadata } = context;
    
    // Notification à la direction
    await this.notificationService.createNotification(
      'new_user_registration',
      'direction',
      'direction_admin',
      {
        userName: `${metadata?.prenoms} ${metadata?.nom}`,
        userType: 'enseignant',
        userEmail: metadata?.email,
        userPhone: metadata?.telephone,
        subjects: metadata?.matieres?.join(', ') || '',
        experience: metadata?.experience
      }
    );

    // Notification de bienvenue à l'enseignant
    await this.notificationService.createNotification(
      'contract_assigned',
      'enseignant',
      userId,
      {
        teacherName: `${metadata?.prenoms} ${metadata?.nom}`,
        welcomeMessage: true,
        directorName: 'Direction AS-TRAINING'
      }
    );
  }

  async onTeacherUpdated(context: TriggerContext) {
    const { userId, userRole, metadata } = context;
    
    // Notification si changement de planning
    if (metadata?.scheduleChanged) {
      await this.notificationService.createNotification(
        'schedule_updated',
        'enseignant',
        userId,
        {
          teacherName: `${metadata?.prenoms} ${metadata?.nom}`,
          period: metadata?.period || 'cette semaine',
          changes: metadata?.scheduleChanges || 'Modifications apportées'
        }
      );
    }
  }

  async onTeacherDeleted(context: TriggerContext) {
    const { userId, userRole, metadata } = context;
    
    // Notification à la direction
    await this.notificationService.createNotification(
      'teacher_absence',
      'direction',
      'direction_admin',
      {
        teacherName: `${metadata?.prenoms} ${metadata?.nom}`,
        affectedSessions: metadata?.sessionsCount || 0,
        replacementNeeded: true
      }
    );

    // Notifier les parents concernés
    if (metadata?.affectedParents) {
      for (const parent of metadata.affectedParents) {
        await this.notificationService.createNotification(
          'teacher_message',
          'parent',
          parent.id,
          {
            teacherName: `${metadata?.prenoms} ${metadata?.nom}`,
            studentName: parent.studentName,
            preview: `L'enseignant ${metadata?.prenoms} ${metadata?.nom} ne sera plus disponible. Un remplacement sera organisé.`,
            important: true
          }
        );
      }
    }
  }

  // Déclencheurs pour les contrats
  async onContractCreated(context: TriggerContext) {
    const { userId, userRole, targetUserId, metadata } = context;
    
    // Notification à la direction
    await this.notificationService.createNotification(
      'contract_created',
      'direction',
      'direction_admin',
      {
        contractCode: metadata?.contractCode,
        studentName: metadata?.studentName,
        parentName: metadata?.parentName,
        teachersCount: metadata?.teachersCount,
        amount: metadata?.amount
      }
    );

    // Notification au parent
    if (metadata?.parentId) {
      await this.notificationService.createNotification(
        'contract_signed',
        'parent',
        metadata.parentId,
        {
          contractCode: metadata?.contractCode,
          studentName: metadata?.studentName,
          startDate: metadata?.startDate,
          amount: metadata?.amount
        }
      );
    }

    // Notifications aux enseignants
    if (metadata?.teacherIds && Array.isArray(metadata.teacherIds)) {
      metadata.teacherIds.forEach(async (teacherId: string) => {
        await this.notificationService.createNotification(
          'contract_assigned',
          'enseignant',
          teacherId,
          {
            contractCode: metadata?.contractCode,
            studentName: metadata?.studentName,
            subjects: metadata?.subjects,
            startDate: metadata?.startDate
          }
        );
      });
    }
  }

  async onContractUpdated(context: TriggerContext) {
    const { userId, userRole, targetUserId, metadata } = context;
    
    // Notification à la direction
    await this.notificationService.createNotification(
      'contract_updated',
      'direction',
      'direction_admin',
      {
        contractCode: metadata?.contractCode,
        studentName: metadata?.studentName,
        changes: metadata?.changes
      }
    );

    // Notification au parent si changements importants
    if (metadata?.parentId && metadata?.notifyParent) {
      await this.notificationService.createNotification(
        'contract_updated',
        'parent',
        metadata.parentId,
        {
          contractCode: metadata?.contractCode,
          studentName: metadata?.studentName,
          changes: metadata?.changes
        }
      );
    }

    // Notifications aux enseignants si changements de planning ou matières
    if (metadata?.teacherIds && metadata?.notifyTeachers) {
      metadata.teacherIds.forEach(async (teacherId: string) => {
        await this.notificationService.createNotification(
          'contract_updated',
          'enseignant',
          teacherId,
          {
            contractCode: metadata?.contractCode,
            studentName: metadata?.studentName,
            changes: metadata?.changes
          }
        );
      });
    }
  }

  async onContractExpiring(context: TriggerContext) {
    const { userId, userRole, metadata } = context;
    
    // Notification à la direction
    await this.notificationService.createNotification(
      'contract_expiring',
      'direction',
      'direction_admin',
      {
        count: metadata?.expiringCount || 1,
        days: metadata?.daysUntilExpiry || 7,
        contracts: metadata?.contractsList || []
      }
    );

    // Notifications individuelles aux enseignants et parents
    if (metadata?.contracts) {
      for (const contract of metadata.contracts) {
        // Enseignant
        await this.notificationService.createNotification(
          'contract_assigned',
          'enseignant',
          contract.teacherId,
          {
            contractId: contract.id,
            studentName: contract.studentName,
            subject: contract.subject,
            expiryDate: contract.expiryDate,
            renewal: true
          }
        );

        // Parent
        await this.notificationService.createNotification(
          'teacher_message',
          'parent',
          contract.parentId,
          {
            teacherName: contract.teacherName,
            studentName: contract.studentName,
            preview: `Le contrat pour ${contract.subject} expire le ${contract.expiryDate}`,
            renewal: true
          }
        );
      }
    }
  }

  // Déclencheurs pour les séances
  async onSessionSubmitted(context: TriggerContext) {
    const { userId, userRole, metadata } = context;
    
    // Notification à la direction
    await this.notificationService.createNotification(
      'new_session_to_validate',
      'direction',
      'direction_admin',
      {
        count: 1,
        teacherName: metadata?.teacherName,
        subject: metadata?.subject,
        studentName: metadata?.studentName,
        date: metadata?.sessionDate,
        sessionId: metadata?.sessionId
      }
    );
  }

  async onSessionValidated(context: TriggerContext) {
    const { userId, userRole, targetUserId, metadata } = context;
    
    // Notification à l'enseignant
    if (targetUserId) {
      await this.notificationService.createNotification(
        'session_validated',
        'enseignant',
        targetUserId,
        {
          subject: metadata?.subject,
          date: metadata?.sessionDate,
          studentName: metadata?.studentName,
          validator: metadata?.validatorName || 'Direction'
        }
      );
    }

    // Notification au parent
    if (metadata?.parentId) {
      await this.notificationService.createNotification(
        'grade_published',
        'parent',
        metadata.parentId,
        {
          subject: metadata?.subject,
          studentName: metadata?.studentName,
          teacherName: metadata?.teacherName,
          sessionDate: metadata?.sessionDate,
          notes: metadata?.sessionNotes
        }
      );
    }
  }

  async onSessionRejected(context: TriggerContext) {
    const { userId, userRole, targetUserId, metadata } = context;
    
    // Notification à l'enseignant
    if (targetUserId) {
      await this.notificationService.createNotification(
        'session_rejected',
        'enseignant',
        targetUserId,
        {
          subject: metadata?.subject,
          date: metadata?.sessionDate,
          studentName: metadata?.studentName,
          reason: metadata?.rejectionReason || 'Motif non spécifié',
          validator: metadata?.validatorName || 'Direction'
        }
      );
    }
  }

  async onSessionCancelled(context: TriggerContext) {
    const { userId, userRole, metadata } = context;
    
    // Notification au parent
    if (metadata?.parentId) {
      await this.notificationService.createNotification(
        'session_cancelled',
        'parent',
        metadata.parentId,
        {
          subject: metadata?.subject,
          date: metadata?.sessionDate,
          teacherName: metadata?.teacherName,
          studentName: metadata?.studentName,
          reason: metadata?.cancellationReason,
          reschedule: metadata?.canReschedule || false
        }
      );
    }

    // Notification à l'enseignant si annulation par la direction
    if (metadata?.teacherId && userRole === 'direction') {
      await this.notificationService.createNotification(
        'schedule_updated',
        'enseignant',
        metadata.teacherId,
        {
          teacherName: metadata?.teacherName,
          period: metadata?.sessionDate,
          changes: `Séance annulée: ${metadata?.subject} - ${metadata?.studentName}`
        }
      );
    }
  }

  // Déclencheurs pour les paiements
  async onPaymentDue(context: TriggerContext) {
    const { userId, userRole, targetUserId, metadata } = context;
    
    // Notification au parent
    if (targetUserId) {
      await this.notificationService.createNotification(
        'payment_due',
        'parent',
        targetUserId,
        {
          amount: metadata?.amount,
          dueDate: metadata?.dueDate,
          studentName: metadata?.studentName,
          invoiceId: metadata?.invoiceId,
          month: metadata?.month
        }
      );
    }
  }

  async onPaymentOverdue(context: TriggerContext) {
    const { userId, userRole, targetUserId, metadata } = context;
    
    // Notification de rappel au parent
    if (targetUserId) {
      await this.notificationService.createNotification(
        'payment_reminder',
        'parent',
        targetUserId,
        {
          amount: metadata?.amount,
          days: metadata?.daysOverdue,
          studentName: metadata?.studentName,
          invoiceId: metadata?.invoiceId,
          penaltyAmount: metadata?.penaltyAmount || 0
        }
      );
    }

    // Notification à la direction si montant élevé
    if (metadata?.amount && parseFloat(metadata.amount) > 50000) {
      await this.notificationService.createNotification(
        'low_payment_rate',
        'direction',
        'direction_admin',
        {
          parentName: metadata?.parentName,
          amount: metadata?.amount,
          days: metadata?.daysOverdue,
          studentName: metadata?.studentName
        }
      );
    }
  }

  async onPaymentReceived(context: TriggerContext) {
    const { userId, userRole, metadata } = context;
    
    // Notification à la direction
    await this.notificationService.createNotification(
      'payment_received',
      'direction',
      'direction_admin',
      {
        amount: metadata?.amount,
        parentName: metadata?.parentName,
        studentName: metadata?.studentName,
        paymentMethod: metadata?.paymentMethod,
        invoiceId: metadata?.invoiceId
      }
    );

    // Notification à l'enseignant si paiement de ses cours
    if (metadata?.teacherId) {
      await this.notificationService.createNotification(
        'payment_received_teacher',
        'enseignant',
        metadata.teacherId,
        {
          amount: metadata?.teacherAmount || metadata?.amount,
          studentName: metadata?.studentName,
          month: metadata?.month
        }
      );
    }
  }

  // Déclencheurs pour les notes et performance académique
  async onGradePublished(context: TriggerContext) {
    const { userId, userRole, metadata } = context;
    
    // Notification au parent
    if (metadata?.parentId) {
      await this.notificationService.createNotification(
        'grade_published',
        'parent',
        metadata.parentId,
        {
          studentName: metadata?.studentName,
          teacherName: metadata?.teacherName,
          subject: metadata?.subject,
          grade: metadata?.grade,
          maxGrade: metadata?.maxGrade,
          percentage: metadata?.percentage,
          performanceLevel: metadata?.performanceLevel,
          gradeType: metadata?.gradeType,
          comment: metadata?.comment,
          gradeId: metadata?.gradeId
        }
      );
    }

    // Notification à la direction si note préoccupante
    if (metadata?.percentage && metadata.percentage < 50) {
      await this.notificationService.createNotification(
        'student_performance_alert',
        'direction',
        'direction_admin',
        {
          studentName: metadata?.studentName,
          teacherName: metadata?.teacherName,
          subject: metadata?.subject,
          grade: metadata?.grade,
          maxGrade: metadata?.maxGrade,
          percentage: metadata?.percentage,
          parentName: metadata?.parentName || '',
          alertType: 'low_grade'
        }
      );
    }
  }

  async onBulletinUploaded(context: TriggerContext) {
    const { userId, userRole, metadata } = context;
    
    // Notification à la direction
    await this.notificationService.createNotification(
      'new_user_registration', // Réutiliser ce type pour nouveaux documents
      'direction',
      'direction_admin',
      {
        documentType: 'bulletin',
        studentName: metadata?.studentName,
        parentName: metadata?.parentName,
        period: metadata?.period,
        trimester: metadata?.trimester,
        year: metadata?.year,
        averageGrade: metadata?.averageGrade,
        bulletinId: metadata?.bulletinId
      }
    );

    // Notification aux enseignants concernés
    if (metadata?.teacherIds && Array.isArray(metadata.teacherIds)) {
      metadata.teacherIds.forEach(async (teacherId: string) => {
        await this.notificationService.createNotification(
          'bulletin_available',
          'enseignant',
          teacherId,
          {
            studentName: metadata?.studentName,
            parentName: metadata?.parentName,
            period: metadata?.period,
            averageGrade: metadata?.averageGrade,
            bulletinId: metadata?.bulletinId
          }
        );
      });
    }
  }

  async onPerformanceTrendAlert(context: TriggerContext) {
    const { userId, userRole, metadata } = context;
    
    // Notification au parent
    if (metadata?.parentId) {
      await this.notificationService.createNotification(
        'student_performance_alert',
        'parent',
        metadata.parentId,
        {
          studentName: metadata?.studentName,
          trendType: metadata?.trendType, // 'declining', 'improving', 'concerning'
          affectedSubjects: metadata?.affectedSubjects,
          recommendedActions: metadata?.recommendedActions,
          teacherName: metadata?.teacherName,
          period: metadata?.period
        }
      );
    }

    // Notification à la direction
    await this.notificationService.createNotification(
      'student_performance_alert',
      'direction',
      'direction_admin',
      {
        studentName: metadata?.studentName,
        parentName: metadata?.parentName,
        teacherName: metadata?.teacherName,
        trendType: metadata?.trendType,
        affectedSubjects: metadata?.affectedSubjects,
        urgencyLevel: metadata?.urgencyLevel || 'medium'
      }
    );
  }

  async onAcademicMilestone(context: TriggerContext) {
    const { userId, userRole, metadata } = context;
    
    // Notification au parent pour les réussites
    if (metadata?.parentId && metadata?.milestoneType === 'achievement') {
      await this.notificationService.createNotification(
        'grade_published',
        'parent',
        metadata.parentId,
        {
          studentName: metadata?.studentName,
          teacherName: metadata?.teacherName,
          milestoneType: metadata?.milestoneType,
          achievement: metadata?.achievement,
          subject: metadata?.subject,
          specialMention: true
        }
      );
    }

    // Notification à la direction pour suivi
    await this.notificationService.createNotification(
      'financial_milestone', // Réutiliser pour jalons académiques
      'direction',
      'direction_admin',
      {
        studentName: metadata?.studentName,
        parentName: metadata?.parentName,
        teacherName: metadata?.teacherName,
        milestoneType: metadata?.milestoneType,
        achievement: metadata?.achievement,
        subject: metadata?.subject
      }
    );
  }

  // Déclencheurs pour les messages
  async onMessageSent(context: TriggerContext) {
    const { userId, userRole, targetUserId, targetUserRole, metadata } = context;
    
    if (!targetUserId || !targetUserRole) return;

    const notificationType = targetUserRole === 'parent' ? 'teacher_message' : 'parent_message';
    
    await this.notificationService.createNotification(
      notificationType as NotificationType,
      targetUserRole,
      targetUserId,
      {
        senderName: metadata?.senderName,
        studentName: metadata?.studentName,
        preview: metadata?.messagePreview || metadata?.message?.substring(0, 50) + '...',
        messageId: metadata?.messageId,
        urgent: metadata?.isUrgent || false
      }
    );
  }

  // Déclencheurs d'urgence
  async onUrgentReplacement(context: TriggerContext) {
    const { userId, userRole, metadata } = context;
    
    // Notification aux enseignants disponibles
    if (metadata?.availableTeachers) {
      for (const teacherId of metadata.availableTeachers) {
        await this.notificationService.createNotification(
          'urgent_replacement',
          'enseignant',
          teacherId,
          {
            subject: metadata?.subject,
            date: metadata?.sessionDate,
            time: metadata?.sessionTime,
            studentName: metadata?.studentName,
            location: metadata?.location,
            duration: metadata?.duration,
            compensation: metadata?.compensation
          }
        );
      }
    }
  }

  async onSystemAlert(context: TriggerContext) {
    const { userId, userRole, metadata } = context;
    
    // Notification à la direction
    await this.notificationService.createNotification(
      'system_alert',
      'direction',
      'direction_admin',
      {
        alertType: metadata?.alertType || 'Alerte système',
        description: metadata?.description || 'Problème détecté',
        severity: metadata?.severity || 'medium',
        affectedUsers: metadata?.affectedUsers || 0,
        actionRequired: metadata?.actionRequired || false
      }
    );
  }

  // Déclencheurs financiers avancés
  async onFinancialMilestone(context: TriggerContext) {
    const { userId, userRole, metadata } = context;
    
    // Notification à la direction
    await this.notificationService.createNotification(
      'financial_milestone',
      'direction',
      'direction_admin',
      {
        amount: metadata?.amount,
        period: metadata?.period || 'ce mois',
        milestone: metadata?.milestone || 'Objectif atteint',
        previousAmount: metadata?.previousAmount,
        growthPercentage: metadata?.growthPercentage
      }
    );
  }

  async onLowPaymentRate(context: TriggerContext) {
    const { userId, userRole, metadata } = context;
    
    // Notification à la direction
    await this.notificationService.createNotification(
      'low_payment_rate',
      'direction',
      'direction_admin',
      {
        rate: metadata?.paymentRate,
        month: metadata?.month || new Date().toLocaleDateString('fr-FR', { month: 'long' }),
        target: metadata?.targetRate || 85,
        unpaidAmount: metadata?.unpaidAmount,
        affectedStudents: metadata?.affectedStudents || 0
      }
    );
  }

  // Déclencheurs de performance académique
  async onStudentPerformanceAlert(context: TriggerContext) {
    const { userId, userRole, metadata } = context;
    
    // Notification à la direction
    await this.notificationService.createNotification(
      'student_performance_alert',
      'direction',
      'direction_admin',
      {
        studentName: metadata?.studentName,
        subject: metadata?.subject,
        currentGrade: metadata?.currentGrade,
        previousGrade: metadata?.previousGrade,
        teacherName: metadata?.teacherName,
        recommendedAction: metadata?.recommendedAction
      }
    );

    // Notification au parent
    if (metadata?.parentId) {
      await this.notificationService.createNotification(
        'grade_published',
        'parent',
        metadata.parentId,
        {
          subject: metadata?.subject,
          studentName: metadata?.studentName,
          teacherName: metadata?.teacherName,
          performanceAlert: true,
          recommendedAction: metadata?.recommendedAction
        }
      );
    }
  }

  // Déclencheurs automatiques basés sur le temps
  async setupScheduledTriggers() {
    // Vérification quotidienne des contrats expirants
    setInterval(async () => {
      // Logique pour détecter les contrats expirant dans 7 jours
      // await this.checkExpiringContracts();
    }, 24 * 60 * 60 * 1000); // Chaque 24h

    // Vérification hebdomadaire des paiements en retard
    setInterval(async () => {
      // Logique pour détecter les paiements en retard
      // await this.checkOverduePayments();
    }, 7 * 24 * 60 * 60 * 1000); // Chaque semaine

    // Nettoyage des notifications expirées
    setInterval(async () => {
      await this.notificationService.cleanupExpiredNotifications();
    }, 6 * 60 * 60 * 1000); // Chaque 6h
  }
}

// Hook pour utiliser les déclencheurs
export const useNotificationTriggers = () => {
  const triggers = NotificationTriggers.getInstance();

  return {
    // Parents
    onParentCreated: (context: TriggerContext) => triggers.onParentCreated(context),
    onParentUpdated: (context: TriggerContext) => triggers.onParentUpdated(context),
    onParentDeleted: (context: TriggerContext) => triggers.onParentDeleted(context),
    
    // Enseignants
    onTeacherCreated: (context: TriggerContext) => triggers.onTeacherCreated(context),
    onTeacherUpdated: (context: TriggerContext) => triggers.onTeacherUpdated(context),
    onTeacherDeleted: (context: TriggerContext) => triggers.onTeacherDeleted(context),
    
    // Contrats
    onContractCreated: (context: TriggerContext) => triggers.onContractCreated(context),
    onContractExpiring: (context: TriggerContext) => triggers.onContractExpiring(context),
    
    // Séances
    onSessionSubmitted: (context: TriggerContext) => triggers.onSessionSubmitted(context),
    onSessionValidated: (context: TriggerContext) => triggers.onSessionValidated(context),
    onSessionRejected: (context: TriggerContext) => triggers.onSessionRejected(context),
    onSessionCancelled: (context: TriggerContext) => triggers.onSessionCancelled(context),
    
    // Paiements
    onPaymentDue: (context: TriggerContext) => triggers.onPaymentDue(context),
    onPaymentOverdue: (context: TriggerContext) => triggers.onPaymentOverdue(context),
    onPaymentReceived: (context: TriggerContext) => triggers.onPaymentReceived(context),
    
    // Notes et Performance
    onGradePublished: (context: TriggerContext) => triggers.onGradePublished(context),
    onBulletinUploaded: (context: TriggerContext) => triggers.onBulletinUploaded(context),
    onPerformanceTrendAlert: (context: TriggerContext) => triggers.onPerformanceTrendAlert(context),
    onAcademicMilestone: (context: TriggerContext) => triggers.onAcademicMilestone(context),
    
    // Messages
    onMessageSent: (context: TriggerContext) => triggers.onMessageSent(context),
    
    // Urgences
    onUrgentReplacement: (context: TriggerContext) => triggers.onUrgentReplacement(context),
    onSystemAlert: (context: TriggerContext) => triggers.onSystemAlert(context),
    
    // Finance
    onFinancialMilestone: (context: TriggerContext) => triggers.onFinancialMilestone(context),
    onLowPaymentRate: (context: TriggerContext) => triggers.onLowPaymentRate(context),
    
    // Performance
    onStudentPerformanceAlert: (context: TriggerContext) => triggers.onStudentPerformanceAlert(context)
  };
}; 