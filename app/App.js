import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Animated, Platform, ImageBackground, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './context/AppContext';

import LandingScreen from './screens/LandingScreen';
import HomeScreen from './screens/HomeScreen';
import ProjectsScreen from './screens/ProjectsScreen';
import MatchesScreen from './screens/MatchesScreen';
import ChatsScreen from './screens/ChatsScreen';
import ProfileScreen from './screens/ProfileScreen';
import BottomNav from './components/BottomNav';

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
        <StatusBar barStyle="light-content" backgroundColor="#091830" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
        </View>
      </SafeAreaProvider>
    );
  }

  const isLanding = activeTab === 'landing';
  const ContainerComponent = isLanding ? View : ImageBackground;
  const containerProps = isLanding
    ? { style: styles.container }
    : {
        source: require('./assets/comic_screen_bg.png'),
        style: styles.container,
        resizeMode: 'cover',
      };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isLanding ? 'light-content' : 'dark-content'}
        backgroundColor={isLanding ? '#091830' : '#FAF6EB'}
      />
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: isLanding ? '#091830' : '#FAF6EB' },
        ]}
        edges={isLanding ? [] : ['top', 'left', 'right']}
      >
        <ContainerComponent {...containerProps}>
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
        </ContainerComponent>
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
    backgroundColor: '#091830',
    justifyContent: 'center',
    alignItems: 'center',
  },
});