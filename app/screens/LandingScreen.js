import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  BORDERS,
  BRUTAL_SHADOWS,
} from '../styles/theme';
import ComicBadge from '../components/ComicBadge';
import PopArtHeader from '../components/PopArtHeader';
import OtpSuccessModal from '../components/OtpSuccessModal';
import {
  DoodleStar,
  DoodleSparkle,
  DoodleCode,
  DoodleArrow,
  DoodleCheck,
  DoodleCross,
  DoodleUnderline,
  DoodleUser,
  DoodleSeparator,
} from '../components/DoodleElements';
import { useApp } from '../context/AppContext';
import { forgotPasswordApi, resetPasswordApi } from '../utils/api';
import { getDiceBearAvatar, resolveProfileAvatar } from '../utils/avatar';

/**
 * DevDate LandingScreen & Authentication System — Chunk 8 Redesign
 * Visual Language: Playful Developer Sketchbook + Pop Art Graphic Design + Modern Mobile Product
 * Zero Unicode Emojis.
 */
export default function LandingScreen({ onGetStarted }) {
  const { login, register, verifyEmail } = useApp();

  // Screen flow: 'landing' | 'login' | 'signup' | 'otp' | 'forgot_password' | 'reset_password'
  const [currentView, setCurrentView] = useState('landing');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberRig, setRememberRig] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Signup Form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('AI / ML');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // OTP Form
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationName, setVerificationName] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState(60);
  const otpInputRefs = useRef([]);

  // Forgot & Reset Password Forms
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

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
    setSuccessMessage(null);
    setCurrentView('login');
  };

  const handleOpenSignup = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setCurrentView('signup');
  };

  const handleOpenForgotPassword = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setForgotEmail(loginEmail || signupEmail || '');
    setCurrentView('forgot_password');
  };

  const handleOpenResetPassword = (token = '') => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (token) setResetToken(token);
    setCurrentView('reset_password');
  };

  const handleBack = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (currentView === 'otp') {
      setCurrentView('signup');
    } else if (currentView === 'forgot_password' || currentView === 'reset_password') {
      setCurrentView('login');
    } else {
      setCurrentView('landing');
    }
  };

  // ---------------------------------------------------------------------------
  // AUTH ACTION HANDLERS
  // ---------------------------------------------------------------------------
  const handleLoginSubmit = async () => {
    if (isSubmitting) return;
    if (!loginEmail || !loginEmail.includes('@')) {
      setErrorMessage('Enter a valid email address (e.g. user@gmail.com)');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Access key (password) is required');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        if (onGetStarted) {
          onGetStarted();
        }
      } else {
        const isUnverified =
          res.status === 403 ||
          (res.error && res.error.toLowerCase().includes('verify'));
        if (isUnverified) {
          setVerificationEmail(loginEmail.trim().toLowerCase());
          setOtpDigits(['', '', '', '', '', '']);
          setOtpCountdown(60);
          setErrorMessage('Please verify your email address. Enter the 6-digit code sent to your inbox.');
          setCurrentView('otp');
        } else {
          setErrorMessage(res.error || 'Invalid credentials. Please try again.');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to log in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async () => {
    if (isSubmitting) return;
    if (!signupName.trim()) {
      setErrorMessage('Full name / alias is required');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMessage('Valid email address (e.g. user@gmail.com) is required');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setErrorMessage('Access key must be at least 6 characters long');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the developer collaboration pledge');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await register({
        name: signupName.trim(),
        email: signupEmail.trim().toLowerCase(),
        role: selectedRole,
        password: signupPassword,
      });

      if (res.success) {
        setVerificationEmail(signupEmail.trim().toLowerCase());
        setVerificationName(signupName.trim());
        setOtpDigits(['', '', '', '', '', '']);
        setOtpCountdown(60);
        setCurrentView('otp');
      } else {
        setErrorMessage(res.error || 'Registration failed. Please check your information.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpDigitChange = (value, index) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setErrorMessage(null);

    // Support pasting the full code from email
    if (sanitized.length > 1) {
      const newDigits = [...otpDigits];
      const chars = sanitized.slice(0, 6).split('');
      chars.forEach((char, i) => {
        if (index + i < 6) {
          newDigits[index + i] = char;
        }
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(index + chars.length, 5);
      if (otpInputRefs.current[nextFocus]) {
        otpInputRefs.current[nextFocus].focus();
      }
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = sanitized.slice(-1);
    setOtpDigits(newDigits);

    if (sanitized && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent?.key === 'Backspace' && !otpDigits[index] && index > 0 && otpInputRefs.current[index - 1]) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async () => {
    if (isSubmitting) return;
    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code');
      return;
    }
    const targetEmail = verificationEmail || signupEmail || loginEmail;
    if (!targetEmail) {
      setErrorMessage('Email address missing. Please return to login.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await verifyEmail(targetEmail, otpCode);
      if (res.success) {
        setShowSuccessModal(true);
      } else {
        setErrorMessage(res.error || 'Invalid or expired verification code');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Verification request failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCountdown > 0 || isSubmitting) return;
    const targetEmail = verificationEmail || signupEmail || loginEmail;
    if (!targetEmail) {
      setErrorMessage('Email address missing. Please return to signup.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await register({
        name: verificationName || signupName || 'DevDate Builder',
        email: targetEmail,
        role: selectedRole,
        password: signupPassword || 'DevDate2026!',
      });
      if (res.success) {
        setOtpDigits(['', '', '', '', '', '']);
        setOtpCountdown(60);
        setSuccessMessage('A fresh verification code has been dispatched to your email.');
      } else {
        setErrorMessage(res.error || 'Failed to resend code');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resend code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSuccessModalDone = () => {
    setShowSuccessModal(false);
    const targetEmail = verificationEmail || signupEmail || loginEmail;
    if (targetEmail) {
      setLoginEmail(targetEmail);
    }
    setSuccessMessage('Email verified successfully! Please enter your access key to log in.');
    setCurrentView('login');
  };

  const handleForgotPasswordSubmit = async () => {
    if (isSubmitting) return;
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setErrorMessage('Please enter a valid registered email address');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await forgotPasswordApi(forgotEmail.trim().toLowerCase());
      if (res.success) {
        setSuccessMessage('If an account exists, a recovery token has been sent to your email.');
      } else {
        setErrorMessage(res.error || 'Unable to process recovery request.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Recovery request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (isSubmitting) return;
    if (!resetToken.trim()) {
      setErrorMessage('Please enter the recovery token from your email');
      return;
    }
    if (!resetPassword || resetPassword.length < 6) {
      setErrorMessage('New access key must be at least 6 characters long');
      return;
    }
    if (resetPassword !== confirmResetPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await resetPasswordApi({
        token: resetToken.trim(),
        password: resetPassword,
      });

      if (res.success) {
        setSuccessMessage('Access key successfully updated! Please log in with your new key.');
        setCurrentView('login');
      } else {
        setErrorMessage(res.error || 'Invalid or expired token.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Reset password failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ========================================================================= */
  /* 1. PLAYFUL SKETCHBOOK LANDING VIEW                                        */
  /* ========================================================================= */
  if (currentView === 'landing') {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.landingScroll}
          contentContainerStyle={styles.landingScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Brand Bar */}
          <View style={styles.topBrandBar}>
            <View style={styles.logoBadge}>
              <DoodleCode symbol="//" color={COLORS.ink} bgColor={COLORS.yellow} style={styles.logoCodeIcon} />
              <Text style={styles.logoText}>DEVDATE</Text>
            </View>

            <ComicBadge
              text="POW! // v1.0"
              color={COLORS.coral}
              textColor={COLORS.white}
              rotate="2deg"
              size="sm"
            />
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={[styles.heroPill, BRUTAL_SHADOWS.xs]}>
              <DoodleStar size={12} color={COLORS.ink} />
              <Text style={styles.heroPillText}>THE DEVELOPER SQUAD NETWORK</Text>
            </View>

            <Text style={styles.heroTitle}>
              MATCH.{' '}
              <Text style={{ color: COLORS.cyanDark || '#0284C7' }}>CODE.</Text>{' '}
              <Text style={{ color: COLORS.coral }}>SHIP.</Text>
            </Text>

            <DoodleUnderline width="75%" color={COLORS.yellow} height={4} style={{ marginVertical: 6 }} />

            <Text style={styles.heroSubtitle}>
              The matchmaking platform built for builders. Swipe on projects, squad up with compatible developers, and ship real software together.
            </Text>
          </View>

          {/* Sketchbook Graphic Area: Browser-like Frame */}
          <View style={[styles.sketchWindowFrame, BRUTAL_SHADOWS.md]}>
            {/* Window Top Bar with folder tab and dots */}
            <View style={styles.windowTopBar}>
              <View style={styles.windowDotsRow}>
                <View style={[styles.windowDot, { backgroundColor: COLORS.coral }]} />
                <View style={[styles.windowDot, { backgroundColor: COLORS.yellow }]} />
                <View style={[styles.windowDot, { backgroundColor: COLORS.lime }]} />
              </View>

              <View style={styles.windowTitlePill}>
                <DoodleCode symbol="rig.dev" color={COLORS.textMuted} bgColor={COLORS.white} style={styles.miniWindowCode} />
                <Text style={styles.windowTitleText}>devdate.local/squad-up</Text>
              </View>

              <DoodleSparkle size={14} color={COLORS.ink} />
            </View>

            {/* Window Sketch Content */}
            <View style={styles.windowContent}>
              {/* Co-founder Match Card Preview */}
              <View style={styles.previewCoFounders}>
                <View style={[styles.miniDevCard, BRUTAL_SHADOWS.xs]}>
                  <Image
                    source={{ uri: resolveProfileAvatar('', 'Maya Lin', 'voxel-bot') }}
                    style={styles.miniDevAvatar}
                  />
                  <Text style={styles.miniDevName}>MAYA LIN</Text>
                  <Text style={styles.miniDevRole}>Full Stack</Text>
                  <View style={[styles.miniTagPill, { backgroundColor: COLORS.cyan }]}>
                    <Text style={styles.miniTagText}>REACT</Text>
                  </View>
                </View>

                {/* Connection burst */}
                <View style={styles.matchBurstWrap}>
                  <View style={[styles.matchBurstCircle, BRUTAL_SHADOWS.xs]}>
                    <Text style={styles.matchBurstPercent}>96%</Text>
                    <Text style={styles.matchBurstLabel}>MATCH</Text>
                  </View>
                  <DoodleSparkle size={16} color={COLORS.yellow} style={styles.burstSparkle} />
                </View>

                <View style={[styles.miniDevCard, BRUTAL_SHADOWS.xs]}>
                  <Image
                    source={{ uri: resolveProfileAvatar('', 'Alex Chen', 'voxel-bot') }}
                    style={styles.miniDevAvatar}
                  />
                  <Text style={styles.miniDevName}>ALEX CHEN</Text>
                  <Text style={styles.miniDevRole}>Backend</Text>
                  <View style={[styles.miniTagPill, { backgroundColor: COLORS.lime }]}>
                    <Text style={styles.miniTagText}>PYTHON</Text>
                  </View>
                </View>
              </View>

              {/* Doodle annotation below cards */}
              <View style={styles.annotationBanner}>
                <DoodleStar size={12} color={COLORS.ink} />
                <Text style={styles.annotationText}>// 100% COLLAB-READY HACKERS</Text>
                <DoodleCode symbol="</>" color={COLORS.ink} bgColor={COLORS.white} style={styles.miniWindowCode} />
              </View>
            </View>
          </View>

          {/* Feature Highlight Pills */}
          <View style={styles.featuresRow}>
            <View style={[styles.featurePill, BRUTAL_SHADOWS.xs]}>
              <DoodleCheck size={11} color={COLORS.green} />
              <Text style={styles.featurePillText}>SWIPE DEVS</Text>
            </View>
            <View style={[styles.featurePill, BRUTAL_SHADOWS.xs]}>
              <DoodleCheck size={11} color={COLORS.green} />
              <Text style={styles.featurePillText}>3D VOXEL RIGS</Text>
            </View>
            <View style={[styles.featurePill, BRUTAL_SHADOWS.xs]}>
              <DoodleCheck size={11} color={COLORS.green} />
              <Text style={styles.featurePillText}>LIVE CHAT</Text>
            </View>
          </View>

          {/* Action CTAs */}
          <View style={styles.actionButtonsWrap}>
            {/* Primary Action Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleOpenSignup}
              style={[styles.primaryLandingBtn, BRUTAL_SHADOWS.md]}
              accessibilityRole="button"
              accessibilityLabel="Get Started"
            >
              <DoodleSparkle size={16} color={COLORS.ink} />
              <Text style={styles.primaryLandingBtnText}>GET STARTED</Text>
              <DoodleArrow direction="right" size={16} color={COLORS.ink} />
            </TouchableOpacity>

            {/* Secondary Action Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOpenLogin}
              style={[styles.secondaryLandingBtn, BRUTAL_SHADOWS.xs]}
              accessibilityRole="button"
              accessibilityLabel="I already have an account"
            >
              <Text style={styles.secondaryLandingBtnText}>
                I ALREADY HAVE AN ACCOUNT
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer note */}
          <View style={styles.landingFooter}>
            <DoodleSeparator style={{ marginBottom: 8 }} />
            <Text style={styles.landingFooterText}>
              DEV ENVIRONMENT // BUILT FOR HACKERS & CREATORS
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  /* ========================================================================= */
  /* 2. AUTH SCREEN HEADER                                                     */
  /* ========================================================================= */
  const renderHeader = () => {
    switch (currentView) {
      case 'signup':
        return (
          <PopArtHeader
            mode="signup"
            onBack={handleBack}
            rightBadgeText="REGISTER"
            powText="POW! // SQUAD UP"
            matchBadgeText=""
          />
        );
      case 'otp':
        return (
          <PopArtHeader
            mode="otp"
            onBack={handleBack}
            rightBadgeText="SECURE OTP"
            powText="POW! // 2-STEP AUTH"
            matchBadgeText={`${otpCountdown}s EXPIRES`}
          />
        );
      case 'forgot_password':
        return (
          <PopArtHeader
            mode="forgot"
            onBack={handleBack}
            rightBadgeText="RECOVERY"
            powText="POW! // RECOVER KEY"
            matchBadgeText=""
          />
        );
      case 'reset_password':
        return (
          <PopArtHeader
            mode="reset"
            onBack={handleBack}
            rightBadgeText="RESET"
            powText="POW! // NEW KEY"
            matchBadgeText=""
          />
        );
      case 'login':
      default:
        return (
          <PopArtHeader
            mode="login"
            onBack={handleBack}
            rightBadgeText="AUTHENTICATE"
            powText="POW! // SQUAD UP"
            matchBadgeText=""
          />
        );
    }
  };

  return (
    <View style={styles.container}>
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
            {/* Feedback Banners */}
            {errorMessage && (
              <View style={[styles.errorBox, BRUTAL_SHADOWS.xs]}>
                <DoodleCross size={14} color={COLORS.coral} style={{ marginRight: 6 }} />
                <Text style={styles.errorBoxText}>{errorMessage}</Text>
              </View>
            )}

            {successMessage && (
              <View style={[styles.successBox, BRUTAL_SHADOWS.xs]}>
                <DoodleCheck size={14} color={COLORS.green} style={{ marginRight: 6 }} />
                <Text style={styles.successBoxText}>{successMessage}</Text>
              </View>
            )}

            {/* ============================================================== */}
            {/* VIEW A: LOGIN SCREEN ('ENTER THE LAB')                         */}
            {/* ============================================================== */}
            {currentView === 'login' && (
              <View style={[styles.popArtCard, BRUTAL_SHADOWS.md]}>
                {/* 1. Header Ribbon Section */}
                <View style={styles.cardRibbonHeader}>
                  <View style={styles.ribbonTopRow}>
                    <View style={styles.verifiedTagPill}>
                      <Text style={styles.verifiedTagText}>VERIFIED BUILDERS ONLY</Text>
                    </View>
                  </View>

                  <Text style={styles.comicHeroTitle}>ENTER THE LAB</Text>
                  <Text style={styles.comicHeroSubtitle}>Sign in to squad up with developers & manage your rigs</Text>

                  <View style={[styles.bamSticker, BRUTAL_SHADOWS.xs]}>
                    <Text style={styles.bamStickerText}>BAM!</Text>
                  </View>
                </View>

                {/* 2. Dual Toggle Tabs */}
                <View style={styles.tabsContainer}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[styles.tabButton, styles.tabActive]}
                  >
                    <Text style={styles.tabActiveText}>LOG IN</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleOpenSignup}
                    style={[styles.tabButton, styles.tabInactive]}
                  >
                    <Text style={styles.tabInactiveText}>SIGN UP</Text>
                  </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View style={styles.cardBody}>
                  {/* Email Input */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabelText}>EMAIL ADDRESS</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.terminalPrompt}>{'>'}</Text>
                      <TextInput
                        style={styles.textInput}
                        value={loginEmail}
                        onChangeText={(t) => {
                          setLoginEmail(t);
                          setErrorMessage(null);
                        }}
                        placeholder="alex.chen@gmail.com"
                        placeholderTextColor={COLORS.textLight}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabelText}>ACCESS KEY (PASSWORD)</Text>
                      <TouchableOpacity onPress={handleOpenForgotPassword}>
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
                        placeholderTextColor={COLORS.textLight}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.toggleVisibilityBtn}
                      >
                        <Text style={styles.toggleVisibilityText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Remember Rig Checkbox */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setRememberRig(!rememberRig)}
                    style={styles.checkboxRow}
                  >
                    <View style={[styles.checkboxSquare, rememberRig && styles.checkboxSquareActive]}>
                      {rememberRig && <DoodleCheck size={11} color={COLORS.green} />}
                    </View>
                    <Text style={styles.checkboxLabel}>Remember my rig on this device</Text>
                  </TouchableOpacity>

                  {/* Primary Action Button */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleLoginSubmit}
                    disabled={isSubmitting}
                    style={[styles.primarySubmitBtn, BRUTAL_SHADOWS.sm, isSubmitting && { opacity: 0.75 }]}
                    accessibilityRole="button"
                    accessibilityLabel="Login"
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={COLORS.ink} size="small" />
                    ) : (
                      <>
                        <DoodleCheck size={14} color={COLORS.ink} />
                        <Text style={styles.primarySubmitBtnText}>LOG IN TO LAB</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Switch to Signup Prompt */}
                  <View style={styles.promptBanner}>
                    <Text style={styles.promptText}>New to the developer scene?</Text>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={handleOpenSignup}
                      style={[styles.registerPillBtn, BRUTAL_SHADOWS.xs]}
                    >
                      <Text style={styles.registerPillText}>REGISTER</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* ============================================================== */}
            {/* VIEW B: SIGNUP SCREEN ('CLAIM YOUR RIG')                       */}
            {/* ============================================================== */}
            {currentView === 'signup' && (
              <View style={[styles.popArtCard, BRUTAL_SHADOWS.md]}>
                <View style={[styles.cardRibbonHeader, { backgroundColor: COLORS.coral }]}>
                  <View style={styles.ribbonTopRow}>
                    <View style={styles.verifiedTagPill}>
                      <Text style={styles.verifiedTagText}>NEW BUILDER REGISTRATION</Text>
                    </View>
                  </View>

                  <Text style={[styles.comicHeroTitle, { color: COLORS.white }]}>CLAIM YOUR RIG</Text>
                  <Text style={[styles.comicHeroSubtitle, { color: COLORS.white }]}>
                    Create your profile, select your tracks, and squad up
                  </Text>

                  <View style={[styles.bamSticker, BRUTAL_SHADOWS.xs, { backgroundColor: COLORS.yellow }]}>
                    <Text style={styles.bamStickerText}>POW!</Text>
                  </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleOpenLogin}
                    style={[styles.tabButton, styles.tabInactive]}
                  >
                    <Text style={styles.tabInactiveText}>LOG IN</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[styles.tabButton, styles.tabActive]}
                  >
                    <Text style={styles.tabActiveText}>SIGN UP</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.cardBody}>
                  {/* Name Input */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabelText}>FULL NAME / ALIAS</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.terminalPrompt}>{'>'}</Text>
                      <TextInput
                        style={styles.textInput}
                        value={signupName}
                        onChangeText={(t) => {
                          setSignupName(t);
                          setErrorMessage(null);
                        }}
                        placeholder="Alex Chen"
                        placeholderTextColor={COLORS.textLight}
                      />
                    </View>
                  </View>

                  {/* Email Input */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabelText}>EMAIL ADDRESS</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.terminalPrompt}>{'>'}</Text>
                      <TextInput
                        style={styles.textInput}
                        value={signupEmail}
                        onChangeText={(t) => {
                          setSignupEmail(t);
                          setErrorMessage(null);
                        }}
                        placeholder="alex.chen@gmail.com"
                        placeholderTextColor={COLORS.textLight}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>
                  </View>

                  {/* Password Input */}
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
                        placeholder="At least 6 characters"
                        placeholderTextColor={COLORS.textLight}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.toggleVisibilityBtn}
                      >
                        <Text style={styles.toggleVisibilityText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
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
                      {['FRONTEND', 'BACKEND', 'AI / ML', 'DESIGN', 'MOBILE', 'FULLSTACK'].map((role) => {
                        const isSelected = selectedRole === role;
                        return (
                          <TouchableOpacity
                            key={role}
                            activeOpacity={0.85}
                            onPress={() => setSelectedRole(role)}
                            style={[
                              styles.rolePill,
                              isSelected && styles.rolePillActive,
                              isSelected && BRUTAL_SHADOWS.xs,
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

                  {/* Agreement Checkbox */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setAgreeTerms(!agreeTerms)}
                    style={styles.checkboxRow}
                  >
                    <View style={[styles.checkboxSquare, agreeTerms && styles.checkboxSquareActive]}>
                      {agreeTerms && <DoodleCheck size={11} color={COLORS.green} />}
                    </View>
                    <Text style={styles.checkboxLabel}>
                      I agree to collaborate honestly & build cool software
                    </Text>
                  </TouchableOpacity>

                  {/* Primary Action Button */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleSignupSubmit}
                    disabled={isSubmitting}
                    style={[styles.primarySubmitBtn, BRUTAL_SHADOWS.sm, isSubmitting && { opacity: 0.75 }]}
                    accessibilityRole="button"
                    accessibilityLabel="Create Account"
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={COLORS.ink} size="small" />
                    ) : (
                      <>
                        <DoodleStar size={14} color={COLORS.ink} />
                        <Text style={styles.primarySubmitBtnText}>CREATE ACCOUNT & VERIFY</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Switch to Login */}
                  <View style={styles.promptBanner}>
                    <Text style={styles.promptText}>Already registered?</Text>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={handleOpenLogin}
                      style={[styles.registerPillBtn, BRUTAL_SHADOWS.xs]}
                    >
                      <Text style={styles.registerPillText}>LOG IN</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* ============================================================== */}
            {/* VIEW C: OTP VERIFICATION SCREEN ('ENTER ACCESS CODE')          */}
            {/* ============================================================== */}
            {currentView === 'otp' && (
              <View style={[styles.popArtCard, BRUTAL_SHADOWS.md]}>
                <View style={[styles.cardRibbonHeader, { backgroundColor: COLORS.yellow }]}>
                  <View style={styles.ribbonTopRow}>
                    <View style={styles.verifiedTagPill}>
                      <Text style={styles.verifiedTagText}>2-STEP VERIFICATION</Text>
                    </View>
                    <View style={[styles.verifiedTagPill, { backgroundColor: COLORS.cyan }]}>
                      <Text style={styles.verifiedTagText}>DEVDATE #2026</Text>
                    </View>
                  </View>

                  {/* Profile Preview Chip */}
                  <View style={[styles.otpProfileChip, BRUTAL_SHADOWS.xs]}>
                    <Image
                      source={{
                        uri: resolveProfileAvatar('', verificationName || 'Builder', 'voxel-bot'),
                      }}
                      style={styles.otpAvatar}
                    />

                    <View style={styles.otpProfileInfo}>
                      <Text style={styles.otpProfileName} numberOfLines={1}>
                        {verificationName ? verificationName.toUpperCase() : 'NEW BUILDER'}
                      </Text>
                      <Text style={styles.otpEmailText} numberOfLines={1}>
                        {verificationEmail || signupEmail || loginEmail || 'builder@gmail.com'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setCurrentView(signupEmail ? 'signup' : 'login')}
                      style={[styles.otpEditCircle, BRUTAL_SHADOWS.xs]}
                    >
                      <Text style={styles.otpEditIcon}>EDIT</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.comicHeroTitle, { marginTop: 8 }]}>ENTER ACCESS CODE</Text>
                  <Text style={styles.comicHeroSubtitle}>
                    6-digit verification code transmitted to your inbox
                  </Text>
                </View>

                {/* OTP Body */}
                <View style={styles.cardBody}>
                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabelText}>6-DIGIT VERIFICATION TOKEN</Text>
                    <View style={styles.inlineYellowBadge}>
                      <Text style={styles.inlineYellowBadgeText}>NUMERIC</Text>
                    </View>
                  </View>

                  {/* 6 Digit Input Boxes */}
                  <View style={styles.otpTokensRow}>
                    {otpDigits.map((digit, idx) => {
                      const isFilled = Boolean(digit);
                      const isActive =
                        otpDigits.findIndex((d) => !d) === idx || (idx === 5 && isFilled);
                      return (
                        <View
                          key={idx}
                          style={[
                            styles.otpBox,
                            isFilled && styles.otpBoxFilled,
                            isActive && styles.otpBoxActive,
                            BRUTAL_SHADOWS.xs,
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
                            onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                            maxLength={1}
                            keyboardType="numeric"
                            textAlign="center"
                          />
                        </View>
                      );
                    })}
                  </View>

                  {/* Resend Row */}
                  <View style={styles.resendRow}>
                    <Text style={styles.didntCatchText}>Didn't receive it?</Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleResendOtp}
                      disabled={otpCountdown > 0 || isSubmitting}
                      style={[
                        styles.resendPillBtn,
                        (otpCountdown > 0 || isSubmitting) && { opacity: 0.65 },
                        BRUTAL_SHADOWS.xs,
                      ]}
                    >
                      <Text style={styles.resendPillText}>
                        {otpCountdown > 0 ? `RESEND IN ${otpCountdown}S` : 'RESEND CODE'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Primary Verify Button */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleVerifyOtp}
                    disabled={isSubmitting}
                    style={[styles.primarySubmitBtn, BRUTAL_SHADOWS.sm, { marginTop: 12 }, isSubmitting && { opacity: 0.75 }]}
                    accessibilityRole="button"
                    accessibilityLabel="Verify OTP"
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={COLORS.ink} size="small" />
                    ) : (
                      <>
                        <DoodleCheck size={14} color={COLORS.ink} />
                        <Text style={styles.primarySubmitBtnText}>VERIFY & SQUAD UP</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Action Link: Return */}
                  <TouchableOpacity
                    onPress={() => setCurrentView('login')}
                    style={styles.returnLoginLinkWrap}
                  >
                    <Text style={styles.returnLoginLink}>{'<- RETURN TO LOGIN'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ============================================================== */}
            {/* VIEW D: FORGOT PASSWORD ('RECOVER ACCESS KEY')                 */}
            {/* ============================================================== */}
            {currentView === 'forgot_password' && (
              <View style={[styles.popArtCard, BRUTAL_SHADOWS.md]}>
                <View style={[styles.cardRibbonHeader, { backgroundColor: COLORS.yellow }]}>
                  <View style={styles.ribbonTopRow}>
                    <View style={styles.verifiedTagPill}>
                      <Text style={styles.verifiedTagText}>KEY RECOVERY</Text>
                    </View>
                  </View>

                  <Text style={styles.comicHeroTitle}>RECOVER ACCESS KEY</Text>
                  <Text style={styles.comicHeroSubtitle}>
                    Enter your email to receive a password recovery token
                  </Text>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabelText}>REGISTERED EMAIL</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.terminalPrompt}>{'>'}</Text>
                      <TextInput
                        style={styles.textInput}
                        value={forgotEmail}
                        onChangeText={(t) => {
                          setForgotEmail(t);
                          setErrorMessage(null);
                        }}
                        placeholder="alex.chen@gmail.com"
                        placeholderTextColor={COLORS.textLight}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleForgotPasswordSubmit}
                    disabled={isSubmitting}
                    style={[styles.primarySubmitBtn, BRUTAL_SHADOWS.sm, isSubmitting && { opacity: 0.75 }]}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={COLORS.ink} size="small" />
                    ) : (
                      <>
                        <DoodleArrow direction="right" size={14} color={COLORS.ink} />
                        <Text style={styles.primarySubmitBtnText}>SEND RECOVERY TOKEN</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Have token shortcut */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleOpenResetPassword()}
                    style={[styles.secondarySubmitBtn, BRUTAL_SHADOWS.xs, { marginTop: 10 }]}
                  >
                    <Text style={styles.secondarySubmitBtnText}>I HAVE A TOKEN -> RESET KEY</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setCurrentView('login')}
                    style={styles.returnLoginLinkWrap}
                  >
                    <Text style={styles.returnLoginLink}>{'<- RETURN TO LOGIN'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ============================================================== */}
            {/* VIEW E: RESET PASSWORD ('SET NEW ACCESS KEY')                  */}
            {/* ============================================================== */}
            {currentView === 'reset_password' && (
              <View style={[styles.popArtCard, BRUTAL_SHADOWS.md]}>
                <View style={[styles.cardRibbonHeader, { backgroundColor: COLORS.cyan }]}>
                  <View style={styles.ribbonTopRow}>
                    <View style={styles.verifiedTagPill}>
                      <Text style={styles.verifiedTagText}>SECURE RESET</Text>
                    </View>
                  </View>

                  <Text style={styles.comicHeroTitle}>SET NEW ACCESS KEY</Text>
                  <Text style={styles.comicHeroSubtitle}>
                    Enter the token from your email and your new password
                  </Text>
                </View>

                <View style={styles.cardBody}>
                  {/* Token Input */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabelText}>RECOVERY TOKEN</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.textInput}
                        value={resetToken}
                        onChangeText={(t) => {
                          setResetToken(t);
                          setErrorMessage(null);
                        }}
                        placeholder="Paste token from email"
                        placeholderTextColor={COLORS.textLight}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  {/* New Password */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabelText}>NEW ACCESS KEY (PASSWORD)</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.textInput}
                        value={resetPassword}
                        onChangeText={(t) => {
                          setResetPassword(t);
                          setErrorMessage(null);
                        }}
                        placeholder="At least 6 characters"
                        placeholderTextColor={COLORS.textLight}
                        secureTextEntry={!showResetPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowResetPassword(!showResetPassword)}
                        style={styles.toggleVisibilityBtn}
                      >
                        <Text style={styles.toggleVisibilityText}>
                          {showResetPassword ? 'HIDE' : 'SHOW'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabelText}>CONFIRM NEW KEY</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.textInput}
                        value={confirmResetPassword}
                        onChangeText={(t) => {
                          setConfirmResetPassword(t);
                          setErrorMessage(null);
                        }}
                        placeholder="Re-enter new key"
                        placeholderTextColor={COLORS.textLight}
                        secureTextEntry={!showResetPassword}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleResetPasswordSubmit}
                    disabled={isSubmitting}
                    style={[styles.primarySubmitBtn, BRUTAL_SHADOWS.sm, isSubmitting && { opacity: 0.75 }]}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={COLORS.ink} size="small" />
                    ) : (
                      <>
                        <DoodleCheck size={14} color={COLORS.ink} />
                        <Text style={styles.primarySubmitBtnText}>UPDATE ACCESS KEY</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setCurrentView('login')}
                    style={styles.returnLoginLinkWrap}
                  >
                    <Text style={styles.returnLoginLink}>{'<- RETURN TO LOGIN'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Celebratory Modal on OTP Success */}
        <OtpSuccessModal
          visible={showSuccessModal}
          onClose={handleOtpSuccessModalDone}
          onEnterDiscord={handleOtpSuccessModalDone}
          onViewProfile={handleOtpSuccessModalDone}
          primaryButtonText="PROCEED TO LOGIN"
          secondaryButtonText="VIEW SQUAD DETAILS"
        />
      </SafeAreaView>
    </View>
  );
}

// ============================================================================
// STYLES — Pop Art x Doodle Art Aesthetic System
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.creamBg,
  },
  safeAreaContainer: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // ========= LANDING VIEW STYLES =========
  landingScroll: {
    flex: 1,
  },
  landingScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  topBrandBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoCodeIcon: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
    borderWidth: BORDERS.thin,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 1,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  heroPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.ink,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
    maxWidth: 340,
  },

  // Browser Frame
  sketchWindowFrame: {
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: 18,
  },
  windowTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    borderBottomWidth: BORDERS.regular,
    borderBottomColor: COLORS.borderBlack,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  windowDotsRow: {
    flexDirection: 'row',
    gap: 5,
  },
  windowDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.2,
    borderColor: COLORS.borderBlack,
  },
  windowTitlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  miniWindowCode: {
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
  },
  windowTitleText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.ink,
  },
  windowContent: {
    backgroundColor: COLORS.creamDark,
    padding: 14,
  },
  previewCoFounders: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  miniDevCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.md,
    padding: 8,
    alignItems: 'center',
  },
  miniDevAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    marginBottom: 4,
    backgroundColor: COLORS.creamDark,
  },
  miniDevName: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    textAlign: 'center',
  },
  miniDevRole: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  miniTagPill: {
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  miniTagText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: COLORS.ink,
  },
  matchBurstWrap: {
    alignItems: 'center',
    position: 'relative',
  },
  matchBurstCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchBurstPercent: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
    lineHeight: 13,
  },
  matchBurstLabel: {
    fontSize: 7.5,
    fontWeight: '900',
    color: COLORS.ink,
  },
  burstSparkle: {
    position: 'absolute',
    top: -8,
    right: -6,
  },
  annotationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  annotationText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },

  // Feature highlight pills
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  featurePillText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
  },

  // Action Buttons
  actionButtonsWrap: {
    gap: 10,
    marginBottom: 20,
  },
  primaryLandingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 14,
  },
  primaryLandingBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 1,
  },
  secondaryLandingBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 12,
  },
  secondaryLandingBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  landingFooter: {
    alignItems: 'center',
    marginTop: 6,
  },
  landingFooterText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },

  // ========= AUTH CARD & FORM STYLES =========
  popArtCard: {
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  cardRibbonHeader: {
    backgroundColor: COLORS.cyan,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.borderBlack,
    position: 'relative',
  },
  ribbonTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  verifiedTagPill: {
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  comicHeroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  comicHeroSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.ink,
    marginTop: 2,
  },
  bamSticker: {
    position: 'absolute',
    right: 14,
    bottom: -10,
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: 7,
    paddingVertical: 2,
    transform: [{ rotate: '8deg' }],
  },
  bamStickerText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    fontStyle: 'italic',
  },

  // Dual Tabs
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: BORDERS.regular,
    borderBottomColor: COLORS.borderBlack,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.yellow,
  },
  tabActiveText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  tabInactive: {
    backgroundColor: COLORS.creamDark,
  },
  tabInactiveText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
  },

  // Card Form Body
  cardBody: {
    padding: 16,
  },
  inputGroup: {
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
    color: COLORS.ink,
    letterSpacing: 0.4,
  },
  forgotKeyLink: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.coral,
    textDecorationLine: 'underline',
  },
  pickOneText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.creamBg,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 10,
    minHeight: 44,
  },
  terminalPrompt: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.coral,
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.ink,
    paddingVertical: 8,
  },
  toggleVisibilityBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xs,
  },
  toggleVisibilityText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.ink,
  },

  // Checkbox
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  checkboxSquare: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquareActive: {
    backgroundColor: COLORS.lime,
  },
  checkboxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.ink,
    flex: 1,
  },

  // Role selector pills
  rolePillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  rolePill: {
    backgroundColor: COLORS.creamBg,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rolePillActive: {
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.regular,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textMuted,
  },
  rolePillTextActive: {
    color: COLORS.ink,
  },

  // Action Buttons
  primarySubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 13,
    marginTop: 6,
  },
  primarySubmitBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  secondarySubmitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 11,
  },
  secondarySubmitBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
  },

  // Prompt banner
  promptBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.creamDark,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 14,
  },
  promptText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.ink,
  },
  registerPillBtn: {
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  registerPillText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: COLORS.ink,
  },

  // ========= OTP SPECIFIC STYLES =========
  otpProfileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.md,
    padding: 8,
    marginTop: 8,
    gap: 8,
  },
  otpAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: BORDERS.regular,
    borderColor: COLORS.borderBlack,
    backgroundColor: COLORS.creamDark,
  },
  otpProfileInfo: {
    flex: 1,
  },
  otpProfileName: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
  },
  otpEmailText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  otpEditCircle: {
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  otpEditIcon: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.ink,
  },
  inlineYellowBadge: {
    backgroundColor: COLORS.yellow,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  inlineYellowBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: COLORS.ink,
  },
  otpTokensRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginVertical: 10,
  },
  otpBox: {
    flex: 1,
    aspectRatio: 0.88,
    backgroundColor: COLORS.creamBg,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.borderBlack,
  },
  otpBoxFilled: {
    backgroundColor: COLORS.lime,
  },
  otpInputText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.ink,
    width: '100%',
    textAlign: 'center',
  },
  otpInputTextFilled: {
    color: COLORS.ink,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  didntCatchText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  resendPillBtn: {
    backgroundColor: COLORS.white,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.borderBlack,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  resendPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
  },
  returnLoginLinkWrap: {
    alignItems: 'center',
    marginTop: 14,
  },
  returnLoginLink: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.3,
  },

  // ========= FEEDBACK BANNERS =========
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: BORDERS.regular,
    borderColor: '#EF4444',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
  },
  errorBoxText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    color: '#991B1B',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: BORDERS.regular,
    borderColor: '#22C55E',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
  },
  successBoxText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
  },
});
