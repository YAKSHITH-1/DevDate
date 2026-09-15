import React, { useState, useEffect, useRef } from 'react';
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
import { POP_PALETTE, POP_SHADOWS, BORDER_RADIUS } from '../styles/theme';
import PopArtHalftoneView from '../components/PopArtHalftoneView';
import PopArtHeader from '../components/PopArtHeader';
import OtpSuccessModal from '../components/OtpSuccessModal';
import { useApp } from '../context/AppContext';

export default function LandingScreen({ onGetStarted }) {
  const { login, register } = useApp();

  // Screen flow: 'landing' | 'login' | 'signup' | 'otp'
  const [currentView, setCurrentView] = useState('landing');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('rahul.patel@stanford.edu');
  const [loginPassword, setLoginPassword] = useState('treehacks2025');
  const [rememberRig, setRememberRig] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Signup Form
  const [signupName, setSignupName] = useState('Alex Chen');
  const [signupEmail, setSignupEmail] = useState('alex.chen@stanford.edu');
  const [signupPassword, setSignupPassword] = useState('stanford2025');
  const [selectedRole, setSelectedRole] = useState('AI / ML');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // OTP Form
  const [otpDigits, setOtpDigits] = useState(['8', '4', '2', '0', '7', '1']);
  const [otpCountdown, setOtpCountdown] = useState(42);
  const otpInputRefs = useRef([]);

  // Live countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (currentView === 'otp' && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentView, otpCountdown]);

  // Navigation handlers
  const handleOpenLogin = () => {
    setErrorMessage(null);
    setCurrentView('login');
  };

  const handleOpenSignup = () => {
    setErrorMessage(null);
    setCurrentView('signup');
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (currentView === 'otp') {
      setCurrentView('login');
    } else {
      setCurrentView('landing');
    }
  };

  const handleLoginSubmit = () => {
    if (!loginEmail || !loginEmail.includes('@')) {
      setErrorMessage('Enter a valid campus (.edu) email');
      return;
    }
    setErrorMessage(null);
    setCurrentView('otp');
    setOtpCountdown(42);
  };

  const handleSignupSubmit = () => {
    if (!signupName.trim()) {
      setErrorMessage('Full name / alias is required');
      return;
    }
    if (!signupEmail.includes('@')) {
      setErrorMessage('Valid .edu campus email is required');
      return;
    }
    setErrorMessage(null);
    setCurrentView('otp');
    setOtpCountdown(42);
  };

  const handleOtpDigitChange = (value, index) => {
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    if (value && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleVerifyOtp = () => {
    setShowSuccessModal(true);
  };

  const handleEnterSquadDiscord = () => {
    setShowSuccessModal(false);
    if (currentView === 'signup') {
      register({
        name: signupName,
        email: signupEmail,
        role: selectedRole,
        password: signupPassword,
      });
    } else {
      login(loginEmail, loginPassword);
    }
    onGetStarted();
  };

  const handleViewSquadProfile = () => {
    setShowSuccessModal(false);
    login(loginEmail || signupEmail, 'password');
    onGetStarted();
  };

  /* ========================================================================= */
  /* 1. GET STARTED / LANDING COVER VIEW                                       */
  /* ========================================================================= */
  if (currentView === 'landing') {
    return (
      <View style={styles.container}>
        {/* Full-Cover Background Image with guaranteed rendering across Web & Native */}
        <ImageBackground
          source={require('../assets/landing_cover_clean.png')}
          style={styles.coverImageBackground}
          resizeMode="cover"
        >
          {/* Fallback & Web Image Tag */}
          <Image
            source={require('../assets/landing_cover_clean.png')}
            style={styles.coverImage}
            resizeMode="cover"
          />

          {/* Genuine Interactive Buttons Container */}
          <SafeAreaView style={styles.bottomOverlay} edges={['bottom']}>
            <View style={styles.buttonsWrapper}>
              {/* Primary Button: GET STARTED */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleOpenSignup}
                style={styles.getStartedButton}
                accessibilityRole="button"
                accessibilityLabel="Get Started"
              >
                <Text style={styles.getStartedText}>GET STARTED</Text>
              </TouchableOpacity>

              {/* Secondary Button: I ALREADY HAVE AN ACCOUNT */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleOpenLogin}
                style={styles.alreadyAccountButton}
                accessibilityRole="button"
                accessibilityLabel="I Already Have An Account"
              >
                <Text style={styles.alreadyAccountText}>
                  I ALREADY HAVE AN ACCOUNT
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  }

  /* ========================================================================= */
  /* 2. SHARED TOP HEADER FOR POP ART AUTH VIEWS                               */
  /* ========================================================================= */
  const renderHeader = () => {
    switch (currentView) {
      case 'signup':
        return (
          <PopArtHeader
            mode="signup"
            onBack={handleBack}
            rightBadgeText=" READY"
            powText="POW! ★ SQUAD UP"
            matchBadgeText=""
          />
        );
      case 'otp':
        return (
          <PopArtHeader
            mode="otp"
            onBack={handleBack}
            rightBadgeText="SECURE OTP"
            powText="POW! ★ 2-STEP RIG AUTH"
            matchBadgeText={`${otpCountdown}s EXPIRES`}
          />
        );
      case 'login':
      default:
        return (
          <PopArtHeader
            mode="login"
            onBack={handleBack}
            rightBadgeText="READY"
            powText="POW! ★ SQUAD UP"
            matchBadgeText=""
          />
        );
    }
  };

  return (
    <PopArtHalftoneView style={styles.fullScreenWrapper}>
      <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'bottom']}>
        {renderHeader()}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {errorMessage && (
              <View style={[styles.errorBox, POP_SHADOWS.xs]}>
                <Text style={styles.errorBoxText}> OOPS! {errorMessage}</Text>
              </View>
            )}

            {/* ============================================================== */}
            {/* VIEW A: LOGIN SCREEN ('ENTER THE LAB')                         */}
            {/* ============================================================== */}
            {currentView === 'login' && (
              <View style={[styles.popArtCard, POP_SHADOWS.md]}>
                {/* 1. Cyan Hero Header Section */}
                <View style={styles.cardCyanHeader}>
                  <View style={styles.cyanHeaderTopRow}>
                    <View style={styles.verifiedTagPill}>
                      <Text style={styles.verifiedTagText}> VERIFIED BUILDERS ONLY</Text>
                    </View>

                  </View>

                  <Text style={styles.comicHeroTitle}>ENTER THE LAB</Text>



                  <View style={[styles.bamSticker, POP_SHADOWS.xs]}>
                    <Text style={styles.bamStickerText}>BAM! ⚡</Text>
                  </View>
                </View>

                {/* 2. Dual Toggle Tabs */}
                <View style={styles.tabsContainer}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[styles.tabButton, styles.tabActive]}
                  >
                    <Text style={styles.tabActiveText}>➔] LOG IN</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleOpenSignup}
                    style={[styles.tabButton, styles.tabInactive]}
                  >
                    <Text style={styles.tabInactiveText}>👤+ SIGN UP</Text>
                  </TouchableOpacity>
                </View>

                {/* 3. Input 1: Campus Email or GitHub ID */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabelText}>CAMPUS EMAIL OR GITHUB ID</Text>

                  </View>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.terminalPrompt}>{'>_'}</Text>
                    <TextInput
                      style={styles.textInput}
                      value={loginEmail}
                      onChangeText={(t) => {
                        setLoginEmail(t);
                        setErrorMessage(null);
                      }}
                      placeholder="rahul.patel@stanford.edu"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />

                  </View>
                </View>

                {/* 4. Input 2: Access Key (Password) */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabelText}>ACCESS KEY (PASSWORD)</Text>
                    <TouchableOpacity onPress={() => alert('Demo Key: treehacks2025')}>
                      <Text style={styles.forgotKeyLink}>Forgot key?</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputWrapper}>

                    <TextInput
                      style={styles.textInput}
                      value={loginPassword}
                      onChangeText={(t) => {
                        setLoginPassword(t);
                        setErrorMessage(null);
                      }}
                      placeholder="••••••••••••"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Text style={styles.inputRightIcon}>{showPassword ? '🐵' : '👁️'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>


                {/* 6. Primary Action CTA: BLAST OFF TO CANVAS */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleLoginSubmit}
                  style={[styles.blastOffBtn, POP_SHADOWS.md]}
                  accessibilityRole="button"
                  accessibilityLabel="Blast off to Canvas"
                >
                  <Text style={styles.blastOffBtnText}>LOGIN</Text>
                </TouchableOpacity>



                {/* 9. Switch to Register Prompt Banner */}
                <View style={styles.promptBanner}>
                  <View style={styles.promptLeft}>
                    <View style={styles.exclamationCircle}>
                      <Text style={styles.exclamationText}>!</Text>
                    </View>
                    <Text style={styles.promptText}>New to the campus hack scene?</Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleOpenSignup}
                    style={styles.registerPillBtn}
                  >
                    <Text style={styles.registerPillText}>REGISTER ➔</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ============================================================== */}
            {/* VIEW B: SIGNUP SCREEN ('CLAIM YOUR RIG')                       */}
            {/* ============================================================== */}
            {currentView === 'signup' && (
              <View style={[styles.popArtCard, POP_SHADOWS.md]}>
                <View style={styles.cardCyanHeader}>
                  <View style={styles.cyanHeaderTopRow}>
                    <View style={styles.verifiedTagPill}>
                      <Text style={styles.verifiedTagText}>★ NEW BUILDER REGISTRATION</Text>
                    </View>

                  </View>

                  <Text style={styles.comicHeroTitle}>CLAIM YOUR RIG</Text>



                  <View style={[styles.bamSticker, POP_SHADOWS.xs]}>
                    <Text style={styles.bamStickerText}>BAM! ⚡</Text>
                  </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleOpenLogin}
                    style={[styles.tabButton, styles.tabInactive]}
                  >
                    <Text style={styles.tabInactiveText}>➔] LOG IN</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[styles.tabButton, styles.tabActive]}
                  >
                    <Text style={styles.tabActiveText}> SIGN UP</Text>
                  </TouchableOpacity>
                </View>

                {/* Input: Full Name */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabelText}>FULL NAME</Text>
                    <View style={styles.inlineYellowBadge}>
                      <Text style={styles.inlineYellowBadgeText}>DISPLAY NAME</Text>
                    </View>
                  </View>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.terminalPrompt}>{'>_'}</Text>
                    <TextInput
                      style={styles.textInput}
                      value={signupName}
                      onChangeText={(t) => {
                        setSignupName(t);
                        setErrorMessage(null);
                      }}
                      placeholder="Alex Chen"
                      placeholderTextColor="#9CA3AF"
                    />
                    <Text style={styles.inputRightIcon}></Text>
                  </View>
                </View>

                {/* Input: Campus Email */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabelText}> EMAIL</Text>

                  </View>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.terminalPrompt}>{'>_'}</Text>
                    <TextInput
                      style={styles.textInput}
                      value={signupEmail}
                      onChangeText={(t) => {
                        setSignupEmail(t);
                        setErrorMessage(null);
                      }}
                      placeholder="alex.chen@stanford.edu"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />

                  </View>
                </View>

                {/* Input: Password */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabelText}>CREATE ACCESS KEY (PASSWORD)</Text>

                  </View>
                  <View style={styles.inputWrapper}>

                    <TextInput
                      style={styles.textInput}
                      value={signupPassword}
                      onChangeText={(t) => {
                        setSignupPassword(t);
                        setErrorMessage(null);
                      }}
                      placeholder="••••••••••••"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Text style={styles.inputRightIcon}>{showPassword ? '👀' : '👁️'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Role Selector */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabelText}>PRIMARY HACKER TRACK / ROLE</Text>
                    <Text style={styles.pickOneText}>PICK ONE</Text>
                  </View>
                  <View style={styles.rolePillsGrid}>
                    {['FRONTEND', 'BACKEND', 'AI / ML', 'DESIGN'].map((role) => {
                      const isSelected = selectedRole === role;
                      return (
                        <TouchableOpacity
                          key={role}
                          activeOpacity={0.85}
                          onPress={() => setSelectedRole(role)}
                          style={[
                            styles.rolePill,
                            isSelected && styles.rolePillActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.rolePillText,
                              isSelected && styles.rolePillTextActive,
                            ]}
                          >
                            {role}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Agreement */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setAgreeTerms(!agreeTerms)}
                  style={styles.agreementRow}
                >

                </TouchableOpacity>

                {/* CTA */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSignupSubmit}
                  style={[styles.claimPassBtn, POP_SHADOWS.md]}
                  accessibilityRole="button"
                  accessibilityLabel="Claim your pass"
                >
                  <Text style={styles.claimPassBtnText}>Signup</Text>
                </TouchableOpacity>





              </View>
            )}

            {/* ============================================================== */}
            {/* VIEW C: OTP VERIFICATION SCREEN ('ENTER ACCESS CODE')          */}
            {/* ============================================================== */}
            {currentView === 'otp' && (
              <View style={[styles.popArtCard, POP_SHADOWS.md]}>
                <View style={styles.cardCyanHeader}>
                  <View style={styles.cyanHeaderTopRow}>
                    <View style={styles.verifiedTagPill}>
                      <Text style={styles.verifiedTagText}>★ SECURE PROTOCOL</Text>
                    </View>
                    <View style={[styles.verifiedTagPill, { backgroundColor: POP_PALETTE.pink }]}>
                      <Text style={[styles.verifiedTagText, { color: POP_PALETTE.pureWhite }]}>
                        DEVDATE #2026
                      </Text>
                    </View>
                  </View>

                  {/* Profile Preview Chip */}
                  <View style={styles.otpProfileChip}>
                    <View style={styles.otpAvatarContainer}>
                      <Image
                        source={{
                          uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
                        }}
                        style={styles.otpAvatar}
                      />
                      <View style={styles.otpGradBadge}>
                        <Text style={styles.otpGradText}>CS '26</Text>
                      </View>
                    </View>

                    <View style={styles.otpProfileInfo}>
                      <View style={styles.otpNameRow}>
                        <Text style={styles.otpProfileName}>RAHUL PATEL</Text>
                        <Text style={styles.otpVerifiedCheck}>✔</Text>
                      </View>
                      <Text style={styles.otpProjectText}>Project: AI Study Assistant</Text>
                      <Text style={styles.otpEmailText}>rahul.patel@stanford.edu</Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setCurrentView('login')}
                      style={styles.otpEditCircle}
                    >
                      <Text style={styles.otpEditIcon}>✏️</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.comicHeroTitle, { marginTop: 8 }]}>
                    ENTER ACCESS CODE
                  </Text>

                  <Text style={styles.otpRelaySubtext}>
                    Transmitted via Stanford 2FA Relay node to your verified inbox
                  </Text>

                  <View style={[styles.bamSticker, POP_SHADOWS.xs]}>
                    <Text style={styles.bamStickerText}>BAM! ⚡</Text>
                  </View>
                </View>

                {/* OTP Body */}
                <View style={styles.otpBodyContainer}>
                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabelText}>🪪 6-DIGIT RIG TOKEN:</Text>
                    <View style={styles.inlineYellowBadge}>
                      <Text style={styles.inlineYellowBadgeText}>CASE SENSITIVE</Text>
                    </View>
                  </View>

                  {/* 6 Digit Input Boxes */}
                  <View style={styles.otpTokensRow}>
                    {otpDigits.map((digit, idx) => {
                      const isFilled = idx < 4;
                      const isActive = idx === 4;
                      return (
                        <View
                          key={idx}
                          style={[
                            styles.otpBox,
                            isFilled && styles.otpBoxFilled,
                            isActive && styles.otpBoxActive,
                          ]}
                        >
                          <TextInput
                            ref={(el) => (otpInputRefs.current[idx] = el)}
                            style={[
                              styles.otpInputText,
                              isFilled && styles.otpInputTextFilled,
                            ]}
                            value={digit}
                            onChangeText={(val) => handleOtpDigitChange(val, idx)}
                            maxLength={1}
                            keyboardType="numeric"
                            textAlign="center"
                          />
                        </View>
                      );
                    })}
                  </View>

                  {/* Hardware Encrypted Status */}
                  <View style={styles.hardwareEncryptedRow}>

                    <View style={styles.onlineBadgePill}>
                      <Text style={styles.onlineBadgeText}>ONLINE</Text>
                    </View>
                  </View>

                  {/* Resend Row */}
                  <View style={styles.resendRow}>
                    <Text style={styles.didntCatchText}>Didn't catch it?</Text>
                    <View style={styles.resendActions}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setOtpCountdown(45)}
                        style={styles.resendPillBtn}
                      >
                        <Text style={styles.resendPillText}>
                          🔄 RESEND IN {otpCountdown}S
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity activeOpacity={0.8} style={styles.smsPillBtn}>
                        <Text style={styles.smsPillText}>SMS 💬</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Step Ribbon */}
                  <View style={styles.stepRibbonRow}>
                    <View style={styles.stepRibbonLeft}>
                      <View style={styles.stepBadgeCyan}>
                        <Text style={styles.stepBadgeCyanText}>AGENTIC RAG SQUAD</Text>
                      </View>
                      <View style={styles.stepBadgePink}>
                        <Text style={styles.stepBadgePinkText}>DEVDATE</Text>
                      </View>
                    </View>
                    <Text style={styles.stepCountText}>STEP 2 OF 2</Text>
                  </View>
                </View>

                {/* Primary Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleVerifyOtp}
                  style={[styles.claimPassBtn, POP_SHADOWS.md, { marginTop: 6 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Verify and blast off"
                >
                  <Text style={styles.claimPassBtnText}>🚀 VERIFY & BLAST OFF 🚀</Text>
                </TouchableOpacity>

                {/* Action Links */}
                <View style={styles.otpActionLinksRow}>
                  <TouchableOpacity onPress={() => setCurrentView('login')}>
                    <Text style={styles.returnLoginLink}>{'< RETURN TO RIG LOGIN'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => alert('Support dispatch sent to your terminal!')}>
                    <Text style={styles.needHelpLink}>NEED HELP? ⚡</Text>
                  </TouchableOpacity>
                </View>

                {/* TreeHacks Verified Stamp */}
                <View style={styles.treeHacksVerifiedBox}>
                  <View style={styles.treeHacksCirclesGroup}>
                    <View style={[styles.treeHacksCircle, { backgroundColor: '#38BDF8', zIndex: 3 }]} />
                    <View style={[styles.treeHacksCircle, { backgroundColor: '#F43F5E', marginLeft: -8, zIndex: 2 }]} />
                    <View style={[styles.treeHacksCircle, { backgroundColor: '#FACC15', marginLeft: -8, zIndex: 1 }]} />
                  </View>

                  <View style={styles.treeHacksTextCol}>
                    <Text style={styles.treeHacksPortalTitle}>DEVDATE PLATFORM 2026</Text>
                    <Text style={styles.treeHacksPortalSub}>End-to-End Encrypted Squad Portal</Text>
                  </View>

                  <View style={styles.verifiedYellowBadge}>
                    <Text style={styles.verifiedYellowText}>VERIFIED</Text>
                  </View>
                </View>
              </View>
            )}



            {/* Legal Pledge Footer */}
            <View style={styles.footerLegalWrap}>
              <Text style={styles.footerLegalText}>
                By launching, you pledge to abide by the{' '}
                <Text style={styles.footerUnderline}>Hacker Code of Conduct</Text> &{' '}
                <Text style={styles.footerUnderline}>Squad Collaboration Rules</Text>.
              </Text>
              <Text style={styles.footerTreeHacksTag}>
                DevDate
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Success Modal */}
        <OtpSuccessModal
          visible={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          onEnterDiscord={handleEnterSquadDiscord}
          onViewProfile={handleViewSquadProfile}
        />
      </SafeAreaView>
    </PopArtHalftoneView>
  );
}

