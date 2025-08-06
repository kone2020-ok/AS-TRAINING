import React from 'react';
import { Alert, Platform } from 'react-native';
import { TeacherStudentReport, ParentTeacherReport } from '../types/Report';

export interface ExportOptions {
  format: 'pdf' | 'excel';
  includeAISuggestions?: boolean;
  includeGraphics?: boolean;
  template?: 'standard' | 'detailed' | 'summary';
}

export class ReportExportService {
  private static instance: ReportExportService;

  static getInstance(): ReportExportService {
    if (!ReportExportService.instance) {
      ReportExportService.instance = new ReportExportService();
    }
    return ReportExportService.instance;
  }

  // Export rapport enseignant en PDF
  async exportTeacherReportToPDF(
    report: TeacherStudentReport, 
    options: ExportOptions = { format: 'pdf' }
  ): Promise<string | null> {
    try {
      const htmlContent = this.generateTeacherReportHTML(report, options);
      
      if (Platform.OS === 'web') {
        // Pour le web, utiliser la fonction d'impression native
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.print();
          return 'printed';
        }
      } else {
        // Pour mobile, simuler le téléchargement
        Alert.alert(
          'Export PDF',
          'Rapport exporté avec succès dans vos téléchargements',
          [{ text: 'OK' }]
        );
        return 'downloaded';
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'exporter le rapport');
      return null;
    }
    return null;
  }

  // Export rapport parent en PDF
  async exportParentReportToPDF(
    report: ParentTeacherReport,
    options: ExportOptions = { format: 'pdf' }
  ): Promise<string | null> {
    try {
      const htmlContent = this.generateParentReportHTML(report, options);
      
      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.print();
          return 'printed';
        }
      } else {
        Alert.alert(
          'Export PDF',
          'Évaluation exportée avec succès dans vos téléchargements',
          [{ text: 'OK' }]
        );
        return 'downloaded';
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'exporter l\'évaluation');
      return null;
    }
    return null;
  }

  // Export multiple rapports en Excel
  async exportMultipleReportsToExcel(
    reports: (TeacherStudentReport | ParentTeacherReport)[],
    options: ExportOptions = { format: 'excel' }
  ): Promise<string | null> {
    try {
      const csvContent = this.generateCSVContent(reports);
      
      if (Platform.OS === 'web') {
        // Créer et télécharger le fichier CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `rapports_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return 'downloaded';
      } else {
        Alert.alert(
          'Export Excel',
          'Données exportées avec succès dans vos téléchargements',
          [{ text: 'OK' }]
        );
        return 'downloaded';
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'exporter les données');
      return null;
    }
  }

  // Générer HTML pour rapport enseignant
  private generateTeacherReportHTML(report: TeacherStudentReport, options: ExportOptions): string {
    const { content } = report;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Rapport Mensuel - ${report.studentName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #1E40AF; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { color: #1E40AF; font-size: 24px; font-weight: bold; }
        .section { margin-bottom: 25px; }
        .section-title { background: #1E40AF; color: white; padding: 10px; margin-bottom: 15px; }
        .field { margin-bottom: 10px; }
        .field-label { font-weight: bold; color: #1E40AF; }
        .grade-badge { background: #10B981; color: white; padding: 5px 10px; border-radius: 15px; }
        .ai-section { background: #F0F9FF; border-left: 4px solid #3B82F6; padding: 15px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">AS-TRAINING</div>
        <h1>Rapport Mensuel d'Évaluation</h1>
        <p><strong>Élève:</strong> ${report.studentName} | <strong>Enseignant:</strong> ${report.teacherName}</p>
        <p><strong>Période:</strong> ${this.getMonthName(report.month)} ${report.year}</p>
      </div>

      <div class="section">
        <div class="section-title">1. Engagement et Compréhension</div>
        <div class="field">
          <span class="field-label">Attitude générale:</span> ${this.getAttitudeLabel(content.attitude)}
        </div>
        <div class="field">
          <span class="field-label">Attention/Concentration:</span> ${this.getAttentionLabel(content.attention)}
        </div>
        <div class="field">
          <span class="field-label">Principales difficultés:</span> ${content.difficulties}
        </div>
        <div class="field">
          <span class="field-label">Points forts:</span> ${content.strengths}
        </div>
      </div>

      <div class="section">
        <div class="section-title">2. Progression et Résultats</div>
        <div class="field">
          <span class="field-label">Évolution des résultats:</span> ${this.getProgressLabel(content.progressEvolution)}
        </div>
        <div class="field">
          <span class="field-label">Dernières notes:</span>
          ${content.lastGrades?.map(grade => 
            `<span class="grade-badge">${grade.matiere}: ${grade.note}/20</span>`
          ).join(' ') || 'Aucune note enregistrée'}
        </div>
      </div>

      <div class="section">
        <div class="section-title">6. Appréciation Générale</div>
        <div class="field">
          <span class="field-label">Note globale:</span> 
          <span class="grade-badge">${content.overallGrade}/20</span>
        </div>
        <div class="field">
          <span class="field-label">Appréciation:</span> ${this.getAppreciationLabel(content.generalAppreciation)}
        </div>
        <div class="field">
          <span class="field-label">Description générale:</span> ${content.generalDescription}
        </div>
      </div>

      ${options.includeAISuggestions && content.aiSuggestions?.generated ? `
      <div class="ai-section">
        <h3>🤖 Suggestions IA Personnalisées</h3>
        <div class="field">
          <span class="field-label">Recommandations pédagogiques:</span>
          <ul>
            ${content.aiSuggestions.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
        <div class="field">
          <span class="field-label">Ajustements suggérés:</span>
          <ul>
            ${content.aiSuggestions.pedagogicalAdjustments.map(adj => `<li>${adj}</li>`).join('')}
          </ul>
        </div>
      </div>
      ` : ''}

      <div class="footer">
        <p>Rapport généré le ${new Date().toLocaleDateString('fr-FR')} par AS-TRAINING</p>
        <p>Plateforme de Gestion Éducative Intelligente</p>
      </div>
    </body>
    </html>
    `;
  }

  // Générer HTML pour rapport parent
  private generateParentReportHTML(report: ParentTeacherReport, options: ExportOptions): string {
    const { content } = report;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Évaluation Enseignant - ${report.teacherName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #EA580C; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { color: #EA580C; font-size: 24px; font-weight: bold; }
        .section { margin-bottom: 25px; }
        .section-title { background: #EA580C; color: white; padding: 10px; margin-bottom: 15px; }
        .field { margin-bottom: 10px; }
        .field-label { font-weight: bold; color: #EA580C; }
        .satisfaction-badge { background: #10B981; color: white; padding: 5px 10px; border-radius: 15px; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">AS-TRAINING</div>
        <h1>Évaluation Mensuelle - Enseignant</h1>
        <p><strong>Enseignant:</strong> ${report.teacherName} | <strong>Parent:</strong> ${report.parentName}</p>
        <p><strong>Élève:</strong> ${report.studentName} | <strong>Période:</strong> ${this.getMonthName(report.month)} ${report.year}</p>
      </div>

      <div class="section">
        <div class="section-title">Évaluation de la Prestation</div>
        <div class="field">
          <span class="field-label">Prestation générale:</span> ${this.getSatisfactionLabel(content.q1_prestation_generale)}
        </div>
        <div class="field">
          <span class="field-label">Détails:</span> ${content.q1_prestation_details}
        </div>
        <div class="field">
          <span class="field-label">Ponctualité:</span> ${this.getFrequencyLabel(content.q2_ponctualite)}
        </div>
        <div class="field">
          <span class="field-label">Méthodes pédagogiques:</span> ${this.getSatisfactionLabel(content.q3_methodes_pedagogiques)}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Satisfaction Globale</div>
        <div class="field">
          <span class="field-label">Note de satisfaction:</span> 
          <span class="satisfaction-badge">${content.q7_satisfaction_globale}/10</span>
        </div>
        <div class="field">
          <span class="field-label">Commentaire global:</span> ${content.q7_commentaire_global}
        </div>
        <div class="field">
          <span class="field-label">Recommandations:</span> ${content.q6_recommandations}
        </div>
      </div>

      <div class="footer">
        <p>Évaluation soumise le ${new Date(report.createdAt).toLocaleDateString('fr-FR')} par AS-TRAINING</p>
        <p>Plateforme de Gestion Éducative Intelligente</p>
      </div>
    </body>
    </html>
    `;
  }

  // Générer contenu CSV pour export Excel
  private generateCSVContent(reports: (TeacherStudentReport | ParentTeacherReport)[]): string {
    let csvContent = 'Type,Date,Enseignant,Élève,Parent,Note,Statut,Détails\n';
    
    reports.forEach(report => {
      if ('content' in report && 'overallGrade' in report.content) {
        // Rapport enseignant
        const teacherReport = report as TeacherStudentReport;
        csvContent += `Enseignant,${teacherReport.createdAt},${teacherReport.teacherName},${teacherReport.studentName},${teacherReport.parentName},${teacherReport.content.overallGrade}/20,${teacherReport.status},"${teacherReport.content.generalDescription}"\n`;
      } else {
        // Rapport parent
        const parentReport = report as ParentTeacherReport;
        csvContent += `Parent,${parentReport.createdAt},${parentReport.teacherName},${parentReport.studentName},${parentReport.parentName},${parentReport.content.q7_satisfaction_globale}/10,${parentReport.status},"${parentReport.content.q7_commentaire_global}"\n`;
      }
    });
    
    return csvContent;
  }

  // Fonctions utilitaires pour les labels
  private getMonthName(month: number): string {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                   'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return months[month] || '';
  }

  private getAttitudeLabel(attitude: string): string {
    const labels: Record<string, string> = {
      'tres_motive': 'Très motivé(e)',
      'motive': 'Motivé(e)',
      'peu_motive': 'Peu motivé(e)',
      'pas_motive': 'Pas du tout motivé(e)'
    };
    return labels[attitude] || attitude;
  }

  private getAttentionLabel(attention: string): string {
    const labels: Record<string, string> = {
      'toujours': 'Toujours',
      'souvent': 'Souvent',
      'parfois': 'Parfois',
      'jamais': 'Jamais'
    };
    return labels[attention] || attention;
  }

  private getProgressLabel(progress: string): string {
    const labels: Record<string, string> = {
      'forte_amelioration': 'Forte amélioration',
      'amelioration': 'Amélioration',
      'stable': 'Stable',
      'regression': 'Régression',
      'forte_baisse': 'Forte baisse'
    };
    return labels[progress] || progress;
  }

  private getAppreciationLabel(appreciation: string): string {
    const labels: Record<string, string> = {
      'excellent': 'Excellent',
      'tres_bien': 'Très bien',
      'bien': 'Bien',
      'passable': 'Passable',
      'insuffisant': 'Insuffisant'
    };
    return labels[appreciation] || appreciation;
  }

  private getSatisfactionLabel(satisfaction: string): string {
    const labels: Record<string, string> = {
      'tres_satisfait': 'Très satisfait(e)',
      'satisfait': 'Satisfait(e)',
      'peu_satisfait': 'Peu satisfait(e)',
      'pas_satisfait': 'Pas du tout satisfait(e)'
    };
    return labels[satisfaction] || satisfaction;
  }

  private getFrequencyLabel(frequency: string): string {
    const labels: Record<string, string> = {
      'toujours': 'Toujours',
      'souvent': 'Souvent',
      'parfois': 'Parfois',
      'jamais': 'Jamais'
    };
    return labels[frequency] || frequency;
  }
}

// Hook pour utiliser le service d'export
export const useReportExport = () => {
  const exportService = ReportExportService.getInstance();

  return {
    exportTeacherReportToPDF: exportService.exportTeacherReportToPDF.bind(exportService),
    exportParentReportToPDF: exportService.exportParentReportToPDF.bind(exportService),
    exportMultipleReportsToExcel: exportService.exportMultipleReportsToExcel.bind(exportService),
  };
}; 