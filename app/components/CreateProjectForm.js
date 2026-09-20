import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, BORDER_RADIUS, BORDERS, BRUTAL_SHADOWS } from '../styles/theme';
import * as ImagePicker from 'expo-image-picker';
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
  getSkillPresentation,
} from '../data/skillsDatabase';
import {
  DoodleStar,
  DoodleSparkle,
  DoodleCode,
  DoodleArrow,
  DoodleUnderline,
  DoodleCheck,
  DoodleCross,
} from './DoodleElements';
import { useApp } from '../context/AppContext';
import { resolveSkillToId } from '../utils/api';

const SKILL_THEMES = [
  { bg: COLORS.pillBlue, border: COLORS.pillBlueBorder },
  { bg: COLORS.pillYellow, border: COLORS.pillYellowBorder },
  { bg: COLORS.pillGreen, border: COLORS.pillGreenBorder },
  { bg: COLORS.purplePastel, border: COLORS.purple },
  { bg: COLORS.pillCoral, border: COLORS.pillCoralBorder },
  { bg: COLORS.orangePastel, border: COLORS.orange },
];

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
  const [minDevs, setMinDevs] = useState(
    initialData?.teamSize?.min ?? initialData?.minMembers ?? 2
  );
  const [maxDevs, setMaxDevs] = useState(
    initialData?.teamSize?.max ?? initialData?.maxMembers ?? 5
  );
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
  const [projectImage, setProjectImage] = useState(initialData?.image || '');
  const [projectIcon, setProjectIcon] = useState(initialData?.icon || '</>');
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handlePickProjectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setProjectImage(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Project image pick error:', err);
    }
  };

  const { canonicalSkills = [] } = useApp ? useApp() : {};

  // ─── Reset / Sync on Open ───────────────────────────────────
  useEffect(() => {
    if (visible) {
      setStep(1);
      const resolveList = (list) => {
        if (!Array.isArray(list)) return [];
        return list
          .map((item) => {
            if (!item) return null;
            if (typeof item === 'string' && /^[0-9a-fA-F]{24}$/.test(item)) {
              return item;
            }
            if (typeof item === 'object') {
              const objId = (item._id || item.id || '').toString();
              if (objId && /^[0-9a-fA-F]{24}$/.test(objId)) {
                return objId;
              }
              if (item.name) {
                const id = resolveSkillToId(item.name, canonicalSkills);
                if (id) return id;
              }
            }
            const id = resolveSkillToId(item, canonicalSkills);
            return id || (typeof item === 'object' ? (item.id || item._id) : item);
          })
          .filter(Boolean);
      };

      if (initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setCategory(initialData.category || 'Web Development');
        setDuration(initialData.duration || '1-2 months');
        setMinDevs(initialData.teamSize?.min ?? initialData.minMembers ?? 2);
        setMaxDevs(initialData.teamSize?.max ?? initialData.maxMembers ?? 5);
        const resolved = resolveList(initialData.requiredSkills || initialData.techStack || ['javascript', 'react']);
        setSelectedSkills([...new Set(resolved)]);
        setSelectedRoles(initialData.wantedRoles || initialData.requiredRoles || ['FULL STACK']);
        setSelectedInterests(initialData.interests || ['Web Platform']);
        setProjectIcon(initialData.icon || (initialData.image && !initialData.image.startsWith('http') ? initialData.image : '</>'));
        setProjectImage(initialData.image || '');
      } else {
        setTitle('DevDate');
        setDescription('');
        setCategory('Web Development');
        setDuration('1-2 months');
        setMinDevs(2);
        setMaxDevs(5);
        const resolved = resolveList(['javascript', 'react', 'nodejs', 'mongodb']);
        setSelectedSkills([...new Set(resolved)]);
        setSelectedRoles(['FULL STACK', 'BACKEND DEV']);
        setSelectedInterests(['AI & Neural Nets', 'Web Platform', 'Developer Tools']);
        setProjectIcon('</>');
        setProjectImage('');
      }
      setSkillSearch('');
      setActiveCategoryTab('all');
      setShowCategoryPicker(false);
      setShowDurationPicker(false);
      setShowSkillCategoryDropdown(false);
      setShowIconPicker(false);
    }
  }, [visible, initialData, canonicalSkills]);

  // Available skills: prioritize canonical backend skills if loaded, otherwise fallback to local ALL_SKILLS
  const allAvailableSkills = useMemo(() => {
    if (canonicalSkills && canonicalSkills.length > 0) {
      return canonicalSkills.map((cs) => {
        const pres = getSkillPresentation(cs.name);
        return {
          id: (cs.id || cs._id).toString(),
          label: cs.name,
          name: cs.name,
          categories: cs.categories || [],
          aliases: cs.aliases || [],
          badge: pres?.badge || { text: cs.name.slice(0, 2).toUpperCase(), bg: '#38BDF8', color: '#FFF' },
          subtitle: cs.categories?.[0]?.toUpperCase() || 'TECH',
        };
      });
    }
    return ALL_SKILLS;
  }, [canonicalSkills]);

  // ─── Filtered Skills ────────────────────────────────────────
  const filteredSkills = useMemo(() => {
    if (skillSearch.trim()) {
      const q = skillSearch.trim().toLowerCase();
      return allAvailableSkills.filter(
        (s) =>
          s.label.toLowerCase().includes(q) ||
          (Array.isArray(s.aliases) && s.aliases.some((a) => a.toLowerCase().includes(q))) ||
          (Array.isArray(s.categories) && s.categories.some((c) => c.toLowerCase().includes(q)))
      );
    }
    if (activeCategoryTab === 'all') {
      return allAvailableSkills.slice(0, 24);
    }
    return allAvailableSkills
      .filter((s) =>
        Array.isArray(s.categories)
          ? s.categories.some((c) => c.toLowerCase().includes(activeCategoryTab.toLowerCase()))
          : s.categoryId === activeCategoryTab
      )
      .slice(0, 24);
  }, [skillSearch, activeCategoryTab, allAvailableSkills]);

  const toggleSkill = (skillId) => {
    const targetId = String(skillId);
    setSelectedSkills((prev) =>
      prev.includes(targetId) ? prev.filter((s) => s !== targetId) : [...new Set([...prev, targetId])]
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const formData = {
      title: title.trim(),
      description: description.trim() || 'Exciting collaborative project built with passion.',
      category: category || 'Web Development',
      duration: duration || '1-2 months',
      maxMembers: maxDevs,
      minMembers: minDevs,
      teamSize: {
        min: minDevs,
        max: maxDevs,
      },
      techStack: selectedSkills,
      requiredSkills: selectedSkills,
      wantedRoles: selectedRoles.length > 0 ? selectedRoles : ['FULL STACK'],
      requiredRoles: selectedRoles.length > 0 ? selectedRoles : ['FULL STACK'],
      interests: selectedInterests,
      icon: projectIcon,
      image: projectImage.trim() || null,
    };

    try {
      const result = await onSubmit(formData);
      if (result && result.success === false) {
        setSubmitError(result.error || (isEdit ? 'Failed to update project' : 'Failed to create project'));
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setSubmitError(err.message || (isEdit ? 'Failed to update project' : 'Failed to create project'));
      setIsSubmitting(false);
    }
  };

  const categoryTabOptions = [
    { id: 'all', label: 'All Tech' },
    { id: 'fullstack', label: 'Full Stack' },
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'mobile', label: 'Mobile' },
    { id: 'ai_ml', label: 'AI / ML' },
    { id: 'database', label: 'Database' },
    { id: 'devops', label: 'DevOps' },
    { id: 'languages', label: 'Languages' },
    { id: 'blockchain', label: 'Blockchain' },
    { id: 'design', label: 'UI / UX' },
  ];

  // ─── TOP WIZARD HEADER ──────────────────────────────────────
  const renderTopHeader = () => {
    let stepTitle = isEdit ? 'EDIT PROJECT SCOPE' : 'PROJECT SCOPE';
    if (step === 2) stepTitle = isEdit ? 'EDIT TECH STACK' : 'STACK & ARCHITECTURE';
    if (step === 3) stepTitle = isEdit ? 'EDIT TEAM' : 'CO-FOUNDER MATCHING';

    return (
      <View style={styles.topHeader}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBack}
          style={[styles.headerBackBtn, BRUTAL_SHADOWS.xs]}
        >
          <Text style={styles.headerBackArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerSubtitleRow}>
            <Text style={styles.headerSubtitleDevDate}>DEVDATE WIZARD</Text>
            <Text style={styles.headerSubtitleSlash}> // </Text>
            <Text style={styles.headerSubtitleDrafting}>{isEdit ? 'EDITING' : 'DRAFTING'}</Text>
          </View>
          <Text style={styles.headerMainTitle} numberOfLines={1}>
            STEP {step}: {stepTitle}
          </Text>
        </View>

        <View style={[styles.headerModeBadge, BRUTAL_SHADOWS.xs]}>
          <Text style={styles.headerModeBadgeText}>{isEdit ? 'EDIT' : 'NEW'}</Text>
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
            step === 1 && styles.trackerCircleActive,
            step > 1 && styles.trackerCircleDone,
          ]}
        >
          <Text
            style={[
              styles.trackerCircleText,
              (step === 1 || step > 1) && styles.trackerCircleTextActive,
            ]}
          >
            {step > 1 ? 'OK' : '1'}
          </Text>
        </View>
        <Text style={[styles.trackerLabel, step === 1 && styles.trackerLabelActive]}>
          1. SCOPE
        </Text>
      </View>

      {/* CONNECTOR 1-2 */}
      <View style={[styles.trackerLine, step >= 2 && styles.trackerLineDone]} />

      {/* STEP 2 */}
      <View style={styles.trackerNode}>
        <View
          style={[
            styles.trackerCircle,
            step === 2 && styles.trackerCircleActive,
            step > 2 && styles.trackerCircleDone,
          ]}
        >
          <Text
            style={[
              styles.trackerCircleText,
              (step === 2 || step > 2) && styles.trackerCircleTextActive,
            ]}
          >
            {step > 2 ? 'OK' : '2'}
          </Text>
        </View>
        <Text style={[styles.trackerLabel, step === 2 && styles.trackerLabelActive]}>
          2. STACK
        </Text>
      </View>

      {/* CONNECTOR 2-3 */}
      <View style={[styles.trackerLine, step === 3 && styles.trackerLineDone]} />

      {/* STEP 3 */}
      <View style={styles.trackerNode}>
        <View
          style={[
            styles.trackerCircle,
            step === 3 && styles.trackerCircleActive,
          ]}
        >
          <Text
            style={[
              styles.trackerCircleText,
              step === 3 && styles.trackerCircleTextActive,
            ]}
          >
            3
          </Text>
        </View>
        <Text style={[styles.trackerLabel, step === 3 && styles.trackerLabelActive]}>
          3. TEAM
        </Text>
      </View>
    </View>
  );

  // ─── STEP 1: PROJECT SCOPE ──────────────────────────────────
  const renderStep1 = () => (
    <View style={styles.stepBody}>
      {/* Scope Header Card */}
      <View style={[styles.stepIntroCard, BRUTAL_SHADOWS.card]}>
        <View style={styles.stepIntroRow}>
          <DoodleCode symbol="</>" bgColor={COLORS.yellow} color={COLORS.ink} style={styles.stepIntroBadge} />
          <View style={{ flex: 1 }}>
            <Text style={styles.stepIntroTitle}>
              {isEdit ? 'EDIT PROJECT SCOPE' : 'DEFINE YOUR PROJECT'}
            </Text>
            <Text style={styles.stepIntroSubtitle}>
              Tell developers what you're building and set team expectations.
            </Text>
          </View>
        </View>
      </View>

      {/* Field 1: Project Name */}
      <View style={[styles.fieldCard, BRUTAL_SHADOWS.xs]}>
        <View style={styles.fieldHeaderRow}>
          <Text style={styles.fieldLabel}>PROJECT NAME *</Text>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.promptPrefix}>&gt;_</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. DevDate, StudySync"
            placeholderTextColor={COLORS.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>
      </View>

      {/* Field 2: Project Description */}
      <View style={[styles.fieldCard, BRUTAL_SHADOWS.xs]}>
        <View style={styles.fieldHeaderRow}>
          <Text style={styles.fieldLabel}>PROJECT DESCRIPTION *</Text>
          <Text style={styles.charCount}>{description.length} / 500</Text>
        </View>
        <TextInput
          style={styles.textArea}
          placeholder="Describe your project, core architecture, and what problem it solves..."
          placeholderTextColor={COLORS.textMuted}
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
        <View style={styles.fieldHeaderRow}>
          <Text style={styles.fieldLabel}>CATEGORY</Text>
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
        <View style={styles.fieldHeaderRow}>
          <Text style={styles.fieldLabel}>ESTIMATED DURATION</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowDurationPicker(!showDurationPicker)}
          style={styles.dropdownTrigger}
        >
          <Text style={styles.dropdownValueText}>{duration}</Text>
          <Text style={styles.dropdownChevron}>▾</Text>
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
        <View style={styles.fieldHeaderRow}>
          <Text style={styles.fieldLabel}>TEAM SIZE RANGE</Text>
          <Text style={styles.fieldHint}>2-10 developers</Text>
        </View>

        <View style={styles.steppersContainer}>
          <View style={styles.stepperCol}>
            <Text style={styles.stepperLabel}>MIN MEMBERS</Text>
            <View style={styles.stepperBox}>
              <Text style={styles.stepperValue}>{minDevs}</Text>
              <View style={styles.stepperButtons}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (minDevs < maxDevs) setMinDevs(minDevs + 1);
                  }}
                  style={styles.stepperBtn}
                >
                  <Text style={styles.stepperArrow}>▲</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (minDevs > 1) setMinDevs(minDevs - 1);
                  }}
                  style={styles.stepperBtn}
                >
                  <Text style={styles.stepperArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.stepperCol}>
            <Text style={styles.stepperLabel}>MAX MEMBERS</Text>
            <View style={styles.stepperBox}>
              <Text style={styles.stepperValue}>{maxDevs}</Text>
              <View style={styles.stepperButtons}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (maxDevs < 10) setMaxDevs(maxDevs + 1);
                  }}
                  style={styles.stepperBtn}
                >
                  <Text style={styles.stepperArrow}>▲</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (maxDevs > minDevs) setMaxDevs(maxDevs - 1);
                  }}
                  style={styles.stepperBtn}
                >
                  <Text style={styles.stepperArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <Text style={styles.noteText}>NOTE: Maximum capacity cannot be smaller than minimum.</Text>
      </View>

      {/* Step 1 Bottom Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleNext}
        disabled={!canGoNext()}
        style={[
          styles.nextStepBtn,
          !canGoNext() && styles.nextStepBtnDisabled,
          BRUTAL_SHADOWS.button,
        ]}
      >
        <Text style={styles.nextStepBtnText}>NEXT: TECH STACK →</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── STEP 2: STACK & ARCHITECTURE ───────────────────────────
  const renderStep2 = () => (
    <View style={styles.stepBody}>
      {/* Header Card */}
      <View style={[styles.stepIntroCard, BRUTAL_SHADOWS.card]}>
        <View style={styles.stepIntroRow}>
          <DoodleStar size={20} color={COLORS.yellow} style={styles.stepIntroBadge} />
          <View style={{ flex: 1 }}>
            <Text style={styles.stepIntroTitle}>REQUIRED TECH STACK</Text>
            <Text style={styles.stepIntroSubtitle}>
              Select the skills needed. Candidates are recommended based on stack compatibility.
            </Text>
          </View>
        </View>
        <View style={[styles.selectedCountBadge, BRUTAL_SHADOWS.xs]}>
          <Text style={styles.selectedCountText}>{selectedSkills.length} SKILLS SELECTED</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, BRUTAL_SHADOWS.xs]}>
        <Text style={styles.promptPrefix}>&gt;_</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search technologies, frameworks, aliases..."
          placeholderTextColor={COLORS.textMuted}
          value={skillSearch}
          onChangeText={setSkillSearch}
        />
        {skillSearch.length > 0 && (
          <TouchableOpacity onPress={() => setSkillSearch('')} style={styles.clearSearchBtn}>
            <Text style={styles.clearSearchText}>CLEAR</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabsScroll}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {categoryTabOptions.map((tab) => {
          const isActive = activeCategoryTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.8}
              onPress={() => setActiveCategoryTab(tab.id)}
              style={[
                styles.categoryTabPill,
                isActive && styles.categoryTabPillActive,
                BRUTAL_SHADOWS.xs,
              ]}
            >
              <Text
                style={[
                  styles.categoryTabPillText,
                  isActive && styles.categoryTabPillTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 2-Column Skills Grid */}
      <View style={styles.skillsGrid}>
        {filteredSkills.map((skill, index) => {
          const isSelected = selectedSkills.includes(String(skill.id));
          const theme = SKILL_THEMES[index % SKILL_THEMES.length];
          const badgeBg = skill.badge?.bg || theme.bg;
          const badgeTextColor = skill.badge?.color || COLORS.ink;
          const badgeGlyph = skill.badge?.text || skill.label.slice(0, 2).toUpperCase();

          return (
            <TouchableOpacity
              key={skill.id}
              activeOpacity={0.8}
              onPress={() => toggleSkill(skill.id)}
              style={[
                styles.skillSelectCard,
                isSelected && styles.skillSelectCardActive,
                BRUTAL_SHADOWS.xs,
              ]}
            >
              <View style={styles.skillSelectTop}>
                <View style={[styles.techGlyphBadge, { backgroundColor: badgeBg }]}>
                  <Text style={[styles.techGlyphText, { color: badgeTextColor }]}>
                    {badgeGlyph}
                  </Text>
                </View>
                <View
                  style={[
                    styles.checkCircle,
                    isSelected && styles.checkCircleActive,
                  ]}
                >
                  <Text style={styles.checkCircleText}>{isSelected ? 'OK' : '+'}</Text>
                </View>
              </View>

              <Text style={styles.skillSelectName} numberOfLines={1}>
                {skill.label}
              </Text>
              <Text style={styles.skillSelectSubtitle} numberOfLines={1}>
                {skill.subtitle || 'TECH'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Skills Drawer Bar */}
      {selectedSkills.length > 0 && (
        <View style={[styles.selectedDrawer, BRUTAL_SHADOWS.card]}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerHeaderTitle}>ACTIVE SELECTION</Text>
            <Text style={styles.drawerHeaderCount}>{selectedSkills.length} selected</Text>
          </View>
          <View style={styles.drawerChipsRow}>
            {selectedSkills.map((sId) => {
              const sk =
                allAvailableSkills.find((s) => s.id === sId) ||
                ALL_SKILLS.find((s) => s.id === sId);
              const label = sk ? (sk.label || sk.name) : sId;
              return (
                <TouchableOpacity
                  key={sId}
                  activeOpacity={0.8}
                  onPress={() => toggleSkill(sId)}
                  style={styles.selectedDrawerChip}
                >
                  <Text style={styles.selectedDrawerChipText}>{label}</Text>
                  <Text style={styles.selectedDrawerChipRemove}>X</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Step 2 Bottom Navigation */}
      <View style={styles.stepNavRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleBack}
          style={[styles.backStepBtn, BRUTAL_SHADOWS.xs]}
        >
          <Text style={styles.backStepBtnText}>← BACK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleNext}
          disabled={!canGoNext()}
          style={[
            styles.continueStepBtn,
            !canGoNext() && styles.nextStepBtnDisabled,
            BRUTAL_SHADOWS.button,
          ]}
        >
          <Text style={styles.continueStepBtnText}>NEXT: TEAM →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── STEP 3: CO FOUNDER MATCHING ────────────────────────────
  const renderStep3 = () => (
    <View style={styles.stepBody}>
      {/* Header Card */}
      <View style={[styles.stepIntroCard, BRUTAL_SHADOWS.card]}>
        <View style={styles.stepIntroRow}>
          <DoodleSparkle size={22} color={COLORS.yellow} style={styles.stepIntroBadge} />
          <View style={{ flex: 1 }}>
            <Text style={styles.stepIntroTitle}>TEAM & CO-FOUNDERS</Text>
            <Text style={styles.stepIntroSubtitle}>
              Specify wanted roles and technical interests for candidate matching.
            </Text>
          </View>
        </View>
      </View>

      {/* Section: Required Roles */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionHeaderTitle}>REQUIRED ROLES</Text>
        <Text style={styles.sectionSubCount}>{selectedRoles.length} selected</Text>
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
                styles.roleSelectCard,
                isSelected && styles.roleSelectCardActive,
                BRUTAL_SHADOWS.xs,
              ]}
            >
              <Text
                style={[
                  styles.roleSelectTitle,
                  isSelected && styles.roleSelectTitleActive,
                ]}
                numberOfLines={1}
              >
                {rc.title}
              </Text>
              <Text
                style={[
                  styles.roleSelectSubtitle,
                  isSelected && styles.roleSelectSubtitleActive,
                ]}
                numberOfLines={1}
              >
                {rc.subtitle}
              </Text>

              <View
                style={[
                  styles.roleCheckIndicator,
                  isSelected && styles.roleCheckIndicatorActive,
                ]}
              >
                <Text style={styles.roleCheckIndicatorText}>{isSelected ? 'OK' : '+'}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Section: What Is Your Project About? */}
      <View style={[styles.fieldCard, BRUTAL_SHADOWS.xs]}>
        <Text style={styles.fieldLabel}>PROJECT THEMES & DOMAINS</Text>
        <Text style={styles.fieldHint}>Select topics of interest:</Text>

        <View style={styles.interestsWrap}>
          {PROJECT_INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            const activeColor = INTEREST_COLORS[interest] || COLORS.yellow;

            return (
              <TouchableOpacity
                key={interest}
                activeOpacity={0.8}
                onPress={() => toggleInterest(interest)}
                style={[
                  styles.interestChip,
                  isSelected && { backgroundColor: activeColor },
                  BRUTAL_SHADOWS.xs,
                ]}
              >
                {isSelected && <Text style={styles.interestCheckBullet}>● </Text>}
                <Text
                  style={[
                    styles.interestChipText,
                    isSelected && styles.interestChipTextActive,
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Section: Project Cover Image & Icon */}
      <View style={[styles.fieldCard, BRUTAL_SHADOWS.xs]}>
        <View style={styles.fieldHeaderRow}>
          <Text style={styles.fieldLabel}>PROJECT IMAGE & ICON (OPTIONAL)</Text>
        </View>

        <View style={styles.coverRow}>
          {projectImage.trim() ? (
            <View style={[styles.coverPreviewFrame, BRUTAL_SHADOWS.xs]}>
              <Image
                source={{ uri: projectImage.trim() }}
                style={styles.coverImagePreview}
                onError={() => {}}
              />
            </View>
          ) : (
            <View style={[styles.coverFallbackFrame, BRUTAL_SHADOWS.xs]}>
              <Text style={styles.coverFallbackIcon}>{projectIcon}</Text>
              <Text style={styles.coverFallbackCaption}>ICON</Text>
            </View>
          )}

          <View style={styles.coverInputsCol}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handlePickProjectImage}
              style={[styles.pickImageBtn, BRUTAL_SHADOWS.xs]}
            >
              <DoodleSparkle size={13} color={COLORS.ink} />
              <Text style={styles.pickImageBtnText}>
                {projectImage.trim() ? 'CHANGE IMAGE' : 'PICK IMAGE FROM GALLERY'}
              </Text>
            </TouchableOpacity>

            <View style={styles.coverActionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowIconPicker(!showIconPicker)}
                style={[styles.chooseIconBtn, BRUTAL_SHADOWS.xs]}
              >
                <Text style={styles.chooseIconBtnText}>
                  {showIconPicker ? 'HIDE ICONS' : 'SELECT ICON'}
                </Text>
              </TouchableOpacity>

              {projectImage.trim() ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setProjectImage('')}
                  style={styles.clearImageBtn}
                >
                  <Text style={styles.clearImageBtnText}>REMOVE</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        {/* Icon picker dropdown if toggled */}
        {showIconPicker && (
          <View style={styles.iconPickerRow}>
            {PROJECT_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                activeOpacity={0.8}
                onPress={() => {
                  setProjectIcon(icon);
                  setShowIconPicker(false);
                }}
                style={[
                  styles.iconPickerChip,
                  projectIcon === icon && styles.iconPickerChipActive,
                ]}
              >
                <Text style={styles.iconPickerChipText}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Verification Summary Banner */}
      <View style={[styles.verificationBanner, BRUTAL_SHADOWS.xs]}>
        <View style={styles.verificationTop}>
          <DoodleCheck size={14} color={COLORS.ink} style={{ marginRight: 6 }} />
          <Text style={styles.verificationTitle}>PROJECT SPEC VERIFIED</Text>
        </View>
        <Text style={styles.verificationSubtitle}>
          {title} • {selectedSkills.length} skills • {selectedRoles.length} roles open
        </Text>
      </View>

      {/* Error Message if Creation Rejected */}
      {submitError && (
        <View style={[styles.errorBanner, BRUTAL_SHADOWS.xs]}>
          <DoodleCross size={14} color={COLORS.coral} style={{ marginRight: 6 }} />
          <Text style={styles.errorBannerText}>{submitError}</Text>
        </View>
      )}

      {/* Step 3 Bottom Navigation */}
      <View style={styles.stepNavRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleBack}
          style={[styles.backStepBtn, BRUTAL_SHADOWS.xs]}
        >
          <Text style={styles.backStepBtnText}>← BACK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={[
            styles.submitProjectBtn,
            isSubmitting && { opacity: 0.6 },
            BRUTAL_SHADOWS.button,
          ]}
        >
          <Text style={styles.submitProjectBtnText}>
            {isSubmitting
              ? (isEdit ? 'SAVING...' : 'CREATING...')
              : isEdit
                ? 'SAVE CHANGES'
                : 'CREATE PROJECT'}
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
      <SafeAreaView style={styles.screenContainer} edges={['top', 'bottom', 'left', 'right']}>
        {renderTopHeader()}
        {renderStepTracker()}

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
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.creamBg,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    borderLeftWidth: Platform.OS === 'web' ? 2.5 : 0,
    borderRightWidth: Platform.OS === 'web' ? 2.5 : 0,
    borderColor: COLORS.ink,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  stepBody: {
    width: '100%',
  },

  // ─── TOP HEADER ─────────────────────────────────────────────
  topHeader: {
    backgroundColor: COLORS.yellow,
    borderBottomWidth: 2.5,
    borderColor: COLORS.ink,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'ios' ? 14 : 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackArrow: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.ink,
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
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  headerSubtitleSlash: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.inkMuted,
  },
  headerSubtitleDrafting: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  headerMainTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
  },
  headerModeBadge: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerModeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
  },

  // ─── STEP PROGRESS TRACKER ──────────────────────────────────
  trackerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderBottomWidth: 2,
    borderColor: COLORS.ink,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  trackerNode: {
    alignItems: 'center',
  },
  trackerCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  trackerCircleActive: {
    backgroundColor: COLORS.yellow,
    ...BRUTAL_SHADOWS.xs,
  },
  trackerCircleDone: {
    backgroundColor: COLORS.lime,
  },
  trackerCircleText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.inkMuted,
  },
  trackerCircleTextActive: {
    color: COLORS.ink,
  },
  trackerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  trackerLabelActive: {
    color: COLORS.ink,
    fontWeight: '900',
  },
  trackerLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.borderMuted,
    marginHorizontal: 8,
    marginBottom: 14,
  },
  trackerLineDone: {
    backgroundColor: COLORS.ink,
  },

  // ─── STEP INTRO CARD ────────────────────────────────────────
  stepIntroCard: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  stepIntroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepIntroBadge: {
    marginRight: 2,
  },
  stepIntroTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
  },
  stepIntroSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  selectedCountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.yellow,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 8,
  },
  selectedCountText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.ink,
  },

  // ─── FIELD CARDS ────────────────────────────────────────────
  fieldCard: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  fieldHint: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  charCount: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
  },

  // ─── INPUTS ─────────────────────────────────────────────────
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.creamLight,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
  },
  promptPrefix: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.ink,
  },
  textArea: {
    backgroundColor: COLORS.creamLight,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.ink,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // ─── DROPDOWNS ──────────────────────────────────────────────
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.creamLight,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownValueText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.ink,
  },
  dropdownChevron: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
  },
  dropdownMenu: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderRadius: 10,
    marginTop: 6,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.yellowHighlight,
  },
  dropdownItemText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.ink,
  },
  dropdownItemTextActive: {
    fontWeight: '900',
  },

  // ─── STEPPERS ───────────────────────────────────────────────
  steppersContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  stepperCol: {
    flex: 1,
  },
  stepperLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.creamLight,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.ink,
  },
  stepperButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperArrow: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.ink,
  },
  noteText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 8,
  },

  // ─── BUTTONS ────────────────────────────────────────────────
  nextStepBtn: {
    height: 46,
    backgroundColor: COLORS.yellow,
    borderWidth: 2.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  nextStepBtnDisabled: {
    opacity: 0.5,
  },
  nextStepBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  stepNavRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  backStepBtn: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backStepBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  continueStepBtn: {
    flex: 1.5,
    height: 44,
    backgroundColor: COLORS.yellow,
    borderWidth: 2.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueStepBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  submitProjectBtn: {
    flex: 1.5,
    height: 44,
    backgroundColor: COLORS.yellow,
    borderWidth: 2.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitProjectBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },

  // ─── STEP 2 SKILLS SELECTION ────────────────────────────────
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 42,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.ink,
  },
  clearSearchBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  clearSearchText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.inkMuted,
  },
  categoryTabsScroll: {
    marginBottom: 12,
  },
  categoryTabsContent: {
    gap: 8,
  },
  categoryTabPill: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  categoryTabPillActive: {
    backgroundColor: COLORS.yellow,
  },
  categoryTabPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.ink,
  },
  categoryTabPillTextActive: {
    fontWeight: '900',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  skillSelectCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 14,
    padding: 10,
  },
  skillSelectCardActive: {
    backgroundColor: COLORS.yellowHighlight,
  },
  skillSelectTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  techGlyphBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 4,
  },
  techGlyphText: {
    fontSize: 9,
    fontWeight: '900',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: COLORS.yellow,
  },
  checkCircleText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.ink,
  },
  skillSelectName: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
  },
  skillSelectSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  selectedDrawer: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  drawerHeaderTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  drawerHeaderCount: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
  },
  drawerChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectedDrawerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.yellowHighlight,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 6,
  },
  selectedDrawerChipText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
  },
  selectedDrawerChipRemove: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.coral,
  },

  // ─── STEP 3 ROLES & DOMAINS ─────────────────────────────────
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  sectionSubCount: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  roleSelectCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 14,
    padding: 10,
    position: 'relative',
  },
  roleSelectCardActive: {
    backgroundColor: COLORS.yellowHighlight,
  },
  roleSelectTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
  },
  roleSelectTitleActive: {
    color: COLORS.ink,
  },
  roleSelectSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  roleSelectSubtitleActive: {
    color: COLORS.inkMuted,
  },
  roleCheckIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCheckIndicatorActive: {
    backgroundColor: COLORS.yellow,
  },
  roleCheckIndicatorText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.ink,
  },

  interestsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.creamLight,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  interestCheckBullet: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.ink,
  },
  interestChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.ink,
  },
  interestChipTextActive: {
    fontWeight: '900',
  },

  coverRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  coverPreviewFrame: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.creamDark,
  },
  coverImagePreview: {
    width: '100%',
    height: '100%',
  },
  coverFallbackFrame: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderRadius: 10,
    backgroundColor: COLORS.yellowHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverFallbackIcon: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.ink,
  },
  coverFallbackCaption: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.inkMuted,
    marginTop: 2,
  },
  coverInputsCol: {
    flex: 1,
  },
  pickImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.yellow,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 6,
  },
  pickImageBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
  },
  coverUrlInput: {
    backgroundColor: COLORS.creamLight,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.ink,
    marginBottom: 6,
  },
  coverActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chooseIconBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chooseIconBtnText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.ink,
  },
  clearImageBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearImageBtnText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.coral,
  },
  iconPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: COLORS.borderLight,
  },
  iconPickerChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  iconPickerChipActive: {
    backgroundColor: COLORS.yellow,
  },
  iconPickerChipText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
  },

  verificationBanner: {
    backgroundColor: COLORS.creamLight,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  verificationTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  verificationTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  verificationSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pillCoral,
    borderWidth: 1.5,
    borderColor: COLORS.coral,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.coral,
  },
});
