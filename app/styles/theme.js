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