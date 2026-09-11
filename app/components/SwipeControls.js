import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, BRUTAL_SHADOWS } from '../styles/theme';
import ComicBadge from './ComicBadge';

export default function SwipeControls({ onRewind, onPass, onBookmark, onLike }) {
  return (
    <View style={styles.controlsRow}>
      {/* 1. HOT MATCH / REWIND */}
      <View style={styles.buttonWrapper}>
        <ComicBadge
          text="HOT MATCH!"
          color={COLORS.cyan}
          textColor={COLORS.black}
          rotate="-10deg"
          size="sm"
          style={styles.floatingBadgeLeft}
        />
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onRewind}
          style={[styles.btnSmall, styles.bgWhite, BRUTAL_SHADOWS.sm]}
        >
          <Text style={styles.iconSmall}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* 2. NOPE / PASS */}
      <View style={styles.buttonWrapper}>
        <ComicBadge
          text="NOPE"
          color={COLORS.black}
          textColor={COLORS.white}
          rotate="-6deg"
          size="sm"
          style={styles.floatingBadgeCenter}
        />
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onPass}
          style={[styles.btnLarge, styles.bgPink, BRUTAL_SHADOWS.md]}
        >
          <Text style={styles.iconLargeWhite}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* 3. BOOKMARK / STAR */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onBookmark}
          style={[styles.btnMedium, styles.bgYellow, BRUTAL_SHADOWS.sm]}
        >
          <Text style={styles.iconMediumBlack}>★</Text>
        </TouchableOpacity>
      </View>

      {/* 4. YES! / MATCH */}
      <View style={styles.buttonWrapper}>
        <ComicBadge
          text="YES!"
          color={COLORS.yellow}
          textColor={COLORS.black}
          rotate="8deg"
          size="sm"
          style={styles.floatingBadgeRight}
        />
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onLike}
          style={[styles.btnLarge, styles.bgLime, BRUTAL_SHADOWS.md]}
        >
          <Text style={styles.iconLargeHandshake}>🤝</Text>
        </TouchableOpacity>
        {/* Pink star spark effect */}
        <Text style={styles.sparkleDecoration}>✦</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  buttonWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingBadgeLeft: {
    position: 'absolute',
    top: -16,
    left: -14,
    zIndex: 10,
  },
  floatingBadgeCenter: {
    position: 'absolute',
    top: -14,
    zIndex: 10,
  },
  floatingBadgeRight: {
    position: 'absolute',
    top: -14,
    right: -8,
    zIndex: 10,
  },
  btnSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnMedium: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLarge: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 3.5,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgWhite: {
    backgroundColor: COLORS.white,
  },
  bgPink: {
    backgroundColor: COLORS.pink,
  },
  bgYellow: {
    backgroundColor: COLORS.yellow,
  },
  bgLime: {
    backgroundColor: COLORS.lime,
  },
  iconSmall: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.black,
  },
  iconMediumBlack: {
    fontSize: 22,
    color: COLORS.black,
  },
  iconLargeWhite: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.white,
  },
  iconLargeHandshake: {
    fontSize: 28,
  },
  sparkleDecoration: {
    position: 'absolute',
    right: -14,
    bottom: 8,
    fontSize: 20,
    color: COLORS.pink,
    fontWeight: '900',
  },
});
