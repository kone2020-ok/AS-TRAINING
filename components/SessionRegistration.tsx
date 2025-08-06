import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  TextInput,
  useWindowDimensions,
  Platform,
  Animated,
  KeyboardAvoidingView,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Camera,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  BookOpen,
  FileText,
  MessageCircle,
  Send,
  XCircle,
  Loader,
  QrCode,
  ChevronLeft,
  ChevronRight,
  Info,
  HelpCircle,
  Zap,
  Shield,
  Smartphone,
  Monitor
} from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { 
  SessionFormData,
  SessionSubject,
  ParentQRData,
  LocationData,
  SESSION_SUBJECTS,
  calculateSessionDuration,
  calculateDistance,
  validateSessionTime,
  detectAnomalies,
  generateSessionId,
  MAX_DISTANCE_FROM_HOME,
  FRAUD_DETECTION_RADIUS,
  formatDuration
} from '../types/Session';
import { useNotificationTriggers } from '../services/NotificationTriggers';
import { safeScanBarcode } from '../utils/PlatformUtils';

interface SessionRegistrationProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teacherId: string;
  teacherName: string;
}

type RegistrationStep = 'permissions' | 'scan_qr' | 'form' | 'processing';

export default function SessionRegistration({
  visible,
  onClose,
  onSuccess,
  teacherId,
  teacherName
}: SessionRegistrationProps) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 768;
  const notificationTriggers = useNotificationTriggers();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // États principaux
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('permissions');
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // États des permissions
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  // États de géolocalisation
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // États du scan QR
  const [scannedQR, setScannedQR] = useState<ParentQRData | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  // États du formulaire
  const [formData, setFormData] = useState<SessionFormData>({
    studentId: '',
    studentName: '',
    parentId: '',
    dateSeance: new Date().toISOString().split('T')[0],
    heureDebut: '',
    heureFin: '',
    matieres: [],
    chapitres: '',
    objetSeance: '',
    observations: '',
    commentaires: '',
    dureeMinutes: 0
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Ajouter ces états dans le composant SessionRegistration
  const [qrScanStep, setQrScanStep] = useState<'scan' | 'parent_detected' | 'child_selection'>('scan');
  const [scannedParentData, setScannedParentData] = useState<any>(null);
  const [selectedChild, setSelectedChild] = useState<string>('');

  // Réinitialisation lors de l'ouverture/fermeture
  useEffect(() => {
    if (visible) {
      resetForm();
      setCurrentStep('permissions');
      // Animations d'entrée
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      // Animations de sortie
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 50, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.9, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  // Animation de progression
  useEffect(() => {
    const stepIndex = ['permissions', 'scan_qr', 'form'].indexOf(currentStep);
    Animated.timing(progressAnim, {
      toValue: (stepIndex + 1) / 3,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // Gestion du bouton retour Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        if (currentStep === 'permissions') {
          onClose();
          return true;
        } else {
          // Retour à l'étape précédente
          const steps = ['permissions', 'scan_qr', 'form'];
          const currentIndex = steps.indexOf(currentStep);
          if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1] as RegistrationStep);
            return true;
          }
        }
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, currentStep]);

  // Raccourcis clavier pour web
  useEffect(() => {
    if (!isDesktop || !visible) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'Enter':
          if (currentStep === 'permissions') {
            requestPermissions();
          } else if (currentStep === 'scan_qr') {
            startQRScan();
          } else if (currentStep === 'form') {
            handleSubmit();
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          const steps = ['permissions', 'scan_qr', 'form'];
          const currentIndex = steps.indexOf(currentStep);
          if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1] as RegistrationStep);
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          const nextSteps = ['permissions', 'scan_qr', 'form'];
          const nextIndex = nextSteps.indexOf(currentStep);
          if (nextIndex < 2) {
            setCurrentStep(nextSteps[nextIndex + 1] as RegistrationStep);
          }
          break;
        case 'h':
        case 'H':
          event.preventDefault();
          setShowHelp(!showHelp);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [visible, currentStep, isDesktop]);

  const resetForm = () => {
    setCurrentLocation(null);
    setScannedQR(null);
    setQrError(null);
    setLocationError(null);
    setFormErrors({});
    setFormData({
      studentId: '',
      studentName: '',
      parentId: '',
      dateSeance: new Date().toISOString().split('T')[0],
      heureDebut: '',
      heureFin: '',
      matieres: [],
      chapitres: '',
      objetSeance: '',
      observations: '',
      commentaires: '',
      dureeMinutes: 0
    });
  };

  // ÉTAPE 1: Demande des permissions
  const requestPermissions = async () => {
    setLoading(true);
    
    try {
      // Permission caméra
      const cameraResult = await BarCodeScanner.requestPermissionsAsync();
      setCameraPermission(cameraResult.status === 'granted');

      // Permission géolocalisation
      const locationResult = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(locationResult.status === 'granted');

      // Vérifier si au moins une permission est refusée
      const hasDeniedPermissions = cameraResult.status === 'denied' || locationResult.status === 'denied';
      
      if (cameraResult.status === 'granted' && locationResult.status === 'granted') {
        setCurrentStep('scan_qr');
      } else if (hasDeniedPermissions) {
        // Afficher un avertissement si des permissions sont refusées
        Alert.alert(
          '⚠️ Permissions Partiellement Refusées',
          'Certaines permissions ont été refusées. Vous pouvez continuer mais certaines fonctionnalités seront limitées.',
          [
            { 
              text: 'Continuer', 
              onPress: () => {
                // Permettre de continuer même avec des permissions partielles
                if (cameraResult.status === 'granted' || locationResult.status === 'granted') {
                  setCurrentStep('scan_qr');
                } else {
                  // Si toutes les permissions sont refusées, afficher un message d'échec
                  Alert.alert(
                    '❌ Permissions Refusées',
                    'Toutes les permissions ont été refusées. Impossible de continuer sans autoriser au moins la caméra ou la géolocalisation.',
                    [
                      { 
                        text: 'Réessayer', 
                        onPress: () => requestPermissions() 
                      },
                      { 
                        text: 'Annuler', 
                        style: 'cancel',
                        onPress: () => onClose()
                      }
                    ]
                  );
                }
              }
            },
            { 
              text: 'Réessayer', 
              onPress: () => requestPermissions() 
            },
            { 
              text: 'Annuler', 
              style: 'cancel',
              onPress: () => onClose()
            }
          ]
        );
      } else {
        Alert.alert(
          'Permissions requises',
          'La caméra et la géolocalisation sont obligatoires pour enregistrer une séance.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de demander les permissions');
    } finally {
      setLoading(false);
    }
  };

  // ÉTAPE 2: Scan QR et géolocalisation
  const startQRScan = async () => {
    setLoading(true);
    setLocationError(null);
    setQrError(null);
    
    try {
      // Vérifier si les permissions sont disponibles
      if (cameraPermission === false && locationPermission === false) {
        Alert.alert(
          '❌ Permissions Manquantes',
          'Toutes les permissions ont été refusées. Impossible de continuer.',
          [
            { text: 'Réessayer', onPress: () => setCurrentStep('permissions') },
            { text: 'Annuler', style: 'cancel', onPress: () => onClose() }
          ]
        );
        setLoading(false);
        return;
      }

      // Obtenir la position GPS actuelle (si permission accordée)
      if (locationPermission === true) {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 1,
          });

          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
            timestamp: new Date().toISOString(),
          };

          setCurrentLocation(locationData);
        } catch (error) {
          setLocationError('Impossible d\'obtenir votre position GPS');
        }
      } else {
        // Si la permission de localisation est refusée, afficher un avertissement
        Alert.alert(
          '⚠️ Localisation Désactivée',
          'La permission de localisation a été refusée. Vous pouvez continuer mais la validation de position sera limitée.',
          [{ text: 'Continuer' }]
        );
      }

      // Démarrer le scanner QR (si permission accordée)
      if (cameraPermission === true) {
        setShowScanner(true);
      } else {
        Alert.alert(
          '❌ Caméra Désactivée',
          'La permission de caméra a été refusée. Impossible de scanner le QR code.',
          [
            { text: 'Réessayer', onPress: () => setCurrentStep('permissions') },
            { text: 'Annuler', style: 'cancel', onPress: () => onClose() }
          ]
        );
      }
    } catch (error) {
      setLocationError('Impossible d\'obtenir votre position GPS');
      Alert.alert('Erreur GPS', 'Vérifiez que votre GPS est activé et réessayez');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScanned = async ({ data }: { data: string }) => {
    setShowScanner(false);
    
    try {
      const qrData: ParentQRData = JSON.parse(data);
      
      // Vérifications du QR code
      const now = new Date();
      const expires = new Date(qrData.expiresAt);
      
      if (now > expires) {
        setQrError('QR Code expiré');
        return;
      }

      if (!currentLocation) {
        setQrError('Position GPS non disponible');
        return;
      }

      // Vérifier la distance avec le domicile (rayon de 30 mètres)
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        qrData.homeLocation.latitude,
        qrData.homeLocation.longitude
      );

      // Détection de fraude : vérifier si l'enseignant est dans un rayon de 30 mètres
      if (distance > FRAUD_DETECTION_RADIUS) {
        // Tentative de fraude détectée
        Alert.alert(
          '🚨 TENTATIVE DE FRAUDE DÉTECTÉE',
          `Vous êtes à ${Math.round(distance)}m du domicile enregistré.\n\nVous n'êtes pas au domicile de l'enfant/parent.\n\nLe système se fermera automatiquement dans 10 secondes.`,
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Fermer automatiquement après 10 secondes
                setTimeout(() => {
                  onClose();
                }, 10000);
              }
            }
          ]
        );
        
        // Afficher un message d'erreur visuel
        setQrError('🚨 TENTATIVE DE FRAUDE - Vous n\'êtes pas au domicile de l\'enfant/parent');
        
        // Fermer automatiquement après 10 secondes
        setTimeout(() => {
          onClose();
        }, 10000);
        
        return;
      }

      // Si la distance est acceptable, continuer normalement
      if (distance > MAX_DISTANCE_FROM_HOME) {
        Alert.alert(
          'Distance excessive',
          `Vous êtes à ${Math.round(distance)}m du domicile. Distance maximum autorisée: ${MAX_DISTANCE_FROM_HOME}m.`,
          [
            { text: 'Réessayer', onPress: () => setShowScanner(true) },
            { text: 'Annuler', style: 'cancel' }
          ]
        );
        return;
      }

      setScannedQR(qrData);
      setFormData(prev => ({
        ...prev,
        parentId: qrData.parentId
      }));
      setCurrentStep('form');
      
    } catch (error) {
      setQrError('QR Code invalide');
    }
  };

  // Fonction pour simuler le scan du QR code parent
  const handleQRCodeScan = (scannedData: string) => {
    // Simulation de données parent scannées
    if (scannedData.includes('QR-PARENT-')) {
      const mockParentData = {
        id: 'parent_001',
        name: 'M. Diabaté Mamadou',
        familyName: 'Famille Diabaté',
        email: 'diabate.mamadou@email.com',
        phone: '+225 07 12 34 56 78',
        address: 'Cocody, Abidjan',
        children: [
          { id: 'child_001', name: 'Kouadio Aya', grade: '3ème', age: 15 },
          { id: 'child_002', name: 'N\'Dri Kevin', grade: '1ère', age: 17 }
        ],
        accessKey: scannedData
      };
      
      setScannedParentData(mockParentData);
      setQrScanStep('parent_detected');
      
      // Mise à jour automatique des données du formulaire
      setFormData(prev => ({
        ...prev,
        parentId: mockParentData.id,
        parentName: mockParentData.name,
        parentEmail: mockParentData.email,
        parentPhone: mockParentData.phone,
        familyName: mockParentData.familyName
      }));

      Alert.alert(
        '✅ QR Code Parent Scanné',
        `Famille détectée: ${mockParentData.familyName}\n\nVeuillez maintenant sélectionner l'enfant concerné par cette séance.`,
        [{ text: 'Continuer' }]
      );
    } else {
      Alert.alert(
        '❌ QR Code Invalide',
        'Ce QR code ne correspond pas à un parent enregistré. Veuillez scanner le QR code affiché dans la salle d\'étude.',
        [{ text: 'Réessayer' }]
      );
    }
  };

  // Fonction pour confirmer la sélection d'enfant
  const confirmChildSelection = () => {
    if (!selectedChild) {
      Alert.alert('Attention', 'Veuillez sélectionner un enfant');
      return;
    }

    const child = scannedParentData.children.find((c: any) => c.id === selectedChild);
    if (child) {
      setFormData(prev => ({
        ...prev,
        studentId: child.id,
        studentName: child.name,
        studentGrade: child.grade,
        studentAge: child.age
      }));

      setQrScanStep('child_selection');
      Alert.alert(
        '✅ Enfant Sélectionné',
        `Séance pour: ${child.name} (${child.grade})\n\nVous pouvez maintenant remplir les détails de la séance.`,
        [{ text: 'Continuer' }]
      );
    }
  };

  // ÉTAPE 3: Formulaire détaillé
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.studentId) errors.studentId = 'Sélectionnez un élève';
    if (!formData.heureDebut) errors.heureDebut = 'Heure de début requise';
    if (!formData.heureFin) errors.heureFin = 'Heure de fin requise';
    if (formData.matieres.length === 0) errors.matieres = 'Sélectionnez au moins une matière';
    if (!formData.chapitres.trim()) errors.chapitres = 'Chapitres requis';
    if (!formData.objetSeance.trim()) errors.objetSeance = 'Objet de séance requis';

    // Validation des horaires
    if (formData.heureDebut && formData.heureFin) {
      const timeErrors = validateSessionTime(formData.heureDebut, formData.heureFin);
      if (timeErrors.length > 0) {
        errors.timing = timeErrors.join(', ');
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !currentLocation || !scannedQR) return;

    setCurrentStep('processing');
    setLoading(true);

    try {
      const duration = calculateSessionDuration(formData.heureDebut, formData.heureFin);
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        scannedQR.homeLocation.latitude,
        scannedQR.homeLocation.longitude
      );

      const sessionData = {
        id: generateSessionId(),
        teacherId,
        teacherName,
        studentId: formData.studentId,
        studentName: formData.studentName,
        parentId: formData.parentId,
        parentName: scannedQR.parentName,
        dateSeance: formData.dateSeance,
        heureDebut: formData.heureDebut,
        heureFin: formData.heureFin,
        dureeMinutes: duration,
        matieres: formData.matieres,
        chapitres: formData.chapitres,
        objetSeance: formData.objetSeance,
        observations: formData.observations,
        commentaires: formData.commentaires,
        location: currentLocation,
        qrData: scannedQR,
        distanceFromHome: distance,
        statut: 'pending' as const,
        dateCreation: new Date().toISOString(),
        anomalies: detectAnomalies({
          distanceFromHome: distance,
          dureeMinutes: duration,
          heureDebut: formData.heureDebut,
          heureFin: formData.heureFin,
          qrData: scannedQR
        }),
        flagged: distance > MAX_DISTANCE_FROM_HOME || duration < 60 || duration > 240,
        autoValidated: false
      };

      // Simulation d'envoi
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Déclencher les notifications
      await notificationTriggers.onSessionSubmitted({
        userId: teacherId,
        userRole: 'enseignant',
        metadata: {
          sessionId: sessionData.id,
          studentName: sessionData.studentName,
          parentId: sessionData.parentId,
          parentName: sessionData.parentName,
          date: sessionData.dateSeance,
          duration: formatDuration(sessionData.dureeMinutes),
          subjects: sessionData.matieres.join(', '),
          teacherName
        }
      });

      Alert.alert(
        'Séance enregistrée',
        'Votre séance a été enregistrée et envoyée pour validation.',
        [{ text: 'OK', onPress: () => {
          onSuccess();
          onClose();
        }}]
      );

    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'enregistrer la séance');
      setCurrentStep('form');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof SessionFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Mise à jour automatique des champs calculés
      if (field === 'heureDebut' || field === 'heureFin') {
        if (updated.heureDebut && updated.heureFin) {
          updated.dureeMinutes = calculateSessionDuration(updated.heureDebut, updated.heureFin);
        }
      }
      
      if (field === 'studentId' && scannedQR) {
        const student = scannedQR.children.find(child => child.id === value);
        if (student) {
          updated.studentName = `${student.prenoms} ${student.nom}`;
        }
      }
      
      return updated;
    });
    
    // Supprimer l'erreur du champ modifié
    if (formErrors[field]) {
      setFormErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const renderPermissionsStep = () => (
    <View style={styles.stepContainer}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.stepHeader}>
          <Camera color={colors.primary} size={32} />
          <Text style={[styles.stepTitle, { color: colors.text }]}>
            Permissions Requises
          </Text>
          <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
            Pour enregistrer une séance, nous avons besoin de votre autorisation pour accéder à la caméra et à votre position.
          </Text>
        </View>

        {/* Message d'avertissement si des permissions sont refusées */}
        {(cameraPermission === false || locationPermission === false) && (
          <View style={[styles.warningContainer, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
            <AlertTriangle color="#EF4444" size={20} />
            <View style={styles.warningContent}>
              <Text style={[styles.warningTitle, { color: '#EF4444' }]}>
                ⚠️ Permissions Refusées
              </Text>
              <Text style={[styles.warningText, { color: '#DC2626' }]}>
                Certaines permissions ont été refusées. Vous pouvez continuer mais certaines fonctionnalités seront limitées.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.permissionsContainer}>
          <View style={[styles.permissionItem, { backgroundColor: colors.card }]}>
            <Camera color={colors.primary} size={24} />
            <View style={styles.permissionInfo}>
              <Text style={[styles.permissionTitle, { color: colors.text }]}>
                Caméra
              </Text>
              <Text style={[styles.permissionDescription, { color: colors.textSecondary }]}>
                Pour scanner le QR code du parent
              </Text>
            </View>
            <View style={[
              styles.permissionStatus,
              { 
                backgroundColor: cameraPermission === true ? colors.successBackground : 
                               cameraPermission === false ? '#FEF2F2' : colors.warningBackground 
              }
            ]}>
              {cameraPermission === true ? (
                <CheckCircle color={colors.success} size={20} />
              ) : cameraPermission === false ? (
                <XCircle color="#EF4444" size={20} />
              ) : (
                <AlertTriangle color={colors.warning} size={20} />
              )}
            </View>
          </View>

          <View style={[styles.permissionItem, { backgroundColor: colors.card }]}>
            <MapPin color={colors.primary} size={24} />
            <View style={styles.permissionInfo}>
              <Text style={[styles.permissionTitle, { color: colors.text }]}>
                Localisation
              </Text>
              <Text style={[styles.permissionDescription, { color: colors.textSecondary }]}>
                Pour vérifier votre présence chez l&apos;élève
              </Text>
            </View>
            <View style={[
              styles.permissionStatus,
              { 
                backgroundColor: locationPermission === true ? colors.successBackground : 
                               locationPermission === false ? '#FEF2F2' : colors.warningBackground 
              }
            ]}>
              {locationPermission === true ? (
                <CheckCircle color={colors.success} size={20} />
              ) : locationPermission === false ? (
                <XCircle color="#EF4444" size={20} />
              ) : (
                <AlertTriangle color={colors.warning} size={20} />
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton, 
            { 
              backgroundColor: (cameraPermission === false && locationPermission === false) ? '#9CA3AF' : colors.primary 
            }
          ]}
          onPress={requestPermissions}
          disabled={loading || (cameraPermission === false && locationPermission === false)}
        >
          {loading ? (
            <Loader color="#FFFFFF" size={20} />
          ) : (
            <Text style={styles.primaryButtonText}>
              {(cameraPermission === false && locationPermission === false) 
                ? 'Permissions Refusées' 
                : 'Autoriser les Permissions'
              }
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  const renderQRScanStep = () => (
    <View style={styles.stepContainer}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Scanner le QR code du parent
        </Text>
        <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
          Scannez le QR code fourni par le parent pour valider votre présence à son domicile.
        </Text>
        
        {locationError && (
          <View style={[styles.errorContainer, { backgroundColor: '#FEF2F2' }]}>
            <AlertTriangle color="#EF4444" size={20} />
            <Text style={[styles.errorText, { color: '#EF4444' }]}>
              {locationError}
            </Text>
          </View>
        )}
        
        {qrError && (
          <View style={[
            styles.errorContainer, 
            { 
              backgroundColor: qrError.includes('FRAUDE') ? '#FEF2F2' : '#FEF2F2',
              borderColor: qrError.includes('FRAUDE') ? '#EF4444' : '#FCA5A5',
              borderWidth: qrError.includes('FRAUDE') ? 2 : 1
            }
          ]}>
            {qrError.includes('FRAUDE') ? (
              <XCircle color="#EF4444" size={24} />
            ) : (
              <AlertTriangle color="#EF4444" size={20} />
            )}
            <Text style={[
              styles.errorText, 
              { 
                color: '#EF4444',
                fontWeight: qrError.includes('FRAUDE') ? 'bold' : 'normal',
                fontSize: qrError.includes('FRAUDE') ? 16 : 14
              }
            ]}>
              {qrError}
            </Text>
          </View>
        )}
        
        {currentLocation && (
          <View style={[styles.successContainer, { backgroundColor: '#F0FDF4' }]}>
            <CheckCircle color="#10B981" size={20} />
            <Text style={[styles.successText, { color: '#10B981' }]}>
              Position GPS obtenue (précision: ±{Math.round(currentLocation.accuracy)}m)
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={startQRScan}
          disabled={loading}
        >
          {loading ? (
            <Loader color={colors.background} size={20} />
          ) : (
            <>
              <Camera color={colors.background} size={20} />
              <Text style={[styles.actionButtonText, { color: colors.background }]}>
                Scanner QR Code
              </Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  const renderFormStep = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Détails de la séance
        </Text>
        
        {scannedQR && (
          <View style={[styles.qrInfoContainer, { backgroundColor: colors.card }]}>
            <CheckCircle color="#10B981" size={20} />
            <View style={styles.qrInfo}>
              <Text style={[styles.qrTitle, { color: colors.text }]}>
                Famille {scannedQR.parentName}
              </Text>
              <Text style={[styles.qrDesc, { color: colors.textSecondary }]}>
                {scannedQR.children.length} enfant{scannedQR.children.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        )}
        
        {/* Sélection élève */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Élève *</Text>
          <View style={[styles.pickerContainer, { borderColor: formErrors.studentId ? '#EF4444' : colors.border }]}>
            <Picker
              selectedValue={formData.studentId}
              onValueChange={(value) => updateFormData('studentId', value)}
              style={[styles.picker, { color: colors.text }]}
            >
              <Picker.Item label="Sélectionnez un élève..." value="" />
              {scannedQR?.children.map((child) => (
                <Picker.Item
                  key={child.id}
                  label={`${child.prenoms} ${child.nom} (${child.classe})`}
                  value={child.id}
                />
              ))}
            </Picker>
          </View>
          {formErrors.studentId && (
            <Text style={styles.errorMessage}>{formErrors.studentId}</Text>
          )}
        </View>
        
        {/* Horaires */}
        <View style={styles.timeContainer}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={[styles.label, { color: colors.text }]}>Heure début *</Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: formErrors.heureDebut ? '#EF4444' : colors.border }
              ]}
              value={formData.heureDebut}
              onChangeText={(value) => updateFormData('heureDebut', value)}
              placeholder="14:00"
              placeholderTextColor={colors.textSecondary}
            />
            {formErrors.heureDebut && (
              <Text style={styles.errorMessage}>{formErrors.heureDebut}</Text>
            )}
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={[styles.label, { color: colors.text }]}>Heure fin *</Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: formErrors.heureFin ? '#EF4444' : colors.border }
              ]}
              value={formData.heureFin}
              onChangeText={(value) => updateFormData('heureFin', value)}
              placeholder="16:00"
              placeholderTextColor={colors.textSecondary}
            />
            {formErrors.heureFin && (
              <Text style={styles.errorMessage}>{formErrors.heureFin}</Text>
            )}
          </View>
        </View>
        
        {formData.dureeMinutes > 0 && (
          <View style={[styles.durationInfo, { backgroundColor: colors.card }]}>
            <Clock color={colors.primary} size={16} />
            <Text style={[styles.durationText, { color: colors.text }]}>
              Durée: {formatDuration(formData.dureeMinutes)}
            </Text>
          </View>
        )}
        
        {formErrors.timing && (
          <Text style={styles.errorMessage}>{formErrors.timing}</Text>
        )}
        
        {/* Matières */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Matières enseignées *</Text>
          <View style={styles.subjectsContainer}>
            {SESSION_SUBJECTS.map((subject) => (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.subjectChip,
                  {
                    backgroundColor: formData.matieres.includes(subject) 
                      ? colors.primary + '20' 
                      : colors.card,
                    borderColor: formData.matieres.includes(subject) 
                      ? colors.primary 
                      : colors.border
                  }
                ]}
                onPress={() => {
                  const newMatieres = formData.matieres.includes(subject)
                    ? formData.matieres.filter(m => m !== subject)
                    : [...formData.matieres, subject];
                  updateFormData('matieres', newMatieres);
                }}
              >
                <Text style={[
                  styles.subjectChipText,
                  { color: formData.matieres.includes(subject) ? colors.primary : colors.text }
                ]}>
                  {subject}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {formErrors.matieres && (
            <Text style={styles.errorMessage}>{formErrors.matieres}</Text>
          )}
        </View>
        
        {/* Chapitres */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Chapitres abordés *</Text>
          <TextInput
            style={[
              styles.textArea,
              { color: colors.text, borderColor: formErrors.chapitres ? '#EF4444' : colors.border }
            ]}
            value={formData.chapitres}
            onChangeText={(value) => updateFormData('chapitres', value)}
            placeholder="Ex: Théorème de Pythagore, Équations du second degré..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
          />
          {formErrors.chapitres && (
            <Text style={styles.errorMessage}>{formErrors.chapitres}</Text>
          )}
        </View>
        
        {/* Objet de séance */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Objet de la séance *</Text>
          <TextInput
            style={[
              styles.textArea,
              { color: colors.text, borderColor: formErrors.objetSeance ? '#EF4444' : colors.border }
            ]}
            value={formData.objetSeance}
            onChangeText={(value) => updateFormData('objetSeance', value)}
            placeholder="Résumé des activités et exercices effectués..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
          />
          {formErrors.objetSeance && (
            <Text style={styles.errorMessage}>{formErrors.objetSeance}</Text>
          )}
        </View>
        
        {/* Observations */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Observations (optionnel)</Text>
          <TextInput
            style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
            value={formData.observations}
            onChangeText={(value) => updateFormData('observations', value)}
            placeholder="Observations sur la qualité de l'interaction..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={2}
          />
        </View>
        
        {/* Commentaires */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Commentaires (optionnel)</Text>
          <TextInput
            style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
            value={formData.commentaires}
            onChangeText={(value) => updateFormData('commentaires', value)}
                         placeholder="Commentaires sur le comportement de l&apos;élève..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={2}
          />
        </View>
        
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <Loader color={colors.background} size={20} />
          ) : (
            <>
              <Send color={colors.background} size={20} />
              <Text style={[styles.submitButtonText, { color: colors.background }]}>
                Enregistrer la séance
              </Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );

  const renderProcessingStep = () => (
    <View style={styles.processingContainer}>
      <Loader color={colors.primary} size={48} />
      <Text style={[styles.processingTitle, { color: colors.text }]}>
        Enregistrement en cours...
      </Text>
      <Text style={[styles.processingDesc, { color: colors.textSecondary }]}>
        Validation des données anti-fraude et envoi pour validation
      </Text>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 'permissions':
        return renderPermissionsStep();
      case 'scan_qr':
        return renderQRScanStep();
      case 'form':
        return renderFormStep();
      case 'processing':
        return renderProcessingStep();
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[
          styles.modalContainer,
          {
            width: isDesktop ? Math.min(width * 0.8, 800) : width * 0.95,
            maxHeight: isDesktop ? height * 0.85 : height * 0.9,
            borderRadius: isDesktop ? 20 : 16,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          }
        ]}>
          <LinearGradient
            colors={['#059669', '#10B981']}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>
              {currentStep === 'permissions' && 'Permissions Requises'}
              {currentStep === 'scan_qr' && 'Scanner QR Code'}
              {currentStep === 'form' && 'Enregistrer une Séance'}
              {currentStep === 'processing' && 'Traitement en Cours'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={currentStep === 'processing'}
            >
              <XCircle color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Indicateur d'étapes */}
          <View style={styles.stepsIndicator}>
            {['permissions', 'scan_qr', 'form'].map((step, index) => (
              <View key={step} style={styles.stepIndicatorContainer}>
                <View style={[
                  styles.stepIndicator,
                  {
                    backgroundColor: 
                      step === currentStep ? '#FFFFFF' :
                      ['permissions', 'scan_qr', 'form'].indexOf(currentStep) > index ? '#10B981' :
                      'rgba(255, 255, 255, 0.3)'
                  }
                ]}>
                  <Text style={[
                    styles.stepIndicatorText,
                    {
                      color: 
                        step === currentStep ? '#059669' :
                        ['permissions', 'scan_qr', 'form'].indexOf(currentStep) > index 
                          ? '#FFFFFF' 
                          : '#FFFFFF'
                    }
                  ]}>
                    {index + 1}
                  </Text>
                </View>
                {index < 2 && (
                  <View style={[
                    styles.stepIndicatorLine,
                    {
                      backgroundColor: 
                        ['permissions', 'scan_qr', 'form'].indexOf(currentStep) > index ? '#10B981' : 'rgba(255, 255, 255, 0.3)'
                    }
                  ]} />
                )}
              </View>
            ))}
          </View>

          {/* Barre de progression */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: '#FFFFFF',
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    })
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(((['permissions', 'scan_qr', 'form'].indexOf(currentStep) + 1) / 3) * 100)}%
            </Text>
          </View>

          {/* Indicateur de plateforme */}
          <View style={styles.platformIndicator}>
            {isDesktop ? (
              <>
                <Monitor color="#FFFFFF" size={16} />
                <Text style={styles.platformText}>Version Web</Text>
              </>
            ) : (
              <>
                <Smartphone color="#FFFFFF" size={16} />
                <Text style={styles.platformText}>Version Mobile</Text>
              </>
            )}
          </View>

          {/* Bouton d'aide (web uniquement) */}
          {isDesktop && (
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => setShowHelp(!showHelp)}
            >
              <HelpCircle color="#FFFFFF" size={20} />
            </TouchableOpacity>
          )}

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {renderStep()}
          </ScrollView>
        </Animated.View>
      </View>

      {/* Modal d'aide */}
      {showHelp && isDesktop && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.helpOverlay}>
            <View style={styles.helpContainer}>
              <View style={styles.helpHeader}>
                <Text style={styles.helpTitle}>Raccourcis Clavier</Text>
                <TouchableOpacity onPress={() => setShowHelp(false)}>
                  <XCircle color="#6B7280" size={24} />
                </TouchableOpacity>
              </View>
              <View style={styles.helpContent}>
                <View style={styles.helpItem}>
                  <Text style={styles.helpKey}>ESC</Text>
                  <Text style={styles.helpDesc}>Fermer le modal</Text>
                </View>
                <View style={styles.helpItem}>
                  <Text style={styles.helpKey}>Enter</Text>
                  <Text style={styles.helpDesc}>Valider l'étape actuelle</Text>
                </View>
                <View style={styles.helpItem}>
                  <Text style={styles.helpKey}>← →</Text>
                  <Text style={styles.helpDesc}>Navigation entre étapes</Text>
                </View>
                <View style={styles.helpItem}>
                  <Text style={styles.helpKey}>H</Text>
                  <Text style={styles.helpDesc}>Afficher cette aide</Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Scanner QR Modal */}
      {showScanner && (
        <Modal visible={true} animationType="slide">
          <View style={styles.scannerContainer}>
            <BarCodeScanner
              onBarCodeScanned={handleQRScanned}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame}>
                <View style={styles.scannerCorner} />
                <View style={styles.scannerCorner} />
                <View style={styles.scannerCorner} />
                <View style={styles.scannerCorner} />
              </View>
              <Text style={styles.scannerTitle}>
                Scannez le QR Code du parent
              </Text>
              <Text style={styles.scannerSubtitle}>
                Placez le QR code dans le cadre
              </Text>
              <TouchableOpacity
                style={styles.scannerClose}
                onPress={() => setShowScanner(false)}
              >
                <XCircle color="#FFFFFF" size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  stepsIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  stepIndicatorText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepIndicatorLine: {
    width: 40,
    height: 2,
    marginHorizontal: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  permissionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
  },
  permissionStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
  },
  qrInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  qrInfo: {
    flex: 1,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  qrDesc: {
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  subjectChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorMessage: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 32,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  processingDesc: {
    fontSize: 16,
    textAlign: 'center',
  },
  scannerContainer: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 40,
  },
  scannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scannerClose: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalContentContainer: {
    padding: 20,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  progressBar: {
    width: '80%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  platformIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  platformText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  helpButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 20,
  },
  helpOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  helpContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  helpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  helpContent: {
    marginTop: 10,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  helpKey: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginRight: 10,
  },
  helpDesc: {
    fontSize: 16,
    color: '#555',
  },
}); 