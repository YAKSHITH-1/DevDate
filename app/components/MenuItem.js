import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING } from '../styles/theme';

// Simple reusable menu item component
export default function MenuItem({
  icon,
  title,
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
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md, // Better touch target
    paddingHorizontal: SPACING.sm,
  },
  icon: {
    marginRight: SPACING.md,
    fontSize: FONTS.md,
    color: COLORS.primary,
  },
  title: {
    fontSize: FONTS.md,
    color: COLORS.text,
  },
});