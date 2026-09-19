import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { COLORS, BORDERS, BORDER_RADIUS, BRUTAL_SHADOWS, FONTS, SPACING } from '../styles/theme';
import ComicBadge from './ComicBadge';
import { DoodleStar, DoodleCode, DoodleCheck } from './DoodleElements';
import NotificationCard from './NotificationCard';
import { useApp } from '../context/AppContext';

/**
 * Reusable Notifications Feed with Pop Art x Doodle Art styling.
 * Used in ChatsScreen and HomeScreen's notifications modal.
 * ZERO Unicode emojis.
 */
export default function NotificationsList({
  onSelectNotification,
  showHeader = true,
  contentContainerStyle,
  style,
}) {
  const {
    notifications,
    unreadNotificationsCount,
    notificationsLoading,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsRead,
    setActiveChatId,
  } = useApp();

  const handlePress = async (n) => {
    if (markNotificationAsRead && n?.id) {
      await markNotificationAsRead(n.id);
    }
    if (onSelectNotification) {
      onSelectNotification(n);
    } else if (n?.matchId && setActiveChatId) {
      setActiveChatId(n.matchId);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Top Action / Status Bar */}
      {showHeader && (
        <View style={styles.statusBar}>
          <View style={styles.statusLeft}>
            <View style={[styles.unreadCountBadge, unreadNotificationsCount > 0 ? styles.unreadCountActive : styles.unreadCountZero]}>
              <Text style={styles.unreadCountText}>
                {unreadNotificationsCount > 0 ? `${unreadNotificationsCount} UNREAD` : 'ALL READ'}
              </Text>
            </View>
          </View>

          {unreadNotificationsCount > 0 && (
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={markAllNotificationsRead}
              style={[styles.markAllBtn, BRUTAL_SHADOWS.xs]}
            >
              <DoodleCheck size={11} color={COLORS.ink} />
              <Text style={styles.markAllBtnText}>MARK ALL READ</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Notifications Scroll Feed */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(notificationsLoading)}
            onRefresh={() => {
              if (loadNotifications) loadNotifications();
            }}
            tintColor={COLORS.ink}
            colors={[COLORS.yellow, COLORS.cyan]}
          />
        }
      >
        {notificationsLoading && notifications.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={COLORS.ink} />
            <Text style={styles.loadingText}>FETCHING DISPATCHES...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyDoodleRow}>
              <DoodleStar size={24} color={COLORS.yellow} />
              <DoodleCode symbol="//" bgColor={COLORS.creamDark} color={COLORS.ink} />
              <DoodleStar size={18} color={COLORS.coral} />
            </View>

            <Text style={styles.emptyTitle}>ALL CAUGHT UP!</Text>
            <Text style={styles.emptySubtitle}>
              You have no new notifications. Incoming invitations, match alerts, and messages will arrive here in realtime.
            </Text>

            <View style={styles.emptyBadgeWrap}>
              <ComicBadge
                text="SYSTEM READY // 0 ALERTS"
                color={COLORS.lime}
                textColor={COLORS.ink}
                size="sm"
                rotate="-1deg"
              />
            </View>
          </View>
        ) : (
          notifications.map((notif) => (
            <NotificationCard
              key={notif.id}
              notification={notif}
              onPress={handlePress}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderBottomWidth: BORDERS.thin,
    borderBottomColor: 'rgba(24, 24, 27, 0.12)',
    backgroundColor: COLORS.creamLight,
    width: '100%',
    borderRadius: 8,
    marginBottom: 6,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.borderBlack,
  },
  unreadCountActive: {
    backgroundColor: COLORS.yellow,
  },
  unreadCountZero: {
    backgroundColor: COLORS.creamDark,
    borderColor: 'rgba(24, 24, 27, 0.3)',
  },
  unreadCountText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.borderBlack,
    letterSpacing: 0.5,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  markAllBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.borderBlack,
    letterSpacing: 0.4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 28,
  },
  loadingBox: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.8,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xl,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    ...BRUTAL_SHADOWS.sm,
  },
  emptyDoodleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  emptyBadgeWrap: {
    marginTop: 4,
  },
});
