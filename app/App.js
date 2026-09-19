import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated, Platform, ImageBackground, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './context/AppContext';
import { COLORS, SHELL, BRUTAL_SHADOWS, BORDERS } from './styles/theme';
import { DoodleCode, DoodleStar, DoodleSparkle } from './components/DoodleElements';

import LandingScreen from './screens/LandingScreen';
import HomeScreen from './screens/HomeScreen';
import ProjectsScreen from './screens/ProjectsScreen';
import MatchesScreen from './screens/MatchesScreen';
import ChatsScreen from './screens/ChatsScreen';
import ProfileScreen from './screens/ProfileScreen';
import BottomNav from './components/BottomNav';
import ComicHalftoneBackground from './components/ComicHalftoneBackground';

function MainNavigator() {
  const {
    isAuthenticated,
    authLoading,
    logout,
    invitations,
    chats,
    activeChatId,
    setActiveChatId,
    setSelectedDeveloperForProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState(isAuthenticated ? 'discover' : 'landing');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Sync auth state once session restoration completes
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && activeTab === 'landing') {
        setActiveTab('discover');
      } else if (!isAuthenticated && activeTab !== 'landing') {
        setActiveTab('landing');
      }
    }
  }, [isAuthenticated, authLoading]);

  // Smooth transition on tab switch
  useEffect(() => {
    fadeAnim.setValue(0.7);
    slideAnim.setValue(6);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [activeTab]);

  const handleOpenChat = (targetId) => {
    if (targetId) {
      setActiveChatId(targetId);
    }
    setActiveTab('chats');
  };

  const handleLogout = () => {
    logout();
    setActiveTab('landing');
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'landing':
        return (
          <LandingScreen
            onGetStarted={() => setActiveTab('discover')}
          />
        );
      case 'discover':
        return (
          <HomeScreen
            onNavigateToProjects={() => setActiveTab('projects')}
            onNavigateToMatches={() => setActiveTab('matches')}
            onNavigateToProfile={(dev) => {
              if (dev) setSelectedDeveloperForProfile(dev);
              setActiveTab('profile');
            }}
            onOpenChat={handleOpenChat}
          />
        );
      case 'projects':
        return (
          <ProjectsScreen
            onBackToDiscover={() => setActiveTab('discover')}
            onOpenChat={handleOpenChat}
            onSelectForDiscovery={() => setActiveTab('discover')}
          />
        );
      case 'matches':
        return (
          <MatchesScreen
            onOpenChat={handleOpenChat}
            onNavigateToSettings={() => {
              setSelectedDeveloperForProfile(null);
              setActiveTab('profile');
            }}
            onNavigateToProfile={(dev) => {
              if (dev) setSelectedDeveloperForProfile(dev);
              setActiveTab('profile');
            }}
          />
        );
      case 'chats':
        return (
          <ChatsScreen
            onBackToMatches={() => setActiveTab('matches')}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            onBackToDiscover={() => {
              setSelectedDeveloperForProfile(null);
              setActiveTab('discover');
            }}
            onOpenChat={handleOpenChat}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <HomeScreen
            onNavigateToProjects={() => setActiveTab('projects')}
            onNavigateToMatches={() => setActiveTab('matches')}
            onNavigateToProfile={(dev) => {
              if (dev) setSelectedDeveloperForProfile(dev);
              setActiveTab('profile');
            }}
            onOpenChat={handleOpenChat}
          />
        );
    }
  };

  if (authLoading) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={SHELL.loadingBg} />
        <View style={styles.loadingContainer}>
          {/* Doodle accents around loader */}
          <View style={styles.loadingDoodleTopLeft}>
            <DoodleCode symbol="</>" color="rgba(24, 24, 27, 0.08)" bgColor="transparent" />
          </View>
          <View style={styles.loadingDoodleBottomRight}>
            <DoodleStar size={14} color="rgba(255, 222, 0, 0.20)" />
          </View>

          {/* Central loading badge */}
          <View style={styles.loadingBadge}>
            <DoodleSparkle size={20} color={COLORS.yellow} />
            <Text style={styles.loadingText}>LOADING</Text>
          </View>
          <ActivityIndicator size="small" color={SHELL.loadingAccent} style={{ marginTop: 12 }} />
        </View>
      </SafeAreaProvider>
    );
  }

  const isLanding = activeTab === 'landing';

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FAF6EB"
      />
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: '#FAF6EB' },
        ]}
        edges={['top', 'left', 'right']}
      >
        <View style={styles.container}>
          <ComicHalftoneBackground />
          {/* Main Screen Body */}
          <Animated.View
            style={[
              styles.screenWrapper,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {renderActiveScreen()}
          </Animated.View>

          {/* Bottom Nav Bar (Hidden on landing screen) */}
          {!isLanding && (
            <BottomNav
              activeTab={activeTab === 'chats' ? 'matches' : activeTab}
              onTabChange={(tab) => {
                if (tab === 'profile' || tab === 'discover') {
                  setSelectedDeveloperForProfile(null);
                }
                setActiveTab(tab);
              }}
              matchesCount={invitations.length}
            />
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainNavigator />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAF6EB',
  },
  screenWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: SHELL.loadingBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    ...BRUTAL_SHADOWS.sm,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: COLORS.ink,
    textTransform: 'uppercase',
  },
  loadingDoodleTopLeft: {
    position: 'absolute',
    top: '25%',
    left: 24,
  },
  loadingDoodleBottomRight: {
    position: 'absolute',
    bottom: '25%',
    right: 28,
  },
});