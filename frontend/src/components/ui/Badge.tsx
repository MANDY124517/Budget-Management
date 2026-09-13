import React from 'react';

interface BadgeProps {
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'brand',
  size = 'md',
  children,
  dot = false,
}) => {
  const variantStyles = {
    brand: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };

  const dotStyles = {
    brand: 'bg-brand-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    neutral: 'bg-slate-400',
    info: 'bg-cyan-400',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center space-x-1.5 font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]} animate-pulse`} />}
      <span>{children}</span>
    </span>
  );
};
