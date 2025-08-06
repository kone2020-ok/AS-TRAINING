import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { Mail, ArrowLeft, CheckCircle, Send, Eye, EyeOff } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface ResetStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function ForgotPasswordScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [cameFromLogin, setCameFromLogin] = useState(false);

  const steps: ResetStep[] = [
    {
      id: '1',
      title: 'Vérification Email',
      description: 'Entrez votre adresse email',
      completed: false,
    },
    {
      id: '2',
      title: 'Code de Vérification',
      description: 'Entrez le code reçu',
      completed: false,
    },
    {
      id: '3',
      title: 'Nouveau Mot de Passe',
      description: 'Créez votre nouveau mot de passe',
      completed: false,
    },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pour simplifier, on suppose que si on vient de la page de login
    // on redirige vers login après changement de mot de passe
    // Sinon on retourne au dashboard précédent
    setCameFromLogin(true); // Par défaut, on suppose qu'on vient de login
  }, []);

  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSendResetCode = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    setIsLoading(true);

    try {
      // Simulation d'envoi de code
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Générer un code de 6 chiffres
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setResetCode(generatedCode);
      
      // Simuler l'envoi par email et SMS
      console.log(`Code de réinitialisation envoyé à ${email}: ${generatedCode}`);
      
      Alert.alert(
        'Code envoyé !',
        `Un code de réinitialisation a été envoyé à ${email}\n\nCode de démonstration: ${generatedCode}`,
        [
          {
            text: 'Continuer',
            onPress: () => {
              setCurrentStep(2);
              steps[0].completed = true;
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le code. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (!code) {
      Alert.alert('Erreur', 'Veuillez entrer le code de vérification');
      return;
    }

    if (code !== resetCode) {
      Alert.alert('Erreur', 'Code incorrect. Veuillez vérifier et réessayer.');
      return;
    }

    setCurrentStep(3);
    steps[1].completed = true;
  };

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    // Simulation de mise à jour du mot de passe
    Alert.alert(
      'Succès !',
      'Votre mot de passe a été mis à jour avec succès.',
      [
        {
          text: 'Continuer',
          onPress: () => {
            if (cameFromLogin) {
              // Si on vient de login, retourner à la page de login
              router.replace('/(auth)/login');
            } else {
              // Sinon retourner au dashboard précédent
              router.back();
            }
          }
        }
      ]
    );
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={step.id} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            {
              backgroundColor: currentStep > index + 1 ? '#10B981' : 
                              currentStep === index + 1 ? '#3B82F6' : '#E5E7EB'
            }
          ]}>
            {currentStep > index + 1 ? (
              <CheckCircle color="#FFFFFF" size={16} />
            ) : (
              <Text style={[
                styles.stepNumber,
                { color: currentStep === index + 1 ? '#FFFFFF' : '#6B7280' }
              ]}>
                {index + 1}
              </Text>
            )}
          </View>
          <Text style={[
            styles.stepTitle,
            { color: currentStep >= index + 1 ? '#1F2937' : '#9CA3AF' }
          ]}>
            {step.title}
          </Text>
          {index < steps.length - 1 && (
            <View style={[
              styles.stepLine,
              { backgroundColor: currentStep > index + 1 ? '#10B981' : '#E5E7EB' }
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
              <Mail color="#3B82F6" size={48} />
            </View>
            <Text style={styles.stepTitle}>Vérification de votre email</Text>
            <Text style={styles.stepDescription}>
              Entrez votre adresse email pour recevoir un code de réinitialisation
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Adresse email</Text>
              <View style={styles.inputContainer}>
                <Mail color="#6B7280" size={20} />
                <TextInput
                  style={styles.textInput}
                  placeholder="votre.email@exemple.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.disabledButton]}
              onPress={handleSendResetCode}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Envoi en cours...' : 'Envoyer le code'}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
              <Send color="#10B981" size={48} />
            </View>
            <Text style={styles.stepTitle}>Code de vérification</Text>
            <Text style={styles.stepDescription}>
              Entrez le code à 6 chiffres envoyé à {email}
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Code de vérification</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, styles.codeInput]}
                  placeholder="000000"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  textAlign="center"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleVerifyCode}
            >
              <Text style={styles.primaryButtonText}>Vérifier le code</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resendButton}>
              <Text style={styles.resendText}>Renvoyer le code</Text>
            </TouchableOpacity>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
              <CheckCircle color="#10B981" size={48} />
            </View>
            <Text style={styles.stepTitle}>Nouveau mot de passe</Text>
            <Text style={styles.stepDescription}>
              Créez un nouveau mot de passe sécurisé
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff color="#6B7280" size={20} /> : <Eye color="#6B7280" size={20} />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff color="#6B7280" size={20} /> : <Eye color="#6B7280" size={20} />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleResetPassword}
            >
              <Text style={styles.primaryButtonText}>Réinitialiser le mot de passe</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#1E40AF', '#3B82F6', '#60A5FA']}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mot de passe oublié</Text>
          <View style={styles.placeholder} />
        </Animated.View>
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {renderStepIndicator()}
        {renderStepContent()}
      </Animated.View>
    </ScrollView>
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
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 24,
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepLine: {
    position: 'absolute',
    top: 20,
    left: '50%',
    width: '100%',
    height: 2,
    zIndex: -1,
  },
  stepContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
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
  codeInput: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  resendText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '500',
  },
}); 