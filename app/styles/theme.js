// DevDate Playful Pop Art x Doodle Art Design System
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const COLORS = {
  // Primary canvas (Warm Cream / Off-white)
  creamBg: '#FAF6EB',
  creamDark: '#F4EEDD',
  creamLight: '#FFFDF9',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',

  // Structural ink (Dark Charcoal / Near-Black)
  black: '#18181B',
  darkInk: '#18181B',
  ink: '#18181B',

  // Pop Art Primaries
  btnYellow: '#FFDE00',
  yellow: '#FFDE00',
  yellowHighlight: '#FEF08A',
  btnRed: '#FF4B4B',
  coral: '#FF4B4B',
  pink: '#FF4B4B',
  btnBlue: '#38BDF8',
  blue: '#38BDF8',
  cyan: '#38BDF8',
  btnGreen: '#22C55E',
  lime: '#4ADE80',
  green: '#22C55E',
  greenOnline: '#22C55E',

  // Secondary Pop Accents
  purple: '#A855F7',
  purplePastel: '#DDD6FE',
  orange: '#FB923C',
  orangePastel: '#FED7AA',
  bluePastel: '#E0F2FE',
  pinkPastel: '#FCE7F3',

  // Badges & Pills
  pillBlue: '#E0F2FE',
  pillBlueBorder: '#38BDF8',
  pillGreen: '#DCFCE7',
  pillGreenBorder: '#22C55E',
  pillYellow: '#FEF9C3',
  pillYellowBorder: '#FACC15',
  pillCoral: '#FEE2E2',
  pillCoralBorder: '#F87171',

  // Text Hierarchy
  textPrimary: '#18181B',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Borders
  borderBlack: '#18181B',
  borderDark: '#18181B',
  borderLight: '#E5E7EB',
  borderMuted: '#D1D5DB',

  // Neutral Grays
  lightGray: '#F3F4F6',
  mediumGray: '#E5E7EB',
  darkGray: '#1F2937',

  // Legacy compat aliases
  primary: '#FFDE00',
  secondary: '#38BDF8',
  accent: '#FF4B4B',
  background: '#FAF6EB',
  cardBackground: '#FFFFFF',
  text: '#18181B',
  border: '#18181B',
};

// Pop Palette (Maintained for backward compatibility and Pop Art tokens)
export const POP_PALETTE = {
  // Vibrant comic colors
  yellow: '#FFDE00',
  yellowDark: '#EAB308',
  yellowGold: '#FACC15',
  cyan: '#38BDF8',
  cyanLight: '#BAE6FD',
  cyanDark: '#0284C7',
  pink: '#FF4B4B',
  pinkLight: '#FCE7F3',
  pinkDark: '#DC2626',
  lime: '#4ADE80',
  limeNeon: '#22C55E',
  limeDark: '#16A34A',

  // Canvas & Structure
  canvasCream: '#FAF6EB',
  canvasCreamDark: '#F4EEDD',
  canvasDot: 'rgba(24, 24, 27, 0.08)',
  pureWhite: '#FFFFFF',
  inkBlack: '#18181B',
  darkTape: '#18181B',

  // Badges & Accents
  stanfordRed: '#991B1B',
  ssoYellow: '#FFDE00',
  purplePastel: '#DDD6FE',
  bluePastel: '#E0F2FE',
  grayMuted: '#6B7280',
  grayLight: '#F3F4F6',
  grayInput: '#F9FAFB',
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
  '4xl': 40,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  '2xl': 26,
  pill: 9999,
};

export const BORDERS = {
  hairline: 1,
  thin: 1.5,
  regular: 2,
  thick: 2.5,
  heavy: 3,
};

// Subtle, playful offset shadows
export const BRUTAL_SHADOWS = {
  none: isWeb
    ? { boxShadow: 'none' }
    : {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },
  xs: isWeb
    ? { boxShadow: '2px 2px 0px #18181B' }
    : {
        shadowColor: '#18181B',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0,
      },
  sm: isWeb
    ? { boxShadow: '3px 3px 0px #18181B' }
    : {
        shadowColor: '#18181B',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0,
      },
  md: isWeb
    ? { boxShadow: '4px 4px 0px #18181B' }
    : {
        shadowColor: '#18181B',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0,
      },
  sticker: isWeb
    ? { boxShadow: '3px 3px 0px #18181B' }
    : {
        shadowColor: '#18181B',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0,
      },
  card: isWeb
    ? { boxShadow: '3px 3px 0px #18181B' }
    : {
        shadowColor: '#18181B',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0,
      },
};

export const POP_SHADOWS = BRUTAL_SHADOWS;

// Typography System
export const TYPOGRAPHY = {
  // Display typography: playful rounded punch for major titles & empty states
  displayHero: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#18181B',
    textTransform: 'uppercase',
  },
  displaySection: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: '#18181B',
  },
  displayCard: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: '#18181B',
  },

  // Body typography: clean, modern, readable
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#374151',
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: '#18181B',
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#4B5563',
  },
  bodySmallMedium: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: '#18181B',
  },
  caption: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },

  // Button typography: bold, tactile, readable
  button: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  buttonSmall: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Developer code / doodle styling
  codeTag: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
};



// ── Global Shell Layout ──────────────────────────────────────────────
export const SHELL = {
  navHeight: 68,
  screenPaddingH: 16,
  navActiveColor: '#18181B',
  navInactiveColor: '#9CA3AF',
  navActiveBg: '#FFDE00',
  navActiveBorder: '#18181B',
  loadingBg: '#FAF6EB',
  loadingAccent: '#18181B',
};