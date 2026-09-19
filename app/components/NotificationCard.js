import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, BORDERS, BORDER_RADIUS, BRUTAL_SHADOWS, FONTS } from '../styles/theme';
import { DoodleStar, DoodleCheck, DoodleCross, DoodleCode, DoodleArrow } from './DoodleElements';
import { resolveProfileAvatar } from '../utils/avatar';

/**
 * Illustrated Activity Card for DevDate Notifications
 * Conforms to Pop Art x Doodle Art visual system with ZERO Unicode emojis.
 */
export default function NotificationCard({ notification, onPress }) {
  if (!notification) return null;

  const { id, title, message, time, read, type, actor, project } = notification;

  const getTypeMeta = () => {
    switch (type) {
      case 'INVITATION_RECEIVED':
        return {
          label: 'INVITE',
          bgColor: COLORS.pillCoral,
          borderColor: COLORS.coral,
          textColor: '#DC2626',
          icon: <DoodleStar size={12} color={COLORS.coral} />,
        };
      case 'INVITATION_ACCEPTED':
        return {
          label: 'ACCEPTED',
          bgColor: COLORS.pillGreen,
          borderColor: COLORS.green,
          textColor: '#15803D',
          icon: <DoodleCheck size={12} color={COLORS.green} />,
        };
      case 'INVITATION_REJECTED':
      case 'INVITATION_WITHDRAWN':
        return {
          label: 'DECLINED',
          bgColor: '#FEE2E2',
          borderColor: '#EF4444',
          textColor: '#B91C1C',
          icon: <DoodleCross size={12} color={COLORS.coral} />,
        };
      case 'MATCH':
      case 'MATCH_CREATED':
        return {
          label: 'MATCH',
          bgColor: COLORS.pillYellow,
          borderColor: COLORS.yellow,
          textColor: '#854D0E',
          icon: <DoodleStar size={12} color={COLORS.ink} />,
        };
      case 'MESSAGE':
      case 'NEW_MESSAGE':
        return {
          label: 'CHAT',
          bgColor: COLORS.pillBlue,
          borderColor: COLORS.cyan,
          textColor: '#0284C7',
          icon: <DoodleCode symbol="//" bgColor={COLORS.cyan} color={COLORS.ink} style={styles.miniCode} />,
        };
      default:
        return {
          label: 'ALERT',
          bgColor: COLORS.creamDark,
          borderColor: COLORS.borderBlack,
          textColor: COLORS.ink,
          icon: <DoodleCode symbol="i" bgColor={COLORS.white} color={COLORS.ink} style={styles.miniCode} />,
        };
    }
  };

  const meta = getTypeMeta();

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={() => onPress && onPress(notification)}
      style={[
        styles.card,
        read ? styles.cardRead : styles.cardUnread,
        read ? BRUTAL_SHADOWS.xs : BRUTAL_SHADOWS.sm,
      ]}
    >
      {/* Unread side accent bar */}
      {!read && <View style={[styles.unreadSideStripe, { backgroundColor: meta.borderColor }]} />}

      <View style={styles.cardInner}>
        {/* Top Header Row */}
        <View style={styles.topRow}>
          <View style={styles.typeBadgeRow}>
            <View style={[styles.typeBadge, { backgroundColor: meta.bgColor, borderColor: meta.borderColor }]}>
              {meta.icon}
              <Text style={[styles.typeBadgeText, { color: meta.textColor }]}>{meta.label}</Text>
            </View>

            {project?.title ? (
              <View style={styles.projectTagPill}>
                <Text style={styles.projectTagText} numberOfLines={1}>
                  // {project.title}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.timeWrap}>
            {!read && (
              <View style={styles.newPillBadge}>
                <Text style={styles.newPillText}>NEW</Text>
              </View>
            )}
            <Text style={[styles.timeText, !read && styles.timeTextUnread]}>{time || 'Just now'}</Text>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.bodyRow}>
          {/* Avatar if actor exists */}
          {actor ? (
            <Image
              source={{ uri: resolveProfileAvatar(actor.avatar, actor.name || 'Dev', 'voxel-bot') }}
              style={styles.actorAvatar}
            />
          ) : null}

          <View style={styles.textCol}>
            <Text style={[styles.titleText, !read && styles.titleTextUnread]} numberOfLines={1}>
              {title}
            </Text>
            <Text style={[styles.messageText, !read && styles.messageTextUnread]}>
              {message}
            </Text>
          </View>
        </View>

        {/* Footer Action Hint */}
        <View style={styles.footerRow}>
          <View style={styles.footerAction}>
            <Text style={styles.actionPromptText}>VIEW DETAILS</Text>
            <DoodleArrow direction="right" size={12} color={COLORS.ink} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    marginBottom: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  cardUnread: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderBlack,
  },
  cardRead: {
    backgroundColor: '#FDFBF7',
    borderColor: 'rgba(24, 24, 27, 0.45)',
  },
  unreadSideStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    zIndex: 2,
  },
  cardInner: {
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  miniCode: {
    paddingHorizontal: 3,
    paddingVertical: 0,
    borderRadius: 3,
    borderWidth: 1,
  },
  projectTagPill: {
    backgroundColor: COLORS.creamDark,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    maxWidth: 140,
  },
  projectTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.ink,
    fontFamily: FONTS.mono,
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newPillBadge: {
    backgroundColor: COLORS.yellow,
    borderWidth: 1.5,
    borderColor: COLORS.borderBlack,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  newPillText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: COLORS.borderBlack,
    letterSpacing: 0.4,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  timeTextUnread: {
    color: COLORS.ink,
    fontWeight: '800',
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  actorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.8,
    borderColor: COLORS.borderBlack,
  },
  avatarFallback: {
    backgroundColor: COLORS.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.borderBlack,
  },
  textCol: {
    flex: 1,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.ink,
    marginBottom: 2,
  },
  titleTextUnread: {
    fontWeight: '900',
    color: COLORS.borderBlack,
  },
  messageText: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    lineHeight: 16,
    fontWeight: '500',
  },
  messageTextUnread: {
    color: COLORS.ink,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(24, 24, 27, 0.08)',
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionPromptText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.borderBlack,
    letterSpacing: 0.4,
  },
});
