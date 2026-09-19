import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS, BORDERS, BRUTAL_SHADOWS } from '../styles/theme';

/**
 * Pure React Native Doodle & Pop Art Graphic Elements
 * Zero external SVG dependencies. Fully responsive across Web, iOS, and Android.
 * Zero Unicode emojis.
 */

// 1. Drawn 4-Point Doodle Star
export function DoodleStar({ size = 18, color = COLORS.ink, style }) {
  const half = size / 2;
  const point = size * 0.42;

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      {/* Vertical pointed diamond */}
      <View
        style={{
          position: 'absolute',
          width: point,
          height: size,
          backgroundColor: color,
          borderRadius: point / 2,
          transform: [{ scaleX: 0.45 }],
        }}
      />
      {/* Horizontal pointed diamond */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: point,
          backgroundColor: color,
          borderRadius: point / 2,
          transform: [{ scaleY: 0.45 }],
        }}
      />
      {/* Center diamond core */}
      <View
        style={{
          position: 'absolute',
          width: size * 0.45,
          height: size * 0.45,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
          borderRadius: 2,
        }}
      />
    </View>
  );
}

// 2. Doodle Sparkle (4-Ray energetic spark mark)
export function DoodleSparkle({ size = 16, color = COLORS.yellow, style }) {
  const lineThickness = Math.max(1.8, size * 0.14);

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      {/* Crossed rays */}
      <View
        style={{
          position: 'absolute',
          width: lineThickness,
          height: size,
          backgroundColor: color,
          borderRadius: lineThickness / 2,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size,
          height: lineThickness,
          backgroundColor: color,
          borderRadius: lineThickness / 2,
        }}
      />
      {/* Diagonal smaller rays */}
      <View
        style={{
          position: 'absolute',
          width: lineThickness,
          height: size * 0.65,
          backgroundColor: color,
          borderRadius: lineThickness / 2,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: lineThickness,
          height: size * 0.65,
          backgroundColor: color,
          borderRadius: lineThickness / 2,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

// 3. Doodle Code Tag (Developer </> or {} sketch badge)
export function DoodleCode({
  symbol = '</>',
  color = COLORS.ink,
  bgColor = COLORS.yellowHighlight,
  style,
  textStyle,
}) {
  return (
    <View
      style={[
        styles.codeBadge,
        {
          backgroundColor: bgColor,
          borderColor: color,
        },
        style,
      ]}
    >
      <Text style={[styles.codeText, { color }, textStyle]}>{symbol}</Text>
    </View>
  );
}

// 4. Doodle Terminal Prompt ($ _)
export function DoodleTerminal({ prompt = '$ _', color = COLORS.ink, style, textStyle }) {
  return (
    <View style={[styles.terminalWrap, style]}>
      <Text style={[styles.terminalText, { color }, textStyle]}>{prompt}</Text>
    </View>
  );
}

// 5. Drawn Doodle Arrow (-> or <-)
export function DoodleArrow({ direction = 'right', size = 18, color = COLORS.ink, style }) {
  const isLeft = direction === 'left';
  const stemWidth = size * 0.75;
  const headSize = size * 0.38;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ rotate: isLeft ? '180deg' : '0deg' }],
        },
        style,
      ]}
    >
      {/* Horizontal Stem */}
      <View
        style={{
          position: 'absolute',
          left: 1,
          width: stemWidth,
          height: 2.2,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      {/* Arrow Head Top Ray */}
      <View
        style={{
          position: 'absolute',
          right: 2,
          top: size / 2 - headSize * 0.35,
          width: headSize,
          height: 2.2,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '42deg' }],
        }}
      />
      {/* Arrow Head Bottom Ray */}
      <View
        style={{
          position: 'absolute',
          right: 2,
          bottom: size / 2 - headSize * 0.35,
          width: headSize,
          height: 2.2,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '-42deg' }],
        }}
      />
    </View>
  );
}

