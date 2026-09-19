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
import { COLORS, BORDER_RADIUS, BRUTAL_SHADOWS } from '../styles/theme';
import ComicBadge from '../components/ComicBadge';
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
    showToast('ACCEPTING INVITATION... ⏳', COLORS.yellow);
    const res = await acceptInvitation(invite);
    if (res && res.success !== false) {
      const matchData = res.match || res;
      showToast(`ACCEPTED INVITATION FOR ${matchData?.projectName || invite.projectName || 'PROJECT'}! 🚀`);
    } else {
      showToast(res?.error || 'Failed to accept invitation', COLORS.pink);
    }
  };

  const handleReject = async (inviteId, devName) => {
    setSelectedInviteDetail(null);
    await rejectInvitation(inviteId, devName);
    showToast(`DECLINED INVITATION FROM ${devName.split(' ')[0]} ✖`, COLORS.pink);
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

  return (
    <View style={styles.container}>
      {/* 1. TOP HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>MATCHES & INVITES</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              if (refreshMatchesAndInvitations) {
                showToast('SYNCING MATCHES... 🔄', COLORS.yellow);
                refreshMatchesAndInvitations();
              }
            }}
            style={styles.settingsIconBtn}
          >
            <Text style={styles.settingsIconText}>🔄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              if (onNavigateToSettings) onNavigateToSettings();
            }}
            style={styles.settingsIconBtn}
          >
            <Text style={styles.settingsIconText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. SEGMENTED TABS (Invitations | My Matches) */}
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
          <Text
            style={[
              styles.segmentText,
              activeSegment === 'invitations' && styles.segmentTextActive,
            ]}
          >
            Invitations
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
          <Text
            style={[
              styles.segmentText,
              activeSegment === 'matches' && styles.segmentTextActive,
            ]}
          >
            My Matches
          </Text>
          <View style={[styles.segmentBadgeMatches, BRUTAL_SHADOWS.xs]}>
            <Text style={styles.segmentBadgeText}>{matches.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* FEEDBACK TOAST */}
      {feedbackToast && (
        <View style={[styles.toastContainer, { backgroundColor: feedbackToast.color }, BRUTAL_SHADOWS.sm]}>
          <Text style={styles.toastText}>{feedbackToast.message}</Text>
        </View>
      )}

      {/* 3. CONTENT AREA */}
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
          /* --- INVITATIONS LIST --- */
          invitations.length > 0 ? (
            invitations.map((inv) => (
              <TouchableOpacity
                key={inv.id}
                activeOpacity={0.9}
                onPress={() => setSelectedInviteDetail(inv)}
                style={[styles.inviteCard, BRUTAL_SHADOWS.sm]}
              >
                <View style={styles.inviteTopRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleOpenDevProfile(inv.developerId, inv)}
                  >
                    <Image source={{ uri: inv.developerAvatar }} style={styles.devAvatar} />
                  </TouchableOpacity>
                  <View style={styles.devInfo}>
                    <View style={styles.nameScoreRow}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleOpenDevProfile(inv.developerId, inv)}
                      >
                        <Text style={styles.devName}>{inv.developerName}</Text>
                      </TouchableOpacity>
                      <View style={styles.scorePill}>
                        <Text style={styles.scorePillText}>{inv.matchScore}% MATCH</Text>
                      </View>
                    </View>
                    <Text style={styles.devRole}>{inv.developerRole}</Text>
                    <View style={styles.projectTagPill}>
                      <Text style={styles.projectTagPillText}>🎯 FOR: {inv.projectName}</Text>
                    </View>
                  </View>
                </View>

                {/* Actions Row */}
                <View style={styles.inviteActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleReject(inv.id, inv.developerName)}
                    style={[styles.rejectBtn, BRUTAL_SHADOWS.xs]}
                  >
                    <Text style={styles.rejectBtnText}>DECLINE ✖</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleAccept(inv)}
                    style={[styles.acceptBtn, BRUTAL_SHADOWS.xs]}
                  >
                    <Text style={styles.acceptBtnText}>ACCEPT & MATCH ♥</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.emptyBox, BRUTAL_SHADOWS.sm]}>
              <Text style={styles.emptyTitle}>NO PENDING INVITATIONS</Text>
              <Text style={styles.emptySubtitle}>
                Swipe right on developers in Discover to send collaboration invites.
              </Text>
            </View>
          )
        ) : (
          /* --- MATCHES LIST --- */
          matches.length > 0 ? (
            matches.map((m) => (
              <TouchableOpacity
                key={m.id}
                activeOpacity={0.85}
                onPress={() => handleOpenMatchChat(m)}
                style={[styles.matchCard, BRUTAL_SHADOWS.sm]}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleOpenDevProfile(m.developerId, m)}
                >
                  {m.developerAvatar ? (
                    <Image source={{ uri: m.developerAvatar }} style={styles.devAvatar} onError={() => {}} />
                  ) : (
                    <View style={[styles.devAvatar, styles.avatarFallback]}>
                      <Text style={styles.avatarFallbackText}>
                        {m.developerName?.charAt(0)?.toUpperCase() || '👤'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                <View style={styles.matchInfo}>
                  <View style={styles.nameScoreRow}>
                    <Text style={styles.devName}>{m.developerName}</Text>
                    <View style={styles.matchBadgePill}>
                      <Text style={styles.matchBadgePillText}>{m.matchScore}% MATCH</Text>
                    </View>
                  </View>
                  <Text style={styles.devRole}>{m.developerRole}</Text>
                  <View style={styles.projectTagPill}>
                    <Text style={styles.projectTagPillText}>⚡ {m.projectName}</Text>
                  </View>
                  <Text style={styles.recentMsgText} numberOfLines={1}>
                    {m.recentMessage}
                  </Text>
                </View>
                <View style={[styles.chatActionBubble, BRUTAL_SHADOWS.xs]}>
                  <Text style={styles.chatActionBubbleText}>💬</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.emptyBox, BRUTAL_SHADOWS.sm]}>
              <Text style={styles.emptyTitle}>NO MATCHES YET</Text>
              <Text style={styles.emptySubtitle}>
                Accept incoming invitations or discover developers to form project squads!
              </Text>
            </View>
          )
        )}
      </ScrollView>

      {/* 4. IT'S A MATCH! CELEBRATION MODAL */}
      <Modal
        visible={!!pendingMatchCelebration}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingMatchCelebration(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, styles.celebrationCard, BRUTAL_SHADOWS.md]}>
            <ComicBadge
              text="IT'S A MATCH! 🎉"
              color="#FCD34D"
              textColor="#000"
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
                        {currentUser?.name?.charAt(0)?.toUpperCase() || '👤'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.connectBurst}>
                    <Text style={styles.connectBurstText}>⚡</Text>
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
                        {pendingMatchCelebration.developerName?.charAt(0)?.toUpperCase() || '👤'}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.celebrationHeading}>
                  You & {pendingMatchCelebration.developerName}
                </Text>

                <View style={styles.projectPillLarge}>
                  <Text style={styles.projectPillLargeText}>
                    COLLABORATING ON: {pendingMatchCelebration.projectName}
                  </Text>
                </View>

                <Text style={styles.celebrationSub}>
                  You both connected to build together. Jump into the project chat to start discussing the codebase!
                </Text>

                <View style={styles.celebrationActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      const matchToOpen = pendingMatchCelebration;
                      setPendingMatchCelebration(null);
                      handleOpenMatchChat(matchToOpen);
                    }}
                    style={[styles.chatNowBtn, BRUTAL_SHADOWS.xs]}
                  >
                    <Text style={styles.chatNowBtnText}>OPEN PROJECT CHAT 💬</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setPendingMatchCelebration(null)}
                    style={styles.keepBrowsingBtn}
                  >
                    <Text style={styles.keepBrowsingBtnText}>KEEP BROWSING</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 5. INVITATION DETAIL MODAL */}
      <Modal
        visible={!!selectedInviteDetail}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedInviteDetail(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, BRUTAL_SHADOWS.md]}>
            <View style={styles.modalHeaderRow}>
              <ComicBadge text="INVITATION DETAILS 📑" color="#38BDF8" textColor="#000" size="sm" />
              <TouchableOpacity onPress={() => setSelectedInviteDetail(null)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedInviteDetail && (
              <>
                <Image source={{ uri: selectedInviteDetail.developerAvatar }} style={styles.detailAvatar} />
                <Text style={styles.detailName}>{selectedInviteDetail.developerName}</Text>
                <Text style={styles.detailRole}>{selectedInviteDetail.developerRole}</Text>

                <View style={styles.detailProjectCard}>
                  <Text style={styles.detailProjectTitle}>PROJECT: {selectedInviteDetail.projectName}</Text>
                  <Text style={styles.detailProjectMatch}>Match Score: {selectedInviteDetail.matchScore}%</Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    const d = selectedInviteDetail;
                    setSelectedInviteDetail(null);
                    handleOpenDevProfile(d.developerId, d);
                  }}
                  style={[styles.viewProfileModalBtn, BRUTAL_SHADOWS.xs]}
                >
                  <Text style={styles.viewProfileModalBtnText}>👤 VIEW FULL DEVELOPER PROFILE</Text>
                </TouchableOpacity>

                <View style={styles.detailActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleReject(selectedInviteDetail.id, selectedInviteDetail.developerName)}
                    style={[styles.rejectBtn, BRUTAL_SHADOWS.xs]}
                  >
                    <Text style={styles.rejectBtnText}>DECLINE ✖</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleAccept(selectedInviteDetail)}
                    style={[styles.acceptBtn, BRUTAL_SHADOWS.xs]}
                  >
                    <Text style={styles.acceptBtnText}>ACCEPT INVITATION ♥</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFCC00',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 3.5,
    borderBottomColor: '#000000',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  settingsIconBtn: {
    padding: 6,
  },
  settingsIconText: {
    fontSize: 20,
  },
  segmentedBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2.5,
    borderBottomColor: '#000000',
    gap: 10,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingVertical: 7,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#FFCC00',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
  },
  segmentTextActive: {
    color: '#000000',
  },
  segmentBadge: {
    backgroundColor: '#EC4899',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#000000',
  },
  segmentBadgeMatches: {
    backgroundColor: '#06B6D4',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#000000',
  },
  segmentBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  toastContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 999,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#000000',
  },
  toastText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 28,
  },
  inviteCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 20,
    padding: 14,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  inviteTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  devAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    borderColor: '#000000',
  },
  devInfo: {
    flex: 1,
  },
  matchInfo: {
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
    color: '#000000',
  },
  scorePill: {
    backgroundColor: '#FEF08A',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  scorePillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000000',
  },
  matchBadgePill: {
    backgroundColor: '#BBF7D0',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  matchBadgePillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#15803D',
  },
  devRole: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666666',
    marginTop: 2,
  },
  projectTagPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 8,
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
    color: '#666666',
    fontWeight: '600',
    marginTop: 4,
  },
  inviteActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  rejectBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#991B1B',
  },
  acceptBtn: {
    flex: 1.5,
    backgroundColor: '#86EFAC',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  acceptBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#166534',
  },
  chatActionBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFCC00',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatActionBubbleText: {
    fontSize: 16,
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 30,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FAF6EB',
    borderRadius: 24,
    borderWidth: 3.5,
    borderColor: '#000000',
    padding: 20,
    alignItems: 'center',
  },
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
    borderWidth: 3,
    borderColor: '#000000',
  },
  connectBurst: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFCC00',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectBurstText: {
    fontSize: 18,
  },
  celebrationHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 6,
  },
  projectPillLarge: {
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 10,
  },
  projectPillLargeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0369A1',
  },
  celebrationSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444444',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  celebrationActionsRow: {
    width: '100%',
    gap: 10,
  },
  chatNowBtn: {
    height: 48,
    backgroundColor: '#FFCC00',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatNowBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  keepBrowsingBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  keepBrowsingBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#666666',
  },

  // Detail Modal
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
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  detailAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#000000',
    marginBottom: 8,
  },
  detailName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
  },
  detailRole: {
    fontSize: 12,
    fontWeight: '800',
    color: '#666666',
    marginBottom: 12,
  },
  detailProjectCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  detailProjectTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
  },
  detailProjectMatch: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    marginTop: 4,
  },
  detailActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  viewProfileModalBtn: {
    width: '100%',
    backgroundColor: '#FEF08A',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  viewProfileModalBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
  },
  avatarFallback: {
    backgroundColor: '#FFE600',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
  },
});
