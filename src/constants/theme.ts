export const Colors = {
  background: '#0A0A0A',
  surface: '#161618',
  surfaceElevated: '#1E1E22',
  surfaceHover: '#26262B',
  textPrimary: '#F0F0F0',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  accent: '#0A84FF',
  accentLight: 'rgba(10, 132, 255, 0.15)',
  accentDark: '#0070E0',
  success: '#30D158',
  successLight: 'rgba(48, 209, 88, 0.15)',
  danger: '#FF453A',
  dangerLight: 'rgba(255, 69, 58, 0.15)',
  warning: '#FFD60A',
  warningLight: 'rgba(255, 214, 10, 0.15)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.15)',
  shadow: 'rgba(0, 0, 0, 0.4)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const MODEL_INPUT_SIZE = 640;
export const CONFIDENCE_THRESHOLD = 0.5;
export const NMS_IOU_THRESHOLD = 0.45;

export type TabName = 'Dashboard' | 'Camera' | 'History' | 'Settings';
