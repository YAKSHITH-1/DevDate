import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../styles/theme';
import {
  DoodleSparkle,
  DoodleCode,
  DoodleStar,
  DoodleArrow,
  DoodleTerminal,
} from './DoodleElements';

// Playful Pop Art x Doodle background: warm cream canvas with scattered sketch watermarks
function ComicHalftoneBackground() {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Warm cream base layer */}
      <View style={styles.creamCanvas} />

      {/* Scattered doodle watermark accents — very faint, non-intrusive */}
      <View style={styles.doodleLayer}>
        {/* Top-left cluster */}
        <View style={[styles.watermarkWrap, { top: 32, left: 14 }]}>
          <DoodleCode symbol="</>" color="rgba(24, 24, 27, 0.05)" bgColor="transparent" />
        </View>
        <View style={[styles.watermarkWrap, { top: 80, left: 50 }]}>
          <DoodleArrow direction="right" size={14} color="rgba(24, 24, 27, 0.04)" />
        </View>

        {/* Top-right cluster */}
        <View style={[styles.watermarkWrap, { top: 56, right: 22 }]}>
          <DoodleSparkle size={16} color="rgba(255, 222, 0, 0.20)" />
        </View>
        <View style={[styles.watermarkWrap, { top: 130, right: 40 }]}>
          <DoodleTerminal prompt="$_" color="rgba(24, 24, 27, 0.04)" />
        </View>

        {/* Mid-left */}
        <View style={[styles.watermarkWrap, { top: '35%', left: 18 }]}>
          <DoodleStar size={12} color="rgba(255, 75, 75, 0.08)" />
        </View>

        {/* Mid-right */}
        <View style={[styles.watermarkWrap, { top: '42%', right: 16 }]}>
          <DoodleCode symbol="{}" color="rgba(56, 189, 248, 0.10)" bgColor="transparent" />
        </View>

        {/* Center-left accent */}
        <View style={[styles.watermarkWrap, { top: '58%', left: 30 }]}>
          <DoodleArrow direction="right" size={12} color="rgba(255, 222, 0, 0.12)" />
        </View>

        {/* Lower-right cluster */}
        <View style={[styles.watermarkWrap, { bottom: 180, right: 24 }]}>
          <DoodleStar size={10} color="rgba(168, 85, 247, 0.08)" />
        </View>
        <View style={[styles.watermarkWrap, { bottom: 130, right: 60 }]}>
          <DoodleSparkle size={12} color="rgba(255, 75, 75, 0.08)" />
        </View>

        {/* Lower-left cluster */}
        <View style={[styles.watermarkWrap, { bottom: 140, left: 20 }]}>
          <DoodleCode symbol="</>" color="rgba(56, 189, 248, 0.06)" bgColor="transparent" />
        </View>
        <View style={[styles.watermarkWrap, { bottom: 90, left: 50 }]}>
          <DoodleTerminal prompt=">>>" color="rgba(24, 24, 27, 0.04)" />
        </View>

        {/* Bottom edge accents */}
        <View style={[styles.watermarkWrap, { bottom: 76, right: 30 }]}>
          <DoodleArrow direction="left" size={14} color="rgba(24, 24, 27, 0.04)" />
        </View>

        {/* Subtle hand-drawn circle outline */}
        <View style={[styles.watermarkWrap, { top: '22%', right: 10 }]}>
          <View style={styles.doodleCircle} />
        </View>
        <View style={[styles.watermarkWrap, { bottom: 200, left: 8 }]}>
          <View style={[styles.doodleCircle, { width: 18, height: 18, borderRadius: 9 }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    backgroundColor: COLORS.creamBg,
  },
  creamCanvas: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.creamBg,
  },
  doodleLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  watermarkWrap: {
    position: 'absolute',
    opacity: 0.85,
  },
  doodleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(24, 24, 27, 0.04)',
    borderStyle: 'dashed',
  },
});

export default React.memo(ComicHalftoneBackground);

