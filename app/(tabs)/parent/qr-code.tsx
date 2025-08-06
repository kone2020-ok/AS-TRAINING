import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Share,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode, Printer, Download, Share2, Info, MapPin, Clock, User, CheckCircle, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { safeCopyToClipboard } from '../../../utils/PlatformUtils';

// Mock parent data - en réalité, cela viendrait de votre système d'authentification
const mockParentData = {
  id: 'parent_001',
  name: 'M. Diabaté Mamadou',
  email: 'diabate.mamadou@email.com',
  phone: '+225 07 12 34 56 78',
  address: 'Cocody, Abidjan',
  children: [
    { id: 'child_001', name: 'Kouadio Aya', grade: '3ème', age: 15 },
    { id: 'child_002', name: 'N\'Dri Kevin', grade: '1ère', age: 17 }
  ],
  qrData: {
    parentId: 'parent_001',
    familyName: 'Famille Diabaté',
    accessKey: 'QR-PARENT-001-2025',
    generatedAt: new Date().toISOString(),
    validUntil: '2025-12-31T23:59:59Z'
  }
};

export default function ParentQRCode() {
  const { colors } = useTheme();
  const { width } = Dimensions.get('window');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [qrGenerated, setQrGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const generateQRCode = async () => {
    setIsGenerating(true);
    
    // Simulation de génération
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setQrGenerated(true);
    setIsGenerating(false);

    Alert.alert(
      '✅ QR Code Généré',
      'Votre QR Code personnel a été généré avec succès !\n\n📝 Instructions :\n• Imprimez et collez ce QR code dans la salle d\'étude\n• L\'enseignant le scannera pour enregistrer les séances\n• Le code est valide jusqu\'au 31/12/2025',
      [{ text: 'Compris' }]
    );
  };

  const printQRCode = () => {
    if (Platform.OS === 'web') {
      window.print();
    } else {
      Alert.alert(
        '🖨️ Impression',
        'Fonctionnalité d\'impression disponible sur navigateur web.\n\nPour mobile : utilisez "Partager" pour envoyer le QR code à une imprimante.',
        [{ text: 'OK' }]
      );
    }
  };

  const shareQRCode = async () => {
    try {
      await Share.share({
        message: `QR Code Famille Diabaté\n\nCode d'accès: ${mockParentData.qrData.accessKey}\n\nInstructions pour l'enseignant:\n1. Scanner ce QR code\n2. Sélectionner l'enfant concerné\n3. Enregistrer la séance\n\nValide jusqu'au 31/12/2025`,
        title: 'QR Code Famille'
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager le QR code');
    }
  };

  const copyQRData = async () => {
    await safeCopyToClipboard(mockParentData.qrData.accessKey);
    Alert.alert('✅ Copié', 'Code d\'accès copié dans le presse-papiers');
  };

  const renderQRCodeDisplay = () => (
    <View style={[styles.qrContainer, { backgroundColor: colors.card }]}>
      <View style={styles.qrHeader}>
        <QrCode color={colors.primary} size={24} />
        <Text style={[styles.qrTitle, { color: colors.text }]}>Mon QR Code Personnel</Text>
      </View>

      {/* QR Code simulé */}
      <View style={[styles.qrCodeBox, { borderColor: colors.border }]}>
        <View style={styles.qrPattern}>
          {/* Pattern QR Code simulé */}
          {Array.from({ length: 15 }, (_, row) => (
            <View key={row} style={styles.qrRow}>
              {Array.from({ length: 15 }, (_, col) => (
                <View
                  key={col}
                  style={[
                    styles.qrDot,
                    {
                      backgroundColor: (row + col) % 3 === 0 ? colors.text : 'transparent'
                    }
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
        
        {/* Code d'accès */}
        <View style={styles.accessCodeContainer}>
          <Text style={[styles.accessCodeLabel, { color: colors.text + '80' }]}>Code d'accès</Text>
          <TouchableOpacity onPress={copyQRData} style={styles.accessCodeBox}>
            <Text style={[styles.accessCode, { color: colors.primary }]}>
              {mockParentData.qrData.accessKey}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Informations famille */}
      <View style={[styles.familyInfo, { backgroundColor: colors.primary + '10' }]}>
        <Text style={[styles.familyInfoTitle, { color: colors.primary }]}>
          👨‍👩‍👧‍👦 {mockParentData.qrData.familyName}
        </Text>
        <Text style={[styles.familyInfoDetails, { color: colors.text + '80' }]}>
          📧 {mockParentData.email}{'\n'}
          📱 {mockParentData.phone}{'\n'}
          📍 {mockParentData.address}{'\n'}
          👦👧 {mockParentData.children.length} enfant(s)
        </Text>
      </View>

      {/* Actions QR Code */}
      <View style={styles.qrActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
          onPress={printQRCode}
        >
          <Printer color={colors.primary} size={18} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Imprimer</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#10B981' + '20' }]}
          onPress={shareQRCode}
        >
          <Share2 color="#10B981" size={18} />
          <Text style={[styles.actionText, { color: '#10B981' }]}>Partager</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#F59E0B' + '20' }]}
          onPress={copyQRData}
        >
          <Download color="#F59E0B" size={18} />
          <Text style={[styles.actionText, { color: '#F59E0B' }]}>Copier</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderInstructions = () => (
    <View style={[styles.instructionsContainer, { backgroundColor: colors.card }]}>
      <View style={styles.instructionsHeader}>
        <Info color={colors.primary} size={20} />
        <Text style={[styles.instructionsTitle, { color: colors.text }]}>
          📋 Instructions d'utilisation
        </Text>
      </View>

      <View style={styles.instructionsList}>
        <View style={styles.instructionItem}>
          <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.instructionContent}>
            <Text style={[styles.instructionTitle, { color: colors.text }]}>
              🖨️ Imprimez votre QR Code
            </Text>
            <Text style={[styles.instructionDescription, { color: colors.text + '80' }]}>
              Imprimez le QR code généré en format A4 pour une meilleure lisibilité
            </Text>
          </View>
        </View>

        <View style={styles.instructionItem}>
          <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.instructionContent}>
            <Text style={[styles.instructionTitle, { color: colors.text }]}>
              📍 Collez dans la salle d'étude
            </Text>
            <Text style={[styles.instructionDescription, { color: colors.text + '80' }]}>
              Fixez le QR code bien visible dans votre salle d'étude à domicile
            </Text>
          </View>
        </View>

        <View style={styles.instructionItem}>
          <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.instructionContent}>
            <Text style={[styles.instructionTitle, { color: colors.text }]}>
              📱 L'enseignant scanne
            </Text>
            <Text style={[styles.instructionDescription, { color: colors.text + '80' }]}>
              L'enseignant scanne le code pour accéder à l'enregistrement de séance
            </Text>
          </View>
        </View>

        <View style={styles.instructionItem}>
          <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <View style={styles.instructionContent}>
            <Text style={[styles.instructionTitle, { color: colors.text }]}>
              👦 Sélection de l'enfant
            </Text>
            <Text style={[styles.instructionDescription, { color: colors.text + '80' }]}>
              Liste de vos enfants s'affiche pour que l'enseignant choisisse
            </Text>
          </View>
        </View>

        <View style={styles.instructionItem}>
          <View style={[styles.stepNumber, { backgroundColor: '#10B981' }]}>
            <CheckCircle color="#FFFFFF" size={16} />
          </View>
          <View style={styles.instructionContent}>
            <Text style={[styles.instructionTitle, { color: colors.text }]}>
              ✅ Séance enregistrée
            </Text>
            <Text style={[styles.instructionDescription, { color: colors.text + '80' }]}>
              La séance est automatiquement enregistrée avec toutes les informations
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderChildrenInfo = () => (
    <View style={[styles.childrenContainer, { backgroundColor: colors.card }]}>
      <View style={styles.childrenHeader}>
        <User color={colors.primary} size={20} />
        <Text style={[styles.childrenTitle, { color: colors.text }]}>
          👦👧 Mes enfants ({mockParentData.children.length})
        </Text>
      </View>

      {mockParentData.children.map((child, index) => (
        <View key={child.id} style={[styles.childCard, { backgroundColor: colors.background }]}>
          <View style={styles.childInfo}>
            <Text style={[styles.childName, { color: colors.text }]}>{child.name}</Text>
            <Text style={[styles.childDetails, { color: colors.text + '80' }]}>
              📚 {child.grade} • 🎂 {child.age} ans
            </Text>
          </View>
          <View style={[styles.childStatus, { backgroundColor: '#10B981' + '20' }]}>
            <CheckCircle color="#10B981" size={16} />
            <Text style={[styles.childStatusText, { color: '#10B981' }]}>Actif</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#EA580C', '#F97316']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <Text style={styles.headerTitle}>📱 Mon QR Code</Text>
          <Text style={styles.headerSubtitle}>Code d'identification pour les séances</Text>
        </Animated.View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {!qrGenerated ? (
            <View style={[styles.generateContainer, { backgroundColor: colors.card }]}>
              <View style={styles.generateContent}>
                <QrCode color={colors.primary} size={64} />
                <Text style={[styles.generateTitle, { color: colors.text }]}>
                  Générer mon QR Code
                </Text>
                <Text style={[styles.generateDescription, { color: colors.text + '80' }]}>
                  Créez votre QR code personnel pour que les enseignants puissent enregistrer 
                  facilement les séances d'étude de vos enfants.
                </Text>
                
                <TouchableOpacity
                  style={[styles.generateButton, { backgroundColor: colors.primary }]}
                  onPress={generateQRCode}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <View style={styles.loadingDot} />
                      <Text style={styles.generateButtonText}>Génération...</Text>
                    </>
                  ) : (
                    <>
                      <QrCode color="#FFFFFF" size={20} />
                      <Text style={styles.generateButtonText}>Générer QR Code</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {renderQRCodeDisplay()}
              {renderChildrenInfo()}
            </>
          )}
          
          {renderInstructions()}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  generateContainer: {
    borderRadius: 16,
    padding: 32,
    marginBottom: 20,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  generateContent: {
    alignItems: 'center',
  },
  generateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  generateDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  qrContainer: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  qrCodeBox: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  qrPattern: {
    marginBottom: 16,
  },
  qrRow: {
    flexDirection: 'row',
  },
  qrDot: {
    width: 4,
    height: 4,
    margin: 1,
  },
  accessCodeContainer: {
    alignItems: 'center',
  },
  accessCodeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  accessCodeBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  accessCode: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  familyInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  familyInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  familyInfoDetails: {
    fontSize: 14,
    lineHeight: 20,
  },
  qrActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  childrenContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  childrenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  childrenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  childDetails: {
    fontSize: 14,
  },
  childStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  childStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  instructionsContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  instructionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});