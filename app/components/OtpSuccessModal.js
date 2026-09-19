import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { COLORS, BORDERS, BORDER_RADIUS, BRUTAL_SHADOWS, FONTS } from '../styles/theme';
import ComicBadge from './ComicBadge';
import { DoodleSparkle, DoodleCheck, DoodleStar, DoodleUnderline } from './DoodleElements';
import { getDiceBearAvatar, resolveProfileAvatar } from '../utils/avatar';

/**
 * DevDate OTP Success Modal — Pop Art Celebratory Verification Modal
 * Fully conforming to Pop Art x Doodle Art design system with ZERO Unicode emojis.
 */
export default function OtpSuccessModal({
  visible,
  onClose,
  onEnterDiscord,
  onViewProfile,
  primaryButtonText = 'PROCEED TO LOGIN',
  secondaryButtonText = 'SQUAD DETAILS & LOGIN',
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, BRUTAL_SHADOWS.md]}>
          {/* ================= HEADER SECTION (YELLOW) ================= */}
          <View style={styles.modalHeader}>
            {/* Top Badge & Close Row */}
            <View style={styles.headerTopRow}>
              <ComicBadge
                text="BOOM! // AUTHENTICATED!"
                color={COLORS.coral}
                textColor={COLORS.white}
                size="sm"
                rotate="-2deg"
              />

              <View style={styles.headerRightRow}>
                <View style={[styles.matchUnlockedPill, BRUTAL_SHADOWS.xs]}>
                  <Text style={styles.matchUnlockedText}>RIG VERIFIED</Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onClose}
                  style={[styles.closeBtn, BRUTAL_SHADOWS.xs]}
                  accessibilityRole="button"
                  accessibilityLabel="Close modal"
                >
                  <Text style={styles.closeBtnText}>X</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sparkle Icon Circle */}
            <View style={[styles.sparkleIconCircle, BRUTAL_SHADOWS.xs]}>
              <DoodleSparkle size={26} color={COLORS.ink} />
            </View>

            {/* Hero Title */}
            <Text style={styles.heroTitle}>YOU'RE IN THE SQUAD!</Text>

            <DoodleUnderline width={140} color={COLORS.coral} height={3} style={{ marginBottom: 6 }} />

            {/* Subtitle Pill */}
            <View style={styles.subtitlePill}>
              <Text style={styles.subtitlePillText}>
                Mission Code Accepted! Identity verified for DevDate.
              </Text>
            </View>
          </View>

          {/* ================= SQUAD MATCH SECTION (CREAM / CYAN) ================= */}
          <View style={styles.squadSection}>
            {/* Tag Badges */}
            <View style={styles.tagBadgesRow}>
              <View style={[styles.tagPill, { backgroundColor: COLORS.ink }]}>
                <Text style={[styles.tagText, { color: COLORS.white }]}>
                  DEVDATE #2026
                </Text>
              </View>

              <View style={[styles.tagPill, { backgroundColor: COLORS.coral }]}>
                <Text style={[styles.tagText, { color: COLORS.white }]}>
                  BIO MATCH
                </Text>
              </View>

              <View style={[styles.tagPill, { backgroundColor: COLORS.lime }]}>
                <Text style={[styles.tagText, { color: COLORS.ink }]}>
                  98% COMPATIBLE
                </Text>
              </View>
            </View>

            {/* Dual Co-Founder Connected Cards */}
            <View style={styles.coFoundersRow}>
              {/* Member 1: Rahul Patel */}
              <View style={[styles.memberCard, BRUTAL_SHADOWS.xs, { marginRight: 4 }]}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{
                      uri: resolveProfileAvatar('', 'Rahul Patel', 'voxel-bot'),
                    }}
                    style={styles.memberAvatar}
                  />
                  <View style={styles.gradYearBadge}>
                    <Text style={styles.gradYearText}>CS '26</Text>
                  </View>
                </View>
                <Text style={styles.memberName} numberOfLines={1}>
                  RAHUL PATEL
                </Text>
                <Text style={styles.memberRole}>Full Stack Lead</Text>
              </View>

              {/* Member 2: Alex Chen */}
              <View style={[styles.memberCard, BRUTAL_SHADOWS.xs, { marginLeft: 4 }]}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{
                      uri: resolveProfileAvatar('', 'Alex Chen', 'voxel-bot'),
                    }}
                    style={styles.memberAvatar}
                  />
                  <View style={styles.gradYearBadge}>
                    <Text style={styles.gradYearText}>CS '26</Text>
                  </View>
                </View>
                <Text style={styles.memberName} numberOfLines={1}>
                  ALEX CHEN
                </Text>
                <Text style={styles.memberRole}>Backend Architect</Text>
              </View>
            </View>

            {/* Squad metadata footer */}
            <View style={styles.squadMetaRow}>
              <Text style={styles.squadMetaLeft}>// AGENTIC RAG SQUAD</Text>
              <Text style={styles.squadMetaRight}>CHANNEL #SQUAD-ALPHA</Text>
            </View>
          </View>

          {/* ================= ACTIONS SECTION ================= */}
          <View style={styles.actionsSection}>
            {/* Primary Action Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onEnterDiscord || onClose}
              style={[styles.primaryModalBtn, BRUTAL_SHADOWS.sm]}
              accessibilityRole="button"
              accessibilityLabel={primaryButtonText}
            >
              <DoodleCheck size={14} color={COLORS.ink} />
              <Text style={styles.primaryModalBtnText}>{primaryButtonText}</Text>
            </TouchableOpacity>

            {/* Secondary Action Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onViewProfile || onClose}
              style={[styles.secondaryModalBtn, BRUTAL_SHADOWS.xs]}
              accessibilityRole="button"
              accessibilityLabel={secondaryButtonText}
            >
              <Text style={styles.secondaryModalBtnText}>
                {secondaryButtonText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(24, 24, 27, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.creamBg,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    alignItems: 'center',
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.borderBlack,
  },
  headerTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchUnlockedPill: {
    backgroundColor: COLORS.lime,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  matchUnlockedText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.4,
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
  },
  sparkleIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.lime,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.ink,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subtitlePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
  },
  subtitlePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.ink,
    textAlign: 'center',
  },
  squadSection: {
    backgroundColor: COLORS.cyan,
    padding: 14,
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.borderBlack,
  },
  tagBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  tagPill: {
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  coFoundersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  memberCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.md,
    padding: 10,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  memberAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    backgroundColor: COLORS.creamDark,
  },
  gradYearBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  gradYearText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.ink,
  },
  memberName: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
  },
  memberRole: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 1,
  },
  squadMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  squadMetaLeft: {
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.ink,
  },
  squadMetaRight: {
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.ink,
  },
  actionsSection: {
    backgroundColor: COLORS.creamBg,
    padding: 14,
    gap: 8,
  },
  primaryModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 12,
  },
  primaryModalBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  secondaryModalBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
  },
  secondaryModalBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
});