const styles = StyleSheet.create({
  // 1. GET STARTED / COVER VIEW STYLES
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#071224',
    position: 'relative',
    overflow: 'hidden',
  },
  coverImageBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
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

  // 2. POP ART AUTH WRAPPER
  fullScreenWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeAreaContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // Error Banner
  errorBox: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FEE2E2',
    borderWidth: 2.5,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  errorBoxText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '900',
  },

  // Pop Art Card
  popArtCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: POP_PALETTE.pureWhite,
    borderWidth: 3.5,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 14,
  },

  // Cyan Header
  cardCyanHeader: {
    backgroundColor: POP_PALETTE.cyan,
    padding: 14,
    borderBottomWidth: 3.5,
    borderBottomColor: POP_PALETTE.inkBlack,
    position: 'relative',
  },
  cyanHeaderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  verifiedTagPill: {
    backgroundColor: POP_PALETTE.yellow,
    borderWidth: 2,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  verifiedTagText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    letterSpacing: 0.4,
  },
  gradCapCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: POP_PALETTE.pureWhite,
    borderWidth: 2,
    borderColor: POP_PALETTE.inkBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradCapIcon: {
    fontSize: 14,
  },
  comicHeroTitle: {
    fontSize: 26,
    fontWeight: '900',
    fontStyle: 'italic',
    color: POP_PALETTE.pureWhite,
    letterSpacing: 1.2,
    textAlign: 'center',
    textShadowColor: POP_PALETTE.inkBlack,
    textShadowOffset: { width: 2.5, height: 2.5 },
    textShadowRadius: 0,
    marginBottom: 6,
  },
  taglinePill: {
    alignSelf: 'center',
    backgroundColor: POP_PALETTE.pureWhite,
    borderWidth: 2,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  taglinePillText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    letterSpacing: 0.5,
  },
  bamSticker: {
    position: 'absolute',
    bottom: -14,
    right: 14,
    backgroundColor: POP_PALETTE.yellow,
    borderWidth: 2.2,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    transform: [{ rotate: '5deg' }],
    zIndex: 10,
  },
  bamStickerText: {
    fontSize: 11,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    fontStyle: 'italic',
  },

  // Toggle Tabs
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginTop: 18,
    marginBottom: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: POP_PALETTE.inkBlack,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    height: 42,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: POP_PALETTE.cyan,
    borderWidth: 2,
    borderColor: POP_PALETTE.inkBlack,
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabActiveText: {
    fontSize: 13,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    letterSpacing: 0.6,
  },
  tabInactiveText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.4,
  },

  // Form Inputs
  inputGroup: {
    marginHorizontal: 14,
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  inputLabelText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    letterSpacing: 0.6,
  },
  eduRequiredText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: POP_PALETTE.pink,
    letterSpacing: 0.4,
  },
  forgotKeyLink: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    textDecorationLine: 'underline',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#FAF6EB',
    borderWidth: 2.5,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  terminalPrompt: {
    fontSize: 13,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    marginRight: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  inputLeftIcon: {
    fontSize: 13,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 12.5,
    fontWeight: '700',
    color: POP_PALETTE.inkBlack,
    padding: 0,
  },
  inputRightIcon: {
    fontSize: 14,
    marginLeft: 6,
  },

  // Badges
  inlineYellowBadge: {
    backgroundColor: POP_PALETTE.yellow,
    borderWidth: 1.5,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  inlineYellowBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
  },
  inlineGreenBadge: {
    backgroundColor: POP_PALETTE.lime,
    borderWidth: 1.5,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  inlineGreenBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
  },
  pickOneText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6B7280',
  },

  // Role Pills
  rolePillsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  rolePill: {
    flex: 1,
    height: 36,
    backgroundColor: POP_PALETTE.pureWhite,
    borderWidth: 2.2,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: BORDER_RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rolePillActive: {
    backgroundColor: POP_PALETTE.yellow,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
  },
  rolePillTextActive: {
    fontWeight: '900',
  },

  // Agreement
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginBottom: 14,
  },
  agreementText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '800',
    color: POP_PALETTE.inkBlack,
    lineHeight: 14,
  },

  // Checkbox
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 14,
    marginBottom: 14,
  },
  checkboxTouch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: POP_PALETTE.inkBlack,
    backgroundColor: POP_PALETTE.pureWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkmarkIcon: {
    fontSize: 11,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    marginTop: -2,
  },
  checkboxLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: POP_PALETTE.inkBlack,
  },
  fastPassPill: {
    backgroundColor: POP_PALETTE.lime,
    borderWidth: 1.8,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  fastPassText: {
    fontSize: 9,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    letterSpacing: 0.5,
  },

  // CTA Buttons
  blastOffBtn: {
    marginHorizontal: 14,
    height: 48,
    backgroundColor: POP_PALETTE.cyan,
    borderWidth: 3.2,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: BORDER_RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  blastOffBtnText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    letterSpacing: 0.8,
  },
  claimPassBtn: {
    marginHorizontal: 14,
    height: 48,
    backgroundColor: POP_PALETTE.lime,
    borderWidth: 3.2,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: BORDER_RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  claimPassBtnText: {
    fontSize: 20.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    letterSpacing: 0.8,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginBottom: 12,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#D1D5DB',
  },
  dividerPill: {
    backgroundColor: POP_PALETTE.pureWhite,
    borderWidth: 1.8,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginHorizontal: 6,
  },
  dividerPillText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    letterSpacing: 0.4,
  },

  // Social SSO Pills
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 14,
    gap: 8,
    marginBottom: 14,
  },
  socialPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    backgroundColor: POP_PALETTE.pureWhite,
    borderWidth: 2.2,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 6,
    gap: 5,
  },
  socialIcon: {
    fontSize: 13,
  },
  socialPillText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
  },

  // Prompt Banner
  promptBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 14,
    marginBottom: 14,
    backgroundColor: '#FAF6EB',
    borderWidth: 2,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: 16,
    padding: 10,
  },
  promptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exclamationCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: POP_PALETTE.pink,
    borderWidth: 1.5,
    borderColor: POP_PALETTE.inkBlack,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  exclamationText: {
    fontSize: 11,
    fontWeight: '900',
    color: POP_PALETTE.pureWhite,
  },
  promptText: {
    fontSize: 10,
    fontWeight: '800',
    color: POP_PALETTE.inkBlack,
    flex: 1,
  },
  registerPillBtn: {
    backgroundColor: POP_PALETTE.lime,
    borderWidth: 2,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  registerPillText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
  },

  // OTP Profile Chip
  otpProfileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 2.5,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: 16,
    padding: 8,
    marginTop: 6,
  },
  otpAvatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  otpAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: POP_PALETTE.inkBlack,
  },
  otpGradBadge: {
    position: 'absolute',
    bottom: -3,
    alignSelf: 'center',
    backgroundColor: POP_PALETTE.lime,
    borderWidth: 1.2,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 0.5,
  },
  otpGradText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
  },
  otpProfileInfo: {
    flex: 1,
  },
  otpNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  otpProfileName: {
    fontSize: 12,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    letterSpacing: 0.4,
  },
  otpVerifiedCheck: {
    fontSize: 10,
    color: '#0284C7',
    fontWeight: '900',
    marginLeft: 4,
  },
  otpProjectText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: POP_PALETTE.inkBlack,
  },
  otpEmailText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
  },
  otpEditCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: POP_PALETTE.pureWhite,
    borderWidth: 1.8,
    borderColor: POP_PALETTE.inkBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpEditIcon: {
    fontSize: 11,
  },
  otpRelaySubtext: {
    fontSize: 9.5,
    fontWeight: '700',
    color: POP_PALETTE.inkBlack,
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 8,
  },
  otpBodyContainer: {
    padding: 14,
  },
  otpTokensRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 14,
    backgroundColor: POP_PALETTE.pureWhite,
    borderWidth: 2.5,
    borderColor: POP_PALETTE.inkBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    backgroundColor: POP_PALETTE.yellow,
  },
  otpBoxActive: {
    borderColor: POP_PALETTE.cyanDark,
    borderWidth: 3,
  },
  otpInputText: {
    fontSize: 20,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    width: '100%',
  },
  otpInputTextFilled: {
    color: POP_PALETTE.inkBlack,
  },
  hardwareEncryptedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  hwStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  hwStatusText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    letterSpacing: 0.4,
  },
  onlineBadgePill: {
    backgroundColor: POP_PALETTE.lime,
    borderWidth: 1.5,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  onlineBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  didntCatchText: {
    fontSize: 10,
    fontWeight: '800',
    color: POP_PALETTE.inkBlack,
  },
  resendActions: {
    flexDirection: 'row',
    gap: 6,
  },
  resendPillBtn: {
    backgroundColor: POP_PALETTE.pureWhite,
    borderWidth: 1.8,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  resendPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
  },
  smsPillBtn: {
    backgroundColor: POP_PALETTE.pureWhite,
    borderWidth: 1.8,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  smsPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
  },
  stepRibbonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1.5,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  stepRibbonLeft: {
    flexDirection: 'row',
    gap: 6,
  },
  stepBadgeCyan: {
    backgroundColor: POP_PALETTE.cyan,
    borderWidth: 1.5,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  stepBadgeCyanText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
  },
  stepBadgePink: {
    backgroundColor: POP_PALETTE.pink,
    borderWidth: 1.5,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  stepBadgePinkText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: POP_PALETTE.pureWhite,
  },
  stepCountText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#6B7280',
  },
  otpActionLinksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  returnLoginLink: {
    fontSize: 10,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    textDecorationLine: 'underline',
  },
  needHelpLink: {
    fontSize: 10,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
  },
  treeHacksVerifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF6EB',
    borderTopWidth: 2.5,
    borderTopColor: POP_PALETTE.inkBlack,
    padding: 10,
  },
  treeHacksCirclesGroup: {
    flexDirection: 'row',
    marginRight: 8,
  },
  treeHacksCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.2,
    borderColor: POP_PALETTE.inkBlack,
  },
  treeHacksTextCol: {
    flex: 1,
  },
  treeHacksPortalTitle: {
    fontSize: 9.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
  },
  treeHacksPortalSub: {
    fontSize: 8,
    fontWeight: '700',
    color: '#6B7280',
  },
  verifiedYellowBadge: {
    backgroundColor: POP_PALETTE.yellow,
    borderWidth: 1.5,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  verifiedYellowText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
  },

  // Social Proof Footer
  socialProofCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: POP_PALETTE.pureWhite,
    borderWidth: 2.5,
    borderColor: POP_PALETTE.inkBlack,
    borderRadius: 18,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarsGroup: {
    flexDirection: 'row',
    marginRight: 10,
  },
  proofAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: POP_PALETTE.inkBlack,
  },
  proofTextCol: {
    flex: 1,
  },
  proofNumber: {
    fontSize: 11,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    letterSpacing: 0.4,
  },
  proofSub: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#4B5563',
  },
  liveIndicatorPill: {
    backgroundColor: POP_PALETTE.inkBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveIndicatorText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: POP_PALETTE.lime,
    letterSpacing: 0.5,
  },

  // Legal Footer
  footerLegalWrap: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  footerLegalText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 6,
  },
  footerUnderline: {
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    textDecorationLine: 'underline',
  },
  footerTreeHacksTag: {
    fontSize: 9,
    fontWeight: '900',
    color: POP_PALETTE.inkBlack,
    letterSpacing: 0.6,
  },
});
