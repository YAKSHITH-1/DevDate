import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { COLORS, FONTS, SPACING } from '../styles/theme';

// Simple reusable setting item component
export default function SettingItem({
  label,
  value,
  switchValue,
  onSwitchChange,
  accessibilityLabel,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {value ? (
        <Text style={styles.value}>{value}</Text>
      ) : (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          thumbColor={COLORS.textInverse}
          trackColor={{ false: COLORS.border, true: COLORS.secondary }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md, // Better touch target
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  label: {
    fontSize: FONTS.md,
    color: COLORS.text,
  },
  value: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
});