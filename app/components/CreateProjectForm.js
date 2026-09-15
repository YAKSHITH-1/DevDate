import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { COLORS, BORDER_RADIUS, BRUTAL_SHADOWS } from '../styles/theme';
import ComicBadge from './ComicBadge';
import {
  SKILL_CATEGORIES,
  ALL_SKILLS,
  searchSkills,
  PROJECT_CATEGORIES,
  PROJECT_DURATIONS,
  TEAM_ROLE_CARDS,
  PROJECT_INTERESTS,
  INTEREST_COLORS,
  PROJECT_ICONS,
} from '../data/skillsDatabase';

/**
 * CreateProjectForm — High-Definition 3-Step Comic Wizard
 * Matches Step 1 (Scope), Step 2 (Stack & Architecture), and Step 3 (Co-Founder Matching)
 */
export default function CreateProjectForm({
  visible,
  onClose,
  onSubmit,
  initialData = null,
  mode = 'create',
}) {
  const isEdit = mode === 'edit';

  // ─── STEP STATE ─────────────────────────────────────────────
  const [step, setStep] = useState(1);

  // ─── STEP 1: Project Details ────────────────────────────────
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || 'Web Development');
  const [duration, setDuration] = useState(initialData?.duration || '1-2 months');
  const [minDevs, setMinDevs] = useState(2);
  const [maxDevs, setMaxDevs] = useState(initialData?.maxMembers || 5);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  // ─── STEP 2: Required Skills ────────────────────────────────
  const [selectedSkills, setSelectedSkills] = useState(
    initialData?.techStack || ['javascript', 'react', 'nodejs', 'mongodb']
  );
  const [skillSearch, setSkillSearch] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [showSkillCategoryDropdown, setShowSkillCategoryDropdown] = useState(false);

  // ─── STEP 3: Team Requirements ──────────────────────────────
  const [selectedRoles, setSelectedRoles] = useState(
    initialData?.wantedRoles || ['FULL STACK', 'BACKEND DEV']
  );
  const [selectedInterests, setSelectedInterests] = useState(
    initialData?.interests || ['AI & Neural Nets', 'Web Platform', 'Developer Tools']
  );
  const [projectIcon, setProjectIcon] = useState(initialData?.icon || '🚀');
  const [showIconPicker, setShowIconPicker] = useState(false);

  // ─── Reset / Sync on Open ───────────────────────────────────
  useEffect(() => {
    if (visible) {
      setStep(1);
      if (initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setCategory(initialData.category || 'Web Development');
        setDuration(initialData.duration || '1-2 months');
        setMinDevs(2);
        setMaxDevs(initialData.maxMembers || 5);
        setSelectedSkills(initialData.techStack || ['javascript', 'react']);
        setSelectedRoles(initialData.wantedRoles || ['FULL STACK']);
        setSelectedInterests(initialData.interests || ['Web Platform']);
        setProjectIcon(initialData.icon || '🚀');
      } else {
        setTitle('DevDate');
        setDescription('');
        setCategory('Web Development');
        setDuration('1-2 months');
        setMinDevs(2);
        setMaxDevs(5);
        setSelectedSkills(['javascript', 'react', 'nodejs', 'mongodb']);
        setSelectedRoles(['FULL STACK', 'BACKEND DEV']);
        setSelectedInterests(['AI & Neural Nets', 'Web Platform', 'Developer Tools']);
        setProjectIcon('🚀');
      }
      setSkillSearch('');
      setActiveCategoryTab('all');
      setShowCategoryPicker(false);
      setShowDurationPicker(false);
      setShowSkillCategoryDropdown(false);
      setShowIconPicker(false);
    }
  }, [visible, initialData]);

  // ─── Filtered Skills ────────────────────────────────────────
  const filteredSkills = useMemo(() => {
    if (skillSearch.trim()) {
      return searchSkills(skillSearch);
    }
    if (activeCategoryTab === 'all') {
      return ALL_SKILLS.slice(0, 18);
    }
    const cat = SKILL_CATEGORIES.find((c) => c.id === activeCategoryTab);
    return cat ? cat.skills.map((s) => ({ ...s, categoryId: cat.id, categoryName: cat.name })) : ALL_SKILLS.slice(0, 18);
  }, [skillSearch, activeCategoryTab]);

  const toggleSkill = (skillId) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    );
  };

  const toggleRole = (roleTitle) => {
    setSelectedRoles((prev) =>
      prev.includes(roleTitle) ? prev.filter((r) => r !== roleTitle) : [...prev, roleTitle]
    );
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  // ─── Navigation ─────────────────────────────────────────────
  const canGoNext = () => {
    if (step === 1) return title.trim().length > 0;
    if (step === 2) return selectedSkills.length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };

  const handleSubmit = () => {
    const formData = {
      title: title.trim(),
      description: description.trim() || 'Exciting collaborative project built with passion.',
      category: category || 'Web Development',
      duration: duration || '1-2 months',
      maxMembers: maxDevs,
      minMembers: minDevs,
      techStack: selectedSkills,
      wantedRoles: selectedRoles.length > 0 ? selectedRoles : ['FULL STACK'],
      interests: selectedInterests,
      icon: projectIcon,
    };
    onSubmit(formData);
    onClose();
  };

  // ─── Category Tabs for Step 2 ───────────────────────────────
  const categoryTabOptions = [
    { id: 'all', label: 'All Technologies' },
    { id: 'fullstack', label: 'Full Stack Development' },
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'mobile', label: 'Mobile' },
    { id: 'ai_ml', label: 'AI / ML' },
    { id: 'database', label: 'Database' },
    { id: 'devops', label: 'DevOps / Cloud' },
    { id: 'languages', label: 'Languages' },
    { id: 'blockchain', label: 'Blockchain' },
    { id: 'design', label: 'UI / UX Design' },
  ];

  // ─── TOP WIZARD HEADER ──────────────────────────────────────
  const renderTopHeader = () => {
    let stepTitle = 'STEP 1: PROJECT SCOPE';
    if (step === 2) stepTitle = 'STEP 2: STACK & ARCHITECTURE';
    if (step === 3) stepTitle = 'STEP 3: CO FOUNDER MATCHING';

    return (
      <View style={styles.topHeader}>
        {/* Left: Back Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBack}
          style={[styles.headerBackBtn, BRUTAL_SHADOWS.xs]}
        >
          <Text style={styles.headerBackArrow}>←</Text>
        </TouchableOpacity>

        {/* Center: Wizard Title & Subtitle */}
        <View style={styles.headerCenter}>
          <View style={styles.headerSubtitleRow}>
            <Text style={styles.headerSubtitleDevDate}>DEVDATE :: WIZARD</Text>
            <Text style={styles.headerSubtitleSlash}> / </Text>
            <Text style={styles.headerSubtitleDrafting}>★ DRAFTING</Text>
          </View>
          <Text style={styles.headerMainTitle} numberOfLines={1}>
            {stepTitle}
          </Text>
        </View>

        {/* Right: Avatar Badge */}
        <View style={[styles.headerAvatarBadge, BRUTAL_SHADOWS.xs]}>
          <Text style={styles.headerAvatarIcon}>👤</Text>
          <View style={styles.headerAvatarOnlineDot} />
        </View>
      </View>
    );
  };

  // ─── STEP PROGRESS TRACKER ──────────────────────────────────
  const renderStepTracker = () => (
    <View style={styles.trackerContainer}>
      {/* STEP 1 */}
      <View style={styles.trackerNode}>
        <View
          style={[
            styles.trackerCircle,
            step === 1 && styles.trackerCircleStep1Active,
            step > 1 && styles.trackerCircleDone,
          ]}
        >
          <Text
            style={[
              styles.trackerCircleText,
              (step === 1 || step > 1) && styles.trackerCircleTextDone,
            ]}
          >
            {step > 1 ? '✓' : '1'}
          </Text>
        </View>
        <View
          style={[
            styles.trackerLabelPill,
            step === 1 && styles.trackerLabelPillStep1Active,
            step > 1 && styles.trackerLabelPillDone,
          ]}
        >
          <Text
            style={[
              styles.trackerLabelText,
              step === 1 && styles.trackerLabelTextStep1Active,
              step > 1 && styles.trackerLabelTextDone,
            ]}
          >
            {step > 1 ? '1 DETAILS' : 'DETAILS'}
          </Text>
        </View>
      </View>

      {/* CONNECTOR 1-2 */}
      <View
        style={[
          styles.trackerLine,
          step >= 2 && styles.trackerLineDone,
        ]}
      />

      {/* STEP 2 */}
      <View style={styles.trackerNode}>
        <View
          style={[
            styles.trackerCircle,
            step === 2 && styles.trackerCircleStep2Active,
            step > 2 && styles.trackerCircleDone,
          ]}
        >
          <Text
            style={[
              styles.trackerCircleText,
              (step === 2 || step > 2) && styles.trackerCircleTextDone,
            ]}
          >
            {step > 2 ? '✓' : '2'}
          </Text>
        </View>
        <View
          style={[
            styles.trackerLabelPill,
            step === 2 && styles.trackerLabelPillStep2Active,
            step > 2 && styles.trackerLabelPillDone,
          ]}
        >
          <Text
            style={[
              styles.trackerLabelText,
              step === 2 && styles.trackerLabelTextStep2Active,
              step > 2 && styles.trackerLabelTextDone,
            ]}
          >
            {step === 2 ? '2 SKILLS' : 'SKILLS'}
          </Text>
        </View>
      </View>

      {/* CONNECTOR 2-3 */}
      <View
        style={[
          styles.trackerLine,
          step === 3 && styles.trackerLineDone,
        ]}
      />

      {/* STEP 3 */}
      <View style={styles.trackerNode}>
        <View
          style={[
            styles.trackerCircle,
            step === 3 && styles.trackerCircleStep3Active,
          ]}
        >
          <Text
            style={[
              styles.trackerCircleText,
              step === 3 && styles.trackerCircleTextStep3Active,
            ]}
          >
            3
          </Text>
        </View>
        <View
          style={[
            styles.trackerLabelPill,
            step === 3 && styles.trackerLabelPillStep3Active,
          ]}
        >
          <Text
            style={[
              styles.trackerLabelText,
              step === 3 && styles.trackerLabelTextStep3Active,
            ]}
          >
            {step === 3 ? '3 TEAM' : 'TEAM'}
          </Text>
        </View>
      </View>
    </View>
  );

  // ─── STEP 1: PROJECT SCOPE ──────────────────────────────────
  const renderStep1 = () => (
    <View style={styles.stepBody}>
      {/* Top Tag & Comic Title */}
      <View style={styles.scopeHeaderCard}>
        <View style={[styles.stepSpecPill, BRUTAL_SHADOWS.xs]}>
          <Text style={styles.stepSpecPillDot}>●</Text>
          <Text style={styles.stepSpecPillText}>STEP 1 OF 3 • PROJECT SPEC</Text>
        </View>

        <Text style={styles.comicHeading}>CREATE YOUR PROJECT</Text>
        <Text style={styles.comicSubheading}>TELL DEVELOPERS WHAT YOU'RE BUILDING.</Text>
      </View>

      {/* Field 1: Project Name */}
      <View style={[styles.fieldCard, BRUTAL_SHADOWS.xs]}>
        <View style={styles.fieldCardHeader}>
          <Text style={styles.fieldLabel}>PROJECT NAME <Text style={styles.redAsterisk}>*</Text></Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>STRING</Text>
          </View>
        </View>
        <View style={styles.inputPromptWrap}>
          <Text style={styles.promptPrefix}>&gt;_</Text>
          <TextInput
            style={styles.terminalInput}
            placeholder="e.g. DevDate, StudySync"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />
        </View>
      </View>

      {/* Field 2: Project Description */}
      <View style={[styles.fieldCard, BRUTAL_SHADOWS.xs]}>
        <View style={styles.fieldCardHeader}>
          <Text style={styles.fieldLabel}>PROJECT DESCRIPTION <Text style={styles.redAsterisk}>*</Text></Text>
          <View style={[styles.counterBadge, BRUTAL_SHADOWS.xs]}>
            <Text style={styles.counterBadgeText}>{description.length} / 500</Text>
          </View>
        </View>
        <TextInput
          style={styles.textAreaInput}
          placeholder="Describe your project, what you're building, and what problem it solves..."
          placeholderTextColor="#94A3B8"
          value={description}
          onChangeText={(text) => {
            if (text.length <= 500) setDescription(text);
          }}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Field 3: Category */}
      <View style={[styles.fieldCard, BRUTAL_SHADOWS.xs]}>
        <View style={styles.fieldCardHeader}>
          <Text style={styles.fieldLabel}>CATEGORY</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>ENUM</Text>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          style={styles.dropdownTrigger}
        >
          <Text style={styles.dropdownValueText}>{category}</Text>
          <Text style={styles.dropdownChevron}>▾</Text>
        </TouchableOpacity>

        {showCategoryPicker && (
          <View style={styles.dropdownMenu}>
            {PROJECT_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.8}
                onPress={() => {
                  setCategory(cat);
                  setShowCategoryPicker(false);
                }}
                style={[
                  styles.dropdownItem,
                  category === cat && styles.dropdownItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    category === cat && styles.dropdownItemTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Field 4: Estimated Duration */}
      <View style={[styles.fieldCard, BRUTAL_SHADOWS.xs]}>
        <View style={styles.fieldCardHeader}>
          <Text style={styles.fieldLabel}>ESTIMATED DURATION</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>TIMELINE</Text>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowDurationPicker(!showDurationPicker)}
          style={styles.dropdownTrigger}
        >
          <Text style={styles.dropdownValueText}>{duration}</Text>
          <Text style={styles.dropdownClockIcon}>🕒</Text>
        </TouchableOpacity>

        {showDurationPicker && (
          <View style={styles.dropdownMenu}>
            {PROJECT_DURATIONS.map((dur) => (
              <TouchableOpacity
                key={dur}
                activeOpacity={0.8}
                onPress={() => {
                  setDuration(dur);
                  setShowDurationPicker(false);
                }}
                style={[
                  styles.dropdownItem,
                  duration === dur && styles.dropdownItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    duration === dur && styles.dropdownItemTextActive,
                  ]}
                >
                  {dur}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Field 5: Team Size */}
      <View style={[styles.fieldCard, BRUTAL_SHADOWS.xs]}>
        <View style={styles.fieldCardHeader}>
          <Text style={styles.fieldLabel}>TEAM SIZE</Text>
          <View style={[styles.rangeBadge, BRUTAL_SHADOWS.xs]}>
            <Text style={styles.rangeBadgeText}>RANGE (2-10)</Text>
          </View>
        </View>

        <View style={styles.stepperRow}>
          {/* Min Devs */}
          <View style={styles.stepperCol}>
            <Text style={styles.stepperSubLabel}>MIN DEVS</Text>
            <View style={styles.stepperBox}>
              <Text style={styles.stepperNumber}>{minDevs}</Text>
              <View style={styles.stepperArrows}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (minDevs < maxDevs) setMinDevs(minDevs + 1);
                  }}
                  style={styles.stepperArrowBtn}
                >
                  <Text style={styles.stepperArrowText}>▲</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (minDevs > 1) setMinDevs(minDevs - 1);
                  }}
                  style={styles.stepperArrowBtn}
                >
                  <Text style={styles.stepperArrowText}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Max Devs */}
          <View style={styles.stepperCol}>
            <Text style={styles.stepperSubLabel}>MAX DEVS</Text>
            <View style={styles.stepperBox}>
              <Text style={styles.stepperNumber}>{maxDevs}</Text>
              <View style={styles.stepperArrows}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (maxDevs < 10) setMaxDevs(maxDevs + 1);
                  }}
                  style={styles.stepperArrowBtn}
                >
                  <Text style={styles.stepperArrowText}>▲</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (maxDevs > minDevs) setMaxDevs(maxDevs - 1);
                  }}
                  style={styles.stepperArrowBtn}
                >
                  <Text style={styles.stepperArrowText}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.stepperNotice}>ⓘ Maximum cannot be smaller than minimum.</Text>
      </View>

      {/* Step 1 Bottom Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleNext}
        disabled={!canGoNext()}
        style={[
          styles.continueFullBtn,
          !canGoNext() && styles.continueBtnDisabled,
          BRUTAL_SHADOWS.sm,
        ]}
      >
        <Text style={styles.continueBtnText}>CONTINUE ➔</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── STEP 2: STACK & ARCHITECTURE ───────────────────────────
  const renderStep2 = () => (
    <View style={styles.stepBody}>
      {/* Top Banner Row */}
      <View style={styles.step2BannerRow}>
        <View style={styles.step2DarkBanner}>
          <Text style={styles.step2DarkBannerText}>STEP 2 OF 3 • REQUIRED TECH STACK</Text>
        </View>
        <View style={styles.step2SkillsCountPill}>
          <Text style={styles.step2SkillsCountText}>{selectedSkills.length}/15 SKILLS</Text>
        </View>
      </View>

      {/* Comic Card with BOOM sticker */}
      <View style={[styles.step2ComicCard, BRUTAL_SHADOWS.xs]}>
        <View style={[styles.boomSticker, BRUTAL_SHADOWS.xs]}>
          <Text style={styles.boomStickerText}>BOOM! ★</Text>
        </View>
        <Text style={styles.comicHeadingSkills}>WHAT SKILLS DOES YOUR PROJECT REQUIRE?</Text>
        <Text style={styles.comicSubheadingSkills}>
          Select the tech stack needed for collaboration. Matches are synthesized based on core proficiencies.
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBarContainer, BRUTAL_SHADOWS.xs]}>
        <Text style={styles.searchPrefix}>&gt;_</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search skills, aliases (e.g., 'js', 'kube')"
          placeholderTextColor="#94A3B8"
          value={skillSearch}
          onChangeText={setSkillSearch}
        />
        <View style={styles.searchIconBtn}>
          <Text style={styles.searchIconBtnText}>🔍</Text>
        </View>
      </View>

      {/* Filter Category Dropdown Trigger */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowSkillCategoryDropdown(!showSkillCategoryDropdown)}
          style={[styles.filterDropdownTrigger, BRUTAL_SHADOWS.xs]}
        >
          <Text style={styles.filterDropdownText} numberOfLines={1}>
            {activeCategoryTab === 'all'
              ? 'FULL STACK DEVELOPMENT (10 available)'
              : categoryTabOptions.find((t) => t.id === activeCategoryTab)?.label || 'FILTER CATEGORY'}
          </Text>
          <Text style={styles.dropdownChevron}>▾</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowSkillCategoryDropdown(!showSkillCategoryDropdown)}
          style={[styles.filterActionBtn, BRUTAL_SHADOWS.xs]}
        >
          <Text style={styles.filterActionBtnText}>🎛 FILTER</Text>
        </TouchableOpacity>
      </View>

      {/* Category Dropdown Menu */}
      {showSkillCategoryDropdown && (
        <View style={[styles.dropdownMenu, { marginBottom: 12 }]}>
          {categoryTabOptions.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.8}
              onPress={() => {
                setActiveCategoryTab(opt.id);
                setShowSkillCategoryDropdown(false);
              }}
              style={[
                styles.dropdownItem,
                activeCategoryTab === opt.id && styles.dropdownItemActive,
              ]}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  activeCategoryTab === opt.id && styles.dropdownItemTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Horizontal Category Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryPillsScroll}
        contentContainerStyle={styles.categoryPillsContent}
      >
        {categoryTabOptions.map((tab) => {
          const isActive = activeCategoryTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.8}
              onPress={() => setActiveCategoryTab(tab.id)}
              style={[
                styles.categoryFilterPill,
                isActive && styles.categoryFilterPillActive,
              ]}
            >
              {isActive && <Text style={styles.activePillBullet}>● </Text>}
              <Text
                style={[
                  styles.categoryFilterPillText,
                  isActive && styles.categoryFilterPillTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 2-Column High-Definition Skills Grid */}
      <View style={styles.skillsGrid}>
        {filteredSkills.map((skill) => {
          const isSelected = selectedSkills.includes(skill.id);
          const badgeBg = skill.badge?.bg || '#3B82F6';
          const badgeTextColor = skill.badge?.color || '#FFFFFF';
          const badgeGlyph = skill.badge?.text || skill.label.slice(0, 2).toUpperCase();

          return (
            <TouchableOpacity
              key={skill.id}
              activeOpacity={0.8}
              onPress={() => toggleSkill(skill.id)}
              style={[
                styles.skillCard,
                isSelected && styles.skillCardSelected,
                BRUTAL_SHADOWS.xs,
              ]}
            >
              {/* Card Top Row: HD Tech Badge + Selection Indicator */}
              <View style={styles.skillCardTopRow}>
                {/* Tech Badge */}
                <View
                  style={[
                    styles.techLogoBadge,
                    { backgroundColor: badgeBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.techLogoBadgeText,
                      { color: badgeTextColor },
                    ]}
                    numberOfLines={1}
                  >
                    {badgeGlyph}
                  </Text>
                </View>

                {/* Check or Plus Indicator */}
                <View
                  style={[
                    styles.skillIndicatorCircle,
                    isSelected && styles.skillIndicatorCircleSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.skillIndicatorText,
                      isSelected && styles.skillIndicatorTextSelected,
                    ]}
                  >
                    {isSelected ? '✓' : '+'}
                  </Text>
                </View>
              </View>

              {/* Skill Name */}
              <Text style={styles.skillCardName} numberOfLines={1}>
                {skill.label}
              </Text>

              {/* Subtitle / Spec */}
              <Text style={styles.skillCardSubtitle} numberOfLines={1}>
                {skill.subtitle || 'LANGUAGE • CORE'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Skills Bottom Drawer Bar */}
      <View style={[styles.selectedSkillsDrawer, BRUTAL_SHADOWS.sm]}>
        <View style={styles.drawerHeaderRow}>
          <Text style={styles.drawerTitle}>☑ SELECTED SKILLS</Text>
          <View style={styles.drawerCountPill}>
            <Text style={styles.drawerCountText}>{selectedSkills.length} selected</Text>
          </View>
        </View>

        <View style={styles.drawerChipsWrap}>
          {selectedSkills.map((sId) => {
            const sk = ALL_SKILLS.find((s) => s.id === sId);
            const label = sk ? sk.label : sId;
            return (
              <TouchableOpacity
                key={sId}
                activeOpacity={0.8}
                onPress={() => toggleSkill(sId)}
                style={styles.drawerChip}
              >
                <Text style={styles.drawerChipText}>{label}</Text>
                <Text style={styles.drawerChipRemove}>✕</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.drawerFooterRow}>
          <Text style={styles.drawerFooterSync}>Auto-synced to project draft</Text>
          <View style={styles.drawerDraftBadge}>
            <Text style={styles.drawerDraftBadgeText}>DRAFT #PRJ-002</Text>
          </View>
        </View>
      </View>

      {/* Step 2 Bottom Navigation */}
      <View style={styles.stepNavRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleBack}
          style={[styles.backNavBtn, BRUTAL_SHADOWS.xs]}
        >
          <Text style={styles.backNavBtnText}>← BACK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleNext}
          disabled={!canGoNext()}
          style={[
            styles.continueNavBtn,
            !canGoNext() && styles.continueBtnDisabled,
            BRUTAL_SHADOWS.sm,
          ]}
        >
          <Text style={styles.continueNavBtnText}>CONTINUE ➔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── STEP 3: CO FOUNDER MATCHING ────────────────────────────
  const renderStep3 = () => (
    <View style={styles.stepBody}>
      {/* POW Sticker & Header Card */}
      <View style={[styles.step3HeaderCard, BRUTAL_SHADOWS.xs]}>
        <View style={[styles.powSticker, BRUTAL_SHADOWS.xs]}>
          <Text style={styles.powStickerText}>POW! ★</Text>
        </View>

        <View style={[styles.step3SpecPill, BRUTAL_SHADOWS.xs]}>
          <Text style={styles.step3SpecPillText}>● STEP 3 OF 3 • TEAM & LAUNCH</Text>
        </View>

        <Text style={styles.comicHeadingTeam}>BUILD YOUR TEAM</Text>
        <Text style={styles.comicSubheadingTeam}>
          Tell us who you're looking for and finalize pairing attributes.
        </Text>
      </View>

      {/* Section: Required Roles */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>👥 REQUIRED ROLES</Text>
        <View style={[styles.rolesCountPill, BRUTAL_SHADOWS.xs]}>
          <Text style={styles.rolesCountPillText}>{selectedRoles.length} / 6 selected</Text>
        </View>
      </View>

      {/* 2-Column Roles Grid */}
      <View style={styles.rolesGrid}>
        {TEAM_ROLE_CARDS.map((rc) => {
          const isSelected = selectedRoles.includes(rc.title);

          return (
            <TouchableOpacity
              key={rc.id}
              activeOpacity={0.8}
              onPress={() => toggleRole(rc.title)}
              style={[
                styles.roleCard,
                isSelected && styles.roleCardSelected,
                BRUTAL_SHADOWS.xs,
              ]}
            >
              <Text
                style={[
                  styles.roleCardTitle,
                  isSelected && styles.roleCardTitleSelected,
                ]}
                numberOfLines={1}
              >
                {rc.title}
              </Text>
              <Text
                style={[
                  styles.roleCardSubtitle,
                  isSelected && styles.roleCardSubtitleSelected,
                ]}
                numberOfLines={1}
              >
                {rc.subtitle}
              </Text>

              {/* Status Circle Bottom Right */}
              <View
                style={[
                  styles.roleIndicatorCircle,
                  isSelected && styles.roleIndicatorCircleSelected,
                ]}
              >
                <Text
                  style={[
                    styles.roleIndicatorText,
                    isSelected && styles.roleIndicatorTextSelected,
                  ]}
                >
                  {isSelected ? '✓' : '+'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Section: What Is Your Project About? */}
      <View style={styles.interestsCard}>
        <Text style={styles.interestsTitle}>💥 WHAT IS YOUR PROJECT ABOUT?</Text>
        <Text style={styles.interestsSubtitle}>Select core technical themes and domain verticals :</Text>

        <View style={styles.interestsPillsWrap}>
          {PROJECT_INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            const activeColor = INTEREST_COLORS[interest] || '#4ADE80';

            return (
              <TouchableOpacity
                key={interest}
                activeOpacity={0.8}
                onPress={() => toggleInterest(interest)}
                style={[
                  styles.interestPill,
                  isSelected && { backgroundColor: activeColor },
                  BRUTAL_SHADOWS.xs,
                ]}
              >
                {isSelected && <Text style={styles.interestCheckmark}>✓ </Text>}
                <Text
                  style={[
                    styles.interestPillText,
                    isSelected && styles.interestPillTextSelected,
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Section: Project Cover Image */}
      <View style={[styles.coverCard, BRUTAL_SHADOWS.xs]}>
        <View style={styles.coverCardHeader}>
          <Text style={styles.coverHeaderTitle}>🖼 PROJECT COVER IMAGE</Text>
          <Text style={styles.coverHeaderOptional}>(Optional)</Text>
        </View>

        <View style={styles.coverUploadBox}>
          <View style={styles.coverBlueprintIconBox}>
            <Text style={styles.coverBlueprintEmoji}>{projectIcon}</Text>
            <Text style={styles.coverBlueprintCaption}>ARCH/ICON</Text>
          </View>

          <View style={styles.coverUploadTextCol}>
            <Text style={styles.coverUploadTitle}>UPLOAD ARCHITECTURE BANNER</Text>
            <Text style={styles.coverUploadSubtext}>
              PNG, JPG up to 5MB. Visuals enhance candidate response rates by <Text style={styles.boldHighlight}>3.2x</Text>.
            </Text>

            <View style={styles.coverBtnRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowIconPicker(!showIconPicker)}
                style={[styles.addImageBtn, BRUTAL_SHADOWS.xs]}
              >
                <Text style={styles.addImageBtnText}>+ ADD IMAGE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowIconPicker(false)}
                style={styles.skipBtn}
              >
                <Text style={styles.skipBtnText}>SKIP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Icon picker dropdown if toggled */}
        {showIconPicker && (
          <View style={styles.iconPickerGrid}>
            {PROJECT_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                activeOpacity={0.8}
                onPress={() => {
                  setProjectIcon(icon);
                  setShowIconPicker(false);
                }}
                style={[
                  styles.iconPickerOption,
                  projectIcon === icon && styles.iconPickerOptionSelected,
                ]}
              >
                <Text style={styles.iconPickerOptionText}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Verification / Deployment Banner */}
      <View style={[styles.deploymentBanner, BRUTAL_SHADOWS.xs]}>
        <View style={styles.deploymentBannerTop}>
          <Text style={styles.deploymentDot}>●</Text>
          <Text style={styles.deploymentTitle}>READY TO DEPLOY MATCH INSTANCE</Text>
        </View>
        <Text style={styles.deploymentSubtitle}>
          5 fields verified • {selectedSkills.length} core stack • {selectedRoles.length} roles open
        </Text>
        <View style={styles.verifiedTag}>
          <Text style={styles.verifiedTagText}>✓ VERIFIED</Text>
        </View>
      </View>

      {/* Step 3 Bottom Navigation */}
      <View style={styles.stepNavRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleBack}
          style={[styles.backNavBtn, BRUTAL_SHADOWS.xs]}
        >
          <Text style={styles.backNavBtnText}>← BACK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmit}
          style={[styles.createProjectBtn, BRUTAL_SHADOWS.sm]}
        >
          <Text style={styles.createProjectBtnText}>
            {isEdit ? 'SAVE CHANGES ✔' : 'CREATE PROJECT 🚀'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── MAIN MODAL RENDER ──────────────────────────────────────
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.screenContainer}>
        {/* Yellow Top Header */}
        {renderTopHeader()}

        {/* 3-Step Tracker */}
        {renderStepTracker()}

        {/* Scrollable Wizard Body with Halftone Background */}
        <ImageBackground
          source={require('../assets/comic_screen_bg.png')}
          style={styles.bodyBackground}
          resizeMode="cover"
        >
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </ScrollView>
        </ImageBackground>
      </View>
    </Modal>
  );
}

// ─── HIGH-DEFINITION STYLES ──────────────────────────────────
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FAF6EB',
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    borderLeftWidth: Platform.OS === 'web' ? 2.5 : 0,
    borderRightWidth: Platform.OS === 'web' ? 2.5 : 0,
    borderColor: '#000000',
  },
  bodyBackground: {
    flex: 1,
    backgroundColor: '#FAF6EB',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 36,
  },
  stepBody: {
    width: '100%',
  },

  // ─── TOP WIZARD HEADER ──────────────────────────────────────
  topHeader: {
    backgroundColor: '#FFE600',
    borderBottomWidth: 3,
    borderColor: '#000000',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 14 : 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackArrow: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 10,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSubtitleDevDate: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  headerSubtitleSlash: {
    fontSize: 9,
    fontWeight: '900',
    color: '#666666',
  },
  headerSubtitleDrafting: {
    fontSize: 9,
    fontWeight: '900',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  headerMainTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  headerAvatarBadge: {
    width: 38,
    height: 38,
    backgroundColor: '#38BDF8',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerAvatarIcon: {
    fontSize: 18,
  },
  headerAvatarOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 1.5,
    borderColor: '#000000',
  },

  // ─── STEP PROGRESS TRACKER ──────────────────────────────────
  trackerContainer: {
    backgroundColor: '#FAF6EB',
    borderBottomWidth: 2.5,
    borderColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  trackerNode: {
    alignItems: 'center',
  },
  trackerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackerCircleStep1Active: {
    backgroundColor: '#00E5FF',
  },
  trackerCircleStep2Active: {
    backgroundColor: '#00E5FF',
  },
  trackerCircleStep3Active: {
    backgroundColor: '#FFE600',
  },
  trackerCircleDone: {
    backgroundColor: '#22C55E',
  },
  trackerCircleText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#64748B',
  },
  trackerCircleTextDone: {
    color: '#000000',
  },
  trackerCircleTextStep3Active: {
    color: '#000000',
  },
  trackerLabelPill: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trackerLabelPillStep1Active: {
    backgroundColor: '#FFE600',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  trackerLabelPillStep2Active: {
    backgroundColor: '#00E5FF',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  trackerLabelPillStep3Active: {
    backgroundColor: '#FFE600',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  trackerLabelPillDone: {
    backgroundColor: '#000000',
  },
  trackerLabelText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  trackerLabelTextStep1Active: {
    color: '#000000',
  },
  trackerLabelTextStep2Active: {
    color: '#000000',
  },
  trackerLabelTextStep3Active: {
    color: '#000000',
  },
  trackerLabelTextDone: {
    color: '#FFFFFF',
  },
  trackerLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#000000',
    marginHorizontal: 4,
    marginBottom: 16,
  },
  trackerLineDone: {
    backgroundColor: '#00E5FF',
  },

  // ─── STEP 1 STYLES ──────────────────────────────────────────
  scopeHeaderCard: {
    marginBottom: 12,
  },
  stepSpecPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F43F5E',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  stepSpecPillDot: {
    fontSize: 9,
    color: '#FFE600',
    marginRight: 5,
  },
  stepSpecPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  comicHeading: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000000',
    fontStyle: 'italic',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  comicSubheading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // Field Cards
  fieldCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  fieldCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  redAsterisk: {
    color: '#EF4444',
  },
  typeBadge: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#334155',
  },
  counterBadge: {
    backgroundColor: '#FDE047',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  counterBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000000',
  },
  rangeBadge: {
    backgroundColor: '#67E8F9',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  rangeBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000000',
  },

  // Inputs
  inputPromptWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 44,
  },
  promptPrefix: {
    fontSize: 14,
    fontWeight: '900',
    color: '#EC4899',
    marginRight: 6,
  },
  terminalInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    padding: 0,
  },
  textAreaInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 10,
    padding: 10,
    minHeight: 74,
    textAlignVertical: 'top',
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 18,
  },

  // Dropdown Pickers
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  dropdownValueText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
  dropdownChevron: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
  },
  dropdownClockIcon: {
    fontSize: 15,
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 10,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  dropdownItemActive: {
    backgroundColor: '#FEF08A',
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  dropdownItemTextActive: {
    fontWeight: '900',
    color: '#000000',
  },

  // Stepper
  stepperRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  stepperCol: {
    flex: 1,
  },
  stepperSubLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  stepperNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
  },
  stepperArrows: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperArrowBtn: {
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  stepperArrowText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748B',
  },
  stepperNotice: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
  },

  // Continue Full Button
  continueFullBtn: {
    height: 50,
    backgroundColor: '#00E5FF',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  continueBtnDisabled: {
    backgroundColor: '#CBD5E1',
    opacity: 0.7,
  },
  continueBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },

  // ─── STEP 2 STYLES ──────────────────────────────────────────
  step2BannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  step2DarkBanner: {
    backgroundColor: '#000000',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  step2DarkBannerText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00E5FF',
    letterSpacing: 0.5,
  },
  step2SkillsCountPill: {
    backgroundColor: '#EC4899',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  step2SkillsCountText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  step2ComicCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    position: 'relative',
  },
  boomSticker: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: '#FFE600',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    transform: [{ rotate: '4deg' }],
  },
  boomStickerText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
  },
  comicHeadingSkills: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  comicSubheadingSkills: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 16,
  },

  // Search
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 12,
    paddingLeft: 10,
    paddingRight: 4,
    height: 44,
    marginBottom: 10,
  },
  searchPrefix: {
    fontSize: 13,
    fontWeight: '900',
    color: '#EC4899',
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    padding: 0,
  },
  searchIconBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#FFE600',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconBtnText: {
    fontSize: 13,
  },

  // Filter Row
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  filterDropdownTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
  },
  filterDropdownText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
  filterActionBtn: {
    backgroundColor: '#FFE600',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterActionBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },

  // Horizontal Pills
  categoryPillsScroll: {
    marginBottom: 12,
  },
  categoryPillsContent: {
    gap: 8,
  },
  categoryFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  categoryFilterPillActive: {
    backgroundColor: '#00E5FF',
  },
  activePillBullet: {
    fontSize: 9,
    color: '#000000',
  },
  categoryFilterPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
  categoryFilterPillTextActive: {
    color: '#000000',
  },

  // Skills Grid
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 14,
  },
  skillCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 14,
    padding: 10,
    marginBottom: 4,
  },
  skillCardSelected: {
    backgroundColor: '#CFFAFE',
  },
  skillCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  techLogoBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  techLogoBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  skillIndicatorCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillIndicatorCircleSelected: {
    backgroundColor: '#00E5FF',
  },
  skillIndicatorText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
  },
  skillIndicatorTextSelected: {
    color: '#000000',
  },
  skillCardName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 2,
  },
  skillCardSubtitle: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.5,
  },

  // Selected Skills Bottom Drawer
  selectedSkillsDrawer: {
    backgroundColor: '#0F172A',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  drawerCountPill: {
    backgroundColor: '#00E5FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  drawerCountText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000000',
  },
  drawerChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  drawerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  drawerChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
    marginRight: 6,
  },
  drawerChipRemove: {
    fontSize: 10,
    fontWeight: '900',
    color: '#EF4444',
  },
  drawerFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#334155',
  },
  drawerFooterSync: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00E5FF',
  },
  drawerDraftBadge: {
    backgroundColor: '#FFE600',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#000000',
  },
  drawerDraftBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#000000',
  },

  // Step Nav Row
  stepNavRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  backNavBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backNavBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
  },
  continueNavBtn: {
    flex: 2,
    height: 48,
    backgroundColor: '#00E5FF',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueNavBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },

  // ─── STEP 3 STYLES ──────────────────────────────────────────
  step3HeaderCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    position: 'relative',
  },
  powSticker: {
    position: 'absolute',
    top: -12,
    left: 10,
    backgroundColor: '#EC4899',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    transform: [{ rotate: '-6deg' }],
  },
  powStickerText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  step3SpecPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FDE047',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 2,
    marginBottom: 6,
  },
  step3SpecPillText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  comicHeadingTeam: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  comicSubheadingTeam: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 16,
  },

  // Required Roles Section
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  rolesCountPill: {
    backgroundColor: '#FFE600',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  rolesCountPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000000',
  },

  // Roles Grid
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 14,
  },
  roleCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 14,
    padding: 10,
    minHeight: 68,
    position: 'relative',
  },
  roleCardSelected: {
    backgroundColor: '#00E5FF',
  },
  roleCardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 2,
  },
  roleCardTitleSelected: {
    color: '#000000',
  },
  roleCardSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    paddingRight: 24,
  },
  roleCardSubtitleSelected: {
    color: '#091830',
  },
  roleIndicatorCircle: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIndicatorCircleSelected: {
    backgroundColor: '#4ADE80',
  },
  roleIndicatorText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
  roleIndicatorTextSelected: {
    color: '#000000',
  },

  // Project Interests Section
  interestsCard: {
    marginBottom: 14,
  },
  interestsTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 2,
  },
  interestsSubtitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  interestsPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  interestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  interestCheckmark: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
  interestPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
  interestPillTextSelected: {
    color: '#000000',
  },

  // Cover Image Card
  coverCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  coverCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  coverHeaderTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
  coverHeaderOptional: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  coverUploadBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  coverBlueprintIconBox: {
    width: 64,
    height: 64,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBlueprintEmoji: {
    fontSize: 26,
  },
  coverBlueprintCaption: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#00E5FF',
    marginTop: 2,
  },
  coverUploadTextCol: {
    flex: 1,
  },
  coverUploadTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 2,
  },
  coverUploadSubtext: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 14,
    marginBottom: 6,
  },
  boldHighlight: {
    fontWeight: '900',
    color: '#000000',
  },
  coverBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addImageBtn: {
    backgroundColor: '#00E5FF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  addImageBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
  },
  skipBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  skipBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  iconPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconPickerOption: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPickerOptionSelected: {
    borderColor: '#000000',
    backgroundColor: '#FEF08A',
  },
  iconPickerOptionText: {
    fontSize: 18,
  },

  // Deployment Banner
  deploymentBanner: {
    backgroundColor: '#4ADE80',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  deploymentBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  deploymentDot: {
    fontSize: 9,
    color: '#166534',
    marginRight: 5,
  },
  deploymentTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  deploymentSubtitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#14532D',
    marginBottom: 6,
  },
  verifiedTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#000000',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  verifiedTagText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#4ADE80',
    letterSpacing: 0.5,
  },

  // Create Project Final Button
  createProjectBtn: {
    flex: 2,
    height: 48,
    backgroundColor: '#00E5FF',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createProjectBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
});
