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
import { COLORS, BORDER_RADIUS, BORDERS, BRUTAL_SHADOWS } from '../styles/theme';
import ComicBadge from '../components/ComicBadge';
import ProjectCard from '../components/ProjectCard';
import CreateProjectForm from '../components/CreateProjectForm';
import {
  DoodleStar,
  DoodleSparkle,
  DoodleCode,
  DoodleArrow,
  DoodleUnderline,
  DoodleBadge,
  DoodleSeparator,
} from '../components/DoodleElements';
import { useApp } from '../context/AppContext';
import { getSkillLabels, ALL_SKILLS } from '../data/skillsDatabase';

const SKILL_COLORS = [
  { bg: COLORS.pillBlue, border: COLORS.pillBlueBorder },
  { bg: COLORS.pillYellow, border: COLORS.pillYellowBorder },
  { bg: COLORS.pillGreen, border: COLORS.pillGreenBorder },
  { bg: COLORS.purplePastel, border: COLORS.purple },
  { bg: COLORS.pillCoral, border: COLORS.pillCoralBorder },
  { bg: COLORS.orangePastel, border: COLORS.orange },
];

export default function ProjectsScreen({
  onBackToDiscover,
  onOpenChat,
  onSelectForDiscovery,
}) {
  const {
    projects,
    projectsLoading,
    projectsError,
    loadProjects,
    viewedProject,
    activeProjectId,
    setActiveProjectId,
    setViewedProjectId,
    createProject,
    updateProject,
    fetchProjectById,
    deleteProject,
    closeProject,
  } = useApp();

  // View mode: 'list' = My Projects cards, 'detail' = single project view
  const [viewMode, setViewMode] = useState('list');

  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [closeConfirmVisible, setCloseConfirmVisible] = useState(false);
  const [closeTargetId, setCloseTargetId] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  // For the detail view
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [interestedModalVisible, setInterestedModalVisible] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  const proj = viewedProject || projects[0];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 1800);
  };

  // ─── HANDLERS ─────────────────────────────────────────────
  const handleViewProject = async (project) => {
    if (!project) return;
    setBannerError(false);
    setViewedProjectId(project.id);
    setViewMode('detail');
    if (project.id && /^[0-9a-fA-F]{24}$/.test(project.id)) {
      await fetchProjectById(project.id);
    }
  };

  const handleEditProject = async (project) => {
    if (!project) return;
    if (project.id && /^[0-9a-fA-F]{24}$/.test(project.id)) {
      const res = await fetchProjectById(project.id);
      if (res.success && res.project) {
        setEditingProject(res.project);
        setEditModalVisible(true);
        return;
      }
    }
    setEditingProject(project);
    setEditModalVisible(true);
  };

  const handleCloseProject = (projectId) => {
    setCloseTargetId(projectId);
    setCloseConfirmVisible(true);
  };

  const confirmCloseProject = async () => {
    if (!closeTargetId || isClosing) return;
    setIsClosing(true);
    try {
      const p = projects.find((pr) => pr.id === closeTargetId);
      const res = await closeProject(closeTargetId);
      if (res && res.success) {
        showToast(`CLOSED "${res.project?.title || p?.title}"`);
        setCloseConfirmVisible(false);
        setCloseTargetId(null);
      } else {
        showToast(`ERROR: ${res?.error || 'Failed to close project'}`);
      }
    } catch (err) {
      showToast(`ERROR: ${err.message || 'Error closing project'}`);
    } finally {
      setIsClosing(false);
    }
  };

  const handleFindMembers = (project) => {
    setActiveProjectId(project.id);
    showToast(`DISCOVERING FOR: ${project.title}`);
    if (onSelectForDiscovery) onSelectForDiscovery();
  };

  const handleCreateSubmit = async (formData) => {
    const result = await createProject(formData);
    if (result && result.success && result.project) {
      showToast(`CREATED "${result.project.title}"`);
      return { success: true };
    } else {
      const errMsg = result?.error || 'Failed to create project';
      showToast(`ERROR: ${errMsg}`);
      return { success: false, error: errMsg };
    }
  };

  const handleEditSubmit = async (formData) => {
    if (!editingProject) return { success: false, error: 'No project selected for editing' };
    const result = await updateProject(editingProject.id, formData);
    if (result && result.success && result.project) {
      showToast('PROJECT UPDATED!');
      setEditingProject(null);
      setEditModalVisible(false);
      return { success: true, project: result.project };
    } else {
      const errMsg = result?.error || 'Failed to update project';
      showToast(`ERROR: ${errMsg}`);
      return { success: false, error: errMsg };
    }
  };

  // ─── Skill label helper ──────────────────────────────────
  const getDisplaySkills = (techStack) => {
    if (!techStack || techStack.length === 0) return [];
    return techStack.map((s) => {
      const skill = ALL_SKILLS.find((sk) => sk.id === s || sk.label === s || sk.name === s);
      return skill ? skill.label : s;
    });
  };

  // ─── STATUS STYLING ──────────────────────────────────────
  const getStatusStyle = (status, membersCount = 0, maxMembers = 0) => {
    if (status === 'CLOSED') {
      return { bg: '#E5E7EB', color: '#374151', label: 'PROJECT CLOSED' };
    }
    if (maxMembers > 0 && membersCount >= maxMembers) {
      return { bg: '#FED7AA', color: '#9A3412', label: 'TEAM FULL' };
    }
    if (status === 'OPEN' || status === 'Recruiting') {
      return { bg: '#DCFCE7', color: '#166534', label: 'RECRUITING' };
    }
    if (status === 'Active MVP') {
      return { bg: '#E0F2FE', color: '#1E40AF', label: 'ACTIVE MVP' };
    }
    return { bg: '#DCFCE7', color: '#166534', label: status?.toUpperCase() || 'RECRUITING' };
  };

  // Category color for skill chips
  const getSkillColor = (skillId) => {
    const skill = ALL_SKILLS.find((s) => s.id === skillId || s.label === skillId || s.name === skillId);
    if (!skill) return '#E5E7EB';
    const colors = {
      frontend: COLORS.pillBlue,
      backend: COLORS.pillYellow,
      fullstack: COLORS.purplePastel,
      ai_ml: '#E9D5FF',
      mobile: COLORS.pillGreen,
      database: COLORS.orangePastel,
      devops: '#A5F3FC',
      design: '#FBCFE8',
      blockchain: COLORS.pillCoral,
      languages: '#E5E7EB',
    };
    return colors[skill.categoryId] || '#E5E7EB';
  };

  // ═══════════════════════════════════════════════════════════
  // MODE A: MY PROJECTS LIST
  // ═══════════════════════════════════════════════════════════
  const renderProjectsList = () => (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.listHeader}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onBackToDiscover}
          style={styles.headerBackBtn}
        >
          <Text style={styles.headerBackArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.listTitleWrap}>
          <Text style={styles.listTitle}>MY PROJECTS</Text>
          <DoodleStar size={14} color={COLORS.yellow} style={styles.titleStar} />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setCreateModalVisible(true)}
          style={[styles.newProjectBtn, BRUTAL_SHADOWS.xs]}
        >
          <Text style={styles.newProjectBtnText}>+ NEW</Text>
        </TouchableOpacity>
      </View>

      {/* Toast */}
      {toastMessage && (
        <View style={[styles.toastContainer, BRUTAL_SHADOWS.xs]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Project Cards List */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.listScrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(projectsLoading)}
            onRefresh={loadProjects}
            tintColor={COLORS.yellow}
            colors={[COLORS.yellow, COLORS.blue]}
          />
        }
      >
        {projectsLoading && projects.length === 0 ? (
          <View style={[styles.emptyCard, BRUTAL_SHADOWS.card]}>
            <DoodleSparkle size={30} color={COLORS.yellow} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>FETCHING PROJECTS...</Text>
            <Text style={styles.emptySubtitle}>
              Connecting to project database...
            </Text>
          </View>
        ) : projects.length === 0 ? (
          <View style={[styles.emptyCard, BRUTAL_SHADOWS.card]}>
            <DoodleCode symbol="</>" bgColor={COLORS.yellowHighlight} color={COLORS.ink} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>NO PROJECTS YET</Text>
            <DoodleUnderline width={130} color={COLORS.yellow} height={3} style={{ marginBottom: 10 }} />
            <Text style={styles.emptySubtitle}>
              Create your first project to start finding team members!
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setCreateModalVisible(true)}
              style={[styles.emptyCreateBtn, BRUTAL_SHADOWS.button]}
            >
              <Text style={styles.emptyCreateBtnText}>+ CREATE PROJECT</Text>
            </TouchableOpacity>
          </View>
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isActiveForDiscovery={project.id === activeProjectId}
              onView={handleViewProject}
              onEdit={handleEditProject}
              onClose={handleCloseProject}
              onFindMembers={handleFindMembers}
            />
          ))
        )}
      </ScrollView>
    </View>
  );

  // ═══════════════════════════════════════════════════════════
  // MODE B: PROJECT DETAIL VIEW
  // ═══════════════════════════════════════════════════════════
  const renderProjectDetail = () => {
    const isSelectedForDiscovery = proj?.id === activeProjectId;
    const isClosed = proj?.status === 'CLOSED';
    const displaySkills = getDisplaySkills(proj?.techStack);
    const currentMembers =
      proj?.membersCount ||
      (Array.isArray(proj?.members) ? proj.members.length : 1);
    const maxMembers = proj?.maxMembers || proj?.teamSize?.max || 4;
    const statusInfo = getStatusStyle(proj?.status, currentMembers, maxMembers);

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.detailHeaderBar}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setViewMode('list')}
            style={styles.detailHeaderIconBtn}
          >
            <Text style={styles.headerBackArrow}>←</Text>
          </TouchableOpacity>

          <View style={[styles.headerProjectBadge, BRUTAL_SHADOWS.xs]}>
            <DoodleCode symbol="</>" bgColor={COLORS.yellowHighlight} color={COLORS.ink} style={styles.badgeCodeTag} />
            <Text style={styles.headerProjectBadgeText} numberOfLines={1}>
              {proj?.title || 'Project'}
            </Text>
          </View>

          <View style={styles.headerRightGroup}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                setIsBookmarked(!isBookmarked);
                showToast(isBookmarked ? 'REMOVED BOOKMARK' : `BOOKMARKED ${proj?.title}`);
              }}
              style={styles.detailHeaderIconBtn}
            >
              <Image
                source={require('../assets/bookmark.png')}
                style={[
                  styles.headerBookmarkImg,
                  !isBookmarked && styles.headerBookmarkInactive,
                ]}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => handleEditProject(proj)}
              style={styles.detailHeaderIconBtn}
            >
              <Text style={styles.editShortcutText}>EDIT</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Toast */}
        {toastMessage && (
          <View style={[styles.toastContainer, BRUTAL_SHADOWS.xs]}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.detailScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={Boolean(projectsLoading)}
              onRefresh={() => {
                if (proj?.id && /^[0-9a-fA-F]{24}$/.test(proj.id)) {
                  fetchProjectById(proj.id);
                } else {
                  loadProjects();
                }
              }}
              tintColor={COLORS.yellow}
              colors={[COLORS.yellow, COLORS.blue]}
            />
          }
        >
          {/* Banner */}
          <View style={[styles.bannerCard, BRUTAL_SHADOWS.card]}>
            {proj?.title === 'StudySync' ? (
              <Image
                source={require('../assets/studysync_banner_clean.png')}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            ) : proj?.image && (proj.image.startsWith('http') || proj.image.startsWith('data:image/')) && !bannerError ? (
              <Image
                source={{ uri: proj.image }}
                style={styles.bannerImage}
                resizeMode="cover"
                onError={() => setBannerError(true)}
              />
            ) : (
              <View style={styles.customBannerWrap}>
                <DoodleCode symbol={proj?.icon || '</>'} bgColor={COLORS.yellowHighlight} color={COLORS.ink} style={styles.bannerCodeBadge} />
                <Text style={styles.customBannerTitle}>{proj?.title}</Text>
                <Text style={styles.customBannerCategory}>{proj?.category || 'Dev Venture'}</Text>
              </View>
            )}

            {/* Status overlay badge */}
            <View style={styles.bannerStatusOverlay}>
              <View style={[styles.statusBadgeOverlay, { backgroundColor: statusInfo.bg }, BRUTAL_SHADOWS.xs]}>
                <Text style={[styles.statusBadgeOverlayText, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Active Discovery Badge / CTA */}
          {!isClosed && isSelectedForDiscovery && (
            <View style={[styles.activeDiscoveryNotice, BRUTAL_SHADOWS.xs]}>
              <DoodleStar size={14} color={COLORS.ink} style={{ marginRight: 6 }} />
              <Text style={styles.activeDiscoveryNoticeText}>CURRENTLY ACTIVE FOR DEVELOPER DISCOVERY</Text>
            </View>
          )}
          {!isClosed && !isSelectedForDiscovery && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setActiveProjectId(proj.id);
                showToast(`ACTIVATED ${proj.title} FOR DISCOVERY`);
                if (onSelectForDiscovery) onSelectForDiscovery();
              }}
              style={[styles.activateDiscoveryBtn, BRUTAL_SHADOWS.button]}
            >
              <Text style={styles.activateDiscoveryBtnText}>SELECT FOR DISCOVERY DECK →</Text>
            </TouchableOpacity>
          )}

          {/* Meta Stats Row */}
          <View style={styles.projectStatsRow}>
            <View style={[styles.metaStatPill, BRUTAL_SHADOWS.xs]}>
              <Text style={styles.metaStatPillLabel}>CATEGORY</Text>
              <Text style={styles.metaStatPillValue}>{proj?.category || 'Dev Venture'}</Text>
            </View>
            <View style={[styles.metaStatPill, BRUTAL_SHADOWS.xs]}>
              <Text style={styles.metaStatPillLabel}>DURATION</Text>
              <Text style={styles.metaStatPillValue}>{proj?.duration || 'Ongoing'}</Text>
            </View>
            <View style={[styles.metaStatPill, BRUTAL_SHADOWS.xs]}>
              <Text style={styles.metaStatPillLabel}>TEAM SIZE</Text>
              <Text style={styles.metaStatPillValue}>
                {currentMembers}/{maxMembers} Devs
              </Text>
            </View>
          </View>

          {/* Skills Section */}
          <View style={styles.detailSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>REQUIRED TECH STACK</Text>
              <DoodleStar size={12} color={COLORS.yellow} />
            </View>
            <View style={styles.tagsRow}>
              {displaySkills.map((skill, i) => {
                const colorTheme = SKILL_COLORS[i % SKILL_COLORS.length];
                return (
                  <View key={i} style={[styles.skillTag, { backgroundColor: colorTheme.bg }]}>
                    <Text style={styles.skillTagText}>{skill}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Description */}
          <View style={styles.detailSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>PROJECT PITCH</Text>
              <DoodleUnderline width={60} color={COLORS.yellowHighlight} height={2} />
            </View>
            <Text style={styles.descriptionText}>
              {proj?.description || 'Real-time study rooms for developers to code together, share goals, and stay accountable.'}
            </Text>
          </View>

          {/* Looking For Roles */}
          <View style={styles.detailSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>ROLES WANTED</Text>
              <DoodleArrow direction="right" size={14} color={COLORS.inkMuted} />
            </View>
            <View style={styles.rolesGrid}>
              {proj?.wantedRoles && proj.wantedRoles.length > 0 ? (
                proj.wantedRoles.map((role, i) => (
                  <View key={i} style={[styles.roleTagCard, BRUTAL_SHADOWS.xs]}>
                    <View style={styles.roleTagDot} />
                    <Text style={styles.roleTagCardText}>{role}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyFieldText}>No roles specified</Text>
              )}
            </View>
          </View>

          {/* Interests */}
          {proj?.interests && proj.interests.length > 0 && (
            <View style={styles.detailSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeader}>PROJECT INTERESTS</Text>
              </View>
              <View style={styles.interestsRow}>
                {proj.interests.map((interest, i) => (
                  <View key={i} style={styles.interestTag}>
                    <Text style={styles.interestTagText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Current Squad */}
          {proj?.members && proj.members.length > 0 && (
            <View style={styles.detailSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeader}>CURRENT SQUAD ({proj.members.length})</Text>
              </View>
              <View style={styles.squadRow}>
                {proj.members.map((member, i) => (
                  <View key={member.id || i} style={[styles.squadMemberPill, BRUTAL_SHADOWS.xs]}>
                    <View style={styles.squadAvatarWrap}>
                      {member.avatar ? (
                        <Image source={{ uri: member.avatar }} style={styles.squadAvatar} />
                      ) : (
                        <Text style={styles.squadAvatarInitial}>
                          {(member.name || 'D').charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.squadMemberName}>{member.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Detail Action Buttons */}
          <View style={styles.detailActionRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleEditProject(proj)}
              style={[styles.detailActionBtn, styles.detailActionEdit, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.detailActionBtnText}>EDIT PROJECT</Text>
            </TouchableOpacity>

            {!isClosed ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleCloseProject(proj.id)}
                style={[styles.detailActionBtn, styles.detailActionClose, BRUTAL_SHADOWS.xs]}
              >
                <Text style={styles.detailActionCloseText}>CLOSE PROJECT</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.detailActionBtn, styles.detailActionClosed]}>
                <Text style={styles.detailActionClosedText}>PROJECT CLOSED</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating "I'm Interested" Button (only visible if not closed) */}
        {!isClosed && (
          <View style={styles.bottomCtaContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setInterestedModalVisible(true)}
              style={[styles.interestedBtn, BRUTAL_SHADOWS.button]}
            >
              <Text style={styles.interestedBtnText}>I'M INTERESTED IN THIS PROJECT</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // ═══════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <View style={styles.container}>
      {viewMode === 'list' ? renderProjectsList() : renderProjectDetail()}

      {/* CREATE PROJECT FORM (3-step) */}
      <CreateProjectForm
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreateSubmit}
        mode="create"
      />

      {/* EDIT PROJECT FORM (3-step, pre-filled) */}
      <CreateProjectForm
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setEditingProject(null);
        }}
        onSubmit={handleEditSubmit}
        initialData={editingProject}
        mode="edit"
      />

      {/* CLOSE PROJECT CONFIRMATION MODAL */}
      <Modal
        visible={closeConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCloseConfirmVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.confirmCard, BRUTAL_SHADOWS.modal]}>
            <ComicBadge text="CLOSE PROJECT?" color={COLORS.pillCoral} textColor="#000" size="md" />
            <Text style={styles.confirmTitle}>Are you sure?</Text>
            <Text style={styles.confirmSubtitle}>
              Closing this project will stop new member recruitment. The project will remain saved and you can still view and edit its details.
            </Text>

            <View style={styles.confirmBtnRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => !isClosing && setCloseConfirmVisible(false)}
                disabled={isClosing}
                style={[styles.confirmCancelBtn, BRUTAL_SHADOWS.xs, isClosing && { opacity: 0.5 }]}
              >
                <Text style={styles.confirmCancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={confirmCloseProject}
                disabled={isClosing}
                style={[styles.confirmCloseBtn, BRUTAL_SHADOWS.xs, isClosing && { opacity: 0.6 }]}
              >
                <Text style={styles.confirmCloseText}>{isClosing ? 'CLOSING...' : 'CLOSE IT'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* APPLICATION CONFIRMATION MODAL (detail view) */}
      <Modal
        visible={interestedModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInterestedModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.confirmCard, BRUTAL_SHADOWS.modal]}>
            <ComicBadge text="APPLICATION FILED!" color={COLORS.yellow} textColor="#000" rotate="-3deg" size="md" />
            <Text style={styles.confirmTitle}>{proj?.title} Squad</Text>
            <Text style={styles.confirmSubtitle}>
              You signaled interest to join {proj?.title}! The squad leads have been notified and you will receive a direct invitation response in Matches.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setInterestedModalVisible(false)}
              style={[styles.confirmAwesomeBtn, BRUTAL_SHADOWS.button]}
            >
              <Text style={styles.confirmAwesomeText}>AWESOME!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // ─── LIST VIEW HEADER ────────────────────────────────────
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  headerBackBtn: {
    width: 34,
    height: 34,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackArrow: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.ink,
  },
  listTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.8,
  },
  titleStar: {
    position: 'absolute',
    top: -6,
    right: -14,
  },
  newProjectBtn: {
    backgroundColor: COLORS.yellow,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  newProjectBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },

  // ─── TOAST ───────────────────────────────────────────────
  toastContainer: {
    position: 'absolute',
    top: 55,
    alignSelf: 'center',
    zIndex: 999,
    backgroundColor: COLORS.yellow,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  toastText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
  },

  // ─── SCROLL ──────────────────────────────────────────────
  scrollArea: {
    flex: 1,
  },
  listScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
  },
  detailScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
    paddingTop: 8,
  },

  // ─── EMPTY STATE ─────────────────────────────────────────
  emptyCard: {
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
  emptyCreateBtn: {
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
  emptyCreateBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },

  // ─── DETAIL VIEW HEADER ──────────────────────────────────
  detailHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  detailHeaderIconBtn: {
    width: 34,
    height: 34,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerProjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: 180,
    gap: 6,
  },
  badgeCodeTag: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  headerProjectBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBookmarkImg: {
    width: 18,
    height: 18,
  },
  headerBookmarkInactive: {
    opacity: 0.45,
  },
  editShortcutText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
  },

  // ─── BANNER CARD ─────────────────────────────────────────
  bannerCard: {
    width: '100%',
    height: 190,
    borderWidth: 2.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS.creamDark,
    marginBottom: 14,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  customBannerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  bannerCodeBadge: {
    marginBottom: 8,
  },
  customBannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  customBannerCategory: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginTop: 4,
  },
  bannerStatusOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  statusBadgeOverlay: {
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeOverlayText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // ─── ACTIVE DISCOVERY NOTICE ─────────────────────────────
  activeDiscoveryNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.yellow,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  activeDiscoveryNoticeText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  activateDiscoveryBtn: {
    backgroundColor: COLORS.yellow,
    borderWidth: 2.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 18,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  activateDiscoveryBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },

  // ─── META STATS ROW ──────────────────────────────────────
  projectStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metaStatPill: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  metaStatPillLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaStatPillValue: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
  },

  // ─── DETAIL SECTIONS ─────────────────────────────────────
  detailSection: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 11,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  skillTagText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
  },
  descriptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // ─── ROLES GRID ──────────────────────────────────────────
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleTagCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.creamLight,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  roleTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.coral,
    marginRight: 6,
  },
  roleTagCardText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
  },
  emptyFieldText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  // ─── INTERESTS ───────────────────────────────────────────
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  interestTag: {
    backgroundColor: COLORS.creamLight,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  interestTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.ink,
  },

  // ─── SQUAD ROW ───────────────────────────────────────────
  squadRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  squadMemberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.creamLight,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  squadAvatarWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.yellowHighlight,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  squadAvatar: {
    width: '100%',
    height: '100%',
  },
  squadAvatarInitial: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
  },
  squadMemberName: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
  },

  // ─── DETAIL ACTIONS ROW ──────────────────────────────────
  detailActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  detailActionBtn: {
    flex: 1,
    height: 42,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailActionEdit: {
    backgroundColor: COLORS.white,
  },
  detailActionBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  detailActionClose: {
    backgroundColor: COLORS.pillCoral,
  },
  detailActionCloseText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.coral,
    letterSpacing: 0.5,
  },
  detailActionClosed: {
    backgroundColor: COLORS.creamDark,
    borderColor: COLORS.borderMuted,
  },
  detailActionClosedText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },

  // ─── FLOATING CTA ────────────────────────────────────────
  bottomCtaContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  interestedBtn: {
    backgroundColor: COLORS.yellow,
    borderWidth: 2.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 20,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestedBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },

  // ─── MODAL STYLES ────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 26,
    borderWidth: 3,
    borderColor: COLORS.ink,
    padding: 22,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.ink,
    marginTop: 10,
    marginBottom: 6,
  },
  confirmSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 18,
  },
  confirmBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
  },
  confirmCloseBtn: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.pillCoral,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCloseText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.coral,
  },
  confirmAwesomeBtn: {
    width: '100%',
    height: 42,
    backgroundColor: COLORS.yellow,
    borderWidth: 2.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  confirmAwesomeText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
});
