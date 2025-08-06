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
import { X, Upload, User, Mail, Phone, MapPin, Camera, Copy, MessageCircle, Plus, Minus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNotificationTriggers } from '../services/NotificationTriggers';

interface ParentFormData {
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  latitude: string;
  longitude: string;
  enfants: string[];
  photo?: string;
}

interface ParentFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (parent: any) => void;
  editingParent?: any;
}

interface GeneratedCredentials {
  codeId: string;
  motDePasse: string;
  qrCode: string;
}

export default function ParentForm({ visible, onClose, onSuccess, editingParent }: ParentFormProps) {
  const [formData, setFormData] = useState<ParentFormData>({
    nom: '',
    prenoms: '',
    email: '',
    telephone: '+225 ',
    adresse: '',
    ville: '',
    latitude: '',
    longitude: '',
    enfants: [''],
  });
  
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<GeneratedCredentials | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const triggers = useNotificationTriggers();

  useEffect(() => {
    if (editingParent) {
      setFormData({
        nom: editingParent.nom || '',
        prenoms: editingParent.prenoms || '',
        email: editingParent.email || '',
        telephone: editingParent.telephone || '+225 ',
        adresse: editingParent.adresse || '',
        ville: editingParent.ville || '',
        latitude: editingParent.latitude || '',
        longitude: editingParent.longitude || '',
        enfants: editingParent.enfants || [''],
        photo: editingParent.photo,
      });
      setPhotoUri(editingParent.photo || null);
    } else {
      resetForm();
    }
  }, [editingParent, visible]);

  const resetForm = () => {
    setFormData({
      nom: '',
      prenoms: '',
      email: '',
      telephone: '+225 ',
      adresse: '',
      ville: '',
      latitude: '',
      longitude: '',
      enfants: [''],
    });
    setErrors({});
    setPhotoUri(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }

    if (!formData.prenoms.trim()) {
      newErrors.prenoms = 'Les prénoms sont obligatoires';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.telephone.trim() || formData.telephone === '+225 ') {
      newErrors.telephone = 'Le numéro de téléphone est obligatoire';
    } else if (!formData.telephone.startsWith('+225')) {
      newErrors.telephone = 'Le numéro doit commencer par +225';
    }

    if (!formData.adresse.trim()) {
      newErrors.adresse = 'L\'adresse est obligatoire';
    }

    if (!formData.ville.trim()) {
      newErrors.ville = 'La ville est obligatoire';
    }

    // Validation des enfants
    const validChildren = formData.enfants.filter(enfant => enfant.trim() !== '');
    if (validChildren.length === 0) {
      newErrors.enfants = 'Au moins un enfant doit être renseigné';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateCredentials = (): GeneratedCredentials => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 9999) + 1;
    
    const codeId = `PAR-${month.toUpperCase()}-${year}${String(randomNum).padStart(4, '0')}`;
    const motDePasse = `Fam${year}@${randomNum}`;
    const qrCode = `QR_${codeId}`;
    
    return { codeId, motDePasse, qrCode };
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Simulation de l'appel à l'API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let credentials = null;
      if (!editingParent) {
        // Génération des identifiants pour un nouveau parent
        credentials = generateCredentials();
        setGeneratedCredentials(credentials);
        setShowCredentials(true);
      }
      
      const parentData = {
        id: editingParent?.id || `parent_${Date.now()}`,
        ...formData,
        enfants: formData.enfants.filter(enfant => enfant.trim() !== ''),
        codeId: editingParent?.codeId || credentials?.codeId,
        qrCode: editingParent?.qrCode || credentials?.qrCode,
        statut: 'actif',
        dateCreation: editingParent?.dateCreation || new Date().toISOString(),
        photo: photoUri,
      };
      
      // Déclencher les notifications appropriées
      if (!editingParent) {
        // Nouveau parent créé
        await triggers.onParentCreated({
          userId: parentData.id,
          userRole: 'parent',
          metadata: {
            prenoms: parentData.prenoms,
            nom: parentData.nom,
            email: parentData.email,
            telephone: parentData.telephone,
            enfants: parentData.enfants,
            codeId: parentData.codeId,
            ville: parentData.ville
          }
        });
      } else {
        // Parent modifié
        const changedFields = [];
        if (editingParent.email !== parentData.email) changedFields.push('email');
        if (editingParent.telephone !== parentData.telephone) changedFields.push('téléphone');
        if (editingParent.adresse !== parentData.adresse) changedFields.push('adresse');
        
        await triggers.onParentUpdated({
          userId: parentData.id,
          userRole: 'parent',
          metadata: {
            prenoms: parentData.prenoms,
            nom: parentData.nom,
            significantChange: changedFields.length > 0,
            changedFields: changedFields
          }
        });
      }
      
      onSuccess(parentData);
      
      if (editingParent) {
        Alert.alert('Succès', 'Parent modifié avec succès');
        onClose();
      }
      
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission refusée', 'L\'autorisation d\'accès à la galerie est requise');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        setFormData({ ...formData, photo: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const addChild = () => {
    setFormData({
      ...formData,
      enfants: [...formData.enfants, '']
    });
  };

  const removeChild = (index: number) => {
    if (formData.enfants.length > 1) {
      const newChildren = formData.enfants.filter((_, i) => i !== index);
      setFormData({ ...formData, enfants: newChildren });
    }
  };

  const updateChild = (index: number, value: string) => {
    const newChildren = [...formData.enfants];
    newChildren[index] = value;
    setFormData({ ...formData, enfants: newChildren });
  };

  const handleCopyCredentials = (text: string) => {
    Alert.alert('Copié', `${text} copié dans le presse-papiers`);
  };

  const handleSendCredentials = (method: 'sms' | 'whatsapp') => {
    if (!generatedCredentials) return;
    
    const message = `Bonjour, voici vos identifiants AS-TRAINING:\nCode ID: ${generatedCredentials.codeId}\nMot de passe: ${generatedCredentials.motDePasse}\nCode QR: ${generatedCredentials.qrCode}\nTéléchargez l'app ASTRA Manager pour vous connecter.`;
    
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
                {editingParent ? 'Modifier le parent' : 'Créer un profil parent'}
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
                    <Text style={styles.inputLabel}>Photo de profil</Text>
                    <TouchableOpacity style={[styles.photoUploadButton, photoUri && styles.photoUploadButtonSuccess]} onPress={pickImage}>
                      {photoUri ? (
                        <Image source={{ uri: photoUri }} style={styles.previewImage} />
                      ) : (
                        <>
                          <Camera color="#3B82F6" size={32} />
                          <Text style={styles.photoUploadText}>Ajouter une photo</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

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
                  <Text style={styles.sectionTitle}>Adresse</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Adresse complète *</Text>
                    <View style={styles.inputContainer}>
                      <MapPin color="#6B7280" size={20} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Rue, quartier, commune"
                        value={formData.adresse}
                        onChangeText={(text) => setFormData({ ...formData, adresse: text })}
                        multiline
                      />
                    </View>
                    {errors.adresse && <Text style={styles.errorText}>{errors.adresse}</Text>}
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

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Latitude</Text>
                    <View style={styles.inputContainer}>
                      <MapPin color="#6B7280" size={20} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Ex: 5.316667 (coordonnée GPS)"
                        value={formData.latitude}
                        onChangeText={(text) => setFormData({ ...formData, latitude: text })}
                        keyboardType="numeric"
                      />
                    </View>
                    {errors.latitude && <Text style={styles.errorText}>{errors.latitude}</Text>}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Longitude</Text>
                    <View style={styles.inputContainer}>
                      <MapPin color="#6B7280" size={20} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Ex: -4.033333 (coordonnée GPS)"
                        value={formData.longitude}
                        onChangeText={(text) => setFormData({ ...formData, longitude: text })}
                        keyboardType="numeric"
                      />
                    </View>
                    {errors.longitude && <Text style={styles.errorText}>{errors.longitude}</Text>}
                  </View>
                </View>

                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Enfants</Text>
                    <TouchableOpacity style={styles.addChildButton} onPress={addChild}>
                      <Plus color="#3B82F6" size={20} />
                      <Text style={styles.addChildText}>Ajouter</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {formData.enfants.map((enfant, index) => (
                    <View key={index} style={styles.childInputGroup}>
                      <View style={styles.childInputContainer}>
                        <User color="#6B7280" size={20} />
                        <TextInput
                          style={styles.textInput}
                          placeholder={`Nom complet enfant ${index + 1}`}
                          value={enfant}
                          onChangeText={(text) => updateChild(index, text)}
                        />
                        {formData.enfants.length > 1 && (
                          <TouchableOpacity
                            style={styles.removeChildButton}
                            onPress={() => removeChild(index)}
                          >
                            <Minus color="#EF4444" size={20} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                  {errors.enfants && <Text style={styles.errorText}>{errors.enfants}</Text>}
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
                        {editingParent ? 'Modifier' : 'Créer le profil'}
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
                  <User color="#10B981" size={48} />
                </View>
                
                <Text style={styles.credentialsTitle}>Famille créée avec succès !</Text>
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

                <View style={styles.credentialCard}>
                  <Text style={styles.credentialLabel}>Code QR</Text>
                  <View style={styles.credentialValue}>
                    <Text style={styles.credentialText}>{generatedCredentials?.qrCode}</Text>
                    <TouchableOpacity 
                      onPress={() => handleCopyCredentials(generatedCredentials?.qrCode || '')}
                      style={styles.copyButton}
                    >
                      <Copy color="#3B82F6" size={16} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.credentialsNote}>
                  La famille devra changer son mot de passe lors de sa première connexion.
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
    width: '100%',
  },
  formContentDesktop: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addChildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  addChildText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  childInputGroup: {
    marginBottom: 12,
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
  childInputContainer: {
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
  removeChildButton: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  photoUploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginBottom: 12,
    minHeight: 120,
  },
  photoUploadButtonSuccess: {
    borderColor: '#10B981',
    borderStyle: 'solid',
  },
  photoUploadText: {
    fontSize: 14,
    color: '#3B82F6',
    marginTop: 8,
    fontWeight: '500',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    width: '100%',
    maxWidth: 500,
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