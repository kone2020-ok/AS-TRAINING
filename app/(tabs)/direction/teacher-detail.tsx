import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  useWindowDimensions,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import PrintableCV from '@/components/PrintableCV';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Calendar,
  User,
  Edit,
  Trash2,
  Download,
  Eye,
  Copy,
  MessageCircle,
  Printer,
  FileImage
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { safeCopyToClipboard } from '../../../utils/PlatformUtils';

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

export default function TeacherDetail() {
  const { teacherId } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCVPreview, setShowCVPreview] = useState(false);

  // Données de démonstration - En production, ces données viendraient d'une API
  const demoTeachers: Teacher[] = [
    {
      id: 'teacher_1',
      nom: 'Kouassi',
      prenoms: 'Jean Baptiste',
      profession: 'Enseignant de Mathématiques',
      ville: 'Cocody',
      matieres: 'Mathématiques, Physique, Chimie',
      telephone: '+225 07 59 63 27 88',
      email: 'kouassi.jean@gmail.com',
      formation: 'Master en Mathématiques Appliquées\nLicence en Physique-Chimie',
      experience: 'Enseignant au Lycée Moderne de Cocody (5 ans)\nCours particuliers (3 ans)',
      codeId: 'ENS-JAN-20240001',
      statut: 'actif',
      dateCreation: '2024-01-15T10:00:00Z',
      photo: undefined, // Sera remplacé par l'URI de la photo téléversée
      cv: undefined, // Sera remplacé par l'URI du CV téléversé
    },
    {
      id: 'teacher_2',
      nom: 'N\'Guessan',
      prenoms: 'Marie Antoinette',
      profession: 'Enseignante de Français',
      ville: 'Marcory',
      matieres: 'Français, Littérature, Histoire-Géographie',
      telephone: '+225 05 67 89 12 34',
      email: 'nguessan.marie@gmail.com',
      formation: 'Master en Lettres Modernes\nCAPES de Français',
      experience: 'Enseignante au Collège Sainte-Marie (7 ans)\nCorrectrice au BEPC (2 ans)',
      codeId: 'ENS-JAN-20240002',
      statut: 'actif',
      dateCreation: '2024-01-20T14:30:00Z',
    },
  ];

  useEffect(() => {
    // Simulation du chargement des données
    const loadTeacherData = async () => {
      setLoading(true);
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundTeacher = demoTeachers.find(t => t.id === teacherId);
      setTeacher(foundTeacher || null);
      setLoading(false);
    };

    if (teacherId) {
      loadTeacherData();
    }
  }, [teacherId]);

  const handleGoBack = () => {
    router.back();
  };

  const handleEdit = () => {
    // Navigation vers le formulaire d'édition
    router.push({
      pathname: '/(tabs)/direction/teachers',
      params: { editTeacherId: teacher?.id }
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer l'enseignant ${teacher?.prenoms} ${teacher?.nom} ?\n\nCette action supprimera définitivement :\n• Toutes les informations personnelles\n• Les documents associés (CV, photo)\n• L'historique des cours\n\nCette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            // Ici vous pouvez appeler votre API de suppression
            Alert.alert('Succès', `L'enseignant ${teacher?.prenoms} ${teacher?.nom} a été supprimé avec succès.`, [
              { text: 'OK', onPress: () => router.back() }
            ]);
          }
        }
      ]
    );
  };

  const handleCall = () => {
    if (!teacher?.telephone) return;
    
    Alert.alert(
      'Appeler l\'enseignant',
      `Voulez-vous appeler ${teacher.prenoms} ${teacher.nom} au ${teacher.telephone} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Appeler', 
          onPress: () => {
            // Sur mobile, cela ouvrira l'application de téléphone
            if (typeof window !== 'undefined') {
              // Pour le web
              window.open(`tel:${teacher.telephone}`, '_self');
            } else {
              // Pour React Native
              import('react-native').then(({ Linking }) => {
                Linking.openURL(`tel:${teacher.telephone}`);
              });
            }
          }
        }
      ]
    );
  };

  const handleSendMessage = () => {
    if (!teacher?.telephone) return;
    
    Alert.alert(
      'Envoyer un message',
      `Choisissez le mode de communication avec ${teacher.prenoms} ${teacher.nom} :`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'SMS', 
          onPress: () => {
            if (typeof window !== 'undefined') {
              window.open(`sms:${teacher.telephone}`, '_self');
            } else {
              import('react-native').then(({ Linking }) => {
                Linking.openURL(`sms:${teacher.telephone}`);
              });
            }
          }
        },
        { 
          text: 'WhatsApp', 
          onPress: () => {
            const whatsappUrl = `https://wa.me/${teacher.telephone.replace(/\D/g, '')}`;
            if (typeof window !== 'undefined') {
              window.open(whatsappUrl, '_blank');
            } else {
              import('react-native').then(({ Linking }) => {
                Linking.openURL(whatsappUrl);
              });
            }
          }
        }
      ]
    );
  };

  const handleDownloadCV = () => {
    if (!teacher?.cv) return;
    
    Alert.alert(
      'Télécharger le CV',
      `Voulez-vous télécharger le CV de ${teacher.prenoms} ${teacher.nom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Télécharger', 
          onPress: () => {
            if (typeof window !== 'undefined') {
              // Pour le web
              const link = document.createElement('a');
              link.href = teacher.cv!;
              link.download = `CV_${teacher.prenoms}_${teacher.nom}.pdf`;
              link.click();
            } else {
              // Pour React Native, vous pourriez utiliser expo-file-system
              Alert.alert('Téléchargement', 'Téléchargement en cours...');
            }
          }
        }
      ]
    );
  };

  const handleCopyInfo = (info: string, label: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(info).then(() => {
        Alert.alert('Copié', `${label} copié dans le presse-papiers`);
      });
    } else {
      import('@react-native-clipboard/clipboard').then(({ default: Clipboard }) => {
        Clipboard.setString(info);
        Alert.alert('Copié', `${label} copié dans le presse-papiers`);
      }).catch(() => {
        Alert.alert('Copié', `${label} : ${info}`);
      });
    }
  };

  const handlePrintCV = () => {
    if (!teacher) return;
    
    Alert.alert(
      'Imprimer le CV',
      `Voulez-vous imprimer le CV professionnel de ${teacher.prenoms} ${teacher.nom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Prévisualiser', onPress: () => setShowCVPreview(true) },
        { 
          text: 'Imprimer', 
          onPress: () => {
            if (Platform.OS === 'web') {
              // Pour le web, on ouvre la prévisualisation et utilise window.print()
              setShowCVPreview(true);
              setTimeout(() => {
                if (typeof window !== 'undefined') {
                  window.print();
                }
              }, 500);
            } else {
              // Pour mobile, on utilise expo-print ou react-native-print
              Alert.alert('Impression', 'Préparation de l\'impression...');
              // Ici vous pourriez intégrer expo-print pour l'impression mobile
            }
          }
        }
      ]
    );
  };

  const handleExportCV = () => {
    if (!teacher) return;
    
    Alert.alert(
      'Exporter le CV',
      `Choisissez le format d'export pour le CV de ${teacher.prenoms} ${teacher.nom} :`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'PDF', 
          onPress: () => {
            if (Platform.OS === 'web') {
              // Simulation de génération PDF
              Alert.alert('Export PDF', 'Génération du PDF en cours...');
              // Ici vous pourriez intégrer jsPDF ou html2canvas pour générer un PDF
            } else {
              Alert.alert('Export PDF', 'Génération du PDF...');
              // Ici vous pourriez utiliser expo-print pour générer un PDF
            }
          }
        },
        { 
          text: 'Image', 
          onPress: () => {
            Alert.alert('Export Image', 'Génération de l\'image en cours...');
            // Ici vous pourriez utiliser react-native-view-shot pour capturer une image
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  if (!teacher) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Enseignant non trouvé</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil Enseignant</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEdit} style={styles.headerActionButton}>
              <Edit color="#FFFFFF" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.headerActionButton}>
              <Trash2 color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {teacher.photo ? (
              <Image source={{ uri: teacher.photo }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getInitials(teacher.nom, teacher.prenoms)}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.fullName}>{teacher.prenoms} {teacher.nom}</Text>
            <Text style={styles.profession}>{teacher.profession}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(teacher.statut) }]}>
              <Text style={styles.statusText}>
                {teacher.statut.charAt(0).toUpperCase() + teacher.statut.slice(1)}
              </Text>
            </View>
            <Text style={styles.teacherId}>ID: {teacher.codeId}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Phone color="#FFFFFF" size={16} />
            <Text style={styles.actionButtonText}>Appeler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.messageButton]} onPress={handleSendMessage}>
            <MessageCircle color="#FFFFFF" size={16} />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.printButton]} onPress={handlePrintCV}>
            <Printer color="#FFFFFF" size={16} />
            <Text style={styles.actionButtonText}>CV</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.exportButton]} onPress={handleExportCV}>
            <FileImage color="#FFFFFF" size={16} />
            <Text style={styles.actionButtonText}>Export</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleEdit}>
            <Edit color="#FFFFFF" size={16} />
            <Text style={styles.actionButtonText}>Modifier</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de Contact</Text>
          
          <TouchableOpacity 
            style={styles.infoRow} 
            onPress={() => handleCopyInfo(teacher.telephone, 'Numéro de téléphone')}
          >
            <View style={styles.infoIcon}>
              <Phone color="#3B82F6" size={20} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{teacher.telephone}</Text>
            </View>
            <Copy color="#9CA3AF" size={16} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.infoRow} 
            onPress={() => handleCopyInfo(teacher.email, 'Adresse email')}
          >
            <View style={styles.infoIcon}>
              <Mail color="#3B82F6" size={20} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{teacher.email}</Text>
            </View>
            <Copy color="#9CA3AF" size={16} />
          </TouchableOpacity>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MapPin color="#3B82F6" size={20} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ville</Text>
              <Text style={styles.infoValue}>{teacher.ville}</Text>
            </View>
          </View>
        </View>

        {/* Professional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Professionnelles</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <BookOpen color="#10B981" size={20} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Matières enseignées</Text>
              <Text style={styles.infoValue}>{teacher.matieres}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <GraduationCap color="#10B981" size={20} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Formation</Text>
              <Text style={styles.infoValue}>{teacher.formation}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <FileText color="#10B981" size={20} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Expérience</Text>
              <Text style={styles.infoValue}>{teacher.experience}</Text>
            </View>
          </View>
        </View>

        {/* Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>
          
          {teacher.cv ? (
            <TouchableOpacity style={styles.documentRow} onPress={handleDownloadCV}>
              <View style={styles.documentIcon}>
                <FileText color="#EF4444" size={20} />
              </View>
              <View style={styles.documentContent}>
                <Text style={styles.documentName}>Curriculum Vitae</Text>
                <Text style={styles.documentType}>PDF Document</Text>
              </View>
              <Download color="#9CA3AF" size={16} />
            </TouchableOpacity>
          ) : (
            <View style={styles.noDocumentRow}>
              <Text style={styles.noDocumentText}>Aucun CV téléversé</Text>
            </View>
          )}
        </View>

        {/* Administrative Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Administratives</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Calendar color="#F59E0B" size={20} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date de création du profil</Text>
              <Text style={styles.infoValue}>{formatDate(teacher.dateCreation)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal de prévisualisation du CV */}
      <Modal visible={showCVPreview} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.cvModalContainer}>
          <View style={styles.cvModalHeader}>
            <Text style={styles.cvModalTitle}>Prévisualisation du CV</Text>
            <View style={styles.cvModalActions}>
              <TouchableOpacity 
                style={styles.cvModalButton} 
                onPress={() => {
                  if (Platform.OS === 'web' && typeof window !== 'undefined') {
                    window.print();
                  } else {
                    Alert.alert('Impression', 'Impression en cours...');
                  }
                }}
              >
                <Printer color="#3B82F6" size={20} />
                <Text style={styles.cvModalButtonText}>Imprimer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.cvModalButton, styles.cvModalCloseButton]} 
                onPress={() => setShowCVPreview(false)}
              >
                <Text style={styles.cvModalCloseText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView style={styles.cvModalContent}>
            {teacher && <PrintableCV teacher={teacher} />}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
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
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerActionButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#059669',
  },
  profileInfo: {
    alignItems: 'center',
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  profession: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  teacherId: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    flex: 1,
    marginHorizontal: 2,
    marginVertical: 4,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  messageButton: {
    backgroundColor: '#10B981',
  },
  printButton: {
    backgroundColor: '#8B5CF6',
  },
  exportButton: {
    backgroundColor: '#EF4444',
  },
  editButton: {
    backgroundColor: '#F59E0B',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    lineHeight: 22,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentContent: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  documentType: {
    fontSize: 14,
    color: '#6B7280',
  },
  noDocumentRow: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  noDocumentText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  cvModalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  cvModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cvModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cvModalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cvModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
    backgroundColor: '#F3F4F6',
  },
  cvModalCloseButton: {
    backgroundColor: '#EF4444',
  },
  cvModalButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 8,
  },
  cvModalCloseText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cvModalContent: {
    flex: 1,
  },
}); 