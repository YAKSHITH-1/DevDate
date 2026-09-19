import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { COLORS, POP_PALETTE, POP_SHADOWS, BORDER_RADIUS, BORDERS } from '../styles/theme';
import { DoodleStar } from './DoodleElements';

export default function PopArtHeader({
  onBack,
  mode = 'login', // 'login' | 'signup' | 'otp'
  rightBadgeText = 'READY',
  powText = 'POW! // SQUAD UP',
  matchBadgeText = '98% CO-FOUNDER MATCH',
  onSettingsPress,
}) {
  const getBreadcrumb = () => {
    switch (mode) {
      case 'signup':
        return '// DEVDATE :: REGISTER';
      case 'otp':
        return '// DEVDATE :: VERIFY';
      case 'forgot':
        return '// DEVDATE :: RECOVER';
      case 'reset':
        return '// DEVDATE :: RESET';
      case 'login':
      default:
        return '// DEVDATE :: AUTH';
    }
  };

  return (
    <View style={styles.headerContainer}>
      {/* 1. TOP YELLOW STATUS BAR */}
      <View style={styles.topYellowBar}>
        {/* Back Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onBack}
          style={[styles.circleBtn, POP_SHADOWS.xs]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.circleBtnText}>←</Text>
        </TouchableOpacity>

        {/* Brand & Breadcrumb */}
        <View style={styles.brandTitleContainer}>
          <View style={styles.brandTitleRow}>
            <Text style={styles.brandTitleText}>DEVDATE</Text>
            <View style={styles.brandStarWrap}>
              <DoodleStar size={12} color={COLORS.coral} />
            </View>
          </View>
          <Text style={styles.breadcrumbText}>{getBreadcrumb()}</Text>
        </View>

        {/* Right Status Badges */}
        <View style={styles.rightActionsRow}>
          <View style={[styles.readyPill, POP_SHADOWS.xs]}>
            <Text style={styles.readyPillText}>{rightBadgeText}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSettingsPress}
            style={[styles.slidersCircleBtn, POP_SHADOWS.xs]}
            accessibilityRole="button"
            accessibilityLabel="Rig Settings"
          >
            {/* Custom vector slider lines */}
            <View style={styles.sliderIconWrap}>
              <View style={styles.sliderLine}>
                <View style={[styles.sliderKnob, { left: 2 }]} />
              </View>
              <View style={styles.sliderLine}>
                <View style={[styles.sliderKnob, { right: 2 }]} />
              </View>
              <View style={styles.sliderLine}>
                <View style={[styles.sliderKnob, { left: 4 }]} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. SPEECH BUBBLE & STAT PILL ROW */}
      <View style={styles.decalRow}>
        {/* POW! Speech Bubble */}
        <View style={[styles.powBubble, POP_SHADOWS.sm]}>
          <Text style={styles.powBubbleText}>{powText}</Text>
        </View>

        {/* Co-founder / Match Pill */}
        <View style={[styles.matchPill, POP_SHADOWS.xs]}>
          <Text style={styles.matchPillText}>{matchBadgeText}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  topYellowBar: {
    backgroundColor: COLORS.btnYellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: BORDERS.thick,
    borderBottomColor: COLORS.borderBlack,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.borderBlack,
    lineHeight: 22,
    marginTop: -2,
  },
  brandTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitleText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.borderBlack,
    letterSpacing: 0.8,
  },
  brandStarWrap: {
    marginLeft: 4,
  },
  breadcrumbText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#047857',
    letterSpacing: 0.6,
    marginTop: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readyPill: {
    backgroundColor: COLORS.coral,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  readyPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.6,
  },
  slidersCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.btnBlue,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderIconWrap: {
    width: 18,
    height: 14,
    justifyContent: 'space-between',
  },
  sliderLine: {
    width: '100%',
    height: 2,
    backgroundColor: COLORS.borderBlack,
    position: 'relative',
    justifyContent: 'center',
  },
  sliderKnob: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderBlack,
  },
  decalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  powBubble: {
    backgroundColor: COLORS.coral,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.borderBlack,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    transform: [{ rotate: '-1.5deg' }],
  },
  powBubbleText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  matchPill: {
    backgroundColor: COLORS.lime,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  matchPillText: {
    color: COLORS.borderBlack,
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
});
