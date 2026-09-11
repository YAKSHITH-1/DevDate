import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING } from '../styles/theme';

// Simple reusable stat item component
export default function StatItem({
  number,
  label,
  onPress,
  accessibilityLabel,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={styles.container}
    >
      <Text style={styles.number}>{number}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING.md, // Better touch target
  },
  number: {
    fontSize: FONTS.lg,
    fontWeight: '600',
    color: COLORS.primary,
  },
  label: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
});