// DevDate Comic Reference Design System matching screen-ref.png exactly

import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const COLORS = {
  // Screen-ref exact palette
  creamBg: '#FAF6EB',
  white: '#FFFFFF',
  black: '#000000',
  darkInk: '#111827',
  cardBg: '#FFFFFF',

  // Buttons & Badges (from screen-ref Phone 2 & 4)
  btnRed: '#FF4B4B',
  btnGreen: '#4ADE80',
  btnBlue: '#93C5FD',
  btnYellow: '#FFDE00',
  yellowActive: '#FCD34D',
  greenOnline: '#22C55E',
  pillBlue: '#E0F2FE',
  pillBlueBorder: '#93C5FD',
  pillGreen: '#86EFAC',
  pillGreenBorder: '#22C55E',

  // Text colors
  textPrimary: '#000000',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',

  // Borders & Accents
  borderBlack: '#000000',
  borderLight: '#E5E7EB',

  // Pastels & Accents
  pastelYellow: '#FEF08A',
  pastelPurple: '#DDD6FE',
  pastelBlue: '#BAE6FD',
  pastelPink: '#FBCFE8',
  pastelGreen: '#BBF7D0',
  lightGray: '#F3F4F6',
  darkGray: '#1F2937',

  // Legacy compat
  primary: '#FFDE00',
  secondary: '#00C2CB',
  accent: '#FF4B4B',
  pink: '#FF4B4B',
  yellow: '#FFDE00',
  cyan: '#93C5FD',
  lime: '#4ADE80',
  background: '#FAF6EB',
  cardBackground: '#FFFFFF',
  text: '#000000',
  textInverse: '#FFFFFF',
  border: '#000000',
};

export const FONTS = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  '2xl': 26,
  pill: 9999,
};

export const BRUTAL_SHADOWS = {
  xs: isWeb
    ? { boxShadow: '2px 2px 0px #000000' }
    : {
      shadowColor: '#000000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 0,
    },
  sm: isWeb
    ? { boxShadow: '3px 3px 0px #000000' }
    : {
      shadowColor: '#000000',
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 0,
    },
  md: isWeb
    ? { boxShadow: '4px 4px 0px #000000' }
    : {
      shadowColor: '#000000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 0,
    },
  card: isWeb
    ? { boxShadow: '4px 4px 0px #000000' }
    : {
      shadowColor: '#000000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 0,
    },
};

export const SHADOWS = BRUTAL_SHADOWS;

export const COMIC_TEXT_SHADOW = {
  textShadowColor: '#000000',
  textShadowOffset: { width: 2, height: 2 },
  textShadowRadius: 0,
};

// Extracted Pop Art Comic Reference System (from CampusCollab / TreeHacks 2025 screens)
export const POP_PALETTE = {
  // Vibrant comic colors
  yellow: '#FFE600',
  yellowDark: '#EAB308',
  yellowGold: '#FACC15',
  cyan: '#00D2FF',
  cyanLight: '#BAE6FD',
  cyanDark: '#0284C7',
  pink: '#FF2E93',
  pinkLight: '#FCE7F3',
  pinkDark: '#DB2777',
  lime: '#4ADE80',
  limeNeon: '#22C55E',
  limeDark: '#16A34A',

  // Canvas & Structure
  canvasCream: '#FAF6EB',
  canvasCreamDark: '#F3EDDA',
  canvasDot: 'rgba(0, 0, 0, 0.12)',
  pureWhite: '#FFFFFF',
  inkBlack: '#000000',
  darkTape: '#09101D',

  // Badges & Accents
  stanfordRed: '#8C1515',
  ssoYellow: '#FFDE00',
  purplePastel: '#DDD6FE',
  bluePastel: '#E0F2FE',
  grayMuted: '#6B7280',
  grayLight: '#F3F4F6',
  grayInput: '#F9FAFB',
};

export const POP_SHADOWS = {
  xs: isWeb
    ? { boxShadow: '2px 2px 0px #000000' }
    : {
      shadowColor: '#000000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 0,
    },
  sm: isWeb
    ? { boxShadow: '3px 3px 0px #000000' }
    : {
      shadowColor: '#000000',
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 0,
    },
  md: isWeb
    ? { boxShadow: '4px 4px 0px #000000' }
    : {
      shadowColor: '#000000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 0,
    },
  lg: isWeb
    ? { boxShadow: '6px 6px 0px #000000' }
    : {
      shadowColor: '#000000',
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 0,
    },
  modal: isWeb
    ? { boxShadow: '8px 8px 0px #000000' }
    : {
      shadowColor: '#000000',
      shadowOffset: { width: 8, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 0,
    },
};

export const POP_TYPOGRAPHY = {
  heroHeader: {
    fontSize: 28,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    letterSpacing: 1.5,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2.5, height: 2.5 },
    textShadowRadius: 0,
    letterSpacing: 1.2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
};