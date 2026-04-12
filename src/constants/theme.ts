// --- Dark Mode Color Tokens ---
export const Colors = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceElevated: '#2C2C2C',
  textPrimary: '#E0E0E0',
  textSecondary: '#A0A0A0',
  accent: '#00ADB5',
  accentDark: '#008A91',
  danger: '#FF5252',
  success: '#4CAF50',
  overlay: 'rgba(0, 0, 0, 0.6)',
  border: '#333333',
};

// --- Model Configuration ---
export const MODEL_INPUT_SIZE = 640; // 640x640
export const CONFIDENCE_THRESHOLD = 0.5;
export const NMS_IOU_THRESHOLD = 0.45;

// --- Navigation ---
export type RootTabParamList = {
  Camera: undefined;
  History: undefined;
  Settings: undefined;
};
