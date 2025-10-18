export const lightColors = {
  // Primary palette
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  secondary: '#06B6D4',
  secondaryLight: '#22D3EE',
  secondaryDark: '#0891B2',
  tertiary: '#A855F7',

  // Semantic colors
  success: '#10B981',
  successLight: '#34D399',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  error: '#F43F5E',
  errorLight: '#FB7185',
  info: '#3B82F6',

  // Neutral palette
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E2E8F0',

  // Text colors
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#F1F5F9',

  // Interactive
  link: '#3B82F6',
  linkHover: '#2563EB',

  // Overlays
  overlay: 'rgba(15, 23, 42, 0.5)',
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkColors = {
  // Primary palette
  primary: '#818CF8',
  primaryLight: '#A5B4FC',
  primaryDark: '#6366F1',
  secondary: '#22D3EE',
  secondaryLight: '#67E8F9',
  secondaryDark: '#06B6D4',
  tertiary: '#C084FC',

  // Semantic colors
  success: '#34D399',
  successLight: '#6EE7B7',
  warning: '#FBBF24',
  warningLight: '#FCD34D',
  error: '#FB7185',
  errorLight: '#FDA4AF',
  info: '#60A5FA',

  // Neutral palette
  background: '#0F172A',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  border: '#334155',

  // Text colors
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textInverse: '#0F172A',

  // Interactive
  link: '#60A5FA',
  linkHover: '#93C5FD',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  modalOverlay: 'rgba(0, 0, 0, 0.8)',
};

export type ColorScheme = typeof lightColors;
