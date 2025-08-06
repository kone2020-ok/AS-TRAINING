import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  GraduationCap,
  BookOpen,
  Briefcase,
  User
} from 'lucide-react-native';

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

interface PrintableCVProps {
  teacher: Teacher;
}

export default function PrintableCV({ teacher }: PrintableCVProps) {
  const getInitials = (nom: string, prenoms: string) => {
    return `${prenoms.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFormation = (formation: string) => {
    return formation.split('\n').filter(item => item.trim() !== '');
  };

  const formatExperience = (experience: string) => {
    return experience.split('\n').filter(item => item.trim() !== '');
  };

  const formatMatieres = (matieres: string) => {
    return matieres.split(',').map(matiere => matiere.trim());
  };

  return (
    <View style={styles.container}>
      {/* En-tête du CV */}
      <LinearGradient 
        colors={['#1E40AF', '#3B82F6']} 
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.photoSection}>
            {teacher.photo ? (
              <Image source={{ uri: teacher.photo }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.initialsText}>{getInitials(teacher.nom, teacher.prenoms)}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.fullName}>{teacher.prenoms} {teacher.nom}</Text>
            <Text style={styles.profession}>{teacher.profession}</Text>
            <Text style={styles.teacherId}>ID: {teacher.codeId}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Informations de contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>COORDONNÉES</Text>
        <View style={styles.contactGrid}>
          <View style={styles.contactItem}>
            <Phone color="#1E40AF" size={16} />
            <Text style={styles.contactText}>{teacher.telephone}</Text>
          </View>
          <View style={styles.contactItem}>
            <Mail color="#1E40AF" size={16} />
            <Text style={styles.contactText}>{teacher.email}</Text>
          </View>
          <View style={styles.contactItem}>
            <MapPin color="#1E40AF" size={16} />
            <Text style={styles.contactText}>{teacher.ville}</Text>
          </View>
          <View style={styles.contactItem}>
            <Calendar color="#1E40AF" size={16} />
            <Text style={styles.contactText}>Depuis le {formatDate(teacher.dateCreation)}</Text>
          </View>
        </View>
      </View>

      {/* Matières enseignées */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MATIÈRES ENSEIGNÉES</Text>
        <View style={styles.subjectsContainer}>
          {formatMatieres(teacher.matieres).map((matiere, index) => (
            <View key={index} style={styles.subjectTag}>
              <BookOpen color="#059669" size={14} />
              <Text style={styles.subjectText}>{matiere}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Formation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FORMATION ACADÉMIQUE</Text>
        <View style={styles.formationContainer}>
          <GraduationCap color="#1E40AF" size={20} style={styles.sectionIcon} />
          <View style={styles.formationContent}>
            {formatFormation(teacher.formation).map((diplome, index) => (
              <View key={index} style={styles.formationItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.formationText}>{diplome}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Expérience professionnelle */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EXPÉRIENCE PROFESSIONNELLE</Text>
        <View style={styles.experienceContainer}>
          <Briefcase color="#1E40AF" size={20} style={styles.sectionIcon} />
          <View style={styles.experienceContent}>
            {formatExperience(teacher.experience).map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.experienceText}>{exp}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Pied de page */}
      <View style={styles.footer}>
        <View style={styles.footerLine} />
        <Text style={styles.footerText}>
          CV généré par AS-TRAINING • {new Date().toLocaleDateString('fr-FR')}
        </Text>
        <Text style={styles.footerSubtext}>
          Statut: {teacher.statut.charAt(0).toUpperCase() + teacher.statut.slice(1)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    minHeight: '100%',
  },
  header: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoSection: {
    marginRight: 24,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  initialsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  headerInfo: {
    flex: 1,
  },
  fullName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  profession: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  teacherId: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'monospace',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 16,
    letterSpacing: 0.5,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subjectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#059669',
  },
  subjectText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginLeft: 6,
  },
  formationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  formationContent: {
    flex: 1,
    marginLeft: 12,
  },
  formationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#1E40AF',
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 2,
  },
  formationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    flex: 1,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  experienceContent: {
    flex: 1,
    marginLeft: 12,
  },
  experienceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  experienceText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    flex: 1,
  },
  sectionIcon: {
    marginTop: 2,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
  },
}); 