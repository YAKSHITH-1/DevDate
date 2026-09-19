import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  RefreshControl,
} from 'react-native';
import { COLORS, BORDER_RADIUS, BORDERS, BRUTAL_SHADOWS, TYPOGRAPHY } from '../styles/theme';
import ComicBadge from '../components/ComicBadge';
import {
  DoodleStar,
  DoodleSparkle,
  DoodleCode,
  DoodleArrow,
  DoodleUnderline,
  DoodleCheck,
  DoodleCross,
  DoodleUser,
  DoodleSeparator,
} from '../components/DoodleElements';
import { useApp } from '../context/AppContext';
import { INITIAL_DEVELOPERS } from '../data/projectsData';

export default function MatchesScreen({ onOpenChat, onNavigateToSettings, onNavigateToProfile }) {
  const {
    invitations,
    matches,
    matchesLoading,
    refreshMatchesAndInvitations,
    acceptInvitation,
    rejectInvitation,
    pendingMatchCelebration,
    setPendingMatchCelebration,
    getOrCreateChatForMatch,
    currentUser,
    setSelectedDeveloperForProfile,
  } = useApp();

  const [activeSegment, setActiveSegment] = useState('invitations'); // 'invitations' | 'matches'
  const [selectedInviteDetail, setSelectedInviteDetail] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState(null);

  const showToast = (message, color = COLORS.lime) => {
    setFeedbackToast({ message, color });
    setTimeout(() => setFeedbackToast(null), 1600);
  };

  const handleAccept = async (invite) => {
    setSelectedInviteDetail(null);
    const res = await acceptInvitation(invite);
    if (res && res.success !== false) {
      const matchData = res.match || res;
      showToast(`ACCEPTED INVITATION FOR ${matchData?.projectName || invite.projectName || 'PROJECT'}!`);
    } else {
      showToast(res?.error || 'Failed to accept invitation', COLORS.pink);
    }
  };

  const handleReject = async (inviteId, devName) => {
    setSelectedInviteDetail(null);
    await rejectInvitation(inviteId, devName);
    showToast(`DECLINED INVITATION FROM ${devName.split(' ')[0]}`, COLORS.pink);
  };

  const handleOpenMatchChat = (match) => {
    const chat = getOrCreateChatForMatch(match);
    if (onOpenChat) {
      // Contract: Real MongoDB Match._id is used as the chat ID
      onOpenChat(chat.id || match.id);
    }
  };

  const handleOpenDevProfile = (devId, fallbackData) => {
    const fullDev = INITIAL_DEVELOPERS.find((d) => d.id === devId) || {
      id: devId,
      name: fallbackData.developerName || fallbackData.name || 'Developer',
      role: fallbackData.developerRole || fallbackData.role || 'Full Stack Developer',
      avatar: fallbackData.developerAvatar || fallbackData.avatar,
      matchScore: fallbackData.matchScore || 95,
      skills: ['React', 'Node.js', 'TypeScript', 'UI/UX'],
      bio: `Excited to collaborate on ${fallbackData.projectName || 'projects'}! Let's build together.`,
      experience: '3+ yrs exp',
      location: 'Remote OK',
      lookingTo: ['Join a project', 'Find co-founders'],
      interests: ['Web Apps', 'Indie Hacking', 'AI Tools'],
    };
    if (setSelectedDeveloperForProfile) {
      setSelectedDeveloperForProfile(fullDev);
    }
    if (onNavigateToProfile) {
      onNavigateToProfile(fullDev);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* ═══════════════════════════════════════════════════════════════
          1. TOP HEADER — Cream ink-bordered bar
         ═══════════════════════════════════════════════════════════════ */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <DoodleStar size={20} color={COLORS.yellow} style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>MATCHES & INVITES</Text>
          <DoodleSparkle size={14} color={COLORS.cyan} style={{ marginLeft: 6, marginTop: -4 }} />
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              if (refreshMatchesAndInvitations) {
                showToast('SYNCING MATCHES...', COLORS.yellow);
                refreshMatchesAndInvitations();
              }
            }}
            style={[styles.headerPillBtn, BRUTAL_SHADOWS.xs]}
          >
            <DoodleArrow direction="right" size={12} color={COLORS.ink} />
            <Text style={styles.headerPillBtnText}>SYNC</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              if (onNavigateToSettings) onNavigateToSettings();
            }}
            style={styles.headerGearBtn}
          >
            <DoodleStar size={16} color={COLORS.ink} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════════
          2. SEGMENTED TABS — Pop Art sticker tabs
         ═══════════════════════════════════════════════════════════════ */}
      <View style={styles.segmentedBar}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setActiveSegment('invitations');
            if (refreshMatchesAndInvitations) refreshMatchesAndInvitations();
          }}
          style={[
            styles.segmentBtn,
            activeSegment === 'invitations' && styles.segmentBtnActive,
            BRUTAL_SHADOWS.xs,
          ]}
        >
          <DoodleArrow direction="left" size={12} color={activeSegment === 'invitations' ? COLORS.ink : COLORS.textMuted} />
          <Text
            style={[
              styles.segmentText,
              activeSegment === 'invitations' && styles.segmentTextActive,
            ]}
          >
            INVITATIONS
          </Text>
          {invitations.length > 0 && (
            <View style={[styles.segmentBadge, BRUTAL_SHADOWS.xs]}>
              <Text style={styles.segmentBadgeText}>{invitations.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setActiveSegment('matches');
            if (refreshMatchesAndInvitations) refreshMatchesAndInvitations();
          }}
          style={[
            styles.segmentBtn,
            activeSegment === 'matches' && styles.segmentBtnActive,
            BRUTAL_SHADOWS.xs,
          ]}
        >
          <DoodleCheck size={12} color={activeSegment === 'matches' ? COLORS.green : COLORS.textMuted} />
          <Text
            style={[
              styles.segmentText,
              activeSegment === 'matches' && styles.segmentTextActive,
            ]}
          >
            MY MATCHES
          </Text>
          <View style={[styles.segmentBadgeMatches, BRUTAL_SHADOWS.xs]}>
            <Text style={styles.segmentBadgeText}>{matches.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ═══════════════════════════════════════════════════════════════
          FEEDBACK TOAST — Pop Art sticker pill
         ═══════════════════════════════════════════════════════════════ */}
      {feedbackToast && (
        <View style={[styles.toastContainer, { backgroundColor: feedbackToast.color }, BRUTAL_SHADOWS.sm]}>
          <DoodleSparkle size={12} color={COLORS.ink} style={{ marginRight: 6 }} />
          <Text style={styles.toastText}>{feedbackToast.message}</Text>
        </View>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          3. CONTENT AREA
         ═══════════════════════════════════════════════════════════════ */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(matchesLoading)}
            onRefresh={() => {
              if (refreshMatchesAndInvitations) refreshMatchesAndInvitations();
            }}
            tintColor={COLORS.yellow}
          />
        }
      >
        {activeSegment === 'invitations' ? (
          /* ─── INVITATIONS LIST ─── */
          invitations.length > 0 ? (
            <>
              {/* Section label */}
              <View style={styles.sectionLabelRow}>
                <DoodleArrow direction="right" size={14} color={COLORS.ink} />
                <Text style={styles.sectionLabelText}>
                  {invitations.length} PENDING {invitations.length === 1 ? 'INVITATION' : 'INVITATIONS'}
                </Text>
                <DoodleUnderline width={60} color={COLORS.yellow} height={3} style={{ marginLeft: 6 }} />
              </View>

              {invitations.map((inv, idx) => (
                <TouchableOpacity
                  key={inv.id}
                  activeOpacity={0.9}
                  onPress={() => setSelectedInviteDetail(inv)}
                  style={[styles.inviteCard, BRUTAL_SHADOWS.sm]}
                >
                  {/* Top Row: Avatar + Info */}
                  <View style={styles.inviteTopRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleOpenDevProfile(inv.developerId, inv)}
                    >
                      {inv.developerAvatar ? (
                        <Image source={{ uri: inv.developerAvatar }} style={styles.devAvatar} />
                      ) : (
                        <View style={[styles.devAvatar, styles.avatarFallback]}>
                          <Text style={styles.avatarFallbackText}>
                            {inv.developerName?.charAt(0)?.toUpperCase() || 'D'}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    <View style={styles.devInfo}>
                      <View style={styles.nameScoreRow}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => handleOpenDevProfile(inv.developerId, inv)}
                        >
                          <Text style={styles.devName}>{inv.developerName}</Text>
                        </TouchableOpacity>
                        <View style={[styles.scorePill, BRUTAL_SHADOWS.xs]}>
                          <DoodleStar size={8} color={COLORS.ink} style={{ marginRight: 3 }} />
                          <Text style={styles.scorePillText}>{inv.matchScore}% MATCH</Text>
                        </View>
                      </View>
                      <Text style={styles.devRole}>{inv.developerRole}</Text>
                      <View style={styles.projectTagPill}>
                        <DoodleCode symbol="{ }" color={COLORS.ink} bgColor="transparent" style={{ borderWidth: 0, padding: 0, marginRight: 4 }} textStyle={{ fontSize: 8 }} />
                        <Text style={styles.projectTagPillText}>FOR: {inv.projectName}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Doodle separator */}
                  <View style={styles.cardDivider} />

                  {/* Actions Row */}
                  <View style={styles.inviteActionsRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleReject(inv.id, inv.developerName)}
                      style={[styles.rejectBtn, BRUTAL_SHADOWS.xs]}
                    >
                      <DoodleCross size={12} color={COLORS.coral} style={{ marginRight: 4 }} />
                      <Text style={styles.rejectBtnText}>DECLINE</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleAccept(inv)}
                      style={[styles.acceptBtn, BRUTAL_SHADOWS.xs]}
                    >
                      <DoodleCheck size={12} color="#166534" style={{ marginRight: 4 }} />
                      <Text style={styles.acceptBtnText}>ACCEPT & MATCH</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            /* ─── INVITATIONS EMPTY STATE ─── */
            <View style={[styles.emptyBox, BRUTAL_SHADOWS.sm]}>
              <DoodleCode symbol="</>" color={COLORS.ink} bgColor={COLORS.yellowHighlight} style={{ marginBottom: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 2, borderRadius: 8 }} textStyle={{ fontSize: 16 }} />
              <Text style={styles.emptyTitle}>NO PENDING INVITATIONS</Text>
              <DoodleUnderline width={140} color={COLORS.yellow} height={3} style={{ marginBottom: 10 }} />
              <Text style={styles.emptySubtitle}>
                Swipe right on developers in Discover to send collaboration invites.
              </Text>
              <View style={styles.emptyHintRow}>
                <DoodleArrow direction="right" size={14} color={COLORS.textMuted} />
                <Text style={styles.emptyHintText}>Head to Discover to find teammates</Text>
              </View>
            </View>
          )
        ) : (
          /* ─── MATCHES LIST ─── */
          matches.length > 0 ? (
            <>
              {/* Section label */}
              <View style={styles.sectionLabelRow}>
                <DoodleCheck size={14} color={COLORS.green} />
                <Text style={styles.sectionLabelText}>
                  {matches.length} {matches.length === 1 ? 'MATCH' : 'MATCHES'} FOUND
                </Text>
                <DoodleUnderline width={60} color={COLORS.lime} height={3} style={{ marginLeft: 6 }} />
              </View>

              {matches.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  activeOpacity={0.85}
                  onPress={() => handleOpenMatchChat(m)}
                  style={[styles.matchCard, BRUTAL_SHADOWS.sm]}
                >
                  {/* Avatar */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleOpenDevProfile(m.developerId, m)}
                  >
                    {m.developerAvatar ? (
                      <Image source={{ uri: m.developerAvatar }} style={styles.devAvatar} onError={() => {}} />
                    ) : (
                      <View style={[styles.devAvatar, styles.avatarFallback]}>
                        <Text style={styles.avatarFallbackText}>
                          {m.developerName?.charAt(0)?.toUpperCase() || 'D'}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Match Info */}
                  <View style={styles.matchInfo}>
                    <View style={styles.nameScoreRow}>
                      <Text style={styles.devName}>{m.developerName}</Text>
                      <View style={[styles.matchBadgePill, BRUTAL_SHADOWS.xs]}>
                        <Text style={styles.matchBadgePillText}>{m.matchScore}% MATCH</Text>
                      </View>
                    </View>
                    <Text style={styles.devRole}>{m.developerRole}</Text>
                    <View style={styles.projectTagPill}>
                      <Text style={styles.projectTagPillText}>{m.projectName}</Text>
                    </View>
                    {m.recentMessage ? (
                      <Text style={styles.recentMsgText} numberOfLines={1}>
                        {m.recentMessage}
                      </Text>
                    ) : null}
                  </View>

                  {/* Chat Action Bubble */}
                  <View style={[styles.chatActionBubble, BRUTAL_SHADOWS.xs]}>
                    <DoodleArrow direction="right" size={16} color={COLORS.ink} />
                  </View>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            /* ─── MATCHES EMPTY STATE ─── */
            <View style={[styles.emptyBox, BRUTAL_SHADOWS.sm]}>
              <View style={styles.emptyStarCluster}>
                <DoodleStar size={22} color={COLORS.yellow} style={{ marginRight: 4 }} />
                <DoodleStar size={14} color={COLORS.cyan} style={{ marginTop: 6 }} />
                <DoodleStar size={18} color={COLORS.lime} style={{ marginLeft: 4, marginTop: -2 }} />
              </View>
              <Text style={styles.emptyTitle}>NO MATCHES YET</Text>
              <DoodleUnderline width={120} color={COLORS.cyan} height={3} style={{ marginBottom: 10 }} />
              <Text style={styles.emptySubtitle}>
                Accept incoming invitations or discover developers to form project squads!
              </Text>
              <View style={styles.emptyHintRow}>
                <DoodleArrow direction="left" size={14} color={COLORS.textMuted} />
                <Text style={styles.emptyHintText}>Check Invitations tab for pending requests</Text>
              </View>
            </View>
          )
        )}
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════════
          4. IT'S A MATCH! CELEBRATION MODAL
         ═══════════════════════════════════════════════════════════════ */}
      <Modal
        visible={!!pendingMatchCelebration}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingMatchCelebration(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, styles.celebrationCard, BRUTAL_SHADOWS.md]}>
            {/* Corner sparkles */}
            <DoodleSparkle size={20} color={COLORS.yellow} style={{ position: 'absolute', top: 12, left: 14 }} />
            <DoodleSparkle size={14} color={COLORS.cyan} style={{ position: 'absolute', top: 16, right: 18 }} />
            <DoodleStar size={12} color={COLORS.lime} style={{ position: 'absolute', bottom: 16, left: 20 }} />
            <DoodleStar size={16} color={COLORS.orange} style={{ position: 'absolute', bottom: 14, right: 16 }} />

            <ComicBadge
              text="IT'S A MATCH!"
              color={COLORS.yellow}
              textColor={COLORS.ink}
              rotate="-3deg"
              size="md"
            />

            {pendingMatchCelebration && (
              <>
                <View style={styles.avatarsConnectedRow}>
                  {currentUser?.avatar ? (
                    <Image
                      source={{ uri: currentUser.avatar }}
                      style={styles.connectedAvatar}
                      onError={() => {}}
                    />
                  ) : (
                    <View style={[styles.connectedAvatar, styles.avatarFallback]}>
                      <Text style={styles.avatarFallbackText}>
                        {currentUser?.name?.charAt(0)?.toUpperCase() || 'D'}
                      </Text>
                    </View>
                  )}

                  {/* Connector burst */}
                  <View style={[styles.connectBurst, BRUTAL_SHADOWS.xs]}>
                    <DoodleStar size={16} color={COLORS.ink} />
                  </View>

                  {pendingMatchCelebration.developerAvatar ? (
                    <Image
                      source={{ uri: pendingMatchCelebration.developerAvatar }}
                      style={styles.connectedAvatar}
                      onError={() => {}}
                    />
                  ) : (
                    <View style={[styles.connectedAvatar, styles.avatarFallback]}>
                      <Text style={styles.avatarFallbackText}>
                        {pendingMatchCelebration.developerName?.charAt(0)?.toUpperCase() || 'D'}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.celebrationHeading}>
                  You & {pendingMatchCelebration.developerName}
                </Text>

                <View style={[styles.projectPillLarge, BRUTAL_SHADOWS.xs]}>
                  <DoodleCode symbol="{ }" color={COLORS.ink} bgColor="transparent" style={{ borderWidth: 0, padding: 0, marginRight: 6 }} textStyle={{ fontSize: 9 }} />
                  <Text style={styles.projectPillLargeText}>
                    COLLABORATING ON: {pendingMatchCelebration.projectName}
                  </Text>
                </View>

                <Text style={styles.celebrationSub}>
                  You both connected to build together. Jump into the project chat to start discussing the codebase!
                </Text>

                <DoodleSeparator color={COLORS.borderLight} style={{ marginBottom: 16 }} />

                <View style={styles.celebrationActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      const matchToOpen = pendingMatchCelebration;
                      setPendingMatchCelebration(null);
                      handleOpenMatchChat(matchToOpen);
                    }}
                    style={[styles.chatNowBtn, BRUTAL_SHADOWS.sm]}
                  >
                    <DoodleArrow direction="right" size={16} color={COLORS.ink} style={{ marginRight: 6 }} />
                    <Text style={styles.chatNowBtnText}>OPEN PROJECT CHAT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setPendingMatchCelebration(null)}
                    style={styles.keepBrowsingBtn}
                  >
                    <Text style={styles.keepBrowsingBtnText}>KEEP BROWSING</Text>
                    <DoodleUnderline width={100} color={COLORS.borderLight} height={2} style={{ marginTop: 2 }} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════
          5. INVITATION DETAIL MODAL
         ═══════════════════════════════════════════════════════════════ */}
      <Modal
        visible={!!selectedInviteDetail}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedInviteDetail(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, BRUTAL_SHADOWS.md]}>
            {/* Header Row */}
            <View style={styles.modalHeaderRow}>
              <ComicBadge text="INVITATION DETAILS" color={COLORS.cyan} textColor={COLORS.ink} size="sm" />
              <TouchableOpacity onPress={() => setSelectedInviteDetail(null)} style={[styles.modalCloseBtn, BRUTAL_SHADOWS.xs]}>
                <DoodleCross size={12} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {selectedInviteDetail && (
              <>
                {/* Developer Avatar */}
                {selectedInviteDetail.developerAvatar ? (
                  <Image source={{ uri: selectedInviteDetail.developerAvatar }} style={styles.detailAvatar} />
                ) : (
                  <View style={[styles.detailAvatar, styles.avatarFallback]}>
                    <Text style={styles.avatarFallbackLgText}>
                      {selectedInviteDetail.developerName?.charAt(0)?.toUpperCase() || 'D'}
                    </Text>
                  </View>
                )}

                <Text style={styles.detailName}>{selectedInviteDetail.developerName}</Text>
                <Text style={styles.detailRole}>{selectedInviteDetail.developerRole}</Text>

                {/* Project Info Card */}
                <View style={[styles.detailProjectCard, BRUTAL_SHADOWS.xs]}>
                  <View style={styles.detailProjectCardHeader}>
                    <DoodleCode symbol="{ }" color={COLORS.ink} bgColor={COLORS.yellowHighlight} style={{ marginRight: 8 }} textStyle={{ fontSize: 10 }} />
                    <Text style={styles.detailProjectTitle}>PROJECT: {selectedInviteDetail.projectName}</Text>
                  </View>
                  <DoodleSeparator color={COLORS.borderLight} style={{ marginVertical: 8 }} />
                  <View style={styles.detailMatchScoreRow}>
                    <DoodleStar size={14} color={COLORS.yellow} />
                    <Text style={styles.detailProjectMatch}>Match Score: {selectedInviteDetail.matchScore}%</Text>
                  </View>
                </View>

                {/* View Profile Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    const d = selectedInviteDetail;
                    setSelectedInviteDetail(null);
                    handleOpenDevProfile(d.developerId, d);
                  }}
                  style={[styles.viewProfileModalBtn, BRUTAL_SHADOWS.xs]}
                >
                  <DoodleUser size={14} color={COLORS.ink} fillColor={COLORS.yellowHighlight} style={{ marginRight: 6 }} />
                  <Text style={styles.viewProfileModalBtnText}>VIEW FULL DEVELOPER PROFILE</Text>
                </TouchableOpacity>

                {/* Action Buttons */}
                <View style={styles.detailActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleReject(selectedInviteDetail.id, selectedInviteDetail.developerName)}
                    style={[styles.rejectBtn, BRUTAL_SHADOWS.xs]}
                  >
                    <DoodleCross size={12} color={COLORS.coral} style={{ marginRight: 4 }} />
                    <Text style={styles.rejectBtnText}>DECLINE</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleAccept(selectedInviteDetail)}
                    style={[styles.acceptBtn, BRUTAL_SHADOWS.xs]}
                  >
                    <DoodleCheck size={12} color="#166534" style={{ marginRight: 4 }} />
                    <Text style={styles.acceptBtnText}>ACCEPT INVITATION</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.creamBg,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: BORDERS.thick,
    borderBottomColor: COLORS.ink,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  headerPillBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.ink,
    letterSpacing: 0.4,
  },
  headerGearBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Segmented Tabs ──
  segmentedBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.creamLight,
    borderBottomWidth: BORDERS.thick,
    borderBottomColor: COLORS.ink,
    gap: 10,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 16,
    paddingVertical: 8,
    gap: 5,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.yellow,
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 0.4,
  },
  segmentTextActive: {
    color: COLORS.ink,
  },
  segmentBadge: {
    backgroundColor: COLORS.coral,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
  },
  segmentBadgeMatches: {
    backgroundColor: COLORS.cyan,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
  },
  segmentBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.white,
  },

  // ── Toast ──
  toastContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.ink,
  },
  toastText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
  },

  // ── Scroll ──
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 28,
  },

  // ── Section Label ──
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  sectionLabelText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },

  // ── Invitation Card ──
  inviteCard: {
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 24,
    padding: 14,
  },
  inviteTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  cardDivider: {
    height: 1.5,
    backgroundColor: COLORS.borderLight,
    marginBottom: 10,
    borderRadius: 1,
  },
  inviteActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  // ── Match Card ──
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 24,
    padding: 14,
    gap: 12,
  },
  matchInfo: {
    flex: 1,
  },

  // ── Shared Avatar ──
  devAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.ink,
  },
  devInfo: {
    flex: 1,
  },
  nameScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  devName: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
  },
  devRole: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // ── Score / Match Pills ──
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.yellowHighlight,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  scorePillText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.ink,
  },
  matchBadgePill: {
    backgroundColor: COLORS.pillGreen,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  matchBadgePillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#15803D',
  },

  // ── Project Tag ──
  projectTagPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pillBlue,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  projectTagPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0369A1',
  },
  recentMsgText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 4,
    fontStyle: 'italic',
  },

  // ── Action Buttons ──
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.pillCoral,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 14,
    paddingVertical: 9,
  },
  rejectBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#991B1B',
    letterSpacing: 0.4,
  },
  acceptBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.pillGreen,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 14,
    paddingVertical: 9,
  },
  acceptBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#166534',
    letterSpacing: 0.4,
  },

  // ── Chat Bubble ──
  chatActionBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Empty States ──
  emptyBox: {
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginTop: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  emptyHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  emptyHintText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  emptyStarCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  // ── Modal Shared ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(24, 24, 27, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.creamBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 26,
    borderWidth: 3.5,
    borderColor: COLORS.ink,
    padding: 20,
    alignItems: 'center',
  },

  // ── Celebration Modal ──
  celebrationCard: {
    paddingVertical: 24,
  },
  avatarsConnectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  connectedAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.ink,
  },
  connectBurst: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.ink,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  projectPillLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pillBlue,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 10,
  },
  projectPillLargeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0369A1',
    letterSpacing: 0.3,
  },
  celebrationSub: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  celebrationActionsRow: {
    width: '100%',
    gap: 10,
  },
  chatNowBtn: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 20,
  },
  chatNowBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  keepBrowsingBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  keepBrowsingBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },

  // ── Detail Modal ──
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.ink,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.ink,
    marginBottom: 8,
  },
  detailName: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
  },
  detailRole: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  detailProjectCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 18,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  detailProjectCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailProjectTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
  },
  detailMatchScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailProjectMatch: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  detailActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  viewProfileModalBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.yellowHighlight,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 16,
    paddingVertical: 10,
    marginBottom: 12,
  },
  viewProfileModalBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
  },

  // ── Avatar Fallback ──
  avatarFallback: {
    backgroundColor: COLORS.yellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.ink,
  },
  avatarFallbackLgText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.ink,
  },
});
