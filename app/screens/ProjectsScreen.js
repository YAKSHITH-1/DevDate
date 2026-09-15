import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { COLORS, BORDER_RADIUS, BRUTAL_SHADOWS } from '../styles/theme';
import ComicBadge from '../components/ComicBadge';
import CreateProjectForm from '../components/CreateProjectForm';
import { useApp } from '../context/AppContext';
import { getSkillLabels, ALL_SKILLS } from '../data/skillsDatabase';

export default function ProjectsScreen({
  onBackToDiscover,
  onOpenChat,
  onSelectForDiscovery,
}) {
  const {
    projects,
    viewedProject,
    activeProjectId,
    setActiveProjectId,
    setViewedProjectId,
    createProject,
    updateProject,
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

  // For the detail view
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [interestedModalVisible, setInterestedModalVisible] = useState(false);

  const proj = viewedProject || projects[0];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 1800);
  };

  // ─── HANDLERS ─────────────────────────────────────────────
  const handleViewProject = (project) => {
    setViewedProjectId(project.id);
    setViewMode('detail');
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setEditModalVisible(true);
  };

  const handleCloseProject = (projectId) => {
    setCloseTargetId(projectId);
    setCloseConfirmVisible(true);
  };

  const confirmCloseProject = () => {
    if (closeTargetId) {
      const p = projects.find((pr) => pr.id === closeTargetId);
      closeProject(closeTargetId);
      showToast(`CLOSED "${p?.title}" 🔒`);
    }
    setCloseConfirmVisible(false);
    setCloseTargetId(null);
  };

  const handleFindMembers = (project) => {
    setActiveProjectId(project.id);
    showToast(`DISCOVERING FOR: ${project.title} 🎯`);
    if (onSelectForDiscovery) onSelectForDiscovery();
  };

  const handleCreateSubmit = (formData) => {
    const newProj = createProject(formData);
    showToast(`CREATED "${newProj.title}" 🚀`);
  };

  const handleEditSubmit = (formData) => {
    if (!editingProject) return;
    updateProject(editingProject.id, {
      title: formData.title,
      category: formData.category,
      description: formData.description,
      techStack: formData.techStack,
      wantedRoles: formData.wantedRoles,
      maxMembers: formData.maxMembers,
      icon: formData.icon,
      duration: formData.duration,
      interests: formData.interests,
    });
    showToast('PROJECT UPDATED! ✔');
    setEditingProject(null);
  };

  // ─── Skill label helper ──────────────────────────────────
  const getDisplaySkills = (techStack) => {
    if (!techStack || techStack.length === 0) return [];
    return techStack.map((s) => {
      const skill = ALL_SKILLS.find((sk) => sk.id === s);
      return skill ? skill.label : s;
    });
  };

  // ─── STATUS STYLING ──────────────────────────────────────
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Recruiting':
        return { bg: '#86EFAC', color: '#166534', label: 'RECRUITING' };
      case 'Active MVP':
        return { bg: '#93C5FD', color: '#1E40AF', label: 'ACTIVE MVP' };
      case 'CLOSED':
        return { bg: '#D1D5DB', color: '#374151', label: 'CLOSED' };
      default:
        return { bg: '#FCD34D', color: '#713F12', label: status?.toUpperCase() || 'ACTIVE' };
    }
  };

  // Category color for skill chips
  const getSkillColor = (skillId) => {
    const skill = ALL_SKILLS.find((s) => s.id === skillId);
    if (!skill) return '#E5E7EB';
    const colors = {
      frontend: '#BFDBFE',
      backend: '#FDE68A',
      fullstack: '#C4B5FD',
      ai_ml: '#E9D5FF',
      mobile: '#BBF7D0',
      database: '#FED7AA',
      devops: '#A5F3FC',
      design: '#FBCFE8',
      blockchain: '#FCA5A5',
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
          style={styles.headerIconBtn}
        >
          <Text style={styles.headerIconText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.listTitle}>MY PROJECTS</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setCreateModalVisible(true)}
          style={[styles.newProjectBtn, BRUTAL_SHADOWS.xs]}
        >
          <Text style={styles.newProjectBtnText}>➕ NEW</Text>
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
      >
        {projects.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📁</Text>
            <Text style={styles.emptyTitle}>NO PROJECTS YET</Text>
            <Text style={styles.emptySubtitle}>
              Create your first project to start finding team members!
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setCreateModalVisible(true)}
              style={[styles.emptyCreateBtn, BRUTAL_SHADOWS.sm]}
            >
              <Text style={styles.emptyCreateBtnText}>CREATE PROJECT 🚀</Text>
            </TouchableOpacity>
          </View>
        ) : (
          projects.map((project) => {
            const statusInfo = getStatusStyle(project.status);
            const displaySkills = getDisplaySkills(project.techStack);
            const isActive = project.id === activeProjectId;
            const isClosed = project.status === 'CLOSED';
            const shownSkills = displaySkills.slice(0, 5);
            const extraCount = displaySkills.length - 5;

            return (
              <View
                key={project.id}
                style={[styles.projectCard, BRUTAL_SHADOWS.sm]}
              >
                {/* Card Header: Icon + Title + Status */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardIcon}>{project.icon || '🚀'}</Text>
                    <View style={styles.cardTitleGroup}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {project.title}
                      </Text>
                      <Text style={styles.cardCategory}>{project.category}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                {/* Active Discovery Indicator */}
                {isActive && !isClosed && (
                  <View style={styles.activeIndicator}>
                    <Text style={styles.activeIndicatorText}>🎯 ACTIVE FOR DISCOVERY</Text>
                  </View>
                )}

                {/* Description */}
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {project.description}
                </Text>

                {/* Skills Chips */}
                <View style={styles.cardSkillsRow}>
                  {shownSkills.map((skill, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.skillChip,
                        { backgroundColor: getSkillColor(project.techStack[idx]) },
                      ]}
                    >
                      <Text style={styles.skillChipText}>{skill}</Text>
                    </View>
                  ))}
                  {extraCount > 0 && (
                    <View style={styles.skillChipMore}>
                      <Text style={styles.skillChipMoreText}>+{extraCount}</Text>
                    </View>
                  )}
                </View>

                {/* Team Size Bar */}
                <View style={styles.teamSizeRow}>
                  <Text style={styles.teamSizeText}>
                    👥 {project.membersCount || project.members?.length || 1}/{project.maxMembers || 4} Members
                  </Text>
                  <View style={styles.teamSizeBarBg}>
                    <View
                      style={[
                        styles.teamSizeBarFill,
                        {
                          width: `${Math.min(100, ((project.membersCount || project.members?.length || 1) / (project.maxMembers || 4)) * 100)}%`,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Roles Wanted */}
                {project.wantedRoles && project.wantedRoles.length > 0 && (
                  <View style={styles.rolesPreview}>
                    <Text style={styles.rolesPreviewLabel}>LOOKING FOR:</Text>
                    <Text style={styles.rolesPreviewText} numberOfLines={1}>
                      {project.wantedRoles.slice(0, 3).join(' • ')}
                      {project.wantedRoles.length > 3 ? ` +${project.wantedRoles.length - 3}` : ''}
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleViewProject(project)}
                    style={[styles.actionBtn, styles.actionBtnView, BRUTAL_SHADOWS.xs]}
                  >
                    <Text style={styles.actionBtnText}>👁️ VIEW</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleEditProject(project)}
                    style={[styles.actionBtn, styles.actionBtnEdit, BRUTAL_SHADOWS.xs]}
                  >
                    <Text style={styles.actionBtnText}>✏️ EDIT</Text>
                  </TouchableOpacity>

                  {!isClosed ? (
                    <>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleCloseProject(project.id)}
                        style={[styles.actionBtn, styles.actionBtnClose, BRUTAL_SHADOWS.xs]}
                      >
                        <Text style={styles.actionBtnCloseText}>🔒 CLOSE</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleFindMembers(project)}
                        style={[styles.actionBtn, styles.actionBtnFind, BRUTAL_SHADOWS.xs]}
                      >
                        <Text style={styles.actionBtnFindText}>🎯 FIND</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={[styles.actionBtn, styles.actionBtnDisabled]}>
                      <Text style={styles.actionBtnDisabledText}>CLOSED</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
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

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setViewMode('list')}
            style={styles.headerIconBtn}
          >
            <Text style={styles.headerIconText}>←</Text>
          </TouchableOpacity>

          <View style={[styles.headerProjectBadge, BRUTAL_SHADOWS.xs]}>
            <Text style={styles.headerProjectBadgeText} numberOfLines={1}>
              {proj?.icon || '⚡'} {proj?.title || 'Project'}
            </Text>
          </View>

          <View style={styles.headerRightGroup}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                setIsBookmarked(!isBookmarked);
                showToast(isBookmarked ? 'REMOVED BOOKMARK' : `BOOKMARKED ${proj?.title} ★`);
              }}
              style={styles.headerIconBtn}
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
              style={styles.headerIconBtn}
            >
              <Text style={styles.headerIconText}>✏️</Text>
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
        >
          {/* Banner */}
          <View style={styles.bannerContainer}>
            {proj?.title === 'StudySync' ? (
              <Image
                source={require('../assets/studysync_banner_clean.png')}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.customBannerWrap}>
                <Text style={styles.customBannerIcon}>{proj?.icon || '🚀'}</Text>
                <Text style={styles.customBannerTitle}>{proj?.title}</Text>
                <Text style={styles.customBannerCategory}>{proj?.category || 'Dev Project'}</Text>
              </View>
            )}

            {/* Status overlay badge */}
            <View style={styles.bannerStatusOverlay}>
              {(() => {
                const si = getStatusStyle(proj?.status);
                return (
                  <View style={[styles.bannerStatusBadge, { backgroundColor: si.bg }]}>
                    <Text style={[styles.bannerStatusText, { color: si.color }]}>{si.label}</Text>
                  </View>
                );
              })()}
            </View>
          </View>

          {/* Active Discovery Badge */}
          {!isClosed && isSelectedForDiscovery && (
            <View style={styles.activeDiscoveryNotice}>
              <Text style={styles.activeDiscoveryNoticeText}>🎯 CURRENTLY ACTIVE FOR DEVELOPER DISCOVERY</Text>
            </View>
          )}
          {!isClosed && !isSelectedForDiscovery && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setActiveProjectId(proj.id);
                showToast(`ACTIVATED ${proj.title} FOR DISCOVERY 🎯`);
                if (onSelectForDiscovery) onSelectForDiscovery();
              }}
              style={[styles.activateDiscoveryBtn, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.activateDiscoveryBtnText}>🎯 SELECT FOR DISCOVERY DECK →</Text>
            </TouchableOpacity>
          )}

          {/* Skills Tags */}
          <View style={styles.tagsRow}>
            {displaySkills.map((skill, i) => (
              <View key={i} style={[styles.blueTag, { backgroundColor: getSkillColor(proj?.techStack[i]) }]}>
                <Text style={styles.blueTagText}>{skill}</Text>
              </View>
            ))}
          </View>

          {/* Meta Info */}
          <View style={styles.projectStatsRow}>
            <View style={styles.metaStatPill}>
              <Text style={styles.metaStatPillText}>📁 {proj?.category || 'Dev Venture'}</Text>
            </View>
            <View style={styles.metaStatPill}>
              <Text style={styles.metaStatPillText}>⏱️ {proj?.duration || 'Ongoing'}</Text>
            </View>
            <View style={styles.metaStatPill}>
              <Text style={styles.metaStatPillText}>
                👥 {proj?.membersCount || (proj?.members ? proj.members.length : 2)}/{proj?.maxMembers || 4} Members
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.descriptionText}>
            {proj?.description || 'Real-time study rooms for developers to code together, share goals, and stay accountable.'}
          </Text>

          {/* Looking For Roles */}
          <Text style={styles.sectionHeader}>LOOKING FOR</Text>
          <View style={styles.lookingForGrid}>
            {proj?.wantedRoles && proj.wantedRoles.length > 0 ? (
              proj.wantedRoles.map((role, i) => (
                <View key={i} style={styles.roleTag}>
                  <Text style={styles.roleTagText}>{role}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyFieldText}>No roles specified</Text>
            )}
          </View>

          {/* Interests */}
          {proj?.interests && proj.interests.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>INTERESTS</Text>
              <View style={styles.lookingForGrid}>
                {proj.interests.map((interest, i) => (
                  <View key={i} style={styles.interestTag}>
                    <Text style={styles.interestTagText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Current Squad */}
          {proj?.members && proj.members.length > 0 && (
            <View style={styles.squadSection}>
              <Text style={styles.sectionHeader}>CURRENT SQUAD ({proj.members.length})</Text>
              <View style={styles.squadRow}>
                {proj.members.map((member, i) => (
                  <View key={member.id || i} style={styles.squadMemberPill}>
                    {member.avatar ? (
                      <Image source={{ uri: member.avatar }} style={styles.squadAvatar} />
                    ) : null}
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
              <Text style={styles.detailActionBtnText}>✏️ EDIT PROJECT</Text>
            </TouchableOpacity>

            {!isClosed ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleCloseProject(proj.id)}
                style={[styles.detailActionBtn, styles.detailActionClose, BRUTAL_SHADOWS.xs]}
              >
                <Text style={styles.detailActionCloseText}>🔒 CLOSE PROJECT</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.detailActionBtn, styles.detailActionClosed]}>
                <Text style={styles.detailActionClosedText}>🔒 PROJECT CLOSED</Text>
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
              style={styles.interestedImageBtn}
            >
              <Image
                source={require('../assets/im_interested_btn.png')}
                style={[styles.interestedBtnImage, { backgroundColor: 'transparent' }]}
                resizeMode="contain"
              />
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
          <View style={[styles.confirmCard, BRUTAL_SHADOWS.md]}>
            <ComicBadge text="CLOSE PROJECT? 🔒" color="#FCA5A5" textColor="#000" size="md" />
            <Text style={styles.confirmTitle}>Are you sure?</Text>
            <Text style={styles.confirmSubtitle}>
              Closing this project will change its status to CLOSED and prevent new member recruitment. You can still view and edit the project.
            </Text>

            <View style={styles.confirmBtnRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setCloseConfirmVisible(false)}
                style={[styles.confirmCancelBtn, BRUTAL_SHADOWS.xs]}
              >
                <Text style={styles.confirmCancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={confirmCloseProject}
                style={[styles.confirmCloseBtn, BRUTAL_SHADOWS.xs]}
              >
                <Text style={styles.confirmCloseText}>CLOSE IT</Text>
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
          <View style={[styles.confirmCard, BRUTAL_SHADOWS.md]}>
            <ComicBadge text="APPLICATION FILED! 🚀" color="#FCD34D" textColor="#000" rotate="-3deg" size="md" />
            <Text style={styles.confirmTitle}>{proj?.title} Squad</Text>
            <Text style={styles.confirmSubtitle}>
              You signaled interest to join {proj?.title}! The squad leads have been notified and you will receive a direct invitation response in Matches.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setInterestedModalVisible(false)}
              style={[styles.confirmCloseBtn, { backgroundColor: '#FFCC00' }, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.confirmCloseText}>AWESOME!</Text>
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
    paddingVertical: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
  newProjectBtn: {
    backgroundColor: '#4ADE80',
    borderWidth: 2.5,
    borderColor: '#000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  newProjectBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
  },
  headerIconBtn: {
    padding: 4,
  },
  headerIconText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000',
  },
  headerBookmarkImg: {
    width: 22,
    height: 22,
  },
  headerBookmarkInactive: {
    opacity: 0.45,
  },

  // ─── TOAST ───────────────────────────────────────────────
  toastContainer: {
    position: 'absolute',
    top: 55,
    alignSelf: 'center',
    zIndex: 999,
    backgroundColor: '#FCD34D',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  toastText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
  },

  // ─── SCROLL ──────────────────────────────────────────────
  scrollArea: {
    flex: 1,
  },
  listScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  detailScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },

  // ─── EMPTY STATE ─────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  emptyCreateBtn: {
    height: 48,
    paddingHorizontal: 28,
    backgroundColor: '#FFCC00',
    borderWidth: 2.5,
    borderColor: '#000',
    borderRadius: BORDER_RADIUS.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCreateBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000',
  },

  // ═══ PROJECT CARD (List Mode) ════════════════════════════
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  cardIcon: {
    fontSize: 30,
  },
  cardTitleGroup: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
  },
  cardCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    marginTop: 1,
  },
  statusBadge: {
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  activeIndicator: {
    backgroundColor: '#FEF9C3',
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  activeIndicatorText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#854D0E',
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    color: '#333',
    marginBottom: 10,
  },

  // Skills Chips
  cardSkillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 10,
  },
  skillChip: {
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  skillChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
  },
  skillChipMore: {
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#F3F4F6',
  },
  skillChipMoreText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#666',
  },

  // Team Size
  teamSizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  teamSizeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
    minWidth: 100,
  },
  teamSizeBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#000',
    overflow: 'hidden',
  },
  teamSizeBarFill: {
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 3,
  },

  // Roles Preview
  rolesPreview: {
    marginBottom: 10,
  },
  rolesPreviewLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#666',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  rolesPreviewText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
  },

  // Action Buttons
  cardActions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    height: 36,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnView: {
    backgroundColor: '#E0F2FE',
  },
  actionBtnEdit: {
    backgroundColor: '#FEF9C3',
  },
  actionBtnClose: {
    backgroundColor: '#FEE2E2',
  },
  actionBtnFind: {
    backgroundColor: '#4ADE80',
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000',
  },
  actionBtnCloseText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#B91C1C',
  },
  actionBtnFindText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000',
  },
  actionBtnDisabled: {
    backgroundColor: '#E5E7EB',
    borderColor: '#9CA3AF',
  },
  actionBtnDisabledText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#6B7280',
  },

  // ═══ DETAIL VIEW ═════════════════════════════════════════
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerProjectBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    maxWidth: 180,
  },
  headerProjectBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  // Banner
  bannerContainer: {
    width: '100%',
    height: 340,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: '#000',
    overflow: 'hidden',
    backgroundColor: '#FAF6EB',
    marginBottom: 14,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  customBannerWrap: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  customBannerIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  customBannerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    textAlign: 'center',
  },
  customBannerCategory: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
    marginTop: 6,
  },
  bannerStatusOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  bannerStatusBadge: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  bannerStatusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Detail — Discovery
  activeDiscoveryNotice: {
    backgroundColor: '#FEF9C3',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  activeDiscoveryNoticeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#854D0E',
    letterSpacing: 0.5,
  },
  activateDiscoveryBtn: {
    backgroundColor: '#FFCC00',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  activateDiscoveryBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },

  // Detail — Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  blueTag: {
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  blueTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
  },

  // Detail — Meta Stats
  projectStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  metaStatPill: {
    backgroundColor: '#FAF6EB',
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaStatPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
  },

  // Detail — Description
  descriptionText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    color: '#000',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  lookingForGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  roleTag: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  roleTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  interestTag: {
    backgroundColor: '#E9D5FF',
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  interestTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  emptyFieldText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },

  // Detail — Squad
  squadSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  squadRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  squadMemberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  squadAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#000',
  },
  squadMemberName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
  },

  // Detail — Action Row
  detailActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 20,
  },
  detailActionBtn: {
    flex: 1,
    height: 44,
    borderWidth: 2.5,
    borderColor: '#000',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailActionEdit: {
    backgroundColor: '#FEF9C3',
  },
  detailActionClose: {
    backgroundColor: '#FEE2E2',
  },
  detailActionClosed: {
    backgroundColor: '#E5E7EB',
    borderColor: '#9CA3AF',
  },
  detailActionBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
  },
  detailActionCloseText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#B91C1C',
  },
  detailActionClosedText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6B7280',
  },

  // Floating CTA
  bottomCtaContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99,
  },
  interestedImageBtn: {
    width: '100%',
    alignItems: 'center',
  },
  interestedBtnImage: {
    width: 320,
    height: 70,
  },

  // ─── MODALS ──────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FAF6EB',
    borderRadius: 24,
    borderWidth: 3.5,
    borderColor: '#000',
    padding: 24,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    marginTop: 14,
    marginBottom: 8,
  },
  confirmSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  confirmBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmCancelBtn: {
    height: 42,
    paddingHorizontal: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#000',
    borderRadius: BORDER_RADIUS.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
  },
  confirmCloseBtn: {
    height: 42,
    paddingHorizontal: 22,
    backgroundColor: '#FCA5A5',
    borderWidth: 2.5,
    borderColor: '#000',
    borderRadius: BORDER_RADIUS.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmCloseText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
  },
});
