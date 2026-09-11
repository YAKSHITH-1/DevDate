import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { COLORS, FONTS, SPACING } from '../styles/theme';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Switch
            value={true}
            onValueChange={(value) => {}}
            thumbColor={COLORS.textInverse}
            trackColor={{ false: COLORS.border, true: COLORS.secondary }}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={false}
            onValueChange={(value) => {}}
            thumbColor={COLORS.textInverse}
            trackColor={{ false: COLORS.border, true: COLORS.secondary }}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Data Usage</Text>
          <Switch
            value={true}
            onValueChange={(value) => {}}
            thumbColor={COLORS.textInverse}
            trackColor={{ false: COLORS.border, true: COLORS.secondary }}
          />
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Language</Text>
          <Text style={styles.settingValue}>English (US)</Text>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Time Zone</Text>
          <Text style={styles.settingValue}>GMT+0</Text>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Privacy Policy</Text>
          <Text style={styles.settingValue}>Read policy</Text>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>About</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Version</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Terms of Service</Text>
          <Text style={styles.settingValue}>Read terms</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  settingsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md, // More space between sections
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING['2xl'], // Enhanced touch target (≥44x44dp)
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLabel: {
    fontSize: FONTS.md,
    color: COLORS.text,
  },
  settingValue: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
});