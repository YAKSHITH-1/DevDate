import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, BORDERS, BORDER_RADIUS, BRUTAL_SHADOWS } from '../styles/theme';

export default function ComicBadge({
  text,
  color = COLORS.pink,
  textColor = COLORS.white,
  rotate = '0deg',
  size = 'md',
  variant = 'default', // 'default' | 'pill' | 'sketch'
  iconNode,
  style,
  textStyle,
}) {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  let shapeRadius = BORDER_RADIUS.sm;
  if (variant === 'pill') shapeRadius = BORDER_RADIUS.pill;
  if (variant === 'sketch') shapeRadius = 8;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color,
          borderRadius: shapeRadius,
          transform: [{ rotate }],
          paddingVertical: isSmall ? 2 : isLarge ? 6 : 4,
          paddingHorizontal: isSmall ? 6 : isLarge ? 12 : 8,
        },
        BRUTAL_SHADOWS.xs,
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {iconNode && <View style={styles.iconContainer}>{iconNode}</View>}
        {text ? (
          <Text
            style={[
              styles.text,
              {
                color: textColor,
                fontSize: isSmall ? FONTS.xs : isLarge ? FONTS.sm + 1 : FONTS.xs + 1,
              },
              textStyle,
            ]}
          >
            {text}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
