import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, BORDER_RADIUS, BORDERS, BRUTAL_SHADOWS } from '../styles/theme';
import { DoodleStar, DoodleSparkle, DoodleUnderline, DoodleCode, DoodleArrow } from './DoodleElements';
import { getSkillLabels, ALL_SKILLS } from '../data/skillsDatabase';

// Pop Art pastel colors for skill chips — unified with Chunk 3
const SKILL_COLORS = [
  { bg: COLORS.pillBlue, border: COLORS.pillBlueBorder },
  { bg: COLORS.pillYellow, border: COLORS.pillYellowBorder },
  { bg: COLORS.pillGreen, border: COLORS.pillGreenBorder },
  { bg: COLORS.purplePastel, border: COLORS.purple },
  { bg: COLORS.pillCoral, border: COLORS.pillCoralBorder },
  { bg: COLORS.orangePastel, border: COLORS.orange },
];

function getStatusInfo(status, currentMembers = 0, maxMembers = 0) {
  if (status === 'CLOSED') {
    return { bg: '#E5E7EB', color: '#374151', label: 'PROJECT CLOSED' };
  }
  if (maxMembers > 0 && currentMembers >= maxMembers) {
    return { bg: '#FED7AA', color: '#9A3412', label: 'TEAM FULL' };
  }
  if (status === 'OPEN' || status === 'Recruiting') {
    return { bg: '#DCFCE7', color: '#166534', label: 'RECRUITING' };
  }
  if (status === 'Active MVP') {
    return { bg: '#E0F2FE', color: '#1E40AF', label: 'ACTIVE MVP' };
  }
  return { bg: '#DCFCE7', color: '#166534', label: status?.toUpperCase() || 'RECRUITING' };
}

