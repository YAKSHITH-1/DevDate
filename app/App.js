import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from './styles/theme';

import HomeScreen from './screens/HomeScreen';
import MatchesScreen from './screens/MatchesScreen';
import ChatsScreen from './screens/ChatsScreen';
import ProfileScreen from './screens/ProfileScreen';
import BottomNav from './components/BottomNav';

export default function App() {
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'matches' | 'chats' | 'hero'

  const handleOpenChatFromMatches = (projectName) => {
    setActiveTab('chats');
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'discover':
        return (
          <HomeScreen
            onNavigateToMatches={() => setActiveTab('matches')}
            onNavigateToChat={() => setActiveTab('chats')}
          />
        );
      case 'matches':
        return (
          <MatchesScreen
            onOpenChat={handleOpenChatFromMatches}
          />
        );
      case 'chats':
        return <ChatsScreen />;
      case 'hero':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.yellow} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.container}>
          {/* Active Screen Body */}
          <View style={styles.screenWrapper}>{renderActiveScreen()}</View>

          {/* Pop Art Bottom Nav */}
          <BottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            matchesCount={2}
            chatsCount={2}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.yellow,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.creamBg,
  },
  screenWrapper: {
    flex: 1,
  },
});