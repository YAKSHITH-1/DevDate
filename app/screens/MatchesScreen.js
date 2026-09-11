import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, BRUTAL_SHADOWS } from '../styles/theme';
import ComicBadge from '../components/ComicBadge';
import { INITIAL_MATCHES } from '../data/projectsData';

export default function MatchesScreen({ onOpenChat }) {
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [filterTab, setFilterTab] = useState('ALL'); // ALL, ACCEPTED, PENDING

  const filteredMatches = matches.filter((m) => {
    if (filterTab === 'ALL') return true;
    return m.status === filterTab;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SQUAD MATCHES</Text>
        <ComicBadge text="COLLAB HUB" color={COLORS.yellow} textColor={COLORS.black} rotate="3deg" size="sm" />
      </View>

      {/* Tabs Row */}
      <View style={styles.filterTabsRow}>
        {['ALL', 'ACCEPTED', 'PENDING'].map((tab) => (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.8}
            onPress={() => setFilterTab(tab)}
            style={[
              styles.filterTabBtn,
              filterTab === tab && styles.filterTabBtnActive,
              BRUTAL_SHADOWS.xs,
            ]}
          >
            <Text
              style={[
                styles.filterTabText,
                filterTab === tab && styles.filterTabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredMatches.map((match) => {
          const isAccepted = match.status === 'ACCEPTED';

          return (
            <View key={match.id} style={[styles.matchCard, BRUTAL_SHADOWS.md]}>
              {/* Card top banner */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.authorRow}>
                  <Image source={{ uri: match.authorAvatar }} style={styles.avatar} />
                  <View>
                    <Text style={styles.authorName}>{match.authorName}</Text>
                    <Text style={styles.authorRole}>{match.authorRole}</Text>
                  </View>
                </View>

                <ComicBadge
                  text={match.status}
                  color={isAccepted ? COLORS.lime : COLORS.yellow}
                  textColor={COLORS.black}
                  size="sm"
                />
              </View>

              {/* Project title */}
              <Text style={styles.projectTitle}>{match.projectTitle}</Text>
              <Text style={styles.appliedRoleText}>
                Applied for: <Text style={{ color: COLORS.pink, fontWeight: '900' }}>{match.appliedRole}</Text>
              </Text>

              {/* Compatibility Breakdown (from PRD spec) */}
              <View style={[styles.scoreBox, BRUTAL_SHADOWS.xs]}>
                <View style={styles.scoreRow}>
                  <Text style={styles.totalScore}>⭐ {match.matchScore}% TOTAL MATCH</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownItem}>⚡ Skill: {match.breakdown.skill}%</Text>
                  <Text style={styles.breakdownItem}>🎯 Interest: {match.breakdown.interest}%</Text>
                  <Text style={styles.breakdownItem}>💼 Role: {match.breakdown.role}%</Text>
                </View>
              </View>

              {/* Message preview */}
              <Text style={styles.recentMessageText}>"{match.recentMessage}"</Text>

              {/* Action Button */}
              {isAccepted ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onOpenChat && onOpenChat(match.projectTitle)}
                  style={[styles.chatBtn, BRUTAL_SHADOWS.sm]}
                >
                  <Text style={styles.chatBtnText}>💬 ENTER SQUAD CHAT</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.pendingPill, BRUTAL_SHADOWS.xs]}>
                  <Text style={styles.pendingPillText}>⏳ AWAITING OWNER APPROVAL</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.creamBg,
  },
  header: {
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
  headerTitle: {
    fontSize: FONTS.xl,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 2.5,
    borderBottomColor: COLORS.black,
  },
  filterTabBtn: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  filterTabBtnActive: {
    backgroundColor: COLORS.pink,
  },
  filterTabText: {
    fontSize: FONTS.xs,
    fontWeight: '900',
    color: COLORS.black,
  },
  filterTabTextActive: {
    color: COLORS.white,
  },
  scrollContent: {
    padding: SPACING.md,
    gap: 16,
  },
  matchCard: {
    backgroundColor: COLORS.white,
    borderWidth: 3.5,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  authorName: {
    fontSize: FONTS.sm + 1,
    fontWeight: '900',
    color: COLORS.black,
  },
  authorRole: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  projectTitle: {
    fontSize: FONTS['2xl'],
    fontWeight: '900',
    color: COLORS.black,
    marginVertical: 4,
  },
  appliedRoleText: {
    fontSize: FONTS.xs + 1,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  scoreBox: {
    backgroundColor: '#FFFBEA',
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.md,
    padding: 8,
    marginBottom: 10,
  },
  scoreRow: {
    marginBottom: 4,
  },
  totalScore: {
    fontSize: FONTS.xs + 1,
    fontWeight: '900',
    color: COLORS.black,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    fontSize: FONTS.xs - 1,
    fontWeight: '800',
    color: COLORS.darkGray,
  },
  recentMessageText: {
    fontSize: FONTS.xs + 1,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  chatBtn: {
    backgroundColor: COLORS.lime,
    borderWidth: 2.5,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chatBtnText: {
    fontSize: FONTS.xs + 1,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  pendingPill: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingVertical: 8,
    alignItems: 'center',
  },
  pendingPillText: {
    fontSize: FONTS.xs,
    fontWeight: '900',
    color: COLORS.textSecondary,
  },
});
