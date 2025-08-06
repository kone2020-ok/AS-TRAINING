import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AccountingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page de Comptabilité</Text>
      <Text>Ici sera gérée toute la comptabilité de la structure.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
}); 