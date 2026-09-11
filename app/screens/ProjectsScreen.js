import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, BORDER_RADIUS, BRUTAL_SHADOWS } from '../styles/theme';
import ComicBadge from '../components/ComicBadge';
import { useApp } from '../context/AppContext';

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
  } = useApp();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [interestedModalVisible, setInterestedModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const [optionsMenuVisible, setOptionsMenuVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [switchPickerVisible, setSwitchPickerVisible] = useState(false);

  // Form Fields for Create Project
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSkills, setFormSkills] = useState('');
  const [formRoles, setFormRoles] = useState('');
  const [formExpLevel, setFormExpLevel] = useState('Intermediate');

  // Form Fields for Edit Project
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editRoles, setEditRoles] = useState('');
  const [editExpLevel, setEditExpLevel] = useState('Intermediate');
  const [editStatus, setEditStatus] = useState('Recruiting');

  const proj = viewedProject || projects[0];
  const isSelectedForDiscovery = proj?.id === activeProjectId;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 1800);
  };

  const handleOpenEdit = () => {
    setOptionsMenuVisible(false);
    if (!proj) return;
    setEditTitle(proj.title);
    setEditCategory(proj.category || 'Web App');
    setEditDescription(proj.description || '');
    setEditSkills(proj.techStack ? proj.techStack.join(', ') : 'React, Node.js');
    setEditRoles(proj.wantedRoles ? proj.wantedRoles.join(', ') : 'Frontend Dev');
    setEditExpLevel(proj.experienceLevel || 'Intermediate');
    setEditStatus(proj.status || 'Recruiting');
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      showToast('TITLE CANNOT BE EMPTY');
      return;
    }
    updateProject(proj.id, {
      title: editTitle.trim(),
      category: editCategory.trim(),
      description: editDescription.trim(),
      techStack: editSkills.split(',').map((s) => s.trim()).filter(Boolean),
      wantedRoles: editRoles.split(',').map((r) => r.trim()).filter(Boolean),
      experienceLevel: editExpLevel.trim() || 'Intermediate',
      status: editStatus.trim() || 'Recruiting',
    });
    setEditModalVisible(false);
    showToast('PROJECT UPDATED! ✔');
  };

  const handleCreateSubmit = () => {
    if (!formTitle.trim()) {
      showToast('ENTER A PROJECT TITLE');
      return;
    }
    const newProj = createProject({
      title: formTitle.trim(),
      category: formCategory.trim() || 'Web App',
      description: formDescription.trim() || 'Collaborative developer venture.',
      techStack: formSkills.split(',').map((s) => s.trim()).filter(Boolean),
      wantedRoles: formRoles.split(',').map((r) => r.trim()).filter(Boolean),
      experienceLevel: formExpLevel,
    });
    setCreateModalVisible(false);
    setFormTitle('');
    setFormCategory('');
    setFormDescription('');
    setFormSkills('');
    setFormRoles('');
    showToast(`CREATED "${newProj.title}" 🚀`);
  };

  const handleDelete = () => {
    setOptionsMenuVisible(false);
    const title = proj.title;
    deleteProject(proj.id);
    showToast(`DELETED "${title}" 🗑️`);
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP HEADER (Back Arrow, Switcher Pill, Bookmark, Three Dots) */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onBackToDiscover}
          style={styles.headerIconBtn}
        >
          <Text style={styles.headerIconText}>←</Text>
        </TouchableOpacity>

        {/* Quick Project Switcher Button in Header */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSwitchPickerVisible(true)}
          style={[styles.headerProjectBadge, BRUTAL_SHADOWS.xs]}
        >
          <Text style={styles.headerProjectBadgeText} numberOfLines={1}>
            {proj?.icon || '⚡'} {proj?.title || 'StudySync'} ▾
          </Text>
        </TouchableOpacity>

        <View style={styles.headerRightGroup}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              setIsBookmarked(!isBookmarked);
              showToast(isBookmarked ? 'REMOVED BOOKMARK' : `BOOKMARKED ${proj?.title} ★`);
            }}
            style={styles.headerIconBtn}
          >
            <Text style={styles.headerIconText}>{isBookmarked ? '🔖' : '📑'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setOptionsMenuVisible(true)}
            style={styles.headerIconBtn}
          >
            <Text style={styles.headerIconText}>···</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <View style={[styles.toastContainer, BRUTAL_SHADOWS.xs]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* 2. SCROLLABLE PROJECT CONTENT (EXACT MATCH TO PHONE 3) */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Container: Uses StudySync clean banner for StudySync, or generated styled comic banner */}
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
        </View>

        {/* Active Discovery Status Badge */}
        {isSelectedForDiscovery ? (
          <View style={styles.activeDiscoveryNotice}>
            <Text style={styles.activeDiscoveryNoticeText}>🎯 CURRENTLY ACTIVE FOR DEVELOPER DISCOVERY</Text>
          </View>
        ) : (
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

        {/* Project Meta Tags Row */}
        <View style={styles.tagsRow}>
          {proj?.techStack && proj.techStack.length > 0 ? (
            proj.techStack.map((tech, i) => (
              <View key={i} style={styles.blueTag}>
                <Text style={styles.blueTagText}>{tech}</Text>
              </View>
            ))
          ) : (
            <>
              <View style={styles.blueTag}><Text style={styles.blueTagText}>Web App</Text></View>
              <View style={styles.blueTag}><Text style={styles.blueTagText}>Open Source</Text></View>
              <View style={styles.blueTag}><Text style={styles.blueTagText}>MVP</Text></View>
            </>
          )}
          <View style={styles.greenTag}>
            <Text style={styles.greenTagText}>
              {proj?.status === 'Recruiting' ? 'Looking for Collaborators' : proj?.status || 'Active'}
            </Text>
          </View>
        </View>

        {/* Project Meta Info Row: Category, Experience Level, Members */}
        <View style={styles.projectStatsRow}>
          <View style={styles.metaStatPill}>
            <Text style={styles.metaStatPillText}>📁 {proj?.category || 'Dev Venture'}</Text>
          </View>
          <View style={styles.metaStatPill}>
            <Text style={styles.metaStatPillText}>⭐ {proj?.experienceLevel || 'Intermediate'}</Text>
          </View>
          <View style={styles.metaStatPill}>
            <Text style={styles.metaStatPillText}>👥 {proj?.membersCount || (proj?.members ? proj.members.length : 2)}/{proj?.maxMembers || 4} Members</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.descriptionText}>
          {proj?.description || 'Real-time study rooms for developers to code together, share goals, and stay accountable.'}
        </Text>

        {/* LOOKING FOR Section */}
        <Text style={styles.sectionHeader}>LOOKING FOR</Text>
        <View style={styles.lookingForGrid}>
          {proj?.wantedRoles && proj.wantedRoles.length > 0 ? (
            proj.wantedRoles.map((role, i) => (
              <View key={i} style={styles.roleTag}>
                <Text style={styles.roleTagText}>{role}</Text>
              </View>
            ))
          ) : (
            <>
              <View style={styles.roleTag}><Text style={styles.roleTagText}>Frontend Dev</Text></View>
              <View style={styles.roleTag}><Text style={styles.roleTagText}>Backend Dev</Text></View>
              <View style={styles.roleTag}><Text style={styles.roleTagText}>UI/UX Designer</Text></View>
              <View style={styles.roleTag}><Text style={styles.roleTagText}>Product Thinker</Text></View>
            </>
          )}
        </View>

        {/* CURRENT SQUAD MEMBERS */}
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
      </ScrollView>

      {/* 3. EXACT FLOATING 'I'M INTERESTED' BURST BUTTON */}
      <View style={styles.bottomCtaContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setInterestedModalVisible(true)}
          style={styles.interestedImageBtn}
        >
          <Image
            source={require('../assets/im_interested_btn.png')}
            style={styles.interestedBtnImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* 4. APPLICATION CONFIRMATION MODAL */}
      <Modal
        visible={interestedModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInterestedModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, BRUTAL_SHADOWS.md]}>
            <ComicBadge
              text="APPLICATION FILED! 🚀"
              color="#FCD34D"
              textColor="#000000"
              rotate="-3deg"
              size="md"
            />
            <Text style={styles.modalTitle}>{proj?.title} Squad</Text>
            <Text style={styles.modalSubtitle}>
              You signaled interest to join {proj?.title}! The squad leads have been notified and you will receive a direct invitation response in Matches.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setInterestedModalVisible(false)}
              style={[styles.modalDoneBtn, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.modalDoneBtnText}>AWESOME!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 5. PROJECT OPTIONS ACTION SHEET MODAL */}
      <Modal
        visible={optionsMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsMenuVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, styles.optionsModalCard, BRUTAL_SHADOWS.md]}>
            <View style={styles.pickerHeaderRow}>
              <ComicBadge text="PROJECT OPTIONS ⚙️" color="#38BDF8" textColor="#000" size="sm" />
              <TouchableOpacity onPress={() => setOptionsMenuVisible(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Select for Discovery Option */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setActiveProjectId(proj.id);
                setOptionsMenuVisible(false);
                showToast(`DISCOVERING FOR: ${proj.title} 🎯`);
                if (onSelectForDiscovery) onSelectForDiscovery();
              }}
              style={[styles.optionItemBtn, isSelectedForDiscovery && styles.optionItemBtnActive, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.optionItemText}>
                {isSelectedForDiscovery ? '✔ ACTIVE FOR DISCOVERY' : '🎯 SELECT FOR DISCOVERY'}
              </Text>
            </TouchableOpacity>

            {/* Switch Project */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setOptionsMenuVisible(false);
                setSwitchPickerVisible(true);
              }}
              style={[styles.optionItemBtn, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.optionItemText}>🔀 SWITCH / VIEW OTHER PROJECTS</Text>
            </TouchableOpacity>

            {/* Edit Project */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOpenEdit}
              style={[styles.optionItemBtn, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.optionItemText}>✏️ EDIT PROJECT DETAILS</Text>
            </TouchableOpacity>

            {/* Create New Project */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setOptionsMenuVisible(false);
                setCreateModalVisible(true);
              }}
              style={[styles.optionItemBtn, { backgroundColor: '#FEF08A' }, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.optionItemText}>➕ CREATE NEW PROJECT</Text>
            </TouchableOpacity>

            {/* Delete Project */}
            {projects.length > 1 && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDelete}
                style={[styles.optionItemBtn, styles.deleteOptionBtn, BRUTAL_SHADOWS.xs]}
              >
                <Text style={styles.deleteOptionText}>🗑️ DELETE THIS PROJECT</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* 6. SWITCH PROJECT PICKER MODAL */}
      <Modal
        visible={switchPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSwitchPickerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, styles.pickerModalCard, BRUTAL_SHADOWS.md]}>
            <View style={styles.pickerHeaderRow}>
              <ComicBadge text="ALL PROJECTS 📁" color="#FFCC00" textColor="#000" size="sm" />
              <TouchableOpacity onPress={() => setSwitchPickerVisible(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {projects.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    setViewedProjectId(p.id);
                    setSwitchPickerVisible(false);
                    showToast(`VIEWING ${p.title}`);
                  }}
                  style={[
                    styles.projectPickerItem,
                    p.id === proj.id && styles.projectPickerItemActive,
                    BRUTAL_SHADOWS.xs,
                  ]}
                >
                  <Text style={styles.pickerItemIcon}>{p.icon || '⚡'}</Text>
                  <View style={styles.pickerItemBody}>
                    <Text style={styles.pickerItemTitle}>{p.title}</Text>
                    <Text style={styles.pickerItemTech}>{p.category} • {p.membersCount} members</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setSwitchPickerVisible(false);
                setCreateModalVisible(true);
              }}
              style={[styles.createProjectPromptBtn, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.createProjectPromptText}>➕ CREATE NEW PROJECT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 7. CREATE PROJECT MODAL */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <ScrollView contentContainerStyle={styles.scrollModalCenter} showsVerticalScrollIndicator={false}>
            <View style={[styles.modalCard, BRUTAL_SHADOWS.md]}>
              <View style={styles.pickerHeaderRow}>
                <ComicBadge text="NEW PROJECT 🚀" color="#4ADE80" textColor="#000" size="sm" />
                <TouchableOpacity onPress={() => setCreateModalVisible(false)} style={styles.modalCloseBtn}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.formSectionTitle}>PROJECT TITLE</Text>
              <TextInput
                style={styles.comicInput}
                placeholder="e.g. CodeForge, DevPulse"
                placeholderTextColor="#999"
                value={formTitle}
                onChangeText={setFormTitle}
              />

              <Text style={styles.formSectionTitle}>CATEGORY</Text>
              <TextInput
                style={styles.comicInput}
                placeholder="e.g. AI / Productivity, EdTech, Mobile"
                placeholderTextColor="#999"
                value={formCategory}
                onChangeText={setFormCategory}
              />

              <Text style={styles.formSectionTitle}>DESCRIPTION</Text>
              <TextInput
                style={[styles.comicInput, styles.textAreaInput]}
                placeholder="What are you building and why?"
                placeholderTextColor="#999"
                value={formDescription}
                onChangeText={setFormDescription}
                multiline
              />

              <Text style={styles.formSectionTitle}>TECH STACK (comma separated)</Text>
              <TextInput
                style={styles.comicInput}
                placeholder="e.g. React, Node.js, Python, AWS"
                placeholderTextColor="#999"
                value={formSkills}
                onChangeText={setFormSkills}
              />

              <Text style={styles.formSectionTitle}>LOOKING FOR ROLES (comma separated)</Text>
              <TextInput
                style={styles.comicInput}
                placeholder="e.g. Frontend Dev, Backend Dev, UI/UX"
                placeholderTextColor="#999"
                value={formRoles}
                onChangeText={setFormRoles}
              />

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleCreateSubmit}
                style={[styles.submitFormBtn, BRUTAL_SHADOWS.sm]}
              >
                <Text style={styles.submitFormBtnText}>CREATE & LAUNCH FOR MATCHING 🚀</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* 8. EDIT PROJECT MODAL */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <ScrollView contentContainerStyle={styles.scrollModalCenter} showsVerticalScrollIndicator={false}>
            <View style={[styles.modalCard, BRUTAL_SHADOWS.md]}>
              <View style={styles.pickerHeaderRow}>
                <ComicBadge text="EDIT PROJECT ✏️" color="#FCD34D" textColor="#000" size="sm" />
                <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.modalCloseBtn}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.formSectionTitle}>PROJECT TITLE</Text>
              <TextInput
                style={styles.comicInput}
                value={editTitle}
                onChangeText={setEditTitle}
              />

              <Text style={styles.formSectionTitle}>CATEGORY</Text>
              <TextInput
                style={styles.comicInput}
                value={editCategory}
                onChangeText={setEditCategory}
              />

              <Text style={styles.formSectionTitle}>DESCRIPTION</Text>
              <TextInput
                style={[styles.comicInput, styles.textAreaInput]}
                value={editDescription}
                onChangeText={setEditDescription}
                multiline
              />

              <Text style={styles.formSectionTitle}>TECH STACK</Text>
              <TextInput
                style={styles.comicInput}
                value={editSkills}
                onChangeText={setEditSkills}
              />

              <Text style={styles.formSectionTitle}>LOOKING FOR ROLES</Text>
              <TextInput
                style={styles.comicInput}
                value={editRoles}
                onChangeText={setEditRoles}
              />

              <Text style={styles.formSectionTitle}>EXPERIENCE LEVEL</Text>
              <TextInput
                style={styles.comicInput}
                value={editExpLevel}
                onChangeText={setEditExpLevel}
              />

              <Text style={styles.formSectionTitle}>STATUS</Text>
              <TextInput
                style={styles.comicInput}
                value={editStatus}
                onChangeText={setEditStatus}
              />

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSaveEdit}
                style={[styles.submitFormBtn, BRUTAL_SHADOWS.sm]}
              >
                <Text style={styles.submitFormBtnText}>SAVE PROJECT CHANGES ✔</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerIconBtn: {
    padding: 4,
  },
  headerIconText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000000',
  },
  headerProjectBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    maxWidth: 180,
  },
  headerProjectBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  toastContainer: {
    position: 'absolute',
    top: 55,
    alignSelf: 'center',
    zIndex: 999,
    backgroundColor: '#FCD34D',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  toastText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  bannerContainer: {
    width: '100%',
    height: 380,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: '#000000',
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
    color: '#000000',
    textAlign: 'center',
  },
  customBannerCategory: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
    marginTop: 6,
  },
  activeDiscoveryNotice: {
    backgroundColor: '#FEF9C3',
    borderWidth: 2,
    borderColor: '#000000',
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
    borderColor: '#000000',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  activateDiscoveryBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  blueTag: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  blueTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },
  greenTag: {
    backgroundColor: '#86EFAC',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  greenTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },
  descriptionText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    color: '#000000',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  lookingForGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleTag: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  roleTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollModalCenter: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    marginTop: 12,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444444',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  modalDoneBtn: {
    backgroundColor: '#FFCC00',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  modalDoneBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
  },
  optionsModalCard: {
    alignItems: 'stretch',
  },
  pickerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
  optionItemBtn: {
    height: 46,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionItemBtnActive: {
    backgroundColor: '#FEF08A',
  },
  optionItemText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  deleteOptionBtn: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
    marginTop: 4,
  },
  deleteOptionText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#DC2626',
  },
  pickerModalCard: {
    maxHeight: 520,
    alignItems: 'stretch',
  },
  pickerList: {
    maxHeight: 320,
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
  },
  formSectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
    alignSelf: 'flex-start',
    marginBottom: 4,
    marginTop: 8,
  },
  comicInput: {
    width: '100%',
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  textAreaInput: {
    height: 70,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  submitFormBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFCC00',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  submitFormBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  projectStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  metaStatPill: {
    backgroundColor: '#FAF6EB',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaStatPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
  },
  squadSection: {
    marginTop: 16,
    marginBottom: 20,
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
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  squadAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  squadMemberName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
  },
});
