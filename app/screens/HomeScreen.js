import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { COLORS, BORDER_RADIUS, BORDERS, BRUTAL_SHADOWS } from '../styles/theme';
import DeveloperCard from '../components/DeveloperCard';
import SwipeableCard from '../components/SwipeableCard';
import SwipeControls from '../components/SwipeControls';
import ComicBadge from '../components/ComicBadge';
import { DoodleStar, DoodleSparkle, DoodleCode, DoodleArrow, DoodleUnderline } from '../components/DoodleElements';
import { useApp } from '../context/AppContext';

// Code-split NotificationsList loaded on-demand when notifications modal opens
const NotificationsList = React.lazy(() => import('../components/NotificationsList'));
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSkillLabels } from '../data/skillsDatabase';
import { recordSwipeApi, createInvitationApi } from '../utils/api';

export default function HomeScreen({
  onNavigateToProjects,
  onNavigateToMatches,
  onNavigateToProfile,
  onOpenChat,
}) {
  const insets = useSafeAreaInsets();
  const {
    activeProject,
    projects,
    currentUser,
    setActiveProjectId,
    availableDevelopersForActiveProject,
    discoveryLoading,
    discoveryError,
    loadDiscoveryDevelopers,
    skipDeveloper,
    unskipDeveloper,
    uninviteDeveloper,
    inviteDeveloper,
    resetDiscoveryForProject,
    notifications,
    unreadNotificationsCount,
    notificationsLoading,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsRead,
    setSelectedDeveloperForProfile,
  } = useApp();

  const handleNotificationPress = async (n) => {
    if (!n) return;

    // 1. Mark as read on backend & update local state
    if (markNotificationAsRead && n.id) {
      await markNotificationAsRead(n.id);
    }

    // 2. Close modal
    setNotificationsVisible(false);

    // 3. Perform relevant action / navigation
    const type = (n.type || '').toUpperCase();
    if (
      type === 'INVITATION_RECEIVED' ||
      type === 'INVITATION_ACCEPTED' ||
      type === 'INVITATION_REJECTED' ||
      type === 'INVITATION_WITHDRAWN' ||
      type === 'INVITATION'
    ) {
      if (onNavigateToMatches) {
        onNavigateToMatches();
      }
    } else if (
      type === 'MESSAGE' ||
      type === 'NEW_MESSAGE' ||
      type === 'MATCH_CREATED' ||
      type === 'MATCH'
    ) {
      if (n.matchId && onOpenChat) {
        onOpenChat(n.matchId);
      } else if (onNavigateToMatches) {
        onNavigateToMatches();
      }
    } else if (n.projectId && onNavigateToProjects) {
      onNavigateToProjects();
    }
  };

  const [history, setHistory] = useState([]);
  const [inviteModalData, setInviteModalData] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [isProcessingSwipe, setIsProcessingSwipe] = useState(false);

  // Modals
  const [projectPickerVisible, setProjectPickerVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

  // Recruitment Eligibility checks (Chunk 11E)
  const isProjectClosed = activeProject?.status === 'CLOSED';
  const projectMembersCount = activeProject?.membersCount || (Array.isArray(activeProject?.members) ? activeProject.members.length : 1);
  const projectMaxCapacity = activeProject?.maxMembers || activeProject?.teamSize?.max || 4;
  const isProjectFull = projectMembersCount >= projectMaxCapacity;
  const canRecruit = !isProjectClosed && !isProjectFull;

  // Filter developers based on selected role filter
  const filteredDevs = availableDevelopersForActiveProject.filter((dev) => {
    if (selectedRoleFilter === 'ALL') return true;
    return (dev.role || '').toLowerCase().includes(selectedRoleFilter.toLowerCase());
  });

  // Top developer of the active project deck
  const currentDev = canRecruit ? filteredDevs[0] : null;

  const showToast = (message, color = COLORS.btnGreen) => {
    setFeedbackToast({ message, color });
    setTimeout(() => setFeedbackToast(null), 1600);
  };

  const handlePass = async () => {
    if (isProcessingSwipe) return;
    if (!canRecruit) {
      showToast(isProjectClosed ? 'PROJECT IS CLOSED' : 'TEAM IS FULL', COLORS.btnRed);
      return;
    }
    if (!currentDev) return;

    const devToPass = currentDev;
    setIsProcessingSwipe(true);

    // 1. Advance deck locally immediately
    skipDeveloper(devToPass.id);
    showToast('PASSED', '#94A3B8');

    setHistory((prev) => [
      ...prev,
      {
        dev: devToPass,
        action: 'PASS',
        projectId: activeProject?.id,
        invitationId: null,
      },
    ]);

    // 2. Persist to backend asynchronously
    try {
      const isRealProject = activeProject?.id && /^[0-9a-fA-F]{24}$/.test(activeProject.id);
      if (isRealProject) {
        const token = currentUser?.token || null;
        const uid = currentUser?._id || currentUser?.id;
        recordSwipeApi(
          activeProject.id,
          devToPass._id || devToPass.id,
          'PASS',
          token,
          uid
        ).catch((err) => console.error('recordSwipeApi PASS error:', err));
      }
    } catch (err) {
      console.error('handlePass error:', err);
    } finally {
      setIsProcessingSwipe(false);
    }
  };

  const handleLike = async () => {
    if (isProcessingSwipe) return;
    if (!canRecruit) {
      showToast(isProjectClosed ? 'PROJECT IS CLOSED' : 'TEAM IS FULL', COLORS.btnRed);
      return;
    }
    if (!currentDev) return;

    const devToLike = currentDev;
    setIsProcessingSwipe(true);

    // 1. Advance deck locally immediately & show modal
    inviteDeveloper(devToLike);
    setInviteModalData({
      name: devToLike.name,
      role: devToLike.role,
      isSuper: false,
    });

    setHistory((prev) => [
      ...prev,
      {
        dev: devToLike,
        action: 'INVITE',
        projectId: activeProject?.id,
        invitationId: null,
      },
    ]);

    // 2. Persist to backend asynchronously
    try {
      const isRealProject = activeProject?.id && /^[0-9a-fA-F]{24}$/.test(activeProject.id);
      if (isRealProject) {
        const token = currentUser?.token || null;
        const uid = currentUser?._id || currentUser?.id;

        recordSwipeApi(
          activeProject.id,
          devToLike._id || devToLike.id,
          'INTERESTED',
          token,
          uid
        ).catch((err) => console.error('recordSwipeApi LIKE error:', err));

        createInvitationApi(
          activeProject.id,
          devToLike._id || devToLike.id,
          'Hey! Would love to collaborate on this project.',
          token,
          uid
        ).catch((err) => console.error('createInvitationApi error:', err));
      }
    } catch (err) {
      console.error('handleLike error:', err);
    } finally {
      setIsProcessingSwipe(false);
    }
  };

  const handleSuperLike = async () => {
    if (isProcessingSwipe) return;
    if (!canRecruit) {
      showToast(isProjectClosed ? 'PROJECT IS CLOSED' : 'TEAM IS FULL', COLORS.btnRed);
      return;
    }
    if (!currentDev) return;

    const devToLike = currentDev;
    setIsProcessingSwipe(true);

    inviteDeveloper(devToLike, true);
    setInviteModalData({
      name: devToLike.name,
      role: devToLike.role,
      isSuper: true,
    });

    setHistory((prev) => [
      ...prev,
      {
        dev: devToLike,
        action: 'SUPER',
        projectId: activeProject?.id,
        invitationId: null,
      },
    ]);

    try {
      const isRealProject = activeProject?.id && /^[0-9a-fA-F]{24}$/.test(activeProject.id);
      if (isRealProject) {
        const token = currentUser?.token || null;
        const uid = currentUser?._id || currentUser?.id;

        recordSwipeApi(
          activeProject.id,
          devToLike._id || devToLike.id,
          'INTERESTED',
          token,
          uid
        ).catch((err) => console.error('recordSwipeApi SUPERLIKE error:', err));

        createInvitationApi(
          activeProject.id,
          devToLike._id || devToLike.id,
          'Super-invited you to collaborate!',
          token,
          uid
        ).catch((err) => console.error('createInvitationApi super error:', err));
      }
    } catch (err) {
      console.error('handleSuperLike error:', err);
    } finally {
      setIsProcessingSwipe(false);
    }
  };

  const handleRewind = async () => {
    if (history.length === 0) {
      showToast('NO ACTIONS TO UNDO', COLORS.btnRed);
      return;
    }
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));

    if (last.action === 'PASS') {
      unskipDeveloper(last.dev.id);
      showToast(`RESTORED ${last.dev.name.toUpperCase()}`, COLORS.btnYellow);
    } else if (last.action === 'INVITE' || last.action === 'SUPER') {
      uninviteDeveloper(last.dev.id);
      showToast(`UNINVITED ${last.dev.name.toUpperCase()}`, COLORS.btnYellow);
    }
  };

  const handleResetDeck = () => {
    if (activeProject) {
      resetDiscoveryForProject(activeProject.id);
      showToast('DISCOVERY DECK RESET', COLORS.btnYellow);
    }
  };

  const handleOpenDevProfile = (dev) => {
    if (setSelectedDeveloperForProfile) {
      setSelectedDeveloperForProfile(dev);
    }
    if (onNavigateToProfile) {
      onNavigateToProfile();
    }
  };

  const modalBackdropStyle = [
    styles.modalBackdrop,
    {
      paddingTop: Math.max(insets.top + 12, 24),
      paddingBottom: Math.max(insets.bottom + 12, 24),
    },
  ];

  return (
    <View style={styles.container}>
      {/* 1. TOP HEADER (DevDate 3D Logo + Bell + Filter) */}
      <View style={styles.topHeader}>
        <View style={styles.logoWrap}>
          <Image
            source={require('../assets/devdate_logo.png')}
            style={[styles.devdateLogo, { backgroundColor: 'transparent' }]}
            resizeMode="contain"
          />
          <DoodleStar size={14} color={COLORS.yellow} style={styles.headerStar} />
        </View>

        <View style={styles.headerIconsRow}>
          {/* Notification Bell with Red Badge */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              if (loadNotifications) loadNotifications();
              setNotificationsVisible(true);
            }}
            style={styles.iconBtn}
          >
            <Image
              source={require('../assets/notification.png')}
              style={styles.notificationBellImg}
              resizeMode="contain"
            />
            {unreadNotificationsCount > 0 && (
              <View style={styles.notificationDot} />
            )}
          </TouchableOpacity>

          {/* Filter Pill Button */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setFilterModalVisible(true)}
            style={[styles.filterBtn, BRUTAL_SHADOWS.xs]}
          >
            <Text style={styles.filterBtnText}>FILTER</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. ACTIVE PROJECT SELECTOR BADGE */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setProjectPickerVisible(true)}
        style={[styles.projectSelectorBadge, BRUTAL_SHADOWS.xs]}
      >
        <DoodleCode symbol="</>" bgColor={COLORS.yellowHighlight} color={COLORS.ink} style={styles.projectSelectorCodeBadge} />
        <Text style={styles.projectSelectorPrefix}>DISCOVERING FOR:</Text>
        <Text style={styles.projectSelectorTitle} numberOfLines={1}>
          {activeProject?.title || 'StudySync'}
        </Text>
        <Text style={styles.projectSelectorArrow}>▾</Text>
      </TouchableOpacity>

      {/* FEEDBACK TOAST */}
      {feedbackToast && (
        <View style={[styles.toastContainer, { backgroundColor: feedbackToast.color }, BRUTAL_SHADOWS.xs]}>
          <Text style={styles.toastText}>{feedbackToast.message}</Text>
        </View>
      )}

      {/* 4. MAIN CARD & CONTROLS */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(discoveryLoading)}
            onRefresh={() => {
              if (loadDiscoveryDevelopers) loadDiscoveryDevelopers();
            }}
            colors={[COLORS.btnYellow, COLORS.btnBlue]}
            tintColor={COLORS.btnYellow}
          />
        }
      >
        {discoveryLoading && availableDevelopersForActiveProject.length === 0 ? (
          <View style={[styles.emptyCard, BRUTAL_SHADOWS.card]}>
            <DoodleSparkle size={28} color={COLORS.yellow} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>SCANNING SQUAD...</Text>
            <Text style={styles.emptySubtitle}>
              Connecting to real developer database...
            </Text>
          </View>
        ) : discoveryError && availableDevelopersForActiveProject.length === 0 ? (
          <View style={[styles.emptyCard, BRUTAL_SHADOWS.card]}>
            <DoodleCode symbol="!" bgColor={COLORS.coralLight} color={COLORS.coral} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>DISCOVERY ERROR</Text>
            <Text style={styles.emptySubtitle}>
              {discoveryError}
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                if (loadDiscoveryDevelopers) loadDiscoveryDevelopers();
              }}
              style={[styles.resetBtn, BRUTAL_SHADOWS.button]}
            >
              <Text style={styles.resetBtnText}>TRY AGAIN</Text>
            </TouchableOpacity>
          </View>
        ) : isProjectClosed ? (
          <View style={[styles.emptyCard, BRUTAL_SHADOWS.card]}>
            <DoodleCode symbol="X" bgColor={COLORS.coralLight} color={COLORS.coral} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>PROJECT CLOSED</Text>
            <Text style={styles.emptySubtitle}>
              New member recruitment has stopped.
            </Text>
          </View>
        ) : isProjectFull ? (
          <View style={[styles.emptyCard, BRUTAL_SHADOWS.card]}>
            <DoodleStar size={26} color={COLORS.purple} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>TEAM FULL</Text>
            <Text style={styles.emptySubtitle}>
              This project has reached its maximum team size.
            </Text>
          </View>
        ) : currentDev ? (
          <SwipeableCard
            key={currentDev.id}
            cardKey={currentDev.id}
            onSwipeLeft={handlePass}
            onSwipeRight={handleLike}
          >
            <DeveloperCard developer={currentDev} onPress={() => handleOpenDevProfile(currentDev)} />
          </SwipeableCard>
        ) : (
          <View style={[styles.emptyCard, BRUTAL_SHADOWS.card]}>
            <DoodleSparkle size={30} color={COLORS.yellow} style={{ marginBottom: 10 }} />
            <Text style={styles.emptyTitle}>NO MORE DEVELOPERS</Text>
            <DoodleUnderline width={140} color={COLORS.yellow} height={3} style={{ marginBottom: 10 }} />
            <Text style={styles.emptySubtitle}>
              You've gone through everyone available for this project.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleResetDeck}
              style={[styles.resetBtn, BRUTAL_SHADOWS.button]}
            >
              <Text style={styles.resetBtnText}>EXPLORE AGAIN</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons Row */}
        {canRecruit && currentDev && (
          <SwipeControls
            onRewind={handleRewind}
            onPass={handlePass}
            onLike={handleLike}
            onSuperLike={handleSuperLike}
          />
        )}
      </ScrollView>

      {/* 5. INVITE CONFIRMATION MODAL */}
      <Modal
        visible={!!inviteModalData}
        transparent
        animationType="fade"
        onRequestClose={() => setInviteModalData(null)}
      >
        <View style={modalBackdropStyle}>
          <View style={[styles.modalCard, styles.inviteModalCard, BRUTAL_SHADOWS.modal]}>
            <View style={styles.modalSticker}>
              <ComicBadge
                text={inviteModalData?.isSuper ? "SUPER INVITED!" : "MATCH INVITE SENT!"}
                color={inviteModalData?.isSuper ? COLORS.btnBlue : COLORS.btnGreen}
                textColor="#000000"
                rotate="-3deg"
                size="md"
              />
            </View>

            {inviteModalData && (
              <>
                <Text style={styles.modalDevName}>{inviteModalData.name}</Text>
                <Text style={styles.modalDevRole}>{inviteModalData.role || 'Developer'}</Text>
                
                <View style={styles.modalNoticeBox}>
                  <Text style={styles.modalNotice}>
                    Invited to collaborate on{' '}
                    <Text style={styles.modalProjectHighlight}>
                      {activeProject?.title || 'your project'}
                    </Text>
                    ! When they accept, you will receive a notification in Matches.
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setInviteModalData(null)}
                    style={[styles.continueBtn, BRUTAL_SHADOWS.button]}
                  >
                    <Text style={styles.continueBtnText}>KEEP SWIPING</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      setInviteModalData(null);
                      if (onNavigateToMatches) onNavigateToMatches();
                    }}
                    style={[styles.viewMatchesBtn, BRUTAL_SHADOWS.button]}
                  >
                    <Text style={styles.viewMatchesBtnText}>VIEW MATCHES →</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 6. PROJECT PICKER MODAL */}
      <Modal
        visible={projectPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProjectPickerVisible(false)}
      >
        <View style={modalBackdropStyle}>
          <View style={[styles.modalCard, styles.pickerModalCard, BRUTAL_SHADOWS.modal]}>
            <View style={styles.pickerHeaderRow}>
              <ComicBadge text="SELECT DISCOVERY PROJECT" color="#FFCC00" textColor="#000" size="sm" />
              <TouchableOpacity onPress={() => setProjectPickerVisible(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>X</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.pickerSubtitle}>
              Developer recommendations adapt to the required skills of your active project:
            </Text>

            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {projects.map((proj) => {
                const isCurrent = proj.id === activeProject?.id;
                return (
                  <TouchableOpacity
                    key={proj.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      setActiveProjectId(proj.id);
                      setProjectPickerVisible(false);
                      showToast(`DISCOVERING FOR: ${proj.title}`);
                    }}
                    style={[
                      styles.projectPickerItem,
                      isCurrent && styles.projectPickerItemActive,
                      BRUTAL_SHADOWS.xs,
                    ]}
                  >
                    <Text style={styles.pickerItemIcon}>{proj.icon || '</>'}</Text>
                    <View style={styles.pickerItemBody}>
                      <Text style={styles.pickerItemTitle}>{proj.title}</Text>
                      <Text style={styles.pickerItemTech}>{getSkillLabels(proj.techStack).join(' • ')}</Text>
                    </View>
                    {isCurrent && (
                      <View style={styles.activeCheckBadge}>
                        <Text style={styles.activeCheckText}>ACTIVE</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setProjectPickerVisible(false);
                if (onNavigateToProjects) onNavigateToProjects();
              }}
              style={[styles.createProjectPromptBtn, BRUTAL_SHADOWS.button]}
            >
              <Text style={styles.createProjectPromptText}>+ MANAGE OR CREATE PROJECT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 7. NOTIFICATIONS MODAL */}
      <Modal
        visible={notificationsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <View style={modalBackdropStyle}>
          <View style={[styles.modalCard, styles.notificationsModalCard, BRUTAL_SHADOWS.modal]}>
            <View style={styles.pickerHeaderRow}>
              <ComicBadge text="NOTIFICATIONS" color="#38BDF8" textColor="#000" size="sm" />
              <TouchableOpacity onPress={() => setNotificationsVisible(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>X</Text>
              </TouchableOpacity>
            </View>

            {notificationsVisible && (
              <React.Suspense fallback={<ActivityIndicator size="small" color="#000" style={{ padding: 32 }} />}>
                <NotificationsList
                  showHeader={true}
                  onSelectNotification={(n) => {
                    handleNotificationPress(n);
                  }}
                />
              </React.Suspense>
            )}
          </View>
        </View>
      </Modal>

      {/* 8. FILTERS MODAL */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={modalBackdropStyle}>
          <View style={[styles.modalCard, BRUTAL_SHADOWS.modal]}>
            <View style={styles.pickerHeaderRow}>
              <ComicBadge text="DISCOVERY FILTERS" color="#4ADE80" textColor="#000" size="sm" />
              <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>X</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.filterSectionTitle}>FILTER BY ROLE:</Text>
            <View style={styles.filterPillsRow}>
              {['ALL', 'Frontend', 'Backend', 'Full Stack', 'UI/UX', 'Mobile'].map((role) => (
                <TouchableOpacity
                  key={role}
                  onPress={() => {
                    setSelectedRoleFilter(role);
                  }}
                  style={[
                    styles.filterPill,
                    selectedRoleFilter === role && styles.filterPillActive,
                    BRUTAL_SHADOWS.xs,
                  ]}
                >
                  <Text style={[styles.filterPillText, selectedRoleFilter === role && styles.filterPillTextActive]}>
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              style={[styles.createProjectPromptBtn, { marginTop: 20 }, BRUTAL_SHADOWS.button]}
            >
              <Text style={styles.createProjectPromptText}>APPLY FILTERS</Text>
            </TouchableOpacity>
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 2,
  },
  logoWrap: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  devdateLogo: {
    width: 135,
    height: 44,
  },
  headerStar: {
    position: 'absolute',
    top: -2,
    right: -10,
  },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    position: 'relative',
    padding: 6,
  },
  notificationBellImg: {
    width: 24,
    height: 24,
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.coral,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
  },
  filterBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  filterBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },

  // Project Selector Bar
  projectSelectorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
    marginBottom: 8,
    gap: 6,
  },
  projectSelectorCodeBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  projectSelectorPrefix: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  projectSelectorTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    maxWidth: 150,
  },
  projectSelectorArrow: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
  },

  toastContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 999,
    borderWidth: 2.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  toastText: {
    color: COLORS.ink,
    fontSize: 11,
    fontWeight: '900',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  emptyCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderWidth: 2.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 26,
    padding: 28,
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 36,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.ink,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  resetBtn: {
    backgroundColor: COLORS.yellow,
    borderWidth: 2.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },

  // Modal styling
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FAF6EB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 26,
    borderWidth: 3,
    borderColor: COLORS.ink,
    padding: 20,
    alignItems: 'center',
  },
  inviteModalCard: {
    maxWidth: 360,
    backgroundColor: '#FAF6EB',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
  },
  pickerModalCard: {
    maxHeight: 520,
    alignItems: 'stretch',
  },
  notificationsModalCard: {
    height: '75%',
    maxHeight: 560,
    alignItems: 'stretch',
    padding: 16,
  },
  pickerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  modalCloseText: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 13,
  },
  pickerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 12,
    lineHeight: 16,
  },
  pickerList: {
    maxHeight: 300,
  },
  projectPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 18,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  projectPickerItemActive: {
    backgroundColor: COLORS.yellowHighlight,
    borderColor: COLORS.ink,
  },
  pickerItemIcon: {
    fontSize: 22,
  },
  pickerItemBody: {
    flex: 1,
  },
  pickerItemTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.ink,
  },
  pickerItemTech: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  activeCheckBadge: {
    backgroundColor: COLORS.yellow,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeCheckText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.ink,
  },
  createProjectPromptBtn: {
    height: 44,
    backgroundColor: COLORS.yellow,
    borderWidth: 2.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  createProjectPromptText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },

  // Notifications
  notificationCard: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.ink,
    marginBottom: 2,
  },
  notifMsg: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.inkMuted,
  },
  notificationCardUnread: {
    backgroundColor: COLORS.yellowHighlight,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  notifUnreadBadge: {
    backgroundColor: COLORS.greenLight,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  notifUnreadBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.ink,
  },
  notifEmptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifEmptyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.ink,
    marginBottom: 4,
  },
  notifEmptySubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  // Filters
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
    marginTop: 10,
    marginBottom: 10,
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterPillActive: {
    backgroundColor: COLORS.yellow,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.ink,
  },
  filterPillTextActive: {
    fontWeight: '900',
  },

  modalSticker: {
    marginBottom: 8,
  },
  modalDevName: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
    textAlign: 'center',
    marginTop: 4,
  },
  modalDevRole: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalNoticeBox: {
    width: '100%',
    backgroundColor: '#FFFDF9',
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 6,
    marginBottom: 18,
  },
  modalNotice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  modalProjectHighlight: {
    fontWeight: '900',
    color: COLORS.ink,
    backgroundColor: COLORS.yellowHighlight,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  continueBtn: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.white,
    borderWidth: 2.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
  },
  viewMatchesBtn: {
    flex: 1.2,
    height: 44,
    backgroundColor: COLORS.yellow,
    borderWidth: 2.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewMatchesBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
  },
});