import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  amount: string | number;
  currency?: string;
  trend?: {
    value: number;
    isPositiveGood?: boolean;
    label?: string;
  };
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: 'brand' | 'emerald' | 'rose' | 'amber' | 'cyan' | 'purple';
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  currency = '₹',
  trend,
  subtitle,
  icon: Icon,
  iconColor = 'brand',
  delay = 0,
}) => {
  const colorMap = {
    brand: {
      bg: 'bg-brand-500/10 border-brand-500/20 text-brand-400',
      glow: 'group-hover:shadow-[0_0_20px_-3px_rgba(99,102,241,0.4)]',
      gradient: 'from-brand-500/10 to-transparent',
    },
    emerald: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      glow: 'group-hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.4)]',
      gradient: 'from-emerald-500/10 to-transparent',
    },
    rose: {
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      glow: 'group-hover:shadow-[0_0_20px_-3px_rgba(244,63,94,0.4)]',
      gradient: 'from-rose-500/10 to-transparent',
    },
    amber: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      glow: 'group-hover:shadow-[0_0_20px_-3px_rgba(245,158,11,0.4)]',
      gradient: 'from-amber-500/10 to-transparent',
    },
    cyan: {
      bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
      glow: 'group-hover:shadow-[0_0_20px_-3px_rgba(6,182,212,0.4)]',
      gradient: 'from-cyan-500/10 to-transparent',
    },
    purple: {
      bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      glow: 'group-hover:shadow-[0_0_20px_-3px_rgba(168,85,247,0.4)]',
      gradient: 'from-purple-500/10 to-transparent',
    },
  };

  const scheme = colorMap[iconColor] || colorMap.brand;

  const formattedAmount =
    typeof amount === 'number'
      ? `${currency} ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : amount;

  const isPositive = trend && trend.value >= 0;
  const isGood = trend ? (isPositive ? trend.isPositiveGood !== false : trend.isPositiveGood === false) : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="glass-card rounded-2xl p-5 relative overflow-hidden group border border-white/[0.08] hover:border-white/[0.16] transition-colors"
    >
      {/* Subtle top-right ambient illumination */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${scheme.gradient} rounded-full blur-2xl pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</span>
          <h3 className="text-2xl font-bold text-white mt-1.5 font-mono tracking-tight tabular-nums">
            {formattedAmount}
          </h3>
        </div>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 3 }}
          className={`p-2.5 rounded-xl border ${scheme.bg} ${scheme.glow} transition-all duration-300`}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs relative z-10 pt-2 border-t border-white/[0.04]">
        {trend && (
          <div
            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md font-semibold text-[11px] ${
              isGood
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span className="font-mono">{Math.abs(trend.value)}%</span>
            {trend.label && <span className="text-slate-400 font-normal ml-1">{trend.label}</span>}
          </div>
        )}
        {subtitle && <p className="text-slate-400 text-[11px] truncate max-w-[160px]">{subtitle}</p>}
      </div>
    </motion.div>
  );
};
