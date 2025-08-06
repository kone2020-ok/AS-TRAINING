import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Phone, Mail, MapPin, Calendar, Users, QrCode } from 'lucide-react-native';

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

interface PrintableParentProfileProps {
  parent: Parent;
}

export default function PrintableParentProfile({ parent }: PrintableParentProfileProps) {
  const getInitials = (nom: string, prenoms: string) => {
    return `${prenoms.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {/* Header avec gradient */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoSection}>
            {parent.photo ? (
              <Image source={{ uri: parent.photo }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={styles.profileInitials}>
                  {getInitials(parent.nom, parent.prenoms)}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.titleSection}>
            <Text style={styles.fullName}>
              {parent.prenoms} {parent.nom}
            </Text>
            <Text style={styles.role}>Parent d'élève</Text>
            <Text style={styles.codeId}>ID: {parent.codeId}</Text>
          </View>
          
          <View style={styles.brandSection}>
            <Text style={styles.brandName}>AS-TRAINING</Text>
            <Text style={styles.brandSubtitle}>Groupe Educatif</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Contenu principal */}
      <View style={styles.content}>
        {/* Informations de contact */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Phone color="#1E40AF" size={24} />
            <Text style={styles.sectionTitle}>INFORMATIONS DE CONTACT</Text>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{parent.telephone}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{parent.email}</Text>
            </View>
            
            <View style={[styles.infoItem, styles.fullWidth]}>
              <Text style={styles.infoLabel}>Adresse complète</Text>
              <Text style={styles.infoValue}>{parent.adresse}</Text>
              <Text style={styles.infoValue}>{parent.ville}</Text>
            </View>
          </View>
        </View>

        {/* Enfants inscrits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users color="#1E40AF" size={24} />
            <Text style={styles.sectionTitle}>ENFANTS INSCRITS</Text>
          </View>
          
          <View style={styles.childrenList}>
            {parent.enfants.map((enfant, index) => (
              <View key={index} style={styles.childItem}>
                <View style={styles.childNumber}>
                  <Text style={styles.childNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.childDetails}>
                  <Text style={styles.childName}>{enfant}</Text>
                  <Text style={styles.childStatus}>Élève actif</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Informations système */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar color="#1E40AF" size={24} />
            <Text style={styles.sectionTitle}>INFORMATIONS ADMINISTRATIVES</Text>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date d'inscription</Text>
              <Text style={styles.infoValue}>{formatDate(parent.dateCreation)}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Statut</Text>
              <Text style={[styles.infoValue, styles.statusActive]}>
                {parent.statut.charAt(0).toUpperCase() + parent.statut.slice(1)}
              </Text>
            </View>
            
            <View style={[styles.infoItem, styles.fullWidth]}>
              <Text style={styles.infoLabel}>Code QR</Text>
              <Text style={styles.infoValue}>{parent.qrCode}</Text>
            </View>
          </View>
        </View>

        {/* Notes importantes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Notes importantes :</Text>
          <Text style={styles.notesText}>
            • Ce profil contient les informations officielles de la famille {parent.prenoms} {parent.nom}
          </Text>
          <Text style={styles.notesText}>
            • Pour toute modification, contactez l'administration
          </Text>
          <Text style={styles.notesText}>
            • Le code QR permet l'accès aux services numériques AS-TRAINING
          </Text>
          <Text style={styles.notesText}>
            • Nombre total d'enfants inscrits : {parent.enfants.length}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Text style={styles.footerText}>
            Document généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
          </Text>
          <Text style={styles.footerBrand}>
            AS-TRAINING • Groupe Educatif • www.as-training.ci
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    minHeight: 800,
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profilePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  titleSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  fullName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  codeId: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  brandSection: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  content: {
    padding: 40,
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 16,
  },
  fullWidth: {
    width: '100%',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  statusActive: {
    color: '#10B981',
    fontWeight: '600',
  },
  childrenList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  childNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  childNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  childStatus: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
  },
  notesSection: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 12,
  },
  notesText: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 6,
    lineHeight: 18,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 20,
    paddingHorizontal: 40,
    backgroundColor: '#F8FAFC',
  },
  footerContent: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  footerBrand: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
  },
}); 