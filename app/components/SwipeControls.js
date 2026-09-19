import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, BORDERS, BRUTAL_SHADOWS } from '../styles/theme';
import { DoodleStar, DoodleArrow, DoodleUnderline } from './DoodleElements';

export default function SwipeControls({ onRewind, onPass, onLike, onSuperLike }) {
  return (
    <View style={styles.controlsWrapper}>
      <View style={styles.controlsRow}>
        {/* 1. REWIND / UNDO */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onRewind}
          accessibilityRole="button"
          accessibilityLabel="Rewind last profile"
          style={[styles.btnSmall, styles.bgWhite, BRUTAL_SHADOWS.xs]}
        >
          <DoodleArrow direction="left" size={20} color={COLORS.ink} />
        </TouchableOpacity>

        {/* 2. SKIP / PASS */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPass}
          accessibilityRole="button"
          accessibilityLabel="Pass profile"
          style={[styles.btnLarge, styles.bgRed, BRUTAL_SHADOWS.sm]}
        >
          <Image
            source={require('../assets/reject.png')}
            style={styles.iconRejectImg}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* 3. INVITE / MATCH */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onLike}
          accessibilityRole="button"
          accessibilityLabel="Invite developer"
          style={[styles.btnLarge, styles.bgGreen, BRUTAL_SHADOWS.sm]}
        >
          <Image
            source={require('../assets/like.png')}
            style={styles.iconLikeImg}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* 4. SUPER LIKE — Drawn Doodle Star */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onSuperLike}
          accessibilityRole="button"
          accessibilityLabel="Super like profile"
          style={[styles.btnSmall, styles.bgBlue, BRUTAL_SHADOWS.xs]}
        >
          <DoodleStar size={22} color={COLORS.ink} />
        </TouchableOpacity>
      </View>

      {/* Subtle doodle underline accent below controls */}
      <View style={styles.underlineRow}>
        <DoodleUnderline width={60} height={3} color={COLORS.yellowHighlight} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controlsWrapper: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  underlineRow: {
    marginTop: 6,
    alignItems: 'center',
  },
  btnSmall: {
    width: 46,
    height: 46,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLarge: {
    width: 60,
    height: 60,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.borderBlack,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgWhite: {
    backgroundColor: COLORS.white,
  },
  bgRed: {
    backgroundColor: COLORS.coral,
  },
  bgGreen: {
    backgroundColor: COLORS.lime,
  },
  bgBlue: {
    backgroundColor: COLORS.btnBlue,
  },
  iconRejectImg: {
    width: 26,
    height: 26,
  },
  iconLikeImg: {
    width: 30,
    height: 30,
  },
});

