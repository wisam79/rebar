import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

const defaults: IconProps = { size: 24, color: '#F0F0F0' };

export const CameraIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx={12} cy={13} r={4} stroke={color} strokeWidth={1.8}/>
  </svg>
);

export const ChartIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x={3} y={12} width={4} height={9} rx={1} stroke={color} strokeWidth={1.8}/>
    <rect x={10} y={7} width={4} height={14} rx={1} stroke={color} strokeWidth={1.8}/>
    <rect x={17} y={3} width={4} height={18} rx={1} stroke={color} strokeWidth={1.8}/>
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.8}/>
    <path d="M12 6v6l4 2" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.8}/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const FlashIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const FlashOffIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <g stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      <line x1={1} y1={1} x2={23} y2={23}/>
    </g>
  </svg>
);

export const CaptureIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2}/>
    <circle cx={12} cy={12} r={6} fill={color}/>
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx={11} cy={11} r={8} stroke={color} strokeWidth={1.8}/>
    <path d="M21 21l-4.35-4.35" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ExportIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1={12} y1={5} x2={12} y2={19} stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <line x1={5} y1={12} x2={19} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
  </svg>
);

export const XIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1={18} y1={6} x2={6} y2={18} stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <line x1={6} y1={6} x2={18} y2={18} stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const FilterIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M1 4v6h6M23 20v-6h-6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const FolderIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const SlidersIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1={4} y1={21} x2={4} y2={14} stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <line x1={4} y1={10} x2={4} y2={3} stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <line x1={12} y1={21} x2={12} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <line x1={12} y1={8} x2={12} y2={3} stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <line x1={20} y1={21} x2={20} y2={16} stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <line x1={20} y1={12} x2={20} y2={3} stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <line x1={1} y1={14} x2={7} y2={14} stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <line x1={9} y1={8} x2={15} y2={8} stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <line x1={17} y1={16} x2={23} y2={16} stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
  </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.8}/>
    <line x1={12} y1={16} x2={12} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <line x1={12} y1={8} x2={12.01} y2={8} stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 18l6-6-6-6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const EditIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const RebarIcon: React.FC<IconProps> = ({ size = defaults.size, color = defaults.color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1={4} y1={4} x2={4} y2={20} stroke={color} strokeWidth={2.5} strokeLinecap="round"/>
    <line x1={10} y1={4} x2={10} y2={20} stroke={color} strokeWidth={2.5} strokeLinecap="round"/>
    <line x1={16} y1={4} x2={16} y2={20} stroke={color} strokeWidth={2.5} strokeLinecap="round"/>
    <line x1={22} y1={4} x2={22} y2={20} stroke={color} strokeWidth={2.5} strokeLinecap="round"/>
    <line x1={2} y1={8} x2={23} y2={8} stroke={color} strokeWidth={1.2} strokeLinecap="round"/>
    <line x1={2} y1={16} x2={23} y2={16} stroke={color} strokeWidth={1.2} strokeLinecap="round"/>
  </svg>
);
