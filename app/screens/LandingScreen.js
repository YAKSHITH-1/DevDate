import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, BORDER_RADIUS, BRUTAL_SHADOWS } from '../styles/theme';
import ComicBadge from '../components/ComicBadge';
import { useApp } from '../context/AppContext';

export default function LandingScreen({ onGetStarted }) {
  const { login, register } = useApp();

  // Auth Screen State: 'landing' | 'login' | 'signup'
  const [currentView, setCurrentView] = useState('landing');
  const [errorMessage, setErrorMessage] = useState(null);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup Form
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleOpenLogin = () => {
    setErrorMessage(null);
    setCurrentView('login');
  };

  const handleOpenRegister = () => {
    setErrorMessage(null);
    setCurrentView('signup');
  };

  const handleBackToLanding = () => {
    setErrorMessage(null);
    setCurrentView('landing');
  };

  const handleAutoFillDemo = () => {
    setLoginEmail('rahul@devdate.io');
    setLoginPassword('build2026');
    setErrorMessage(null);
  };

  const handleAutoFillSampleSignup = () => {
    setRegName('Alex Chen');
    setRegRole('Backend Developer');
    setRegEmail('alex@devdate.io');
    setRegPassword('build2026');
    setErrorMessage(null);
  };

  const handleLoginSubmit = () => {
    const res = login(loginEmail, loginPassword);
    if (!res.success) {
      setErrorMessage(res.error);
    } else {
      onGetStarted();
    }
  };

  const handleRegisterSubmit = () => {
    const res = register({
      name: regName,
      role: regRole,
      email: regEmail,
      password: regPassword,
    });
    if (!res.success) {
      setErrorMessage(res.error);
    } else {
      onGetStarted();
    }
  };

  /* ==================== 1. LANDING COVER VIEW ==================== */
  if (currentView === 'landing') {
    return (
      <View style={styles.container}>
        {/* Ultra-High-Resolution Comic Cover Art */}
        <Image
          source={require('../assets/landing_cover_clean.png')}
          style={styles.coverImage}
          resizeMode="cover"
        />

        {/* Genuine Interactive React Native Buttons Container */}
        <SafeAreaView style={styles.bottomOverlay} edges={['bottom']}>
          <View style={styles.buttonsWrapper}>
            {/* Primary Button: GET STARTED (Opens Registration Flow) */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleOpenRegister}
              style={styles.getStartedButton}
              accessibilityRole="button"
              accessibilityLabel="Get Started"
            >
              <Text style={styles.getStartedText}>GET STARTED</Text>
            </TouchableOpacity>

            {/* Secondary Button: I ALREADY HAVE AN ACCOUNT (Opens Login Flow) */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleOpenLogin}
              style={styles.alreadyAccountButton}
              accessibilityRole="button"
              accessibilityLabel="I Already Have An Account"
            >
              <Text style={styles.alreadyAccountText}>I ALREADY HAVE AN ACCOUNT</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  /* ==================== 2. COMIC LOGIN SCREEN ==================== */
  if (currentView === 'login') {
    return (
      <ImageBackground
        source={require('../assets/comic_screen_bg.png')}
        style={styles.authScreenContainer}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.authSafeContainer} edges={['top', 'bottom']}>
          {/* Top Comic Navigation Bar */}
          <View style={styles.authTopHeader}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleBackToLanding}
              style={[styles.comicBackBtn, BRUTAL_SHADOWS.xs]}
            >
              <Text style={styles.comicBackBtnText}>← BACK</Text>
            </TouchableOpacity>

            <Image
              source={require('../assets/devdate_logo.png')}
              style={styles.authHeaderLogo}
              resizeMode="contain"
            />

            <ComicBadge
              text="VOL. 1: SIGN IN ⚡"
              color="#FFFFFF"
              textColor="#000000"
              size="sm"
              rotate="2deg"
            />
          </View>

          {/* Form Scroll Area */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
          >
            <ScrollView
              contentContainerStyle={styles.authScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Comic Speech Bubble Header */}
              <View style={styles.headerBadgeRow}>
                <ComicBadge
                  text="WELCOME BACK, DEV! ⚡"
                  color={COLORS.yellow}
                  textColor="#000000"
                  size="md"
                  rotate="-2deg"
                />
              </View>

              <Text style={styles.authSubtitle}>
                Sign in to check squad invites, continue project chats, and discover new co-founders!
              </Text>

              {/* Error Message Banner */}
              {errorMessage && (
                <View style={[styles.errorBanner, BRUTAL_SHADOWS.xs]}>
                  <Text style={styles.errorBannerText}>💥 OOPS! {errorMessage}</Text>
                </View>
              )}

              {/* Brutalist Form Card */}
              <View style={[styles.authCard, BRUTAL_SHADOWS.md]}>
                <View style={styles.cardDecalRow}>
                  <Text style={styles.cardDecalTag}>📁 SQUAD ACCESS TERMINAL</Text>
                  <View style={styles.cardDecalDot} />
                </View>

                {/* Email Address */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                  <TextInput
                    style={[styles.comicInput, BRUTAL_SHADOWS.xs]}
                    placeholder="dev@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={loginEmail}
                    onChangeText={(t) => {
                      setLoginEmail(t);
                      setErrorMessage(null);
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PASSWORD</Text>
                  <TextInput
                    style={[styles.comicInput, BRUTAL_SHADOWS.xs]}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    value={loginPassword}
                    onChangeText={(t) => {
                      setLoginPassword(t);
                      setErrorMessage(null);
                    }}
                    secureTextEntry
                  />
                </View>

                {/* Demo Autofill Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleAutoFillDemo}
                  style={[styles.demoAutofillPill, BRUTAL_SHADOWS.xs]}
                >
                  <Text style={styles.demoAutofillText}>⚡ AUTOFILL DEMO ACCOUNT (RAHUL)</Text>
                </TouchableOpacity>

                {/* Submit Action */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleLoginSubmit}
                  style={[styles.primaryAuthButton, styles.bgYellow, BRUTAL_SHADOWS.md]}
                >
                  <Text style={styles.primaryAuthButtonText}>LOG IN & START MATCHING 🚀</Text>
                </TouchableOpacity>

                {/* Switch to Signup */}
                <TouchableOpacity
                  onPress={() => {
                    setErrorMessage(null);
                    setCurrentView('signup');
                  }}
                  style={styles.switchAuthRow}
                >
                  <Text style={styles.switchAuthText}>
                    Don't have an account yet?{' '}
                    <Text style={styles.switchAuthHighlight}>Register here ➔</Text>
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Bottom Comic Decal Stamp */}
              <View style={styles.bottomDecalWrap}>
                <ComicBadge
                  text="100% COLLABORATIVE • ZERO BORING MEETINGS 👑"
                  color="#FAF6EB"
                  textColor="#000000"
                  size="sm"
                  rotate="1deg"
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  /* ==================== 3. COMIC SIGNUP SCREEN ==================== */
  return (
    <ImageBackground
      source={require('../assets/comic_screen_bg.png')}
      style={styles.authScreenContainer}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.authSafeContainer} edges={['top', 'bottom']}>
        {/* Top Comic Navigation Bar */}
        <View style={styles.authTopHeader}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleBackToLanding}
            style={[styles.comicBackBtn, BRUTAL_SHADOWS.xs]}
          >
            <Text style={styles.comicBackBtnText}>← BACK</Text>
          </TouchableOpacity>

          <Image
            source={require('../assets/devdate_logo.png')}
            style={styles.authHeaderLogo}
            resizeMode="contain"
          />

          <ComicBadge
            text="VOL. 1: SQUAD UP 🚀"
            color={COLORS.cyan}
            textColor="#000000"
            size="sm"
            rotate="-2deg"
          />
        </View>

        {/* Form Scroll Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.authScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Comic Speech Bubble Header */}
            <View style={styles.headerBadgeRow}>
              <ComicBadge
                text="JOIN THE SQUAD! 🚀"
                color={COLORS.cyan}
                textColor="#000000"
                size="md"
                rotate="2deg"
              />
            </View>

            <Text style={styles.authSubtitle}>
              Create your developer profile, match on project skills, and find co-founders to build with!
            </Text>

            {/* Error Message Banner */}
            {errorMessage && (
              <View style={[styles.errorBanner, BRUTAL_SHADOWS.xs]}>
                <Text style={styles.errorBannerText}>💥 OOPS! {errorMessage}</Text>
              </View>
            )}

            {/* Brutalist Form Card */}
            <View style={[styles.authCard, BRUTAL_SHADOWS.md]}>
              <View style={styles.cardDecalRow}>
                <Text style={styles.cardDecalTag}>👑 NEW BUILDER PASSPORT</Text>
                <View style={[styles.cardDecalDot, { backgroundColor: '#38BDF8' }]} />
              </View>

              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>YOUR FULL NAME</Text>
                <TextInput
                  style={[styles.comicInput, BRUTAL_SHADOWS.xs]}
                  placeholder="e.g. Rahul Patel"
                  placeholderTextColor="#9CA3AF"
                  value={regName}
                  onChangeText={(t) => {
                    setRegName(t);
                    setErrorMessage(null);
                  }}
                />
              </View>

              {/* Primary Role */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PRIMARY ROLE</Text>
                <TextInput
                  style={[styles.comicInput, BRUTAL_SHADOWS.xs]}
                  placeholder="e.g. Full Stack Developer, UI/UX, Backend"
                  placeholderTextColor="#9CA3AF"
                  value={regRole}
                  onChangeText={(t) => {
                    setRegRole(t);
                    setErrorMessage(null);
                  }}
                />
              </View>

              {/* Email Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <TextInput
                  style={[styles.comicInput, BRUTAL_SHADOWS.xs]}
                  placeholder="dev@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={regEmail}
                  onChangeText={(t) => {
                    setRegEmail(t);
                    setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <TextInput
                  style={[styles.comicInput, BRUTAL_SHADOWS.xs]}
                  placeholder="At least 4 characters"
                  placeholderTextColor="#9CA3AF"
                  value={regPassword}
                  onChangeText={(t) => {
                    setRegPassword(t);
                    setErrorMessage(null);
                  }}
                  secureTextEntry
                />
              </View>

              {/* Sample Profile Autofill Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleAutoFillSampleSignup}
                style={[styles.demoAutofillPill, BRUTAL_SHADOWS.xs]}
              >
                <Text style={styles.demoAutofillText}>⚡ AUTOFILL SAMPLE PROFILE (ALEX CHEN)</Text>
              </TouchableOpacity>

              {/* Submit Action */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleRegisterSubmit}
                style={[styles.primaryAuthButton, styles.bgCyan, BRUTAL_SHADOWS.md]}
              >
                <Text style={styles.primaryAuthButtonText}>SIGN UP & START BUILDING ★</Text>
              </TouchableOpacity>

              {/* Switch to Login */}
              <TouchableOpacity
                onPress={() => {
                  setErrorMessage(null);
                  setCurrentView('login');
                }}
                style={styles.switchAuthRow}
              >
                <Text style={styles.switchAuthText}>
                  Already have an account?{' '}
                  <Text style={styles.switchAuthHighlight}>Log in here ➔</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Comic Decal Stamp */}
            <View style={styles.bottomDecalWrap}>
              <ComicBadge
                text="NO SOLO DEV LEFT BEHIND • TEAM UP TODAY ⚡"
                color="#FAF6EB"
                textColor="#000000"
                size="sm"
                rotate="-1deg"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071224',
    position: 'relative',
    overflow: 'hidden',
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  buttonsWrapper: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 28,
    alignItems: 'center',
  },
  getStartedButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFCC00',
    borderRadius: 28,
    borderWidth: 3.5,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    marginBottom: 12,
  },
  getStartedText: {
    color: '#000000',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'Impact' : undefined,
  },
  alreadyAccountButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alreadyAccountText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textDecorationLine: 'underline',
    textDecorationColor: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },

  // Auth Full Screens (Login & Signup)
  authScreenContainer: {
    flex: 1,
  },
  authSafeContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  authTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    borderBottomWidth: 3.5,
    borderBottomColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  comicBackBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  comicBackBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  authHeaderLogo: {
    width: 110,
    height: 36,
  },
  keyboardAvoid: {
    flex: 1,
  },
  authScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerBadgeRow: {
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    maxWidth: 320,
  },
  errorBanner: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FEE2E2',
    borderWidth: 2.5,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
  },
  errorBannerText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '900',
  },
  authCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderWidth: 3.5,
    borderColor: '#000000',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },
  cardDecalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 8,
    marginBottom: 14,
  },
  cardDecalTag: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.8,
  },
  cardDecalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  comicInput: {
    height: 46,
    backgroundColor: '#FAF6EB',
    borderWidth: 2.5,
    borderColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  demoAutofillPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 14,
  },
  demoAutofillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0369A1',
    letterSpacing: 0.4,
  },
  primaryAuthButton: {
    height: 52,
    borderRadius: 26,
    borderWidth: 3.5,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  bgYellow: {
    backgroundColor: '#FFCC00',
  },
  bgCyan: {
    backgroundColor: '#38BDF8',
  },
  primaryAuthButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.8,
  },
  switchAuthRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchAuthText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  switchAuthHighlight: {
    fontWeight: '900',
    color: '#000000',
    textDecorationLine: 'underline',
  },
  bottomDecalWrap: {
    marginTop: 4,
    alignItems: 'center',
  },
});
