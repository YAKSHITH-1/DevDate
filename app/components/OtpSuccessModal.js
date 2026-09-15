import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Platform,
} from 'react-native';
import { POP_PALETTE, POP_SHADOWS, BORDER_RADIUS } from '../styles/theme';

export default function OtpSuccessModal({
  visible,
  onClose,
  onEnterDiscord,
  onViewProfile,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, POP_SHADOWS.modal]}>
          {/* ================= HEADER SECTION (YELLOW) ================= */}
          <View style={styles.modalHeader}>
            {/* Top Badge & Close Row */}
            <View style={styles.headerTopRow}>
              <View style={[styles.boomBadge, POP_SHADOWS.xs]}>
                <Text style={styles.boomBadgeText}>BOOM! ★ AUTHENTICATED!</Text>
              </View>

              <View style={styles.headerRightRow}>
                <View style={styles.matchUnlockedPill}>
                  <Text style={styles.matchUnlockedText}>MATCH UNLOCKED</Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onClose}
                  style={styles.closeBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Close modal"
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Rocket Icon in Green Circle */}
            <View style={styles.rocketIconCircle}>
              <Text style={styles.rocketIconText}>🚀</Text>
            </View>

            {/* Hero Title */}
            <Text style={styles.heroTitle}>YOU'RE IN THE SQUAD!</Text>

            {/* Subtitle Pill */}
            <View style={styles.subtitlePill}>
              <Text style={styles.subtitlePillText}>
                Mission Code Accepted! Rig verified for DevDate 🚀
              </Text>
            </View>
          </View>

          {/* ================= SQUAD MATCH SECTION (CYAN) ================= */}
          <View style={styles.squadSection}>
            {/* Tag Badges */}
            <View style={styles.tagBadgesRow}>
              <View style={[styles.tagPill, { backgroundColor: POP_PALETTE.inkBlack }]}>
                <Text style={[styles.tagText, { color: POP_PALETTE.pureWhite }]}>
                  DEVDATE #2026
                </Text>
              </View>

              <View style={[styles.tagPill, { backgroundColor: POP_PALETTE.pink }]}>
                <Text style={[styles.tagText, { color: POP_PALETTE.pureWhite }]}>
                  BIO MATCH
                </Text>
              </View>

              <View style={[styles.tagPill, { backgroundColor: POP_PALETTE.lime }]}>
                <Text style={[styles.tagText, { color: POP_PALETTE.inkBlack }]}>
                  98% COMPATIBLE
                </Text>
              </View>
            </View>

            {/* Dual Co-Founder Connected Cards */}
            <View style={styles.coFoundersRow}>
              {/* Member 1: Rahul Patel */}
              <View style={[styles.memberCard, { marginRight: 4 }]}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
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
                <Text style={styles.memberRole}>AI Lead</Text>
              </View>

              {/* Member 2: Alex Chen */}
              <View style={[styles.memberCard, { marginLeft: 4 }]}>
                <View style={styles.avatarContainer}>
                  <View style={[styles.memberAvatar, styles.avatarPinkPlaceholder]}>
                    <Text style={styles.avatarPinkText}>100</Text>
                  </View>
                  <View style={styles.gradYearBadge}>
                    <Text style={styles.gradYearText}>CS '26</Text>
                  </View>
                </View>
                <Text style={styles.memberName} numberOfLines={1}>
                  ALEX CHEN
                </Text>
                <Text style={styles.memberRole}>Frontend Wizard</Text>
              </View>
            </View>

            {/* Squad metadata footer */}
            <View style={styles.squadMetaRow}>
              <Text style={styles.squadMetaLeft}>🩵 AGENTIC RAG SQUAD</Text>
              <Text style={styles.squadMetaRight}>CHANNEL #SQUAD-ALPHA</Text>
            </View>
          </View>

          {/* ================= ACTIONS SECTION ================= */}
          <View style={styles.actionsSection}>
            {/* Primary Action Button: Enter Discord */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onEnterDiscord}
              style={[styles.primaryModalBtn, POP_SHADOWS.sm]}
              accessibilityRole="button"
              accessibilityLabel="Enter Squad Discord"
            >
              <Text style={styles.primaryModalBtnText}>💬 ENTER SQUAD DISCORD 🚀</Text>
            </TouchableOpacity>

            {/* Secondary Action Button: View Squad Profile */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onViewProfile}
              style={styles.secondaryModalBtn}
              accessibilityRole="button"
              accessibilityLabel="View Squad Profile and Details"
            >
              <Text style={styles.secondaryModalBtnText}>
                👥 VIEW SQUAD PROFILE & DETAILS
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
    backgroundColor: 'rgba(5, 12, 24, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: POP_PALETTE.pureWhite,
    borderWidth: 3.5,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: POP_PALETTE.yellow,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    alignItems: 'center',
    borderBottomWidth: 3.5,
    borderBottomColor: POP_PALETTE.inkBlack,
  },
  headerTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  boomBadge: {
    backgroundColor: POP_PALETTE.pink,
    borderWidth: 2.2,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    transform: [{ rotate: '-2deg' }],
  },
  boomBadgeText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: POP_PALETTE.pureWhite,
    letterSpacing: 0.6,
    fontStyle: 'italic',
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchUnlockedPill: {
    backgroundColor: POP_PALETTE.lime,
    borderWidth: 2,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  matchUnlockedText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    letterSpacing: 0.4,
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: POP_PALETTE.pureWhite,
    borderWidth: 2,
    borderColor: POP_PALETTE.inkBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    lineHeight: 14,
  },
  rocketIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: POP_PALETTE.lime,
    borderWidth: 2.8,
    borderColor: POP_PALETTE.inkBlack,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  rocketIconText: {
    fontSize: 22,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
    color: POP_PALETTE.inkBlack,
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  subtitlePill: {
    backgroundColor: POP_PALETTE.pureWhite,
    borderWidth: 2,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: '96%',
  },
  subtitlePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: POP_PALETTE.inkBlack,
    textAlign: 'center',
  },
  squadSection: {
    backgroundColor: POP_PALETTE.cyan,
    padding: 12,
    borderBottomWidth: 3.5,
    borderBottomColor: POP_PALETTE.inkBlack,
  },
  tagBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
  },
  tagPill: {
    borderWidth: 1.8,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  coFoundersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  memberCard: {
    flex: 1,
    backgroundColor: POP_PALETTE.pureWhite,
    borderWidth: 2.5,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  memberAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: POP_PALETTE.inkBlack,
  },
  avatarPinkPlaceholder: {
    backgroundColor: '#EC4899',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPinkText: {
    color: POP_PALETTE.pureWhite,
    fontWeight: '900',
    fontSize: 16,
  },
  gradYearBadge: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    backgroundColor: POP_PALETTE.yellow,
    borderWidth: 1.5,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  gradYearText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
  },
  memberName: {
    fontSize: 12,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 10,
    fontWeight: '700',
    color: POP_PALETTE.grayMuted,
  },
  squadMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    paddingHorizontal: 4,
  },
  squadMetaLeft: {
    fontSize: 9.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    letterSpacing: 0.4,
  },
  squadMetaRight: {
    fontSize: 9.5,
    fontWeight: '800',
    color: POP_PALETTE.inkBlack,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actionsSection: {
    backgroundColor: POP_PALETTE.canvasCream,
    padding: 14,
    gap: 10,
  },
  primaryModalBtn: {
    backgroundColor: POP_PALETTE.lime,
    borderWidth: 3,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: BORDER_RADIUS.pill,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryModalBtnText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    letterSpacing: 0.6,
  },
  secondaryModalBtn: {
    backgroundColor: POP_PALETTE.cyanLight,
    borderWidth: 2.2,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: BORDER_RADIUS.pill,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryModalBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    letterSpacing: 0.4,
  },
});
