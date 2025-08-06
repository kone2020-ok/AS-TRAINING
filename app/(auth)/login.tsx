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
import { User, Mail, Lock, Users, ChevronDown } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface UserRole {
  id: string;
  label: string;
  color: string;
  description: string;
}

const userRoles: UserRole[] = [
  {
    id: 'direction',
    label: 'Direction',
    color: '#1E40AF',
    description: 'Accès complet à la plateforme',
  },
  {
    id: 'enseignant',
    label: 'Enseignant',
    color: '#059669',
    description: 'Gestion des séances et élèves',
  },
  {
    id: 'parent',
    label: 'Parent',
    color: '#EA580C',
    description: 'Suivi des enfants et paiements',
  },
];

const defaultAccounts = {
  direction: {
    id: 'DIR001',
    email: 'groupeas.infos@yahoo.fr',
    password: 'Direction@2024',
  },
  enseignant: {
    id: 'ENS001',
    email: 'enseignant@demo.com',
    password: 'Enseignant@2024',
  },
  parent: {
    id: 'PAR001',
    email: 'parent@demo.com',
    password: 'Parent@2024',
  },
};

export default function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    password: '',
  });
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

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
  }, []);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setShowRoleDropdown(false);
    
    // Auto-fill with demo account
    const demoAccount = defaultAccounts[role as keyof typeof defaultAccounts];
    if (demoAccount) {
      setFormData(demoAccount);
    }
  };

  const handleLogin = () => {
    if (!selectedRole) {
      Alert.alert('Erreur', 'Veuillez sélectionner votre rôle');
      return;
    }

    if (!formData.id || !formData.email || !formData.password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    // Simple validation for demo
    const demoAccount = defaultAccounts[selectedRole as keyof typeof defaultAccounts];
    if (
      formData.id === demoAccount.id &&
      formData.email === demoAccount.email &&
      formData.password === demoAccount.password
    ) {
      router.replace(`/(tabs)/${selectedRole}`);
    } else {
      Alert.alert('Erreur', 'Identifiants incorrects');
    }
  };

  const selectedRoleData = userRoles.find(role => role.id === selectedRole);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#1E40AF', '#3B82F6', '#60A5FA']}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Image 
            source={require('../../assets/images/img (22).jpg')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandText}>AS-TRAINING Manager</Text>
          <Text style={styles.subtitle}>AS-TRAINING - Gestion Éducative</Text>
        </Animated.View>
      </LinearGradient>
      <Animated.View
        style={[
          styles.formContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.welcomeText}>Connexion</Text>
        <Text style={styles.welcomeSubtext}>
          Accédez à votre espace personnel
        </Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Rôle</Text>
          <TouchableOpacity
            style={[styles.roleSelector, selectedRole && { borderColor: selectedRoleData?.color }]}
            onPress={() => setShowRoleDropdown(!showRoleDropdown)}
          >
            <View style={styles.roleSelectorContent}>
              {selectedRole ? (
                <>
                  <Users color={selectedRoleData?.color} size={20} />
                  <Text style={[styles.roleSelectorText, { color: selectedRoleData?.color }]}>
                    {selectedRoleData?.label}
                  </Text>
                </>
              ) : (
                <>
                  <Users color="#9CA3AF" size={20} />
                  <Text style={styles.rolePlaceholder}>Sélectionnez votre rôle</Text>
                </>
              )}
              <ChevronDown color="#9CA3AF" size={20} />
            </View>
          </TouchableOpacity>
          {showRoleDropdown && (
            <View style={styles.roleDropdown}>
              {userRoles.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  style={styles.roleOption}
                  onPress={() => handleRoleSelect(role.id)}
                >
                  <View style={[styles.roleColorIndicator, { backgroundColor: role.color }]} />
                  <View style={styles.roleOptionContent}>
                    <Text style={styles.roleOptionLabel}>{role.label}</Text>
                    <Text style={styles.roleOptionDescription}>{role.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        {selectedRole && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Code Identifiant</Text>
              <View style={styles.inputContainer}>
                <User color="#6B7280" size={20} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Votre code identifiant"
                  value={formData.id}
                  onChangeText={(text) => setFormData({ ...formData, id: text })}
                  autoCapitalize="none"
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Mail color="#6B7280" size={20} />
                <TextInput
                  style={styles.textInput}
                  placeholder="votre.email@exemple.com"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mot de passe</Text>
              <View style={styles.inputContainer}>
                <Lock color="#6B7280" size={20} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Votre mot de passe"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry
                />
              </View>
            </View>
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: selectedRoleData?.color }]}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Se connecter</Text>
            </TouchableOpacity>
            <View style={styles.demoAccountInfo}>
              <Text style={styles.demoTitle}>Compte de démonstration :</Text>
              <Text style={styles.demoText}>ID: {defaultAccounts[selectedRole as keyof typeof defaultAccounts]?.id}</Text>
              <Text style={styles.demoText}>Email: {defaultAccounts[selectedRole as keyof typeof defaultAccounts]?.email}</Text>
              <Text style={styles.demoText}>Mot de passe: {defaultAccounts[selectedRole as keyof typeof defaultAccounts]?.password}</Text>
            </View>
          </>
        )}
        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={() => router.push('/(auth)/forgot-password')}
        >
          <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
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
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  brandText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formContainer: {
    padding: 24,
    marginTop: -20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: height * 0.7,
    alignSelf: 'center', // Centre horizontalement le conteneur du formulaire
    width: '90%', // Permet au formulaire de prendre 90% de la largeur du parent
    maxWidth: 500, // Limite la largeur sur les grands écrans (pour le web par exemple)
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  roleSelector: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  roleSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  rolePlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
    flex: 1,
    marginLeft: 12,
  },
  roleDropdown: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  roleColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  roleOptionContent: {
    flex: 1,
  },
  roleOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  roleOptionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
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
  loginButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  demoAccountInfo: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 13,
    color: '#0369A1',
    marginBottom: 2,
  },
  forgotPassword: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  forgotPasswordText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '500',
  },
});