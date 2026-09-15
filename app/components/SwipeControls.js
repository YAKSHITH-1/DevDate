import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, BRUTAL_SHADOWS } from '../styles/theme';

export default function SwipeControls({ onRewind, onPass, onLike, onSuperLike }) {
  return (
    <View style={styles.controlsRow}>
      {/* 1. REWIND / UNDO (↺) */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onRewind}
        style={[styles.btnSmall, styles.bgWhite, BRUTAL_SHADOWS.xs]}
      >
        <Text style={styles.iconRewind}>↺</Text>
      </TouchableOpacity>

      {/* 2. SKIP / PASS (reject.png) */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPass}
        style={[styles.btnLarge, styles.bgRed, BRUTAL_SHADOWS.sm]}
      >
        <Image
          source={require('../assets/reject.png')}
          style={styles.iconRejectImg}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* 3. LIKE / MATCH (like.png) */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onLike}
        style={[styles.btnLarge, styles.bgGreen, BRUTAL_SHADOWS.sm]}
      >
        <Image
          source={require('../assets/like.png')}
          style={styles.iconLikeImg}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* 4. SUPER LIKE (★) */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onSuperLike}
        style={[styles.btnSmall, styles.bgBlue, BRUTAL_SHADOWS.xs]}
      >
        <Text style={styles.iconStar}>★</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  btnSmall: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2.5,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLarge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2.5,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgWhite: {
    backgroundColor: '#FFFFFF',
  },
  bgRed: {
    backgroundColor: '#FF4B4B',
  },
  bgGreen: {
    backgroundColor: '#4ADE80',
  },
  bgBlue: {
    backgroundColor: '#93C5FD',
  },
  iconRewind: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000000',
  },
  iconSkip: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000000',
  },
  iconHeart: {
    fontSize: 26,
    color: '#000000',
  },
  iconStar: {
    fontSize: 22,
    color: '#000000',
  },
  iconRejectImg: {
    width: 28,
    height: 28,
  },
  iconLikeImg: {
    width: 32,
    height: 32,
  },
});