export default function ProjectCard({
  project,
  isActiveForDiscovery = false,
  onView,
  onEdit,
  onClose,
  onFindMembers,
  onBookmark,
  isBookmarked = false,
  onApply,
}) {
  if (!project) return null;

  const [imgError, setImgError] = useState(false);

  const currentMembers =
    project.membersCount ||
    (Array.isArray(project.members) ? project.members.length : 1);
  const maxMembers = project.maxMembers || project.teamSize?.max || 4;
  const statusInfo = getStatusInfo(project.status, currentMembers, maxMembers);
  const isClosed = project.status === 'CLOSED';

  // Canonical skill labels
  const displaySkills = getSkillLabels(project.techStack);
  const shownSkills = displaySkills.slice(0, 5);
  const extraCount = displaySkills.length - 5;

  const hasImage =
    Boolean(project.image) &&
    (project.image.startsWith('http') || project.image.startsWith('data:image/')) &&
    !imgError;

  return (
    <View style={[styles.cardContainer, BRUTAL_SHADOWS.card]}>
      {/* 1. TOP BAR: THUMBNAIL / ICON + TITLE + STATUS BADGE */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          {hasImage ? (
            <View style={styles.thumbWrapper}>
              <Image
                source={{ uri: project.image }}
                style={styles.thumbImage}
                resizeMode="cover"
                onError={() => setImgError(true)}
              />
            </View>
          ) : (
            <DoodleCode
              symbol={project.icon || '</>'}
              bgColor={COLORS.yellowHighlight}
              color={COLORS.ink}
              style={styles.iconBadge}
            />
          )}

          <View style={styles.titleTexts}>
            <View style={styles.titleRow}>
              <Text style={styles.projectTitle} numberOfLines={1}>
                {project.title}
              </Text>
            </View>
            <Text style={styles.projectCategory}>{project.category || 'Development'}</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusInfo.bg },
            BRUTAL_SHADOWS.xs,
          ]}
        >
          <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      {/* 2. ACTIVE FOR DISCOVERY BADGE */}
      {isActiveForDiscovery && !isClosed && (
        <View style={[styles.activeDiscoveryPill, BRUTAL_SHADOWS.xs]}>
          <DoodleStar size={12} color={COLORS.ink} style={{ marginRight: 6 }} />
          <Text style={styles.activeDiscoveryText}>ACTIVE FOR DISCOVERY</Text>
        </View>
      )}

      {/* 3. PROJECT DESCRIPTION */}
      <Text style={styles.projectDescription} numberOfLines={2}>
        {project.description}
      </Text>

      {/* 4. REQUIRED SKILLS CHIPS */}
      {shownSkills.length > 0 && (
        <View style={styles.skillsSection}>
          <View style={styles.skillsRow}>
            {shownSkills.map((skill, index) => {
              const colorTheme = SKILL_COLORS[index % SKILL_COLORS.length];
              return (
                <View
                  key={index}
                  style={[
                    styles.skillChip,
                    {
                      backgroundColor: colorTheme.bg,
                      borderColor: COLORS.ink,
                    },
                  ]}
                >
                  <Text style={styles.skillChipText}>{skill}</Text>
                </View>
              );
            })}
            {extraCount > 0 && (
              <View style={styles.skillChipMore}>
                <Text style={styles.skillChipMoreText}>+{extraCount}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* 5. TEAM SIZE PROGRESS BAR */}
      <View style={styles.teamProgressSection}>
        <View style={styles.teamProgressHeader}>
          <Text style={styles.teamProgressLabel}>TEAM CAPACITY</Text>
          <Text style={styles.teamProgressValue}>
            {currentMembers}/{maxMembers} Members
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(100, (currentMembers / maxMembers) * 100)}%`,
                backgroundColor: isClosed
                  ? COLORS.borderMuted
                  : currentMembers >= maxMembers
                  ? COLORS.orange
                  : COLORS.green,
              },
            ]}
          />
        </View>
      </View>

      {/* 6. WANTED ROLES */}
      {project.wantedRoles && project.wantedRoles.length > 0 && (
        <View style={styles.rolesSection}>
          <View style={styles.rolesHeaderRow}>
            <DoodleArrow direction="right" size={12} color={COLORS.inkMuted} style={{ marginRight: 4 }} />
            <Text style={styles.rolesHeaderLabel}>LOOKING FOR:</Text>
          </View>
          <View style={styles.rolesRow}>
            {project.wantedRoles.slice(0, 3).map((role, idx) => (
              <View key={idx} style={styles.roleBadge}>
                <Text style={styles.roleBadgeText} numberOfLines={1}>
                  {role}
                </Text>
              </View>
            ))}
            {project.wantedRoles.length > 3 && (
              <View style={styles.roleBadgeMore}>
                <Text style={styles.roleBadgeMoreText}>+{project.wantedRoles.length - 3}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* 7. SQUAD MEMBERS PREVIEW (IF AVAILABLE) */}
      {project.members && project.members.length > 0 && (
        <View style={styles.membersSection}>
          <Text style={styles.membersSectionLabel}>SQUAD:</Text>
          <View style={styles.memberAvatarsRow}>
            {project.members.slice(0, 4).map((member, idx) => (
              <View key={member.id || idx} style={styles.memberAvatarCircle}>
                {member.avatar ? (
                  <Image source={{ uri: member.avatar }} style={styles.memberAvatarImg} />
                ) : (
                  <Text style={styles.memberAvatarInitial}>
                    {(member.name || 'D').charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
            ))}
            {project.members.length > 4 && (
              <View style={styles.memberAvatarMore}>
                <Text style={styles.memberAvatarMoreText}>+{project.members.length - 4}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* 8. CARD ACTIONS */}
      <View style={styles.actionsRow}>
        {onView && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onView(project)}
            style={[styles.actionBtn, styles.actionBtnView, BRUTAL_SHADOWS.xs]}
          >
            <Text style={styles.actionBtnViewText}>VIEW</Text>
          </TouchableOpacity>
        )}

        {onEdit && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onEdit(project)}
            style={[styles.actionBtn, styles.actionBtnEdit, BRUTAL_SHADOWS.xs]}
          >
            <Text style={styles.actionBtnEditText}>EDIT</Text>
          </TouchableOpacity>
        )}

        {!isClosed ? (
          <>
            {onClose && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onClose(project.id)}
                style={[styles.actionBtn, styles.actionBtnClose, BRUTAL_SHADOWS.xs]}
              >
                <Text style={styles.actionBtnCloseText}>CLOSE</Text>
              </TouchableOpacity>
            )}

            {onFindMembers && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onFindMembers(project)}
                style={[styles.actionBtn, styles.actionBtnFind, BRUTAL_SHADOWS.xs]}
              >
                <Text style={styles.actionBtnFindText}>FIND</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.actionBtnClosed}>
            <Text style={styles.actionBtnClosedText}>CLOSED</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderWidth: 2.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  titleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thumbWrapper: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 14,
    overflow: 'hidden',
    backgroundColor: COLORS.creamDark,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  iconBadge: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 14,
    borderWidth: 2,
  },
  titleTexts: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
  },
  projectCategory: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  statusBadge: {
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  activeDiscoveryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.yellow,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 10,
  },
  activeDiscoveryText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },

  projectDescription: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },

  skillsSection: {
    marginBottom: 12,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillChip: {
    borderWidth: 1.5,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  skillChipText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
  },
  skillChipMore: {
    backgroundColor: COLORS.creamDark,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 11,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  skillChipMoreText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.inkMuted,
  },

  teamProgressSection: {
    backgroundColor: COLORS.creamLight,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 14,
    padding: 8,
    marginBottom: 10,
  },
  teamProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  teamProgressLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  teamProgressValue: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  rolesSection: {
    marginBottom: 10,
  },
  rolesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rolesHeaderLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  roleBadge: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.ink,
  },
  roleBadgeMore: {
    backgroundColor: COLORS.creamDark,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  roleBadgeMoreText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
  },

  membersSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  membersSectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  memberAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.yellowHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginLeft: -4,
  },
  memberAvatarImg: {
    width: '100%',
    height: '100%',
  },
  memberAvatarInitial: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
  },
  memberAvatarMore: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
  },
  memberAvatarMoreText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.textMuted,
  },

  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    height: 38,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnView: {
    backgroundColor: COLORS.white,
  },
  actionBtnViewText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  actionBtnEdit: {
    backgroundColor: COLORS.white,
  },
  actionBtnEditText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  actionBtnClose: {
    backgroundColor: COLORS.pillCoral,
    borderColor: COLORS.ink,
  },
  actionBtnCloseText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.coral,
    letterSpacing: 0.5,
  },
  actionBtnFind: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.ink,
  },
  actionBtnFindText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  actionBtnClosed: {
    flex: 1,
    height: 38,
    backgroundColor: COLORS.creamDark,
    borderWidth: 1.5,
    borderColor: COLORS.borderMuted,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnClosedText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
});
