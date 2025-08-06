import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface ColorPickerProps {
  value: string;
  onColorChange: (color: string) => void;
  title?: string;
  showCustom?: boolean;
}

const predefinedColors = [
  // Verts
  '#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0',
  // Bleus
  '#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE',
  // Violets
  '#5B21B6', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE',
  // Oranges
  '#EA580C', '#F97316', '#FB923C', '#FDBA74', '#FED7AA',
  // Rouges
  '#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA',
  // Jaunes
  '#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A',
  // Gris
  '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6',
  // Roses
  '#BE185D', '#EC4899', '#F472B6', '#F9A8D4', '#FCE7F3',
  // Cyan
  '#0E7490', '#0891B2', '#22D3EE', '#67E8F9', '#CFFAFE',
  // Émeraude
  '#047857', '#059669', '#10B981', '#34D399', '#6EE7B7',
];

export default function ColorPicker({ value, onColorChange, title = 'Choisir une couleur', showCustom = true }: ColorPickerProps) {
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setShowModal(false);
  };

  const renderColorOption = (color: string) => (
    <TouchableOpacity
      key={color}
      style={[
        styles.colorOption,
        { backgroundColor: color },
        value === color && styles.selectedColor,
      ]}
      onPress={() => handleColorSelect(color)}
    >
      {value === color && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.colorPreview}
        onPress={() => setShowModal(true)}
      >
        <View style={[styles.colorSwatch, { backgroundColor: value }]} />
        <Text style={[styles.colorText, { color: colors.text }]}>
          {title}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {title}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={[styles.closeButton, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.colorGrid}>
              <View style={styles.colorSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Couleurs prédéfinies
                </Text>
                <View style={styles.colorGridContainer}>
                  {predefinedColors.map(renderColorOption)}
                </View>
              </View>

              {showCustom && (
                <View style={styles.colorSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Couleur personnalisée
                  </Text>
                  <View style={styles.customColorContainer}>
                    <View style={[styles.customColorSwatch, { backgroundColor: customColor }]} />
                    <Text style={[styles.customColorText, { color: colors.text }]}>
                      {customColor}
                    </Text>
                  </View>
                  <Text style={[styles.customColorNote, { color: colors.text + '60' }]}>
                    Entrez un code couleur hexadécimal (ex: #FF5733)
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.border }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => handleColorSelect(customColor)}
              >
                <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                  Appliquer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  colorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Math.min(width * 0.9, 400),
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  colorGrid: {
    padding: 20,
  },
  colorSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  colorGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#000000',
  },
  checkmark: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  customColorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customColorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  customColorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  customColorNote: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 