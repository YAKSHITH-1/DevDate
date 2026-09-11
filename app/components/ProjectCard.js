import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, BRUTAL_SHADOWS } from '../styles/theme';
import ComicBadge from './ComicBadge';

export default function ProjectCard({ project, onApply, onBookmark, isBookmarked }) {
  if (!project) return null;

  return (
    <View style={[styles.cardContainer, BRUTAL_SHADOWS.card]}>
      {/* Top badges row */}
      <View style={styles.topRow}>
        <View style={styles.badgeCluster}>
          <ComicBadge
            text={`★ ${project.matchScore}% MATCH!`}
            color={COLORS.yellow}
            textColor={COLORS.black}
            style={styles.matchBadge}
          />
          {project.badge && (
            <ComicBadge
              text={project.badge}
              color={COLORS.pink}
              textColor={COLORS.white}
              rotate="-2deg"
              style={styles.insiderBadge}
            />
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onBookmark && onBookmark(project.id)}
          style={[styles.bookmarkBtn, BRUTAL_SHADOWS.xs]}
        >
          <Text style={styles.bookmarkIcon}>{isBookmarked ? '★' : '🔖'}</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar with CS badge */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarBorder}>
          <Image
            source={{ uri: project.authorAvatar }}
            style={styles.avatarImage}
          />
          <View style={[styles.yearBadge, BRUTAL_SHADOWS.xs]}>
            <Text style={styles.yearBadgeText}>{project.authorBatch || "CS '25"}</Text>
          </View>
        </View>

        {/* Project Title with Comic Pop Effect */}
        <Text style={styles.projectTitle}>{project.title}</Text>

        {/* Author / Lead Pill */}
        <View style={[styles.leadPill, BRUTAL_SHADOWS.xs]}>
          <View style={styles.redDot} />
          <Text style={styles.leadText}>
            {project.authorName} • <Text style={styles.leadRole}>{project.authorRole}</Text>
          </Text>
        </View>
      </View>

      {/* Inner White Box Content */}
      <View style={[styles.innerContentBox, BRUTAL_SHADOWS.sm]}>
        {/* Quote / Pitch */}
        <Text style={styles.pitchText}>"{project.description}"</Text>

        {/* Tech Arsenal */}
        <View style={styles.sectionDivider} />
        <View style={styles.techSection}>
          <Text style={styles.sectionHeader}>📟 TECH ARSENAL:</Text>
          <View style={styles.techTagsRow}>
            {project.techStack?.map((tech, index) => {
              let tagBg = COLORS.white;
              let tagColor = COLORS.black;
              if (index === 0) tagBg = COLORS.yellow;
              else if (index === 1) { tagBg = COLORS.pink; tagColor = COLORS.white; }
              else if (index === 2) tagBg = COLORS.cyan;

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
                    {tech}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Roles Wanted */}
        <View style={styles.rolesSection}>
          <View style={styles.rolesHeaderRow}>
            <Text style={styles.sectionHeader}>👥 ROLES WANTED IN SQUAD:</Text>
            <View style={[styles.spotsBadge, BRUTAL_SHADOWS.xs]}>
              <Text style={styles.spotsBadgeText}>
                {project.openSpots || '2'} SPOTS!
              </Text>
            </View>
          </View>

          {project.wantedRoles?.map((role, idx) => (
            <View key={idx} style={[styles.roleItem, BRUTAL_SHADOWS.xs]}>
              <Text style={styles.roleItemText}>✏️ {role}</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onApply && onApply(project, role)}
                style={[styles.applyBtn, BRUTAL_SHADOWS.xs]}
              >
                <Text style={styles.applyBtnText}>APPLY</Text>
              </TouchableOpacity>
            </View>
          ))}
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
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  badgeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  matchBadge: {
    marginRight: 4,
  },
  insiderBadge: {
    marginLeft: 2,
  },
  bookmarkBtn: {
    width: 38,
    height: 38,
    backgroundColor: COLORS.white,
    borderWidth: 2.5,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkIcon: {
    fontSize: 18,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarBorder: {
    position: 'relative',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3.5,
    borderColor: COLORS.black,
    backgroundColor: COLORS.yellow,
    padding: 3,
    marginBottom: SPACING.xs,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  yearBadge: {
    position: 'absolute',
    bottom: -2,
    right: -10,
    backgroundColor: COLORS.lime,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  yearBadgeText: {
    fontSize: FONTS.xs,
    fontWeight: '900',
    color: COLORS.black,
  },
  projectTitle: {
    fontSize: FONTS['3xl'],
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginTop: SPACING.xs,
    textTransform: 'uppercase',
    textShadowColor: COLORS.black,
    textShadowOffset: { width: 2.5, height: 2.5 },
    textShadowRadius: 0,
  },
  leadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingVertical: 3,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.pink,
    marginRight: 6,
  },
  leadText: {
    fontSize: FONTS.xs + 1,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: 0.3,
  },
  leadRole: {
    color: COLORS.pink,
    fontWeight: '900',
  },
  innerContentBox: {
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  pitchText: {
    fontSize: FONTS.sm + 1,
    fontWeight: '600',
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  sectionDivider: {
    height: 1.5,
    backgroundColor: COLORS.lightGray,
    marginVertical: SPACING.sm,
  },
  techSection: {
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    fontSize: FONTS.xs + 1,
    fontWeight: '900',
    color: COLORS.black,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  techTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  techTag: {
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  techTagText: {
    fontSize: FONTS.xs,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  rolesSection: {
    marginTop: 4,
  },
  rolesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  spotsBadge: {
    backgroundColor: COLORS.pink,
    borderWidth: 1.5,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  spotsBadgeText: {
    fontSize: FONTS.xs - 1,
    fontWeight: '900',
    color: COLORS.white,
  },
  roleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFBEA',
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 4,
  },
  roleItemText: {
    fontSize: FONTS.xs + 1,
    fontWeight: '800',
    color: COLORS.black,
    flex: 1,
    marginRight: 8,
  },
  applyBtn: {
    backgroundColor: COLORS.orange,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  applyBtnText: {
    fontSize: FONTS.xs,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});
