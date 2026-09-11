// Pop Art / Neo-Brutalist Design System matching Screenshot 2026-09-10 222148.png

export const COLORS = {
  // Primary Pop Art Palette
  yellow: '#FFDE00',
  cyan: '#00C2CB',
  cyanLight: '#4DD8DE',
  pink: '#FF2A6D',
  pinkSoft: '#FF6B8B',
  lime: '#84CC16',
  limeBright: '#76FF03',
  orange: '#FF6B00',

  // Neutrals
  black: '#000000',
  white: '#FFFFFF',
  creamBg: '#FAF7E8',
  lightGray: '#F3F0E6',
  darkGray: '#262626',
  textSecondary: '#525252',

  // Semantics
  primary: '#FFDE00',
  secondary: '#00C2CB',
  accent: '#FF2A6D',
  success: '#84CC16',
  background: '#FAF7E8',
  cardBackground: '#FFFFFF',
  text: '#000000',
  textInverse: '#FFFFFF',
  border: '#000000',
};

export const FONTS = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 34,
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
  xl: 22,
  '2xl': 28,
  pill: 9999,
};

// Neo-Brutalist Solid Offset Drop Shadows (No Blur, Pure Ink Shadows)
export const BRUTAL_SHADOWS = {
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 7,
  },
};