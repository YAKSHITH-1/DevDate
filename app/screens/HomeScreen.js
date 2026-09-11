import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, BRUTAL_SHADOWS } from '../styles/theme';
import ComicBadge from '../components/ComicBadge';
import ProjectCard from '../components/ProjectCard';
import SwipeControls from '../components/SwipeControls';
import { INITIAL_PROJECTS } from '../data/projectsData';

export default function HomeScreen({ onNavigateToMatches, onNavigateToChat }) {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookmarks, setBookmarks] = useState({});
  const [history, setHistory] = useState([]);
  const [selectedRoleModal, setSelectedRoleModal] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState(null);

  const currentProject = projects[currentIndex];

  const showToast = (message, color = COLORS.lime) => {
    setFeedbackToast({ message, color });
    setTimeout(() => setFeedbackToast(null), 1800);
  };

  const handlePass = () => {
    if (currentIndex < projects.length) {
      setHistory((prev) => [...prev, { index: currentIndex, action: 'PASS' }]);
      showToast('PASSED ✖', COLORS.pink);
      setCurrentIndex((prev) => (prev + 1) % projects.length);
    }
  };

  const handleLike = () => {
    if (currentIndex < projects.length) {
      setHistory((prev) => [...prev, { index: currentIndex, action: 'LIKE' }]);
      showToast('INTERESTED! 🤝 SQUAD NOTIFIED', COLORS.lime);
      setCurrentIndex((prev) => (prev + 1) % projects.length);
    }
  };

  const handleRewind = () => {
    if (history.length > 0) {
      const last = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setCurrentIndex(last.index);
      showToast('REWOUND ↺', COLORS.cyan);
    } else {
      showToast('AT DECK START', COLORS.yellow);
    }
  };

  const handleBookmark = (projectId) => {
    setBookmarks((prev) => {
      const updated = { ...prev, [projectId]: !prev[projectId] };
      showToast(updated[projectId] ? 'BOOKMARKED ★' : 'REMOVED ★', COLORS.yellow);
      return updated;
    });
  };

  const handleApply = (project, role) => {
    setSelectedRoleModal({ project, role });
  };

  const confirmApplication = () => {
    if (selectedRoleModal) {
      showToast(`APPLIED FOR ${selectedRoleModal.role}!`, COLORS.lime);
      setSelectedRoleModal(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP HEADER BANNER (EXACT TO SCREENSHOT) */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          {/* Avatar with live green indicator */}
          <View style={styles.userAvatarContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' }}
              style={styles.headerUserAvatar}
            />
            <View style={styles.onlineStatusDot} />
          </View>

          {/* App title & hackathon sub-badge */}
          <View style={styles.titleColumn}>
            <Text style={styles.appTitle}>
              CAMPUS<Text style={styles.appTitleYellow}>COLLAB</Text> ★
            </Text>
            <View style={styles.eventBadge}>
              <Text style={styles.eventBadgeText}>STANFORD HACK</Text>
            </View>
          </View>
        </View>

        {/* Right header buttons */}
        <View style={styles.headerRight}>
          {/* Filter button with badge */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setFilterModalVisible(true)}
            style={[styles.headerIconButton, styles.bgWhite, BRUTAL_SHADOWS.xs]}
          >
            <Text style={styles.filterIconText}>⚙️</Text>
            <View style={[styles.notificationBadge, BRUTAL_SHADOWS.xs]}>
              <Text style={styles.notificationBadgeText}>3!</Text>
            </View>
          </TouchableOpacity>

          {/* Bell notification button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => showToast('2 SQUAD UPDATES', COLORS.cyan)}
            style={[styles.headerIconButton, styles.bgCyan, BRUTAL_SHADOWS.xs]}
          >
            <Text style={styles.bellIconText}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. SUB-HEADER TICKER BAR WITH COMIC BADGES */}
      <View style={styles.tickerBar}>
        <ComicBadge
          text="POW! ★"
          color={COLORS.pink}
          textColor={COLORS.white}
          rotate="-4deg"
          size="sm"
          style={styles.powBadge}
        />

        <View style={[styles.tickerPill, BRUTAL_SHADOWS.xs]}>
          <Text style={styles.tickerPillText}>LIVE: 14 CREATIVE TEAMS</Text>
        </View>

        <View style={[styles.matchRatePill, BRUTAL_SHADOWS.xs]}>
          <Text style={styles.matchRateText}>⚡ 94% MATCH RATE!</Text>
        </View>

        <ComicBadge
          text="BAM! ⚡"
          color={COLORS.yellow}
          textColor={COLORS.black}
          rotate="5deg"
          size="sm"
          style={styles.bamBadge}
        />
      </View>

      {/* FEEDBACK POPUP TOAST */}
      {feedbackToast && (
        <View style={[styles.toastContainer, { backgroundColor: feedbackToast.color }, BRUTAL_SHADOWS.sm]}>
          <Text style={styles.toastText}>{feedbackToast.message}</Text>
        </View>
      )}

      {/* 3. MAIN CARD DISCOVERY VIEW */}
      <ScrollView
        style={styles.cardScrollView}
        contentContainerStyle={styles.cardScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentProject ? (
          <ProjectCard
            project={currentProject}
            onApply={handleApply}
            onBookmark={handleBookmark}
            isBookmarked={!!bookmarks[currentProject.id]}
          />
        ) : (
          <View style={[styles.emptyCard, BRUTAL_SHADOWS.md]}>
            <Text style={styles.emptyTitle}>🎉 ALL SQUADS EXPLORED!</Text>
            <Text style={styles.emptySubtitle}>You have reviewed all available Stanford Hack teams.</Text>
            <TouchableOpacity
              onPress={() => setCurrentIndex(0)}
              style={[styles.resetBtn, BRUTAL_SHADOWS.sm]}
            >
              <Text style={styles.resetBtnText}>↺ RESTART DECK</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 4. TINDER/COMIC ACTION BUTTONS */}
        <SwipeControls
          onRewind={handleRewind}
          onPass={handlePass}
          onBookmark={() => currentProject && handleBookmark(currentProject.id)}
          onLike={handleLike}
        />
      </ScrollView>

      {/* APPLY ROLE MODAL */}
      <Modal visible={!!selectedRoleModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, BRUTAL_SHADOWS.lg]}>
            <ComicBadge text="SQUAD APPLICATION" color={COLORS.yellow} textColor={COLORS.black} size="md" />
            <Text style={styles.modalTitle}>Join {selectedRoleModal?.project.title}</Text>
            <Text style={styles.modalSub}>Role: <Text style={{ fontWeight: '900', color: COLORS.pink }}>{selectedRoleModal?.role}</Text></Text>
            <Text style={styles.modalBody}>
              Your developer profile, GitHub links, and technical skill compatibility (
              {selectedRoleModal?.project.matchScore}%) will be sent directly to{' '}
              {selectedRoleModal?.project.authorName}.
            </Text>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                onPress={() => setSelectedRoleModal(null)}
                style={[styles.modalCancelBtn, BRUTAL_SHADOWS.xs]}
              >
                <Text style={styles.modalCancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmApplication}
                style={[styles.modalConfirmBtn, BRUTAL_SHADOWS.xs]}
              >
                <Text style={styles.modalConfirmText}>SEND PITCH 🚀</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FILTER MODAL */}
      <Modal visible={filterModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, BRUTAL_SHADOWS.lg]}>
            <ComicBadge text="SQUAD FILTERS" color={COLORS.cyan} textColor={COLORS.black} size="md" />
            <Text style={styles.modalTitle}>Filter by Category</Text>

            <View style={styles.filterChipsRow}>
              {['ALL', 'AI / ML', 'ROBOTICS', 'FINTECH', 'HEALTH', 'WEB3'].map((cat, i) => (
                <View
                  key={cat}
                  style={[
                    styles.filterChip,
                    i === 0 && { backgroundColor: COLORS.yellow },
                    BRUTAL_SHADOWS.xs,
                  ]}
                >
                  <Text style={styles.filterChipText}>{cat}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              style={[styles.modalConfirmBtn, { marginTop: 16 }, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.modalConfirmText}>APPLY FILTERS</Text>
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
    backgroundColor: COLORS.creamBg,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 3.5,
    borderBottomColor: COLORS.black,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userAvatarContainer: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: COLORS.black,
    backgroundColor: COLORS.white,
  },
  headerUserAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  onlineStatusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.lime,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  titleColumn: {
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: FONTS.lg + 1,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  appTitleYellow: {
    color: COLORS.black,
  },
  eventBadge: {
    backgroundColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  eventBadgeText: {
    fontSize: FONTS.xs - 1,
    fontWeight: '900',
    color: COLORS.yellow,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2.5,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bgWhite: {
    backgroundColor: COLORS.white,
  },
  bgCyan: {
    backgroundColor: COLORS.cyan,
  },
  filterIconText: {
    fontSize: 18,
  },
  bellIconText: {
    fontSize: 18,
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.pink,
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.black,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  notificationBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.white,
  },
  tickerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    backgroundColor: COLORS.creamBg,
    borderBottomWidth: 2.5,
    borderBottomColor: COLORS.black,
  },
  powBadge: {
    marginRight: 4,
  },
  tickerPill: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tickerPillText: {
    fontSize: FONTS.xs - 1,
    fontWeight: '900',
    color: COLORS.black,
  },
  matchRatePill: {
    backgroundColor: COLORS.lime,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  matchRateText: {
    fontSize: FONTS.xs - 1,
    fontWeight: '900',
    color: COLORS.black,
  },
  bamBadge: {
    marginLeft: 4,
  },
  cardScrollView: {
    flex: 1,
  },
  cardScrollContent: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  toastContainer: {
    alignSelf: 'center',
    borderWidth: 2.5,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 6,
    zIndex: 100,
  },
  toastText: {
    fontSize: FONTS.xs + 2,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderWidth: 3.5,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginVertical: 40,
  },
  emptyTitle: {
    fontSize: FONTS.xl,
    fontWeight: '900',
    color: COLORS.black,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  resetBtn: {
    backgroundColor: COLORS.yellow,
    borderWidth: 2.5,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  resetBtnText: {
    fontSize: FONTS.sm,
    fontWeight: '900',
    color: COLORS.black,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderWidth: 3.5,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: FONTS.xl,
    fontWeight: '900',
    color: COLORS.black,
    marginTop: 10,
    marginBottom: 4,
  },
  modalSub: {
    fontSize: FONTS.sm,
    color: COLORS.black,
    marginBottom: 10,
  },
  modalBody: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modalCancelText: {
    fontSize: FONTS.xs + 1,
    fontWeight: '800',
    color: COLORS.black,
  },
  modalConfirmBtn: {
    backgroundColor: COLORS.lime,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: FONTS.xs + 1,
    fontWeight: '900',
    color: COLORS.black,
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  filterChip: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipText: {
    fontSize: FONTS.xs,
    fontWeight: '900',
    color: COLORS.black,
  },
});