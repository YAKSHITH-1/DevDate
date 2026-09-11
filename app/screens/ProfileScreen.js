import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, BORDER_RADIUS, BRUTAL_SHADOWS } from '../styles/theme';
import ComicBadge from '../components/ComicBadge';
import { useApp } from '../context/AppContext';

export default function ProfileScreen({ onBackToDiscover, onOpenChat, onLogout }) {
  const {
    currentUser,
    updateProfile,
    pushNotificationsEnabled,
    setPushNotificationsEnabled,
    soundEnabled,
    setSoundEnabled,
    selectedDeveloperForProfile,
    setSelectedDeveloperForProfile,
    skipDeveloper,
    inviteDeveloper,
    getOrCreateChatForMatch,
    activeProject,
    projects,
    matches,
    invitations,
  } = useApp();

  const isThirdParty = Boolean(selectedDeveloperForProfile);
  const dev = selectedDeveloperForProfile || currentUser;

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Edit Profile Form State (For User's Own Profile)
  const [editName, setEditName] = useState(currentUser?.name || 'Rahul Patel');
  const [editRole, setEditRole] = useState(currentUser?.role || 'Full Stack Developer');
  const [editExperience, setEditExperience] = useState(currentUser?.experience || '3+ Years (Senior)');
  const [editLocation, setEditLocation] = useState(currentUser?.location || 'Bangalore / Remote');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editSkills, setEditSkills] = useState((currentUser?.skills || []).join(', '));
  const [editInterests, setEditInterests] = useState((currentUser?.interests || []).join(', '));

  const showToast = (msg, color = '#FCD34D') => {
    setToastMessage({ text: msg, color });
    setTimeout(() => setToastMessage(null), 1600);
  };

  const handleBack = () => {
    if (setSelectedDeveloperForProfile) {
      setSelectedDeveloperForProfile(null);
    }
    if (onBackToDiscover) {
      onBackToDiscover();
    }
  };

  // --- THIRD PARTY ACTIONS (SKIP, INVITE, LET'S BUILD) ---
  const handleThirdPartySkip = () => {
    if (!dev) return;
    skipDeveloper(dev.id);
    showToast(`SKIPPED ${dev.name.split(' ')[0]} ✕`, '#FF4B4B');
    if (setSelectedDeveloperForProfile) setSelectedDeveloperForProfile(null);
    if (onBackToDiscover) onBackToDiscover();
  };

  const handleThirdPartyLike = () => {
    if (!dev) return;
    inviteDeveloper(dev, false);
    showToast(`INVITED ${dev.name.split(' ')[0]}! ♥`, '#4ADE80');
    if (setSelectedDeveloperForProfile) setSelectedDeveloperForProfile(null);
    if (onBackToDiscover) onBackToDiscover();
  };

  const handleThirdPartyLetsBuild = () => {
    if (!dev) return;
    inviteDeveloper(dev, true);
    showToast("LET'S BUILD TOGETHER! ⚡", '#FCD34D');

    // Create / retrieve chat thread and navigate to it
    const chat = getOrCreateChatForMatch({
      projectId: activeProject?.id || 'p4',
      projectName: activeProject?.title || 'StudySync',
      developerId: dev.id,
      developerName: dev.name,
      developerRole: dev.role,
      developerAvatar: dev.avatar,
    });

    if (setSelectedDeveloperForProfile) setSelectedDeveloperForProfile(null);
    if (onOpenChat) onOpenChat(chat.id);
  };

  // --- OWN PROFILE ACTIONS ---
  const handleOpenEditModal = () => {
    setEditName(currentUser?.name || '');
    setEditRole(currentUser?.role || '');
    setEditExperience(currentUser?.experience || '3+ Years (Senior)');
    setEditLocation(currentUser?.location || 'Bangalore / Remote');
    setEditBio(currentUser?.bio || '');
    setEditSkills((currentUser?.skills || []).join(', '));
    setEditInterests((currentUser?.interests || []).join(', '));
    setEditModalVisible(true);
  };

  const handleSaveProfile = () => {
    const parsedSkills = editSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedInterests = editInterests
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    updateProfile({
      name: editName.trim() || currentUser.name,
      role: editRole.trim() || currentUser.role,
      experience: editExperience.trim() || '3+ Years',
      location: editLocation.trim() || 'Remote OK',
      bio: editBio.trim() || currentUser.bio,
      skills: parsedSkills.length > 0 ? parsedSkills : currentUser.skills,
      interests: parsedInterests.length > 0 ? parsedInterests : currentUser.interests,
    });

    setEditModalVisible(false);
    showToast('PROFILE SAVED! ★', '#FCD34D');
  };

  const handleToggleLookingTo = (index) => {
    if (isThirdParty) return; // Only toggleable on own profile
    const currentList = currentUser?.lookingTo || [
      { label: 'Join a project', selected: true },
      { label: 'Find co-founders', selected: false },
      { label: 'Contribute to open source', selected: true },
      { label: 'Just meet devs', selected: false },
    ];
    const updated = currentList.map((item, idx) =>
      idx === index ? { ...item, selected: !item.selected } : item
    );
    updateProfile({ lookingTo: updated });
    showToast('GOALS UPDATED ✔');
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP HEADER */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleBack}
          style={styles.headerIconBtn}
        >
          <Text style={styles.headerIconText}>←</Text>
        </TouchableOpacity>

        {isThirdParty ? (
          <View style={[styles.headerPillCenter, BRUTAL_SHADOWS.xs]}>
            <Text style={styles.headerPillCenterText}>DEVELOPER PROFILE</Text>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenEditModal}
            style={[styles.editHeaderPill, BRUTAL_SHADOWS.xs]}
          >
            <Text style={styles.editHeaderPillText}>✏️ EDIT PROFILE</Text>
          </TouchableOpacity>
        )}

        {isThirdParty ? (
          <View style={[styles.matchScorePillHeader, BRUTAL_SHADOWS.xs]}>
            <Text style={styles.matchScorePillHeaderText}>
              ⚡ {dev?.matchScore || 95}%
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setSettingsModalVisible(true)}
            style={styles.headerIconBtn}
          >
            <Text style={styles.headerIconText}>⚙️</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <View style={[styles.toastContainer, { backgroundColor: toastMessage.color }, BRUTAL_SHADOWS.xs]}>
          <Text style={styles.toastText}>{toastMessage.text}</Text>
        </View>
      )}

      {/* 2. PROFILE SCROLL CONTENT */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          isThirdParty && { paddingBottom: 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Area */}
        {isThirdParty ? (
          /* Phone 4 Alex Chen artwork if Alex, else custom comic banner */
          dev?.name === 'Alex Chen' ? (
            <View style={styles.bannerContainer}>
              <Image
                source={require('../assets/alex_banner_clean.png')}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={styles.customDevBannerWrap}>
              <Image
                source={{ uri: dev?.avatar }}
                style={styles.customDevBannerAvatar}
              />
              <View style={styles.customDevBannerTextGroup}>
                <Text style={styles.customDevBannerName}>{dev?.name}</Text>
                <Text style={styles.customDevBannerRole}>{dev?.role}</Text>
                <Text style={styles.customDevBannerExp}>⚡ {dev?.experience || '3+ yrs'}</Text>
              </View>
            </View>
          )
        ) : (
          /* User's Own Hero Banner Card */
          <View style={[styles.ownHeroCard, BRUTAL_SHADOWS.sm]}>
            <View style={styles.ownHeroRow}>
              <Image
                source={{ uri: currentUser?.avatar }}
                style={styles.ownHeroAvatar}
              />
              <View style={styles.ownHeroInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.devName}>{currentUser?.name || 'Rahul Patel'}</Text>
                  <View style={styles.onlineDot} />
                </View>
                <Text style={styles.devRole}>{currentUser?.role || 'Full Stack Developer'}</Text>
                <Text style={styles.experienceText}>⚡ {currentUser?.experience || '3+ Years (Senior)'}</Text>
                <Text style={styles.locationText}>📍 {currentUser?.location || 'Bangalore / Remote'}</Text>
              </View>
            </View>

            {/* User Quick Stats Card */}
            <View style={styles.userStatsRow}>
              <View style={styles.userStatBox}>
                <Text style={styles.userStatNumber}>{projects.length}</Text>
                <Text style={styles.userStatLabel}>PROJECTS</Text>
              </View>
              <View style={styles.userStatDivider} />
              <View style={styles.userStatBox}>
                <Text style={styles.userStatNumber}>{matches.length}</Text>
                <Text style={styles.userStatLabel}>MATCHES</Text>
              </View>
              <View style={styles.userStatDivider} />
              <View style={styles.userStatBox}>
                <Text style={styles.userStatNumber}>{invitations.length}</Text>
                <Text style={styles.userStatLabel}>INVITES</Text>
              </View>
            </View>
          </View>
        )}

        {/* Third-party Name & Info Row */}
        {isThirdParty && (
          <>
            <View style={styles.nameRow}>
              <Text style={styles.devName}>{dev?.name}</Text>
              <View style={styles.onlineDot} />
            </View>
            <Text style={styles.devRole}>{dev?.role}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.experienceText}>⚡ {dev?.experience || '3+ Years'}</Text>
              <Text style={styles.locationText}>📍 {dev?.location || 'Remote OK'}</Text>
            </View>
          </>
        )}

        {/* Bio */}
        <Text style={styles.bioText}>
          {dev?.bio || 'Passionate about building products that create real impact. Always open to collaborate on exciting ideas!'}
        </Text>

        {/* Tech Tag Pills */}
        <Text style={styles.sectionHeader}>CORE TECH & SKILLS</Text>
        <View style={styles.tagsRow}>
          {(dev?.skills || ['React', 'Node.js', 'Python', 'MongoDB', 'OpenAI', 'TypeScript']).map((t) => (
            <View key={t} style={styles.blueTag}>
              <Text style={styles.blueTagText}>{t}</Text>
            </View>
          ))}
        </View>

        {/* LOOKING TO Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>LOOKING TO</Text>
          {!isThirdParty && (
            <Text style={styles.sectionSubhint}>(Tap to update goals)</Text>
          )}
        </View>
        <View style={styles.lookingToGrid}>
          {(dev?.lookingTo || [
            { label: 'Join a project', selected: true },
            { label: 'Find co-founders', selected: false },
            { label: 'Contribute to open source', selected: true },
            { label: 'Just meet devs', selected: false },
          ]).map((item, idx) => {
            const label = typeof item === 'string' ? item : item.label;
            const selected = typeof item === 'string' ? true : item.selected;

            return (
              <TouchableOpacity
                key={label || idx}
                activeOpacity={isThirdParty ? 1 : 0.75}
                onPress={() => handleToggleLookingTo(idx)}
                style={[
                  styles.lookingToPill,
                  selected && styles.lookingToPillActive,
                ]}
              >
                <Text style={styles.radioSymbol}>{selected ? '✔' : '○'}</Text>
                <Text
                  style={[
                    styles.lookingToText,
                    selected && styles.lookingToTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* INTERESTS Section */}
        <Text style={styles.sectionHeader}>INTERESTS</Text>
        <View style={styles.tagsRow}>
          {(dev?.interests || ['AI/ML', 'Developer Tools', 'Open Source', 'Product Design', 'Indie Hacking']).map((interest) => (
            <View key={interest} style={styles.blueTag}>
              <Text style={styles.blueTagText}>{interest}</Text>
            </View>
          ))}
        </View>

        {/* Own Profile Quick Action Buttons */}
        {!isThirdParty && (
          <View style={styles.ownProfileActionsWrap}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleOpenEditModal}
              style={[styles.ownActionPrimaryBtn, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.ownActionPrimaryText}>✏️ EDIT DEVELOPER PROFILE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setSettingsModalVisible(true)}
              style={[styles.ownActionSecondaryBtn, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.ownActionSecondaryText}>⚙️ SETTINGS & PREFERENCES</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                if (onLogout) onLogout();
              }}
              style={[styles.ownLogoutBtn, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.ownLogoutText}>🚪 LOGOUT</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 3. FLOATING ACTION CONTROLS (ONLY ON THIRD-PARTY DEVELOPER PROFILES) */}
      {isThirdParty && (
        <View style={styles.floatingActionsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleThirdPartySkip}
            style={[styles.actionBtnRound, styles.bgRed, BRUTAL_SHADOWS.xs]}
          >
            <Text style={styles.actionIconText}>✕</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleThirdPartyLike}
            style={[styles.actionBtnRound, styles.bgGreen, BRUTAL_SHADOWS.xs]}
          >
            <Text style={styles.actionIconHeart}>♥</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleThirdPartyLetsBuild}
            style={styles.letsBuildStickerBtn}
          >
            <Image
              source={require('../assets/lets_build_burst.png')}
              style={styles.letsBuildImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      )}

      {/* 4. SETTINGS & PREFERENCES MODAL */}
      <Modal
        visible={settingsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.settingsModalCard, BRUTAL_SHADOWS.md]}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Settings & Preferences</Text>
              <TouchableOpacity
                onPress={() => setSettingsModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Edit Profile Action */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setSettingsModalVisible(false);
                handleOpenEditModal();
              }}
              style={[styles.settingsActionBtn, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.settingsActionText}>✏️ Edit Full Developer Profile</Text>
            </TouchableOpacity>

            <View style={styles.settingsItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingsItemTitle}>Push Notifications</Text>
                <Text style={styles.settingsItemSubtitle}>Alerts for squad invites & matches</Text>
              </View>
              <Switch
                value={pushNotificationsEnabled}
                onValueChange={(val) => {
                  setPushNotificationsEnabled(val);
                  showToast(val ? 'NOTIFICATIONS ENABLED' : 'MUTED');
                }}
                trackColor={{ false: '#9CA3AF', true: '#4ADE80' }}
              />
            </View>

            <View style={styles.settingsItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingsItemTitle}>Comic Audio Effects</Text>
                <Text style={styles.settingsItemSubtitle}>Play SFX on swipe match & bursts</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={(val) => {
                  setSoundEnabled(val);
                  showToast(val ? 'SOUND ON 🔊' : 'MUTED 🔇');
                }}
                trackColor={{ false: '#9CA3AF', true: '#4ADE80' }}
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                setSettingsModalVisible(false);
                if (onLogout) onLogout();
              }}
              style={[styles.logoutBtn, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.logoutBtnText}>LOGOUT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 5. EDIT PROFILE MODAL */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={[styles.editModalCard, BRUTAL_SHADOWS.md]}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Edit Developer Profile ✏️</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editFormScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="e.g. Rahul Patel"
                placeholderTextColor="#9CA3AF"
                style={styles.formInput}
              />

              <Text style={styles.inputLabel}>HEADLINE ROLE</Text>
              <TextInput
                value={editRole}
                onChangeText={setEditRole}
                placeholder="e.g. Backend Developer"
                placeholderTextColor="#9CA3AF"
                style={styles.formInput}
              />

              <Text style={styles.inputLabel}>EXPERIENCE LEVEL</Text>
              <TextInput
                value={editExperience}
                onChangeText={setEditExperience}
                placeholder="e.g. 3+ Years (Senior)"
                placeholderTextColor="#9CA3AF"
                style={styles.formInput}
              />

              <Text style={styles.inputLabel}>LOCATION / REMOTE</Text>
              <TextInput
                value={editLocation}
                onChangeText={setEditLocation}
                placeholder="e.g. Bangalore / Remote"
                placeholderTextColor="#9CA3AF"
                style={styles.formInput}
              />

              <Text style={styles.inputLabel}>BIO / PITCH</Text>
              <TextInput
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Tell developers what you love building..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                style={[styles.formInput, styles.multilineInput]}
              />

              <Text style={styles.inputLabel}>SKILLS (COMMA-SEPARATED)</Text>
              <TextInput
                value={editSkills}
                onChangeText={setEditSkills}
                placeholder="Python, Go, Docker, AWS, React"
                placeholderTextColor="#9CA3AF"
                style={styles.formInput}
              />

              <Text style={styles.inputLabel}>INTERESTS (COMMA-SEPARATED)</Text>
              <TextInput
                value={editInterests}
                onChangeText={setEditInterests}
                placeholder="AI/ML, Open Source, DevTools, Startups"
                placeholderTextColor="#9CA3AF"
                style={styles.formInput}
              />

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSaveProfile}
                style={[styles.saveProfileBtn, BRUTAL_SHADOWS.xs]}
              >
                <Text style={styles.saveProfileBtnText}>SAVE PROFILE CHANGES 💾</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
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
  headerPillCenter: {
    backgroundColor: '#FFCC00',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  headerPillCenterText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  matchScorePillHeader: {
    backgroundColor: '#BBF7D0',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  matchScorePillHeaderText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#15803D',
  },
  editHeaderPill: {
    backgroundColor: '#FDE047',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  editHeaderPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
  toastContainer: {
    position: 'absolute',
    top: 55,
    alignSelf: 'center',
    zIndex: 999,
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
    paddingBottom: 30,
  },
  bannerContainer: {
    width: '100%',
    height: 245,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: '#000000',
    overflow: 'hidden',
    backgroundColor: '#FAF6EB',
    marginBottom: 12,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  customDevBannerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 18,
    padding: 16,
    gap: 14,
    marginBottom: 12,
  },
  customDevBannerAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    borderColor: '#000000',
  },
  customDevBannerTextGroup: {
    flex: 1,
  },
  customDevBannerName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
  },
  customDevBannerRole: {
    fontSize: 12,
    fontWeight: '800',
    color: '#666666',
    marginTop: 2,
  },
  customDevBannerExp: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
    marginTop: 4,
  },
  ownHeroCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  ownHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  ownHeroAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: '#000000',
  },
  ownHeroInfo: {
    flex: 1,
  },
  userStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FAF6EB',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 14,
    paddingVertical: 10,
  },
  userStatBox: {
    alignItems: 'center',
  },
  userStatNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
  },
  userStatLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#666666',
    marginTop: 2,
  },
  userStatDivider: {
    width: 2,
    height: 24,
    backgroundColor: '#000000',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  devName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.2,
  },
  onlineDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#22C55E',
  },
  devRole: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  experienceText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  bioText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 18,
    marginBottom: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  blueTag: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  blueTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  sectionSubhint: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666666',
    marginBottom: 10,
  },
  lookingToGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  lookingToPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  lookingToPillActive: {
    backgroundColor: '#FDE047',
  },
  radioSymbol: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
  },
  lookingToText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  lookingToTextActive: {
    color: '#000000',
    fontWeight: '900',
  },
  ownProfileActionsWrap: {
    marginTop: 8,
    gap: 10,
  },
  ownActionPrimaryBtn: {
    backgroundColor: '#FFCC00',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ownActionPrimaryText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  ownActionSecondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ownActionSecondaryText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
  },
  ownLogoutBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  ownLogoutText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#DC2626',
  },
  floatingActionsRow: {
    position: 'absolute',
    bottom: 8,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionBtnRound: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2.5,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgRed: {
    backgroundColor: '#FF4B4B',
  },
  bgGreen: {
    backgroundColor: '#4ADE80',
  },
  actionIconText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000000',
  },
  actionIconHeart: {
    fontSize: 24,
    color: '#000000',
  },
  letsBuildStickerBtn: {
    flex: 1,
    height: 75,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  letsBuildImage: {
    width: 100,
    height: 75,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  settingsModalCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  editModalCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    maxHeight: '85%',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 8,
    marginBottom: 14,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
  },
  settingsActionBtn: {
    backgroundColor: '#FDE047',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  settingsActionText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 12,
  },
  settingsItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
  settingsItemSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: '#FF4B4B',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  editFormScroll: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: '#FAF6EB',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveProfileBtn: {
    backgroundColor: '#FDE047',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  saveProfileBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
});