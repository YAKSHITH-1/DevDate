import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, BRUTAL_SHADOWS, COMIC_TEXT_SHADOW } from '../styles/theme';
import ComicBadge from './ComicBadge';

function ProjectCard({ project, onApply, onBookmark, isBookmarked }) {
  if (!project) return null;

  // Clean description to ensure human-centered, easily understandable pitch
  const cleanDescription = project.description?.replace(/agentic /gi, 'intelligent ') || '';

  return (
    <View style={[styles.cardContainer, BRUTAL_SHADOWS.card]}>
      {/* 1. TOP BADGES & MASCOT ROW */}
      <View style={styles.topRow}>
        <View style={styles.badgeCluster}>
          {/* Match Score Badge */}
          <View style={[styles.matchPill, BRUTAL_SHADOWS.xs]}>
            <Text style={styles.matchPillText}>★ {project.matchScore}% MATCH!</Text>
          </View>

          {/* Slanted Comic Badge */}
          {project.badge && (
            <ComicBadge
              text={project.badge}
              color={COLORS.pink}
              textColor={COLORS.white}
              rotate="-3deg"
              size="sm"
              style={styles.insiderBadge}
            />
          )}
        </View>

        {/* Comic Mascot / Robot Profile Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onBookmark && onBookmark(project.id)}
          style={[styles.mascotBtn, BRUTAL_SHADOWS.xs]}
        >
          <Text style={styles.mascotIcon}>🤖</Text>
        </TouchableOpacity>
      </View>

      {/* 2. CREATOR AVATAR & COMIC TITLE SECTION */}
      <View style={styles.avatarSection}>
        {/* Double-ringed Comic Avatar */}
        <View style={styles.avatarOuterRing}>
          <View style={styles.avatarYellowRing}>
            <Image
              source={{ uri: project.authorAvatar }}
              style={styles.avatarImage}
            />
          </View>

          {/* Batch Pill Badge at bottom-right corner of avatar */}
          <View style={[styles.yearBadge, BRUTAL_SHADOWS.xs]}>
            <Text style={styles.yearBadgeText}>{project.authorBatch || "CS '25"}</Text>
          </View>
        </View>

        {/* Project Title with Pop-Art 3D Comic Block Shadow */}
        <Text style={styles.projectTitle}>{project.title}</Text>

        {/* Author / Lead Builder Pill */}
        <View style={[styles.leadPill, BRUTAL_SHADOWS.xs]}>
          <View style={styles.redDot} />
          <Text style={styles.leadText}>
            {project.authorName} • <Text style={styles.leadRole}>{project.authorRole}</Text>
          </Text>
        </View>
      </View>

      {/* 3. MANGA SPEECH BUBBLE CONTENT BOX (Clean, readable & user-friendly) */}
      <View style={styles.speechBubbleWrapper}>
        {/* Upward triangular speech bubble pointer */}
        <View style={styles.bubbleBeakBorder} />
        <View style={styles.bubbleBeakFill} />

        <View style={[styles.innerContentBox, BRUTAL_SHADOWS.sm]}>
          {/* Pitch Quote - Clean, readable typography */}
          <Text style={styles.pitchText}>"{cleanDescription}"</Text>

          {/* Clean Thin Divider */}
          <View style={styles.sectionDivider} />

          {/* Tech Arsenal - Scannable and compact */}
          <View style={styles.techSection}>
            <Text style={styles.sectionHeader}>📺 TECH ARSENAL:</Text>
            <View style={styles.techTagsRow}>
              {project.techStack?.map((tech, index) => {
                let tagBg = COLORS.white;
                let tagColor = COLORS.black;
                let prefix = '';

                if (index === 0) {
                  tagBg = COLORS.yellow;
                } else if (index === 1) {
                  tagBg = COLORS.pink;
                  tagColor = COLORS.white;
                  prefix = '✦ ';
                } else if (index === 2) {
                  tagBg = COLORS.cyan;
                }

                return (
                  <View
                    key={index}
                    style={[
                      styles.techTag,
                      { backgroundColor: tagBg },
                      BRUTAL_SHADOWS.xs,
                    ]}
                  >
                    <Text style={[styles.techTagText, { color: tagColor }]}>
                      {prefix}{tech}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Squad Roles Wanted - Clean, compact & user-friendly list */}
          <View style={styles.rolesSection}>
            <View style={styles.rolesHeaderRow}>
              <Text style={styles.sectionHeader}>👥 ROLES WANTED IN SQUAD:</Text>
              <View style={[styles.spotsBadge, BRUTAL_SHADOWS.xs]}>
                <Text style={styles.spotsBadgeText}>
                  {project.openSpots || '2'} SPOTS!
                </Text>
              </View>
            </View>

            <View style={styles.rolesList}>
              {project.wantedRoles?.map((role, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => onApply && onApply(project, role)}
                  style={[styles.roleItem, BRUTAL_SHADOWS.xs]}
                >
                  <View style={styles.roleLeft}>
                    <Text style={styles.roleIcon}>✏️</Text>
                    <Text style={styles.roleItemText} numberOfLines={1}>
                      {role}
                    </Text>
                  </View>
                  <View style={[styles.applyBtn, BRUTAL_SHADOWS.xs]}>
                    <Text style={styles.applyBtnText}>APPLY</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.cyan,
    borderWidth: 3.5,
    borderColor: COLORS.black,
    borderRadius: 24,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchPill: {
    backgroundColor: COLORS.yellow,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  matchPillText: {
    fontSize: FONTS.xs,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  insiderBadge: {
    marginLeft: 2,
  },
  mascotBtn: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.white,
    borderWidth: 2.5,
    borderColor: COLORS.black,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotIcon: {
    fontSize: 18,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
    marginTop: 2,
  },
  avatarOuterRing: {
    position: 'relative',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3.5,
    borderColor: COLORS.black,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarYellowRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 3.5,
    borderColor: COLORS.yellow,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  yearBadge: {
    position: 'absolute',
    bottom: -2,
    right: -8,
    backgroundColor: COLORS.lime,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  yearBadgeText: {
    fontSize: FONTS.xs - 1,
    fontWeight: '900',
    color: COLORS.black,
  },
  projectTitle: {
    fontSize: FONTS['3xl'] - 2,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginTop: 4,
    textTransform: 'uppercase',
    ...COMIC_TEXT_SHADOW,
  },
  leadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingVertical: 2,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  redDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.pink,
    marginRight: 6,
  },
  leadText: {
    fontSize: FONTS.xs,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: 0.3,
  },
  leadRole: {
    color: COLORS.pink,
    fontWeight: '900',
  },
  speechBubbleWrapper: {
    position: 'relative',
    marginTop: 6,
  },
  bubbleBeakBorder: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.black,
    zIndex: 2,
  },
  bubbleBeakFill: {
    position: 'absolute',
    top: -7,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.white,
    zIndex: 3,
  },
  innerContentBox: {
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    zIndex: 1,
  },
  pitchText: {
    fontSize: FONTS.xs + 2.5,
    fontWeight: '600',
    color: COLORS.darkGray,
    lineHeight: 18,
    textAlign: 'left',
  },
  sectionDivider: {
    height: 1.5,
    backgroundColor: '#E8E4D8',
    marginVertical: 8,
  },
  techSection: {
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: FONTS.xs,
    fontWeight: '900',
    color: COLORS.black,
    marginBottom: 5,
    letterSpacing: 0.4,
  },
  techTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  techTag: {
    borderWidth: 1.8,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  techTagText: {
    fontSize: FONTS.xs - 1,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  rolesSection: {
    marginTop: 2,
  },
  rolesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  spotsBadge: {
    backgroundColor: COLORS.pink,
    borderWidth: 1.5,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  spotsBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.white,
  },
  rolesList: {
    gap: 4,
  },
  roleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFDF2',
    borderWidth: 1.8,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  roleIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  roleItemText: {
    fontSize: FONTS.xs,
    fontWeight: '800',
    color: COLORS.black,
    flex: 1,
  },
  applyBtn: {
    backgroundColor: COLORS.orange,
    borderWidth: 1.8,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  applyBtnText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.4,
  },
});

export default React.memo(ProjectCard);

