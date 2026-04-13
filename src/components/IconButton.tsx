import React from 'react';
import { Colors } from '../constants/theme';

interface IconButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  size?: number;
  backgroundColor?: string;
  disabled?: boolean;
  loading?: boolean;
}

export default function IconButton({
  onPress,
  children,
  size = 44,
  backgroundColor,
  disabled = false,
  loading = false,
}: IconButtonProps) {
  return (
    <button
      className="icon-btn"
      onClick={disabled || loading ? undefined : onPress}
      disabled={disabled || loading}
      style={{
        width: size,
        height: size,
        backgroundColor: backgroundColor ?? undefined,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {loading ? <div className="spinner spinner-sm" /> : children}
    </button>
  );
}
