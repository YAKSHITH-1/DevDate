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
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, BORDERS, BRUTAL_SHADOWS, TYPOGRAPHY } from '../styles/theme';
import ComicBadge from '../components/ComicBadge';
import {
  DoodleStar,
  DoodleSparkle,
  DoodleCode,
  DoodleArrow,
  DoodleCheck,
  DoodleCross,
  DoodleUnderline,
  DoodleUser,
  DoodleSeparator,
} from '../components/DoodleElements';
import { useApp } from '../context/AppContext';
import { getDiceBearAvatar, resolveProfileAvatar, DICEBEAR_STYLES } from '../utils/avatar';

/**
 * DevDate ProfileScreen — Creative Developer Identity Card + Settings Notebook
 * Pop Art x Doodle Art visual system. ZERO Unicode emojis.
 */
export default function ProfileScreen({ onBackToDiscover, onOpenChat, onLogout }) {
  const {
    currentUser,
    logout,
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
  const dev = selectedDeveloperForProfile || currentUser || {};

  const ownAvatarUri = resolveProfileAvatar(currentUser?.avatar, currentUser?.name || currentUser?.email || 'Developer', 'voxel-bot');
  const devAvatarUri = resolveProfileAvatar(dev?.avatar, dev?.name || dev?.id || 'Developer', 'voxel-bot');

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Edit Profile Form State (For User's Own Profile)
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');
  const [ownAvatarError, setOwnAvatarError] = useState(false);
  const [devAvatarError, setDevAvatarError] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editRole, setEditRole] = useState(currentUser?.role || currentUser?.preferredRole || '');
  const [editExperience, setEditExperience] = useState(currentUser?.experience || '');
  const [editAvailability, setEditAvailability] = useState(currentUser?.availability || '');
  const [editLocation, setEditLocation] = useState(currentUser?.location || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || currentUser?.introduction || '');
  const [editSkills, setEditSkills] = useState((currentUser?.skills || []).join(', '));
  const [editInterests, setEditInterests] = useState((currentUser?.interests || []).join(', '));
  const [editGithub, setEditGithub] = useState(currentUser?.github || '');
  const [editLinkedin, setEditLinkedin] = useState(currentUser?.linkedin || '');
  const [editPortfolio, setEditPortfolio] = useState(currentUser?.portfolio || '');
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (msg, color = COLORS.yellow) => {
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
    showToast(`SKIPPED ${dev.name.split(' ')[0]}`, COLORS.coral);
    if (setSelectedDeveloperForProfile) setSelectedDeveloperForProfile(null);
    if (onBackToDiscover) onBackToDiscover();
  };

  const handleThirdPartyLike = () => {
    if (!dev) return;
    inviteDeveloper(dev, false);
    showToast(`INVITED ${dev.name.split(' ')[0]}!`, COLORS.lime);
    if (setSelectedDeveloperForProfile) setSelectedDeveloperForProfile(null);
    if (onBackToDiscover) onBackToDiscover();
  };

  const handleThirdPartyLetsBuild = () => {
    if (!dev) return;
    inviteDeveloper(dev, true);
    showToast("LET'S BUILD TOGETHER!", COLORS.yellow);

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
    setEditAvatar(resolveProfileAvatar(currentUser?.avatar, currentUser?.name || 'Developer', 'voxel-bot'));
    setEditName(currentUser?.name || '');
    setEditRole(currentUser?.role || currentUser?.preferredRole || '');
    setEditExperience(currentUser?.experience || '');
    setEditAvailability(currentUser?.availability || '');
    setEditLocation(currentUser?.location || '');
    setEditBio(currentUser?.bio || currentUser?.introduction || '');
    setEditSkills((currentUser?.skills || []).join(', '));
    setEditInterests((currentUser?.interests || []).join(', '));
    setEditGithub(currentUser?.github || '');
    setEditLinkedin(currentUser?.linkedin || '');
    setEditPortfolio(currentUser?.portfolio || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (isSaving) return;
    setIsSaving(true);

    const parsedSkills = editSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedInterests = editInterests
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    const res = await updateProfile({
      name: editName.trim() || currentUser?.name || '',
      role: editRole.trim() || currentUser?.role || '',
      preferredRole: editRole.trim() || currentUser?.preferredRole || '',
      experience: editExperience.trim(),
      availability: editAvailability.trim(),
      location: editLocation.trim(),
      bio: editBio.trim(),
      avatar: editAvatar.trim(),
      skills: parsedSkills,
      interests: parsedInterests,
      github: editGithub.trim(),
      linkedin: editLinkedin.trim(),
      portfolio: editPortfolio.trim(),
    });

    setIsSaving(false);

    if (res?.success) {
      setOwnAvatarError(false);
      setEditModalVisible(false);
      showToast('PROFILE SAVED!', COLORS.yellow);
    } else {
      showToast(res?.error || 'FAILED TO SAVE PROFILE', COLORS.coral);
    }
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
    showToast('GOALS UPDATED');
  };

  // =============================
  // AVAILABILITY STATUS HELPER
  // =============================
  const getAvailabilityStatus = () => {
    const avail = (dev?.availability || '').toLowerCase();
    if (avail.includes('full') || avail.includes('available') || avail.includes('open')) {
      return { label: 'AVAILABLE', color: COLORS.lime, borderColor: COLORS.green, textColor: '#15803D' };
    }
    if (avail.includes('part') || avail.includes('limited') || avail.includes('few')) {
      return { label: 'PART-TIME', color: COLORS.pillYellow, borderColor: COLORS.yellow, textColor: '#854D0E' };
    }
    if (avail.includes('not') || avail.includes('busy') || avail.includes('unavailable')) {
      return { label: 'UNAVAILABLE', color: COLORS.pillCoral, borderColor: COLORS.coral, textColor: '#DC2626' };
    }
    return { label: dev?.availability || 'OPEN', color: COLORS.pillBlue, borderColor: COLORS.cyan, textColor: '#0284C7' };
  };

  return (
    <View style={styles.container}>
      {/* ========== 1. TOP HEADER BAR ========== */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBack}
          style={[styles.headerBackBtn, BRUTAL_SHADOWS.xs]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.headerBackIcon}>{'<-'}</Text>
        </TouchableOpacity>

        {isThirdParty ? (
          <View style={[styles.headerCenterPill, BRUTAL_SHADOWS.xs]}>
            <DoodleUser size={14} color={COLORS.ink} />
            <Text style={styles.headerCenterText}>DEVELOPER PROFILE</Text>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleOpenEditModal}
            style={[styles.headerEditPill, BRUTAL_SHADOWS.xs]}
          >
            <DoodleCode symbol="//" color={COLORS.ink} bgColor={COLORS.white} style={styles.miniHeaderCode} />
            <Text style={styles.headerEditText}>EDIT PROFILE</Text>
          </TouchableOpacity>
        )}

        {isThirdParty ? (
          <View style={[styles.headerMatchScorePill, BRUTAL_SHADOWS.xs]}>
            <DoodleStar size={10} color={COLORS.ink} />
            <Text style={styles.headerMatchScoreText}>
              {dev?.matchScore || 95}% MATCH
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSettingsModalVisible(true)}
            style={[styles.headerSettingsBtn, BRUTAL_SHADOWS.xs]}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
          >
            <Text style={styles.headerSettingsIcon}>//</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <View style={[styles.toastContainer, { backgroundColor: toastMessage.color }, BRUTAL_SHADOWS.xs]}>
          <Text style={styles.toastText}>{toastMessage.text}</Text>
        </View>
      )}

      {/* ========== 2. PROFILE SCROLL CONTENT ========== */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          isThirdParty && { paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== PROFILE HERO CARD ===== */}
        {isThirdParty ? (
          /* Third-Party Developer Banner */
          dev?.name === 'Alex Chen' ? (
            <View style={[styles.heroBannerCard, BRUTAL_SHADOWS.sm]}>
              <Image
                source={require('../assets/alex_banner_clean.png')}
                style={styles.heroBannerImage}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={[styles.heroCard, BRUTAL_SHADOWS.sm]}>
              <View style={styles.heroTopRow}>
                {/* Avatar */}
                <View style={styles.heroAvatarWrap}>
                  {!devAvatarError ? (
                    <Image
                      source={{ uri: devAvatarUri }}
                      style={styles.heroAvatar}
                      onError={() => setDevAvatarError(true)}
                    />
                  ) : (
                    <View style={[styles.heroAvatar, styles.avatarFallbackWrap]}>
                      <Text style={styles.avatarFallbackLetter}>
                        {dev?.name?.charAt(0)?.toUpperCase() || 'D'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.avatarOnlineDot} />
                </View>

                {/* Name + Role Block */}
                <View style={styles.heroInfoCol}>
                  <Text style={styles.heroName} numberOfLines={2}>{dev?.name}</Text>
                  <View style={styles.heroRolePill}>
                    <Text style={styles.heroRoleText}>{dev?.role || dev?.preferredRole || 'Developer'}</Text>
                  </View>
                </View>

                {/* Decorative corner sticker */}
                <View style={styles.heroCornerAccent}>
                  <DoodleStar size={16} color={COLORS.yellow} />
                </View>
              </View>

              {/* Meta Row */}
              <View style={styles.heroMetaRow}>
                {dev?.experience ? (
                  <View style={styles.metaPill}>
                    <Text style={styles.metaPillLabel}>EXP</Text>
                    <Text style={styles.metaPillValue}>{dev.experience}</Text>
                  </View>
                ) : null}
                {dev?.availability ? (
                  <View style={[styles.metaPill, { backgroundColor: getAvailabilityStatus().color, borderColor: getAvailabilityStatus().borderColor }]}>
                    <Text style={[styles.metaPillLabel, { color: getAvailabilityStatus().textColor }]}>{getAvailabilityStatus().label}</Text>
                  </View>
                ) : null}
                {dev?.location ? (
                  <View style={styles.metaPill}>
                    <Text style={styles.metaPillLabel}>LOC</Text>
                    <Text style={styles.metaPillValue}>{dev.location}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          )
        ) : (
          /* ===== OWN PROFILE HERO CARD ===== */
          <View style={[styles.heroCard, BRUTAL_SHADOWS.sm]}>
            {/* Yellow accent stripe */}
            <View style={styles.heroYellowStripe} />

            <View style={styles.heroTopRow}>
              {/* Avatar */}
              <View style={styles.heroAvatarWrap}>
                {!ownAvatarError ? (
                  <Image
                    source={{ uri: ownAvatarUri }}
                    style={styles.heroAvatar}
                    onError={() => setOwnAvatarError(true)}
                  />
                ) : (
                  <View style={[styles.heroAvatar, styles.avatarFallbackWrap]}>
                    <Text style={styles.avatarFallbackLetter}>
                      {currentUser?.name?.charAt(0)?.toUpperCase() || 'D'}
                    </Text>
                  </View>
                )}
                <View style={styles.avatarOnlineDot} />
              </View>

              {/* Name + Role */}
              <View style={styles.heroInfoCol}>
                <Text style={styles.heroName} numberOfLines={2}>{currentUser?.name || 'Developer'}</Text>
                <View style={styles.heroRolePill}>
                  <Text style={styles.heroRoleText}>
                    {currentUser?.role || currentUser?.preferredRole || 'Full Stack Developer'}
                  </Text>
                </View>
                {currentUser?.experience ? (
                  <Text style={styles.heroSubMeta}>EXP: {currentUser.experience}</Text>
                ) : null}
                {currentUser?.location ? (
                  <Text style={styles.heroSubMeta}>LOC: {currentUser.location}</Text>
                ) : null}
              </View>

              {/* Doodle Accent */}
              <View style={styles.heroCornerAccent}>
                <DoodleSparkle size={18} color={COLORS.yellow} />
              </View>
            </View>

            {/* Availability Status Bar */}
            {currentUser?.availability ? (
              <View style={[styles.availabilityBar, { backgroundColor: getAvailabilityStatus().color, borderColor: getAvailabilityStatus().borderColor }]}>
                <DoodleCheck size={11} color={getAvailabilityStatus().textColor} />
                <Text style={[styles.availabilityBarText, { color: getAvailabilityStatus().textColor }]}>
                  {getAvailabilityStatus().label} -- {currentUser.availability}
                </Text>
              </View>
            ) : null}

            {/* Quick Stats Bar */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{projects.length}</Text>
                <Text style={styles.statLabel}>PROJECTS</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{matches.length}</Text>
                <Text style={styles.statLabel}>MATCHES</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{invitations.length}</Text>
                <Text style={styles.statLabel}>INVITES</Text>
              </View>
            </View>
          </View>
        )}

        {/* ===== BIO SECTION ===== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <DoodleCode symbol="//" color={COLORS.ink} bgColor={COLORS.creamDark} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>ABOUT</Text>
          </View>
          <DoodleUnderline width="100%" color={COLORS.yellow} height={3} style={styles.sectionUnderline} />
          <Text style={styles.bioText}>
            {dev?.bio || dev?.introduction || 'Passionate about building products that create real impact. Always open to collaborate on exciting ideas!'}
          </Text>
        </View>

        {/* ===== SKILLS SECTION ===== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <DoodleStar size={14} color={COLORS.cyan} />
            <Text style={styles.sectionTitle}>CORE TECH & SKILLS</Text>
          </View>
          <DoodleUnderline width="100%" color={COLORS.cyan} height={3} style={styles.sectionUnderline} />
          <View style={styles.chipsRow}>
            {(dev?.skills || ['React', 'Node.js', 'Python', 'MongoDB', 'OpenAI', 'TypeScript']).map((skill) => (
              <View key={skill} style={[styles.skillChip, BRUTAL_SHADOWS.xs]}>
                <Text style={styles.skillChipText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ===== LOOKING TO SECTION ===== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <DoodleArrow direction="right" size={14} color={COLORS.ink} />
            <Text style={styles.sectionTitle}>LOOKING TO</Text>
            {!isThirdParty && (
              <Text style={styles.sectionHint}>(Tap to update)</Text>
            )}
          </View>
          <DoodleUnderline width="100%" color={COLORS.lime} height={3} style={styles.sectionUnderline} />
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
                  activeOpacity={isThirdParty ? 1 : 0.8}
                  onPress={() => handleToggleLookingTo(idx)}
                  style={[
                    styles.lookingToPill,
                    selected && styles.lookingToPillActive,
                    selected && BRUTAL_SHADOWS.xs,
                  ]}
                >
                  {selected ? (
                    <DoodleCheck size={11} color={COLORS.green} />
                  ) : (
                    <View style={styles.emptyCheckbox} />
                  )}
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
        </View>

        {/* ===== INTERESTS SECTION ===== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <DoodleSparkle size={14} color={COLORS.coral} />
            <Text style={styles.sectionTitle}>INTERESTS</Text>
          </View>
          <DoodleUnderline width="100%" color={COLORS.coral} height={3} style={styles.sectionUnderline} />
          <View style={styles.chipsRow}>
            {(dev?.interests && dev.interests.length > 0
              ? dev.interests
              : ['AI/ML', 'Developer Tools', 'Open Source', 'Product Design', 'Indie Hacking']
            ).map((interest) => (
              <View key={interest} style={[styles.interestChip, BRUTAL_SHADOWS.xs]}>
                <Text style={styles.interestChipText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ===== SOCIAL LINKS SECTION ===== */}
        {(Boolean(dev?.github) || Boolean(dev?.linkedin) || Boolean(dev?.portfolio)) && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <DoodleCode symbol="<>" color={COLORS.ink} bgColor={COLORS.pillBlue} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>LINKS & PORTFOLIO</Text>
            </View>
            <DoodleUnderline width="100%" color={COLORS.purple || COLORS.cyan} height={3} style={styles.sectionUnderline} />

            <View style={styles.socialLinksCol}>
              {Boolean(dev?.github) && (
                <View style={[styles.socialLinkCard, BRUTAL_SHADOWS.xs]}>
                  <View style={styles.socialLinkLeft}>
                    <View style={[styles.socialIconCircle, { backgroundColor: COLORS.creamDark }]}>
                      <Text style={styles.socialIconLabel}>gh</Text>
                    </View>
                    <View style={styles.socialLinkTextCol}>
                      <Text style={styles.socialLinkType}>GITHUB</Text>
                      <Text style={styles.socialLinkUrl} numberOfLines={1}>{dev.github}</Text>
                    </View>
                  </View>
                  <DoodleArrow direction="right" size={12} color={COLORS.textMuted} />
                </View>
              )}
              {Boolean(dev?.linkedin) && (
                <View style={[styles.socialLinkCard, BRUTAL_SHADOWS.xs]}>
                  <View style={styles.socialLinkLeft}>
                    <View style={[styles.socialIconCircle, { backgroundColor: COLORS.pillBlue }]}>
                      <Text style={styles.socialIconLabel}>in</Text>
                    </View>
                    <View style={styles.socialLinkTextCol}>
                      <Text style={styles.socialLinkType}>LINKEDIN</Text>
                      <Text style={styles.socialLinkUrl} numberOfLines={1}>{dev.linkedin}</Text>
                    </View>
                  </View>
                  <DoodleArrow direction="right" size={12} color={COLORS.textMuted} />
                </View>
              )}
              {Boolean(dev?.portfolio) && (
                <View style={[styles.socialLinkCard, BRUTAL_SHADOWS.xs]}>
                  <View style={styles.socialLinkLeft}>
                    <View style={[styles.socialIconCircle, { backgroundColor: COLORS.pillYellow }]}>
                      <Text style={styles.socialIconLabel}>web</Text>
                    </View>
                    <View style={styles.socialLinkTextCol}>
                      <Text style={styles.socialLinkType}>PORTFOLIO</Text>
                      <Text style={styles.socialLinkUrl} numberOfLines={1}>{dev.portfolio}</Text>
                    </View>
                  </View>
                  <DoodleArrow direction="right" size={12} color={COLORS.textMuted} />
                </View>
              )}
            </View>
          </View>
        )}

        {/* ===== OWN PROFILE ACTION BUTTONS ===== */}
        {!isThirdParty && (
          <View style={styles.ownActionsWrap}>
            {/* Doodle separator */}
            <DoodleSeparator style={{ marginBottom: 14 }} />

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleOpenEditModal}
              style={[styles.primaryActionBtn, BRUTAL_SHADOWS.sm]}
            >
              <DoodleCode symbol="//" color={COLORS.ink} bgColor={COLORS.white} style={styles.btnIcon} />
              <Text style={styles.primaryActionText}>EDIT DEVELOPER PROFILE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setSettingsModalVisible(true)}
              style={[styles.secondaryActionBtn, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.secondaryActionText}>SETTINGS & PREFERENCES</Text>
              <DoodleArrow direction="right" size={12} color={COLORS.ink} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                if (onLogout) onLogout();
                else logout();
              }}
              style={[styles.logoutActionBtn, BRUTAL_SHADOWS.xs]}
            >
              <DoodleCross size={12} color="#DC2626" />
              <Text style={styles.logoutActionText}>LOGOUT</Text>
            </TouchableOpacity>

            {/* Bottom badge */}
            <View style={styles.bottomBadgeRow}>
              <ComicBadge
                text="DEV IDENTITY CARD // v1.0"
                color={COLORS.creamDark}
                textColor={COLORS.textMuted}
                size="sm"
                rotate="-1deg"
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* ========== 3. FLOATING ACTIONS (THIRD-PARTY ONLY) ========== */}
      {isThirdParty && (
        <View style={styles.floatingActionsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleThirdPartySkip}
            style={[styles.actionBtnRound, styles.actionBtnSkip, BRUTAL_SHADOWS.sm]}
          >
            <Image
              source={require('../assets/reject.png')}
              style={styles.actionIconImg}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleThirdPartyLike}
            style={[styles.actionBtnRound, styles.actionBtnLike, BRUTAL_SHADOWS.sm]}
          >
            <Image
              source={require('../assets/like.png')}
              style={styles.actionIconImg}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleThirdPartyLetsBuild}
            style={styles.letsBuildStickerBtn}
          >
            <Image
              source={require('../assets/lets_build_burst.png')}
              style={[styles.letsBuildImage, { backgroundColor: 'transparent' }]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      )}

      {/* ========== 4. SETTINGS MODAL ========== */}
      <Modal
        visible={settingsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.settingsModalCard, BRUTAL_SHADOWS.md]}>
            {/* Settings Header */}
            <View style={styles.settingsHeader}>
              <View style={styles.settingsHeaderLeft}>
                <DoodleCode symbol="//" color={COLORS.ink} bgColor={COLORS.yellow} style={styles.settingsHeaderIcon} />
                <Text style={styles.settingsHeaderTitle}>SETTINGS</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSettingsModalVisible(false)}
                style={[styles.modalCloseBtn, BRUTAL_SHADOWS.xs]}
              >
                <Text style={styles.modalCloseText}>X</Text>
              </TouchableOpacity>
            </View>

            <DoodleUnderline width="100%" color={COLORS.yellow} height={3} style={{ marginBottom: 14 }} />

            {/* Quick Edit Profile */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setSettingsModalVisible(false);
                handleOpenEditModal();
              }}
              style={[styles.settingsQuickEditBtn, BRUTAL_SHADOWS.xs]}
            >
              <DoodleUser size={14} color={COLORS.ink} />
              <Text style={styles.settingsQuickEditText}>EDIT FULL DEVELOPER PROFILE</Text>
              <DoodleArrow direction="right" size={12} color={COLORS.ink} />
            </TouchableOpacity>

            {/* Notification Settings Section */}
            <View style={styles.settingsSectionLabel}>
              <DoodleStar size={10} color={COLORS.cyan} />
              <Text style={styles.settingsSectionLabelText}>NOTIFICATION PREFERENCES</Text>
            </View>

            <View style={styles.settingsToggleItem}>
              <View style={styles.settingsToggleInfo}>
                <Text style={styles.settingsToggleTitle}>PUSH NOTIFICATIONS</Text>
                <Text style={styles.settingsToggleSub}>Alerts for squad invites & matches</Text>
              </View>
              <Switch
                value={pushNotificationsEnabled}
                onValueChange={(val) => {
                  setPushNotificationsEnabled(val);
                  showToast(val ? 'NOTIFICATIONS ENABLED' : 'MUTED');
                }}
                trackColor={{ false: COLORS.borderLight, true: COLORS.lime }}
                thumbColor={pushNotificationsEnabled ? COLORS.white : COLORS.textLight}
                style={styles.switchStyle}
              />
            </View>

            <View style={styles.settingsToggleItem}>
              <View style={styles.settingsToggleInfo}>
                <Text style={styles.settingsToggleTitle}>COMIC AUDIO EFFECTS</Text>
                <Text style={styles.settingsToggleSub}>Play SFX on swipe match & bursts</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={(val) => {
                  setSoundEnabled(val);
                  showToast(val ? 'SOUND ON' : 'MUTED');
                }}
                trackColor={{ false: COLORS.borderLight, true: COLORS.lime }}
                thumbColor={soundEnabled ? COLORS.white : COLORS.textLight}
                style={styles.switchStyle}
              />
            </View>

            <DoodleSeparator style={{ marginVertical: 10 }} />

            {/* Logout */}
            <TouchableOpacity
              onPress={() => {
                setSettingsModalVisible(false);
                if (onLogout) onLogout();
                else logout();
              }}
              style={[styles.settingsLogoutBtn, BRUTAL_SHADOWS.xs]}
            >
              <DoodleCross size={12} color="#DC2626" />
              <Text style={styles.settingsLogoutText}>LOGOUT</Text>
            </TouchableOpacity>

            {/* Footer badge */}
            <View style={styles.settingsFooterBadge}>
              <ComicBadge
                text="DEVDATE // SETTINGS v1.0"
                color={COLORS.creamDark}
                textColor={COLORS.textMuted}
                size="sm"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ========== 5. EDIT PROFILE MODAL ========== */}
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
            {/* Edit Header */}
            <View style={styles.editHeader}>
              <View style={styles.editHeaderLeft}>
                <DoodleCode symbol="//" color={COLORS.ink} bgColor={COLORS.cyan} style={styles.editHeaderIcon} />
                <Text style={styles.editHeaderTitle}>EDIT PROFILE</Text>
              </View>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={[styles.modalCloseBtn, BRUTAL_SHADOWS.xs]}
              >
                <Text style={styles.modalCloseText}>X</Text>
              </TouchableOpacity>
            </View>

            <DoodleUnderline width="100%" color={COLORS.cyan} height={3} style={{ marginBottom: 12 }} />

            <ScrollView style={styles.editFormScroll} showsVerticalScrollIndicator={false}>
              {/* Avatar Section */}
              <View style={styles.editFieldGroup}>
                <View style={styles.avatarLabelRow}>
                  <Text style={styles.editFieldLabel}>VOXEL-ART AVATAR (DICEBEAR)</Text>
                  <View style={styles.voxelTagPill}>
                    <Text style={styles.voxelTagText}>3D VOXEL</Text>
                  </View>
                </View>

                <View style={[styles.editAvatarWrap, BRUTAL_SHADOWS.xs]}>
                  {editAvatar.trim() ? (
                    <Image
                      source={{ uri: editAvatar.trim() }}
                      style={styles.editAvatarPreview}
                      onError={() => {}}
                    />
                  ) : (
                    <View style={[styles.editAvatarPreview, styles.avatarFallbackWrap]}>
                      <Text style={styles.avatarFallbackLetter}>
                        {editName?.charAt(0)?.toUpperCase() || 'D'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.editAvatarControls}>
                    <TextInput
                      value={editAvatar}
                      onChangeText={setEditAvatar}
                      placeholder="DiceBear Avatar URL"
                      placeholderTextColor={COLORS.textLight}
                      autoCapitalize="none"
                      style={[styles.formInput, { marginBottom: 8, fontSize: 11 }]}
                    />

                    {/* Voxel & Pop Art Styles */}
                    <View style={styles.presetRow}>
                      {DICEBEAR_STYLES.map((styleObj) => {
                        const isSelected = editAvatar.includes(`/${styleObj.id}/`);
                        return (
                          <TouchableOpacity
                            key={styleObj.id}
                            activeOpacity={0.8}
                            onPress={() => {
                              const newAv = getDiceBearAvatar(editName || currentUser?.name || 'Developer', styleObj.id);
                              setEditAvatar(newAv);
                            }}
                            style={[
                              styles.presetBtn,
                              isSelected && styles.presetBtnActive,
                              BRUTAL_SHADOWS.xs,
                            ]}
                          >
                            <Text
                              style={[
                                styles.presetBtnText,
                                isSelected && styles.presetBtnTextActive,
                              ]}
                            >
                              {styleObj.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Quick Voxel Actions */}
                    <View style={styles.voxelActionsRow}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => {
                          const randSeed = `dev-${Math.random().toString(36).substring(2, 7)}`;
                          setEditAvatar(getDiceBearAvatar(randSeed, 'voxel-bot'));
                        }}
                        style={[styles.randomVoxelBtn, BRUTAL_SHADOWS.xs]}
                      >
                        <DoodleSparkle size={12} color={COLORS.ink} />
                        <Text style={styles.randomVoxelText}>RANDOMIZE VOXEL</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                          setEditAvatar(getDiceBearAvatar(editName || currentUser?.name || 'Developer', 'voxel-bot'));
                        }}
                        style={[styles.presetClearBtn, BRUTAL_SHADOWS.xs]}
                      >
                        <Text style={styles.presetClearText}>RESET</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              {/* Name */}
              <View style={styles.editFieldGroup}>
                <Text style={styles.editFieldLabel}>FULL NAME</Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="e.g. Rahul Patel"
                  placeholderTextColor={COLORS.textLight}
                  style={styles.formInput}
                />
              </View>

              {/* Role */}
              <View style={styles.editFieldGroup}>
                <Text style={styles.editFieldLabel}>HEADLINE ROLE</Text>
                <TextInput
                  value={editRole}
                  onChangeText={setEditRole}
                  placeholder="e.g. Backend Developer"
                  placeholderTextColor={COLORS.textLight}
                  style={styles.formInput}
                />
              </View>

              {/* Experience */}
              <View style={styles.editFieldGroup}>
                <Text style={styles.editFieldLabel}>EXPERIENCE LEVEL</Text>
                <TextInput
                  value={editExperience}
                  onChangeText={setEditExperience}
                  placeholder="e.g. 3+ Years (Senior)"
                  placeholderTextColor={COLORS.textLight}
                  style={styles.formInput}
                />
              </View>

              {/* Location */}
              <View style={styles.editFieldGroup}>
                <Text style={styles.editFieldLabel}>LOCATION / REMOTE</Text>
                <TextInput
                  value={editLocation}
                  onChangeText={setEditLocation}
                  placeholder="e.g. Bangalore / Remote"
                  placeholderTextColor={COLORS.textLight}
                  style={styles.formInput}
                />
              </View>

              {/* Bio */}
              <View style={styles.editFieldGroup}>
                <Text style={styles.editFieldLabel}>BIO / PITCH</Text>
                <TextInput
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder="Tell developers what you love building..."
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  numberOfLines={3}
                  style={[styles.formInput, styles.multilineInput]}
                />
              </View>

              {/* Skills */}
              <View style={styles.editFieldGroup}>
                <Text style={styles.editFieldLabel}>SKILLS (COMMA-SEPARATED)</Text>
                <TextInput
                  value={editSkills}
                  onChangeText={setEditSkills}
                  placeholder="Python, Go, Docker, AWS, React"
                  placeholderTextColor={COLORS.textLight}
                  style={styles.formInput}
                />
              </View>

              {/* Interests */}
              <View style={styles.editFieldGroup}>
                <Text style={styles.editFieldLabel}>INTERESTS (COMMA-SEPARATED)</Text>
                <TextInput
                  value={editInterests}
                  onChangeText={setEditInterests}
                  placeholder="AI/ML, Open Source, DevTools, Startups"
                  placeholderTextColor={COLORS.textLight}
                  style={styles.formInput}
                />
              </View>

              {/* Availability */}
              <View style={styles.editFieldGroup}>
                <Text style={styles.editFieldLabel}>AVAILABILITY</Text>
                <TextInput
                  value={editAvailability}
                  onChangeText={setEditAvailability}
                  placeholder="e.g. Full-time, 15-20 hrs/week, Open to hackathons"
                  placeholderTextColor={COLORS.textLight}
                  style={styles.formInput}
                />
              </View>

              {/* Social Links Section Header */}
              <View style={styles.editSocialDivider}>
                <DoodleStar size={10} color={COLORS.cyan} />
                <Text style={styles.editSocialDividerText}>SOCIAL & PORTFOLIO LINKS</Text>
              </View>

              {/* GitHub */}
              <View style={styles.editFieldGroup}>
                <Text style={styles.editFieldLabel}>GITHUB PROFILE / URL</Text>
                <TextInput
                  value={editGithub}
                  onChangeText={setEditGithub}
                  placeholder="https://github.com/username"
                  placeholderTextColor={COLORS.textLight}
                  autoCapitalize="none"
                  style={styles.formInput}
                />
              </View>

              {/* LinkedIn */}
              <View style={styles.editFieldGroup}>
                <Text style={styles.editFieldLabel}>LINKEDIN PROFILE / URL</Text>
                <TextInput
                  value={editLinkedin}
                  onChangeText={setEditLinkedin}
                  placeholder="https://linkedin.com/in/username"
                  placeholderTextColor={COLORS.textLight}
                  autoCapitalize="none"
                  style={styles.formInput}
                />
              </View>

              {/* Portfolio */}
              <View style={styles.editFieldGroup}>
                <Text style={styles.editFieldLabel}>PORTFOLIO / WEBSITE URL</Text>
                <TextInput
                  value={editPortfolio}
                  onChangeText={setEditPortfolio}
                  placeholder="https://yourportfolio.dev"
                  placeholderTextColor={COLORS.textLight}
                  autoCapitalize="none"
                  style={styles.formInput}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSaveProfile}
                disabled={isSaving}
                style={[styles.saveProfileBtn, BRUTAL_SHADOWS.sm, isSaving && { opacity: 0.65 }]}
              >
                {isSaving ? (
                  <ActivityIndicator color={COLORS.ink} size="small" />
                ) : (
                  <>
                    <DoodleCheck size={14} color={COLORS.ink} />
                    <Text style={styles.saveProfileBtnText}>SAVE PROFILE CHANGES</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ============================================================================
// STYLES — Pop Art x Doodle Art Design System
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.creamBg,
  },

  // ========= HEADER BAR =========
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderBottomWidth: BORDERS.thick,
    borderBottomColor: COLORS.borderBlack,
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackIcon: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.ink,
  },
  headerCenterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  headerCenterText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  headerEditPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  miniHeaderCode: {
    paddingHorizontal: 3,
    paddingVertical: 0,
    borderRadius: 3,
    borderWidth: 1,
  },
  headerEditText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  headerMatchScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.pillGreen,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.green,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  headerMatchScoreText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 0.4,
  },
  headerSettingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSettingsIcon: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.ink,
    fontFamily: FONTS.mono,
  },

  // ========= TOAST =========
  toastContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 999,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  toastText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.4,
  },

  // ========= SCROLL AREA =========
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 30,
  },

  // ========= HERO CARD =========
  heroCard: {
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xl,
    padding: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  heroBannerCard: {
    width: '100%',
    height: 245,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.borderBlack,
    overflow: 'hidden',
    backgroundColor: COLORS.creamBg,
    marginBottom: 14,
  },
  heroBannerImage: {
    width: '100%',
    height: '100%',
  },
  heroYellowStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: COLORS.yellow,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  heroAvatarWrap: {
    position: 'relative',
  },
  heroAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.borderBlack,
  },
  avatarFallbackWrap: {
    backgroundColor: COLORS.yellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackLetter: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.ink,
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.lime,
    borderWidth: 2.5,
    borderColor: COLORS.borderBlack,
  },
  heroInfoCol: {
    flex: 1,
  },
  heroName: {
    fontSize: 21,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  heroRolePill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.creamDark,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  heroRoleText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.ink,
    fontFamily: FONTS.mono,
  },
  heroSubMeta: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginTop: 2,
    fontFamily: FONTS.mono,
  },
  heroCornerAccent: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.creamDark,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  metaPillLabel: {
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
  },
  metaPillValue: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  // Availability Bar
  availabilityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: BORDERS.thin,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  availabilityBarText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.creamBg,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.ink,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 2,
    height: 24,
    backgroundColor: COLORS.borderBlack,
  },

  // ========= SECTION CARDS =========
  sectionCard: {
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.lg,
    padding: 14,
    marginBottom: 12,
    ...BRUTAL_SHADOWS.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionIcon: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.6,
  },
  sectionHint: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  sectionUnderline: {
    marginTop: 6,
    marginBottom: 10,
  },

  // Bio
  bioText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    lineHeight: 19,
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillChip: {
    backgroundColor: COLORS.pillBlue,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.cyan,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  skillChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.ink,
  },
  interestChip: {
    backgroundColor: COLORS.pillYellow,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.yellow,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  interestChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.ink,
  },

  // Looking To
  lookingToGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  lookingToPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.creamBg,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  lookingToPillActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.borderBlack,
    borderWidth: BORDERS.regular,
  },
  emptyCheckbox: {
    width: 11,
    height: 11,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
  },
  lookingToText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  lookingToTextActive: {
    color: COLORS.ink,
    fontWeight: '900',
  },

  // Social Links
  socialLinksCol: {
    gap: 8,
  },
  socialLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.creamBg,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  socialLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  socialIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
    fontFamily: FONTS.mono,
  },
  socialLinkTextCol: {
    flex: 1,
  },
  socialLinkType: {
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  socialLinkUrl: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // ========= OWN PROFILE ACTIONS =========
  ownActionsWrap: {
    marginTop: 4,
    gap: 10,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 13,
  },
  btnIcon: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
  },
  primaryActionText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 12,
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.4,
  },
  logoutActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.pillCoral,
    borderWidth: BORDERS.regular,
    borderColor: '#DC2626',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 12,
    marginTop: 4,
  },
  logoutActionText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  bottomBadgeRow: {
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 4,
  },

  // ========= FLOATING ACTIONS (3rd PARTY) =========
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
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnSkip: {
    backgroundColor: COLORS.coral,
  },
  actionBtnLike: {
    backgroundColor: COLORS.lime,
  },
  actionIconImg: {
    width: 28,
    height: 28,
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

  // ========= MODAL SHARED =========
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.ink,
  },

  // ========= SETTINGS MODAL =========
  settingsModalCard: {
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xl,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsHeaderIcon: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  settingsHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.6,
  },
  settingsQuickEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  settingsQuickEditText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.4,
    flex: 1,
  },
  settingsSectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  settingsSectionLabelText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  settingsToggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.creamBg,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  settingsToggleInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingsToggleTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
  },
  settingsToggleSub: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  switchStyle: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },
  settingsLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.pillCoral,
    borderWidth: BORDERS.regular,
    borderColor: '#DC2626',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
  },
  settingsLogoutText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  settingsFooterBadge: {
    alignItems: 'center',
    marginTop: 14,
  },

  // ========= EDIT PROFILE MODAL =========
  editModalCard: {
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xl,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  editHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editHeaderIcon: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  editHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.6,
  },
  editFormScroll: {
    width: '100%',
  },
  editFieldGroup: {
    marginBottom: 12,
  },
  editFieldLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  formInput: {
    backgroundColor: COLORS.creamBg,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.ink,
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  editAvatarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.creamBg,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.lg,
    padding: 10,
  },
  editAvatarPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
  },
  editAvatarControls: {
    flex: 1,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetBtn: {
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  presetBtnActive: {
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.regular,
  },
  presetBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
  },
  presetBtnTextActive: {
    color: COLORS.ink,
  },
  avatarLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  voxelTagPill: {
    backgroundColor: COLORS.cyan,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  voxelTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.ink,
  },
  voxelActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  randomVoxelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.lime,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xs,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  randomVoxelText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
  },
  presetClearBtn: {
    backgroundColor: COLORS.creamDark,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  presetClearText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
  },
  editSocialDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingTop: 4,
  },
  editSocialDividerText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  saveProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 13,
    marginTop: 6,
    marginBottom: 16,
  },
  saveProfileBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
});