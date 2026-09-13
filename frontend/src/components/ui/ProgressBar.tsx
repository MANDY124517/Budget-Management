import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // percentage (0 - 100+)
  max?: number;
  label?: string;
  showPercentage?: boolean;
  colorVariant?: 'auto' | 'brand' | 'emerald' | 'amber' | 'rose';
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  colorVariant = 'auto',
  size = 'md',
}) => {
  const normalizedValue = Math.min(Math.max(0, value), max);
  const percentage = Math.round((normalizedValue / max) * 100);

  const getAutoColor = (pct: number) => {
    if (pct > 100) return 'bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]';
    if (pct >= 80) return 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]';
    return 'bg-gradient-to-r from-brand-600 to-brand-400 shadow-[0_0_12px_rgba(99,102,241,0.4)]';
  };

  const colorClasses = {
    auto: getAutoColor(percentage),
    brand: 'bg-gradient-to-r from-brand-600 to-brand-400 shadow-[0_0_12px_rgba(99,102,241,0.4)]',
    emerald: 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    amber: 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    rose: 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className="w-full space-y-1.5">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs text-slate-300 font-medium">
          {label && <span className="tracking-tight">{label}</span>}
          {showPercentage && <span className="font-mono tabular-nums font-semibold">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-obsidian-950/80 rounded-full overflow-hidden p-0.5 border border-white/[0.08] ${sizeClasses[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percentage)}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full ${colorClasses[colorVariant]}`}
        />
      </div>
    </div>
  );
};
