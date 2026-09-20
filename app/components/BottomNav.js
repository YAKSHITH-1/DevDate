import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BORDERS, BRUTAL_SHADOWS, SHELL } from '../styles/theme';
import { DoodleUser, DoodleFolder, DoodleStar, DoodleUnderline } from './DoodleElements';

export default function BottomNav({ activeTab, onTabChange, matchesCount = 0 }) {
  const insets = useSafeAreaInsets();
  const tabs = [
    {
      id: 'discover',
      label: 'Discover',
      image: require('../assets/icons8-discover-100.png'),
    },
    {
      id: 'matches',
      label: 'Matches',
      image: require('../assets/match.png'),
      badge: matchesCount,
    },
    {
      id: 'projects',
      label: 'Projects',
      renderCustomIcon: (isActive) => (
        <DoodleFolder
          size={22}
          color={isActive ? COLORS.ink : SHELL.navInactiveColor}
          fillColor={isActive ? SHELL.navActiveBg : COLORS.white}
        />
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      renderCustomIcon: (isActive) => (
        <DoodleUser
          size={22}
          color={isActive ? COLORS.ink : SHELL.navInactiveColor}
          fillColor={isActive ? SHELL.navActiveBg : COLORS.white}
        />
      ),
    },
  ];

  return (
    <View
      style={[
        styles.navContainer,
        {
          paddingBottom: insets.bottom,
          height: SHELL.navHeight + insets.bottom,
        },
      ]}
    >
      {/* Decorative top border accent — doodle-style uneven line */}
      <View style={styles.topBorderAccent} />

      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.7}
              onPress={() => onTabChange(tab.id)}
              style={styles.tabItem}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              {/* Active background pill */}
              {isActive && <View style={styles.activePill} />}

              <View style={styles.iconLabelWrap}>
                <View style={styles.iconContainer}>
                  {tab.renderCustomIcon ? (
                    <View style={styles.customIconWrap}>
                      {tab.renderCustomIcon(isActive)}
                    </View>
                  ) : tab.image ? (
                    <Image
                      source={tab.image}
                      style={[
                        styles.tabImg,
                        isActive ? styles.tabImgActive : styles.tabImgInactive,
                      ]}
                      resizeMode="contain"
                    />
                  ) : null}

                  {/* Badge sticker */}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <View style={styles.badgeSticker}>
                      <Text style={styles.badgeText}>{tab.badge}</Text>
                    </View>
                  )}

                  {/* Sparkle accent on active tab */}
                  {isActive && (
                    <View style={styles.sparkleAccent}>
                      <DoodleStar size={8} color={COLORS.coral} />
                    </View>
                  )}
                </View>

                <Text
                  style={[
                    styles.tabLabel,
                    isActive && styles.tabLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>

                {/* Doodle underline on active tab */}
                {isActive && (
                  <View style={styles.underlineWrap}>
                    <DoodleUnderline
                      width={26}
                      height={3}
                      color={COLORS.yellow}
                    />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: COLORS.creamBg,
    height: SHELL.navHeight,
  },
  topBorderAccent: {
    height: BORDERS.regular,
    backgroundColor: COLORS.borderBlack,
    // Slightly uneven to feel hand-drawn
    marginHorizontal: -1,
    borderRadius: 1,
  },
  tabRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
    paddingTop: 6,
  },
  activePill: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 2,
    backgroundColor: COLORS.yellowHighlight,
    borderWidth: 1.5,
    borderColor: COLORS.borderBlack,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 14,
    ...BRUTAL_SHADOWS.xs,
  },
  iconLabelWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customIconWrap: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  tabImg: {
    width: 24,
    height: 24,
    marginBottom: 1,
  },
  tabImgActive: {
    opacity: 1,
    transform: [{ scale: 1.08 }],
  },
  tabImgInactive: {
    opacity: 0.45,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: SHELL.navInactiveColor,
    letterSpacing: 0.3,
    marginTop: 1,
  },
  tabLabelActive: {
    fontWeight: '800',
    color: SHELL.navActiveColor,
    letterSpacing: 0.4,
  },
  underlineWrap: {
    marginTop: 1,
    alignItems: 'center',
  },
  badgeSticker: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: COLORS.coral,
    borderWidth: 1.5,
    borderColor: COLORS.borderBlack,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 9,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 6,
    paddingHorizontal: 4,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...BRUTAL_SHADOWS.xs,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  sparkleAccent: {
    position: 'absolute',
    top: -4,
    right: -12,
  },
});

