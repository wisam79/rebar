import React, { useEffect } from 'react';
import { XIcon } from '../constants/icons';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [visible]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.6)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--surface)',
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          paddingTop: 8,
          paddingBottom: 28,
          maxHeight: '80%',
          overflowY: 'auto',
          animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <div style={{
          width: 36, height: 5, borderRadius: 3,
          backgroundColor: 'var(--text-3)', margin: '0 auto 14px',
        }} />
        {title && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingLeft: 18, paddingRight: 18, marginBottom: 14,
          }}>
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.4px' }}>{title}</span>
            <button onClick={onClose} style={{
              padding: 4, background: 'none', border: 'none', cursor: 'pointer',
            }}>
              <XIcon size={20} color="var(--text-2)" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
