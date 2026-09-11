import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, BORDER_RADIUS, BRUTAL_SHADOWS } from '../styles/theme';

export default function BottomNav({ activeTab, onTabChange, matchesCount = 3, chatsCount = 2 }) {
  const tabs = [
    { id: 'discover', label: 'DISCOVER', icon: '🎴' },
    { id: 'matches', label: 'MATCHES', icon: '❤️', badge: matchesCount },
    { id: 'chats', label: 'CHATS', icon: '💬', badge: chatsCount },
    { id: 'hero', label: 'HERO', icon: '👤' },
  ];

  return (
    <View style={styles.navContainer}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (isActive) {
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.85}
              onPress={() => onTabChange(tab.id)}
              style={[styles.activeTabPill, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.tabIconActive}>{tab.icon}</Text>
              <Text style={styles.tabLabelActive}>{tab.label}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.8}
            onPress={() => onTabChange(tab.id)}
            style={styles.tabItem}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.tabIconInactive}>{tab.icon}</Text>
              {tab.badge !== undefined && tab.badge > 0 && (
                <View style={[styles.badgePill, BRUTAL_SHADOWS.xs]}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>
            <Text style={styles.tabLabelInactive}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderTopWidth: 3.5,
    borderTopColor: COLORS.black,
    paddingVertical: 10,
    paddingHorizontal: 8,
    height: 70,
  },
  activeTabPill: {
    backgroundColor: COLORS.yellow,
    borderWidth: 2.5,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    fontSize: 16,
    marginBottom: 2,
  },
  tabLabelActive: {
    fontSize: FONTS.xs,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  tabIconInactive: {
    fontSize: 18,
    marginBottom: 2,
    opacity: 0.85,
  },
  tabLabelInactive: {
    fontSize: FONTS.xs,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: 0.3,
  },
  badgePill: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: COLORS.pink,
    borderWidth: 1.5,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.white,
  },
});
