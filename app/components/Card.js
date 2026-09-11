import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/theme';

// Simple reusable card component following ponytail principles
export default function Card({
  title,
  subtitle,
  icon,
  iconColor = COLORS.primary,
  backgroundColor = COLORS.quaternary,
  onPress,
  accessibilityLabel,
  variant = 'default' // default, outline, action
}) {
  let containerStyle = styles.containerDefault;
  let iconContainerStyle = styles.iconContainerDefault;

  if (variant === 'outline') {
    containerStyle = styles.containerOutline;
    iconContainerStyle = styles.iconContainerOutline;
  } else if (variant === 'action') {
    containerStyle = styles.containerAction;
    iconContainerStyle = styles.iconContainerAction;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={variant === 'action' ? styles.actionButton : undefined}
    >
      <View style={containerStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={iconContainerStyle}>
            <Text style={{ color: iconColor, fontSize: FONTS.lg }}>
              {icon}
            </Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  containerDefault: {
    backgroundColor: COLORS.quaternary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  containerOutline: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.background,
    ...SHADOWS.card,
  },
  containerAction: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  iconContainerDefault: {
    width: SPACING['2xl'],
    height: SPACING['2xl'],
    backgroundColor: COLORS.quaternary,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  iconContainerOutline: {
    width: SPACING['2xl'],
    height: SPACING['2xl'],
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  iconContainerAction: {
    width: SPACING['3xl'],
    height: SPACING['3xl'],
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    ...SHADOWS.medium,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONTS.lg,
    fontWeight: '600',
    color: COLORS.textInverse,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textInverse,
    opacity: 0.9,
  },
  actionButton: {
    // Additional styling for action buttons if needed
  },
});