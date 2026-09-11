import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, BRUTAL_SHADOWS } from '../styles/theme';

export default function ComicBadge({
  text,
  color = COLORS.pink,
  textColor = COLORS.white,
  rotate = '0deg',
  size = 'md',
  style,
  textStyle,
}) {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color,
          transform: [{ rotate }],
          paddingVertical: isSmall ? 2 : isLarge ? 6 : 4,
          paddingHorizontal: isSmall ? 6 : isLarge ? 12 : 8,
        },
        BRUTAL_SHADOWS.xs,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: isSmall ? FONTS.xs : isLarge ? FONTS.sm + 1 : FONTS.xs + 2,
          },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: 6,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
