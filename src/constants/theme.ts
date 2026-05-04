// ReturnX Theme Constants
export const COLORS = {
  primary: '#0A2540',
  accent: '#00C853',
  warning: '#FFD600',
  risk: '#FF5252',

  // Extended palette
  primaryLight: '#4DABF7',
  primaryDark: '#061829',
  accentLight: '#69F0AE',
  accentDark: '#00952E',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F8F9FA',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',

  // Semantic
  surface: '#112240',
  surfaceCard: '#1A3357',
  surfaceDark: '#071828',
  textPrimary: '#FFFFFF',
  textSecondary: '#8892B0',
  textMuted: '#4A6179',
  border: '#1E3A5F',
  divider: '#1A3357',

  // Risk levels
  conservative: '#00C853',
  moderate: '#FFD600',
  aggressive: '#FF5252',

  // Chart colors
  chart1: '#00C853',
  chart2: '#2979FF',
  chart3: '#FF6D00',
  chart4: '#AA00FF',
};

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    mono: 'System',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    loose: 1.8,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
};

export const RISK_THRESHOLDS = {
  conservative: 10,   // R <= 10%
  moderate: 15,       // 10% < R <= 15%
  // aggressive: R > 15%
};

export default { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, RISK_THRESHOLDS };