// 6. Drawn Doodle User Silhouette (Replaces avatar icon)
export function DoodleUser({ size = 22, color = COLORS.ink, fillColor = '#FFFFFF', style }) {
  const headSize = Math.round(size * 0.42);
  const bodyWidth = Math.round(size * 0.82);
  const bodyHeight = Math.round(size * 0.48);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {/* Head */}
      <View
        style={{
          width: headSize,
          height: headSize,
          borderRadius: headSize / 2,
          borderWidth: 2,
          borderColor: color,
          backgroundColor: fillColor,
          marginBottom: 1,
        }}
      />
      {/* Shoulders */}
      <View
        style={{
          width: bodyWidth,
          height: bodyHeight,
          borderTopLeftRadius: bodyWidth / 2,
          borderTopRightRadius: bodyWidth / 2,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
          borderWidth: 2,
          borderColor: color,
          backgroundColor: fillColor,
        }}
      />
    </View>
  );
}

// 7. Drawn Doodle Folder / Project Icon (Replaces folder/projects icon)
export function DoodleFolder({ size = 22, color = COLORS.ink, fillColor = '#FFFFFF', style }) {
  const folderWidth = Math.round(size * 0.88);
  const folderHeight = Math.round(size * 0.62);
  const tabWidth = Math.round(folderWidth * 0.44);
  const tabHeight = Math.round(size * 0.22);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <View style={{ width: folderWidth, height: folderHeight + tabHeight - 2 }}>
        {/* Folder tab */}
        <View
          style={{
            width: tabWidth,
            height: tabHeight,
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
            borderWidth: 1.8,
            borderBottomWidth: 0,
            borderColor: color,
            backgroundColor: fillColor,
            marginLeft: 1,
          }}
        />
        {/* Folder body */}
        <View
          style={{
            width: folderWidth,
            height: folderHeight,
            marginTop: -2,
            borderRadius: 4,
            borderWidth: 1.8,
            borderColor: color,
            backgroundColor: fillColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Subtle horizontal code/accent bar */}
          <View
            style={{
              width: folderWidth * 0.46,
              height: 2,
              backgroundColor: color,
              borderRadius: 1,
            }}
          />
        </View>
      </View>
    </View>
  );
}

// 8. Drawn Doodle Check
export function DoodleCheck({ size = 16, color = COLORS.green, style }) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {/* Short leg */}
      <View
        style={{
          position: 'absolute',
          left: size * 0.15,
          top: size * 0.45,
          width: size * 0.35,
          height: 2.4,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '45deg' }],
        }}
      />
      {/* Long leg */}
      <View
        style={{
          position: 'absolute',
          right: size * 0.12,
          top: size * 0.35,
          width: size * 0.65,
          height: 2.4,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '-52deg' }],
        }}
      />
    </View>
  );
}

// 8. Drawn Doodle Cross
export function DoodleCross({ size = 16, color = COLORS.coral, style }) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <View
        style={{
          position: 'absolute',
          width: size * 0.75,
          height: 2.4,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.75,
          height: 2.4,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

// 9. Doodle Sketch Underline (Playful wavy or organic underline)
export function DoodleUnderline({ width = '100%', color = COLORS.yellow, height = 4, style }) {
  return (
    <View style={[{ width, height: height + 2, overflow: 'hidden' }, style]}>
      <View
        style={{
          width: '100%',
          height: height,
          backgroundColor: color,
          borderRadius: height / 2,
          transform: [{ rotate: '-0.8deg' }],
        }}
      />
    </View>
  );
}

// 10. Doodle Sketch Box / Badge Container
export function DoodleBadge({
  children,
  bgColor = COLORS.creamLight,
  borderColor = COLORS.ink,
  style,
}) {
  return (
    <View
      style={[
        styles.sketchBox,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
        },
        BRUTAL_SHADOWS.xs,
        style,
      ]}
    >
      {children}
    </View>
  );
}

// 11. Doodle Separator
export function DoodleSeparator({ color = COLORS.borderLight, style }) {
  return (
    <View style={[styles.separatorWrap, style]}>
      <View style={[styles.separatorLine, { backgroundColor: color }]} />
      <View style={[styles.separatorDot, { backgroundColor: COLORS.ink }]} />
      <View style={[styles.separatorLine, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  codeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  terminalWrap: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLORS.creamDark,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  terminalText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sketchBox: {
    borderWidth: 2,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  separatorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 12,
    gap: 8,
  },
  separatorLine: {
    flex: 1,
    height: 1.5,
  },
  separatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
