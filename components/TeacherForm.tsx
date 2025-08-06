import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  useWindowDimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Upload, User, Mail, Phone, MapPin, BookOpen, GraduationCap, FileText, Camera, Copy, MessageCircle, CheckCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface TeacherFormData {
  nom: string;
  prenoms: string;
  profession: string;
  ville: string;
  matieres: string;
  telephone: string;
  email: string;
  formation: string;
  experience: string;
  cv?: string;
  photo?: string;
}

interface TeacherFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (teacher: any) => void;
  editingTeacher?: any;
}

interface GeneratedCredentials {
  codeId: string;
  motDePasse: string;
}

export default function TeacherForm({ visible, onClose, onSuccess, editingTeacher }: TeacherFormProps) {
  const [formData, setFormData] = useState<TeacherFormData>({
    nom: '',
    prenoms: '',
    profession: '',
    ville: '',
    matieres: '',
    telephone: '+225 ',
    email: '',
    formation: '',
    experience: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<GeneratedCredentials | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [cvUri, setCvUri] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  useEffect(() => {
    if (editingTeacher) {
      setFormData({
        nom: editingTeacher.nom || '',
        prenoms: editingTeacher.prenoms || '',
        profession: editingTeacher.profession || '',
        ville: editingTeacher.ville || '',
        matieres: editingTeacher.matieres || '',
        telephone: editingTeacher.telephone || '+225 ',
        email: editingTeacher.email || '',
        formation: editingTeacher.formation || '',
        experience: editingTeacher.experience || '',
        cv: editingTeacher.cv,
        photo: editingTeacher.photo,
      });
      setPhotoUri(editingTeacher.photo || null);
      setCvUri(editingTeacher.cv || null);
    } else {
      resetForm();
    }
  }, [editingTeacher, visible]);

  const resetForm = () => {
    setFormData({
      nom: '',
      prenoms: '',
      profession: '',
      ville: '',
      matieres: '',
      telephone: '+225 ',
      email: '',
      formation: '',
      experience: '',
    });
    setErrors({});
    setPhotoUri(null);
    setCvUri(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }

    if (!formData.prenoms.trim()) {
      newErrors.prenoms = 'Les prénoms sont obligatoires';
    }

    if (!formData.profession.trim()) {
      newErrors.profession = 'La profession est obligatoire';
    }

    if (!formData.ville.trim()) {
      newErrors.ville = 'La ville est obligatoire';
    }

    if (!formData.matieres.trim()) {
      newErrors.matieres = 'Les matières enseignées sont obligatoires';
    }

    if (!formData.telephone.trim() || formData.telephone === '+225 ') {
      newErrors.telephone = 'Le numéro de téléphone est obligatoire';
    } else if (!formData.telephone.startsWith('+225')) {
      newErrors.telephone = 'Le numéro doit commencer par +225';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.formation.trim()) {
      newErrors.formation = 'La formation est obligatoire';
    }

    // Validation de la photo (obligatoire)
    if (!photoUri && !editingTeacher?.photo) {
      newErrors.photo = 'La photo de profil est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateCredentials = (): GeneratedCredentials => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 9999) + 1;
    
    const codeId = `ENS-${month.toUpperCase()}-${year}${String(randomNum).padStart(4, '0')}`;
    const motDePasse = `Ens${year}@${randomNum}`;
    
    return { codeId, motDePasse };
  };

  const pickImage = async () => {
    try {
      // Demander la permission d'accès à la galerie
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission refusée', 'L\'autorisation d\'accès à la galerie est requise');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Format carré pour les photos de profil
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        setFormData({ ...formData, photo: result.assets[0].uri });
        // Supprimer l'erreur de photo si elle existait
        if (errors.photo) {
          const newErrors = { ...errors };
          delete newErrors.photo;
          setErrors(newErrors);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sélection d\'image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image. Vérifiez les permissions de l\'application.');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setCvUri(result.assets[0].uri);
        setFormData({ ...formData, cv: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de document:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le document PDF.');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Simulation de l'appel à l'action serveur
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!editingTeacher) {
        // Génération des identifiants pour un nouvel enseignant
        const credentials = generateCredentials();
        setGeneratedCredentials(credentials);
        setShowCredentials(true);
      }
      
      const teacherData = {
        id: editingTeacher?.id || `teacher_${Date.now()}`,
        ...formData,
        codeId: editingTeacher?.codeId || generatedCredentials?.codeId,
        statut: 'actif',
        dateCreation: editingTeacher?.dateCreation || new Date().toISOString(),
      };
      
      onSuccess(teacherData);
      
      if (editingTeacher) {
        Alert.alert('Succès', 'Enseignant modifié avec succès');
        onClose();
      }
      
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = (text: string) => {
    // Simulation de la copie dans le presse-papiers
    Alert.alert('Copié', `${text} copié dans le presse-papiers`);
  };

  const handleSendCredentials = (method: 'sms' | 'whatsapp') => {
    if (!generatedCredentials) return;
    
    const message = `Bonjour, voici vos identifiants AS-TRAINING:\nCode ID: ${generatedCredentials.codeId}\nMot de passe: ${generatedCredentials.motDePasse}\nTéléchargez l'app ASTRA Manager pour vous connecter.`;
    
    Alert.alert(
      'Envoi des identifiants',
      `Message ${method.toUpperCase()} préparé:\n\n${message}`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Envoyer', onPress: () => {
          Alert.alert('Succès', `Identifiants envoyés par ${method.toUpperCase()}`);
          onClose();
        }}
      ]
    );
  };

  const handleClose = () => {
    if (showCredentials) {
      setShowCredentials(false);
      setGeneratedCredentials(null);
    }
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, isDesktop && styles.modalContainerDesktop]}>
        <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {editingTeacher ? 'Modifier l\'enseignant' : 'Créer un profil enseignant'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {!showCredentials ? (
          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <View style={[styles.formContent, isDesktop && styles.formContentDesktop]}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations Personnelles</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nom *</Text>
                  <View style={styles.inputContainer}>
                    <User color="#6B7280" size={20} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Nom de famille"
                      value={formData.nom}
                      onChangeText={(text) => setFormData({ ...formData, nom: text })}
                    />
                  </View>
                  {errors.nom && <Text style={styles.errorText}>{errors.nom}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Prénoms *</Text>
                  <View style={styles.inputContainer}>
                    <User color="#6B7280" size={20} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Prénoms"
                      value={formData.prenoms}
                      onChangeText={(text) => setFormData({ ...formData, prenoms: text })}
                    />
                  </View>
                  {errors.prenoms && <Text style={styles.errorText}>{errors.prenoms}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Profession *</Text>
                  <View style={styles.inputContainer}>
                    <GraduationCap color="#6B7280" size={20} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ex: Enseignant de Mathématiques"
                      value={formData.profession}
                      onChangeText={(text) => setFormData({ ...formData, profession: text })}
                    />
                  </View>
                  {errors.profession && <Text style={styles.errorText}>{errors.profession}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Ville *</Text>
                  <View style={styles.inputContainer}>
                    <MapPin color="#6B7280" size={20} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ville de résidence"
                      value={formData.ville}
                      onChangeText={(text) => setFormData({ ...formData, ville: text })}
                    />
                  </View>
                  {errors.ville && <Text style={styles.errorText}>{errors.ville}</Text>}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations Professionnelles</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Matières enseignées *</Text>
                  <View style={styles.inputContainer}>
                    <BookOpen color="#6B7280" size={20} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ex: Mathématiques, Physique, Chimie"
                      value={formData.matieres}
                      onChangeText={(text) => setFormData({ ...formData, matieres: text })}
                      multiline
                    />
                  </View>
                  {errors.matieres && <Text style={styles.errorText}>{errors.matieres}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Formation / Diplômes *</Text>
                  <View style={styles.inputContainer}>
                    <GraduationCap color="#6B7280" size={20} />
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      placeholder="Listez vos diplômes (un par ligne)"
                      value={formData.formation}
                      onChangeText={(text) => setFormData({ ...formData, formation: text })}
                      multiline
                      numberOfLines={4}
                    />
                  </View>
                  {errors.formation && <Text style={styles.errorText}>{errors.formation}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Expérience Professionnelle</Text>
                  <View style={styles.inputContainer}>
                    <FileText color="#6B7280" size={20} />
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      placeholder="Décrivez votre expérience (une par ligne)"
                      value={formData.experience}
                      onChangeText={(text) => setFormData({ ...formData, experience: text })}
                      multiline
                      numberOfLines={4}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Téléphone *</Text>
                  <View style={styles.inputContainer}>
                    <Phone color="#6B7280" size={20} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="+225 XX XX XX XX XX"
                      value={formData.telephone}
                      onChangeText={(text) => setFormData({ ...formData, telephone: text })}
                      keyboardType="phone-pad"
                    />
                  </View>
                  {errors.telephone && <Text style={styles.errorText}>{errors.telephone}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email *</Text>
                  <View style={styles.inputContainer}>
                    <Mail color="#6B7280" size={20} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="email@exemple.com"
                      value={formData.email}
                      onChangeText={(text) => setFormData({ ...formData, email: text })}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Documents</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Photo de profil *</Text>
                  <TouchableOpacity style={[styles.fileUploadButton, photoUri && styles.fileUploadButtonSuccess]} onPress={pickImage}>
                    {photoUri ? (
                      <>
                        <CheckCircle color="#10B981" size={20} />
                        <Text style={[styles.fileUploadText, styles.fileUploadTextSuccess]}>Photo sélectionnée</Text>
                      </>
                    ) : (
                      <>
                        <Camera color="#3B82F6" size={20} />
                        <Text style={styles.fileUploadText}>Sélectionner une photo (JPG, PNG)</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  {photoUri && (
                    <View style={styles.imagePreview}>
                      <Image source={{ uri: photoUri }} style={styles.previewImage} />
                    </View>
                  )}
                  {errors.photo && <Text style={styles.errorText}>{errors.photo}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>CV (optionnel)</Text>
                  <TouchableOpacity style={[styles.fileUploadButton, cvUri && styles.fileUploadButtonSuccess]} onPress={pickDocument}>
                    {cvUri ? (
                      <>
                        <CheckCircle color="#10B981" size={20} />
                        <Text style={[styles.fileUploadText, styles.fileUploadTextSuccess]}>CV sélectionné</Text>
                      </>
                    ) : (
                      <>
                        <Upload color="#3B82F6" size={20} />
                        <Text style={styles.fileUploadText}>Sélectionner un CV (PDF)</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {editingTeacher ? 'Modifier' : 'Créer le profil'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.credentialsContainer}>
            <View style={[styles.credentialsContent, isDesktop && styles.credentialsContentDesktop]}>
              <View style={styles.successIcon}>
                <GraduationCap color="#10B981" size={48} />
              </View>
              
              <Text style={styles.credentialsTitle}>Enseignant créé avec succès !</Text>
              <Text style={styles.credentialsSubtitle}>
                Voici les identifiants générés pour {formData.prenoms} {formData.nom}
              </Text>

              <View style={styles.credentialCard}>
                <Text style={styles.credentialLabel}>Code Identifiant</Text>
                <View style={styles.credentialValue}>
                  <Text style={styles.credentialText}>{generatedCredentials?.codeId}</Text>
                  <TouchableOpacity 
                    onPress={() => handleCopyCredentials(generatedCredentials?.codeId || '')}
                    style={styles.copyButton}
                  >
                    <Copy color="#3B82F6" size={16} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.credentialCard}>
                <Text style={styles.credentialLabel}>Mot de passe temporaire</Text>
                <View style={styles.credentialValue}>
                  <Text style={styles.credentialText}>{generatedCredentials?.motDePasse}</Text>
                  <TouchableOpacity 
                    onPress={() => handleCopyCredentials(generatedCredentials?.motDePasse || '')}
                    style={styles.copyButton}
                  >
                    <Copy color="#3B82F6" size={16} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.credentialsNote}>
                L'enseignant devra changer son mot de passe lors de sa première connexion.
              </Text>

              <View style={styles.sendButtonsContainer}>
                <TouchableOpacity 
                  style={styles.sendButton}
                  onPress={() => handleSendCredentials('sms')}
                >
                  <MessageCircle color="#FFFFFF" size={20} />
                  <Text style={styles.sendButtonText}>Envoyer par SMS</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.sendButton, styles.whatsappButton]}
                  onPress={() => handleSendCredentials('whatsapp')}
                >
                  <MessageCircle color="#FFFFFF" size={20} />
                  <Text style={styles.sendButtonText}>Envoyer par WhatsApp</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.finishButton} onPress={handleClose}>
                <Text style={styles.finishButtonText}>Terminer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContainerDesktop: {
    width: '80%',
    maxWidth: 800,
    maxHeight: '85%',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  formContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  formContent: {
    // Default styles for mobile - full width
    width: '100%',
  },
  formContentDesktop: {
    // Styles for desktop screens - centered form
    width: '100%',
    maxWidth: 600, // Limite la largeur maximale du formulaire
    alignSelf: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  fileUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  fileUploadButtonSuccess: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  fileUploadText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 12,
    fontWeight: '500',
  },
  fileUploadTextSuccess: {
    color: '#10B981',
  },
  imagePreview: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingBottom: 40,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginLeft: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  credentialsContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  credentialsContent: {
    alignItems: 'center',
  },
  credentialsContentDesktop: {
    // Styles for desktop screens - centered credentials
    width: '100%',
    maxWidth: 500, // Limite la largeur maximale des identifiants
    alignSelf: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  credentialsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  credentialsSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  credentialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  credentialLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  credentialValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  credentialText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  copyButton: {
    padding: 8,
  },
  credentialsNote: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
  },
  sendButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
  },
  sendButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  finishButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});