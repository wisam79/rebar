import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  elevated?: boolean;
}

export default function Card({ children, className = '', style, onClick, elevated }: CardProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      className={`card ${elevated ? 'card-elevated' : ''} ${className}`}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'left' as const,
        color: 'inherit',
        font: 'inherit',
        width: '100%',
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}
