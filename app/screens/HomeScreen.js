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
} from 'react-native';
import { COLORS, BORDER_RADIUS, BRUTAL_SHADOWS } from '../styles/theme';
import DeveloperCard from '../components/DeveloperCard';
import SwipeableCard from '../components/SwipeableCard';
import SwipeControls from '../components/SwipeControls';
import ComicBadge from '../components/ComicBadge';
import { useApp } from '../context/AppContext';

export default function HomeScreen({
  onNavigateToProjects,
  onNavigateToMatches,
  onNavigateToProfile,
  onOpenChat,
}) {
  const {
    activeProject,
    projects,
    setActiveProjectId,
    availableDevelopersForActiveProject,
    skipDeveloper,
    unskipDeveloper,
    uninviteDeveloper,
    inviteDeveloper,
    resetDiscoveryForProject,
    notifications,
    unreadNotificationsCount,
    markAllNotificationsRead,
    setSelectedDeveloperForProfile,
  } = useApp();

  const [history, setHistory] = useState([]);
  const [inviteModalData, setInviteModalData] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [activeSegment, setActiveSegment] = useState('DISCOVER');

  // Modals
  const [projectPickerVisible, setProjectPickerVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

  // Filter developers based on selected role filter
  const filteredDevs = availableDevelopersForActiveProject.filter((dev) => {
    if (selectedRoleFilter === 'ALL') return true;
    return dev.role.toLowerCase().includes(selectedRoleFilter.toLowerCase());
  });

  // Top developer of the active project deck
  const currentDev = filteredDevs[0];

  const showToast = (message, color = COLORS.btnGreen) => {
    setFeedbackToast({ message, color });
    setTimeout(() => setFeedbackToast(null), 1600);
  };

  const handlePass = () => {
    if (currentDev) {
      skipDeveloper(currentDev.id);
      setHistory((prev) => [...prev, { dev: currentDev, action: 'PASS' }]);
      showToast(`SKIPPED ${currentDev.name.split(' ')[0]} ✖`, COLORS.btnRed);
    }
  };

  const handleLike = () => {
    if (currentDev) {
      inviteDeveloper(currentDev, false);
      setHistory((prev) => [...prev, { dev: currentDev, action: 'LIKE' }]);
      setInviteModalData(currentDev);
    }
  };

  const handleSuperLike = () => {
    if (currentDev) {
      inviteDeveloper(currentDev, true);
      setHistory((prev) => [...prev, { dev: currentDev, action: 'SUPER' }]);
      setInviteModalData({ ...currentDev, isSuper: true });
    }
  };

  const handleRewind = () => {
    if (history.length > 0) {
      const lastAction = history[history.length - 1];
      if (lastAction.action === 'PASS') {
        unskipDeveloper(lastAction.dev.id);
      } else {
        uninviteDeveloper(lastAction.dev.id);
      }
      setHistory((prev) => prev.slice(0, -1));
      showToast(`RESTORED ${lastAction.dev.name.split(' ')[0]} ↺`, COLORS.btnYellow);
    } else {
      showToast('AT DECK START', COLORS.white);
    }
  };

  const handleResetDeck = () => {
    resetDiscoveryForProject(activeProject?.id);
    setHistory([]);
    showToast(`RESET DECK FOR ${activeProject?.title || 'PROJECT'} ↺`, COLORS.btnYellow);
  };

  const handleOpenDevProfile = (dev) => {
    if (setSelectedDeveloperForProfile) {
      setSelectedDeveloperForProfile(dev);
    }
    if (onNavigateToProfile) {
      onNavigateToProfile();
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP HEADER (DevDate 3D Logo + Bell + Sliders) */}
      <View style={styles.topHeader}>
        <Image
          source={require('../assets/devdate_logo.png')}
          style={styles.devdateLogo}
          resizeMode="contain"
        />

        <View style={styles.headerIconsRow}>
          {/* Notification Bell with Red Badge */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              setNotificationsVisible(true);
              markAllNotificationsRead();
            }}
            style={styles.iconBtn}
          >
            <Text style={styles.headerIconText}>🔔</Text>
            {unreadNotificationsCount > 0 && (
              <View style={styles.notificationDot} />
            )}
          </TouchableOpacity>

          {/* Filter Sliders */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setFilterModalVisible(true)}
            style={styles.iconBtn}
          >
            <Text style={styles.headerIconText}>🎚️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. ACTIVE PROJECT SELECTOR BADGE */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setProjectPickerVisible(true)}
        style={[styles.projectSelectorBadge, BRUTAL_SHADOWS.xs]}
      >
        <Text style={styles.projectSelectorIcon}>{activeProject?.icon || '⚡'}</Text>
        <Text style={styles.projectSelectorPrefix}>DISCOVERING FOR:</Text>
        <Text style={styles.projectSelectorTitle} numberOfLines={1}>
          {activeProject?.title || 'StudySync'}
        </Text>
        <Text style={styles.projectSelectorArrow}>▾</Text>
      </TouchableOpacity>

      {/* 3. SEGMENTED PILL TABS (DISCOVER | PROJECTS | PEOPLE) */}
      <View style={styles.segmentedRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveSegment('DISCOVER')}
          style={[
            styles.segmentPill,
            activeSegment === 'DISCOVER' && styles.segmentPillActive,
          ]}
        >
          <Text style={styles.segmentTextActive}>DISCOVER</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (onNavigateToProjects) onNavigateToProjects();
          }}
          style={styles.segmentPill}
        >
          <Text style={styles.segmentTextInactive}>PROJECTS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (onNavigateToProfile) onNavigateToProfile();
          }}
          style={styles.segmentPill}
        >
          <Text style={styles.segmentTextInactive}>PEOPLE</Text>
        </TouchableOpacity>
      </View>

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
      >
        {currentDev ? (
          <SwipeableCard
            key={currentDev.id}
            cardKey={currentDev.id}
            onSwipeLeft={handlePass}
            onSwipeRight={handleLike}
          >
            <DeveloperCard developer={currentDev} onPress={() => handleOpenDevProfile(currentDev)} />
          </SwipeableCard>
        ) : (
          <View style={[styles.emptyCard, BRUTAL_SHADOWS.md]}>
            <Text style={styles.emptyTitle}>🎉 ALL PROFILES REVIEWED!</Text>
            <Text style={styles.emptySubtitle}>
              You have explored all available developer matches for {activeProject?.title}.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleResetDeck}
              style={[styles.resetBtn, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.resetBtnText}>↺ EXPLORE AGAIN</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons Row */}
        {currentDev && (
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
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, BRUTAL_SHADOWS.md]}>
            <View style={styles.modalSticker}>
              <ComicBadge
                text={inviteModalData?.isSuper ? "★ SUPER INVITED! ★" : "MATCH INVITE SENT! ♥"}
                color={inviteModalData?.isSuper ? COLORS.btnBlue : COLORS.btnGreen}
                textColor="#000000"
                rotate="-3deg"
                size="md"
              />
            </View>

            {inviteModalData && (
              <>
                <Text style={styles.modalDevName}>{inviteModalData.name}</Text>
                <Text style={styles.modalDevRole}>{inviteModalData.role}</Text>
                <Text style={styles.modalNotice}>
                  Invited to collaborate on <Text style={{ fontWeight: '900' }}>{activeProject?.title}</Text>! When they accept, you will receive a notification in Matches.
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setInviteModalData(null)}
                    style={[styles.continueBtn, BRUTAL_SHADOWS.xs]}
                  >
                    <Text style={styles.continueBtnText}>KEEP SWIPING</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      setInviteModalData(null);
                      if (onNavigateToMatches) onNavigateToMatches();
                    }}
                    style={[styles.viewMatchesBtn, BRUTAL_SHADOWS.xs]}
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
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, styles.pickerModalCard, BRUTAL_SHADOWS.md]}>
            <View style={styles.pickerHeaderRow}>
              <ComicBadge text="SELECT DISCOVERY PROJECT 🎯" color="#FFCC00" textColor="#000" size="sm" />
              <TouchableOpacity onPress={() => setProjectPickerVisible(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
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
                      showToast(`DISCOVERING FOR: ${proj.title} 🎯`);
                    }}
                    style={[
                      styles.projectPickerItem,
                      isCurrent && styles.projectPickerItemActive,
                      BRUTAL_SHADOWS.xs,
                    ]}
                  >
                    <Text style={styles.pickerItemIcon}>{proj.icon || '⚡'}</Text>
                    <View style={styles.pickerItemBody}>
                      <Text style={styles.pickerItemTitle}>{proj.title}</Text>
                      <Text style={styles.pickerItemTech}>{proj.techStack?.join(' • ')}</Text>
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
              style={[styles.createProjectPromptBtn, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.createProjectPromptText}>➕ MANAGE OR CREATE PROJECT</Text>
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
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, styles.pickerModalCard, BRUTAL_SHADOWS.md]}>
            <View style={styles.pickerHeaderRow}>
              <ComicBadge text="NOTIFICATIONS 🔔" color="#38BDF8" textColor="#000" size="sm" />
              <TouchableOpacity onPress={() => setNotificationsVisible(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {notifications.map((n) => (
                <View key={n.id} style={[styles.notificationCard, BRUTAL_SHADOWS.xs]}>
                  <Text style={styles.notifTitle}>{n.title}</Text>
                  <Text style={styles.notifMsg}>{n.message}</Text>
                  <Text style={styles.notifTime}>{n.time}</Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                markAllNotificationsRead();
                setNotificationsVisible(false);
              }}
              style={[styles.createProjectPromptBtn, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.createProjectPromptText}>DISMISS ALL</Text>
            </TouchableOpacity>
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
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, BRUTAL_SHADOWS.md]}>
            <View style={styles.pickerHeaderRow}>
              <ComicBadge text="DISCOVERY FILTERS 🎚️" color="#4ADE80" textColor="#000" size="sm" />
              <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
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
              style={[styles.createProjectPromptBtn, { marginTop: 20 }, BRUTAL_SHADOWS.xs]}
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
  devdateLogo: {
    width: 140,
    height: 48,
  },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    position: 'relative',
    padding: 6,
  },
  headerIconText: {
    fontSize: 22,
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#000000',
  },

  // Project Selector Bar
  projectSelectorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 2,
    marginBottom: 4,
    gap: 6,
  },
  projectSelectorIcon: {
    fontSize: 13,
  },
  projectSelectorPrefix: {
    fontSize: 10,
    fontWeight: '900',
    color: '#666666',
    letterSpacing: 0.5,
  },
  projectSelectorTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
    maxWidth: 160,
  },
  projectSelectorArrow: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },

  // Segmented row
  segmentedRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    gap: 10,
  },
  segmentPill: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  segmentPillActive: {
    backgroundColor: '#FFCC00',
    borderWidth: 2.5,
    borderColor: '#000000',
  },
  segmentTextActive: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  segmentTextInactive: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.5,
  },

  toastContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 999,
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  toastText: {
    color: '#000000',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 3.5,
    borderColor: '#000000',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555555',
    textAlign: 'center',
    marginBottom: 16,
  },
  resetBtn: {
    backgroundColor: '#FFCC00',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
  },

  // Modal styling
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
  pickerModalCard: {
    maxHeight: 520,
    alignItems: 'stretch',
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
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  pickerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555555',
    marginBottom: 12,
  },
  pickerList: {
    maxHeight: 300,
  },
  projectPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  projectPickerItemActive: {
    backgroundColor: '#FEF9C3',
    borderColor: '#000000',
  },
  pickerItemIcon: {
    fontSize: 24,
  },
  pickerItemBody: {
    flex: 1,
  },
  pickerItemTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
  },
  pickerItemTech: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666666',
    marginTop: 2,
  },
  activeCheckBadge: {
    backgroundColor: '#FFCC00',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeCheckText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000000',
  },
  createProjectPromptBtn: {
    height: 44,
    backgroundColor: '#FFCC00',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  createProjectPromptText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },

  // Notifications
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 2,
  },
  notifMsg: {
    fontSize: 11,
    fontWeight: '700',
    color: '#444444',
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 10,
    fontWeight: '800',
    color: '#888888',
  },

  // Filters
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
    marginTop: 10,
    marginBottom: 10,
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterPillActive: {
    backgroundColor: '#FFCC00',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
  },
  filterPillTextActive: {
    fontWeight: '900',
  },

  modalSticker: {
    marginBottom: 10,
  },
  modalDevName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
  },
  modalDevRole: {
    fontSize: 13,
    fontWeight: '800',
    color: '#666666',
    marginBottom: 10,
  },
  modalNotice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  continueBtn: {
    flex: 1,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
  viewMatchesBtn: {
    flex: 1.2,
    height: 42,
    backgroundColor: '#FFCC00',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewMatchesBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
});