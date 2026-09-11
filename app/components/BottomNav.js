import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '../styles/theme';

export default function BottomNav({ activeTab, onTabChange, matchesCount = 3 }) {
  const tabs = [
    { id: 'discover', label: 'Discover', icon: '🔥' },
    { id: 'matches', label: 'Matches', icon: '💬', badge: matchesCount },
    { id: 'projects', label: 'Projects', icon: '📁' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <View style={styles.navContainer}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.75}
            onPress={() => onTabChange(tab.id)}
            style={styles.tabItem}
          >
            <View style={styles.iconContainer}>
              <Text
                style={[
                  styles.tabIcon,
                  isActive && styles.tabIconActive,
                ]}
              >
                {tab.icon}
              </Text>

              {tab.badge !== undefined && tab.badge > 0 && (
                <View style={styles.badgeCircle}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
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
    backgroundColor: '#FAF6EB',
    borderTopWidth: 2,
    borderTopColor: '#000000',
    paddingVertical: 8,
    height: 64,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.8,
  },
  tabIconActive: {
    fontSize: 22,
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    fontWeight: '900',
    color: '#000000',
  },
  badgeCircle: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 4,
    minWidth: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
