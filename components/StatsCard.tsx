import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string[];
  change?: string;
  onPress?: () => void;
}

export default function StatsCard({
  title,
  value,
  icon,
  gradient,
  change,
  onPress,
}: StatsCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} disabled={!onPress}>
      <LinearGradient colors={gradient} style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>{icon}</View>
          <View style={styles.content}>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.title}>{title}</Text>
            {change && (
              <Text style={styles.change}>{change}</Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  gradient: {
    padding: 20,
    minHeight: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 16,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  change: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
});