import React from 'react';
import { FinancialHealthScore } from '../../types';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface HealthScoreWidgetProps {
  healthScore?: FinancialHealthScore;
  isLoading?: boolean;
}

export const HealthScoreWidget: React.FC<HealthScoreWidgetProps> = ({ healthScore, isLoading }) => {
  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 h-full animate-pulse border border-white/[0.06]">
        <div className="h-4 bg-white/5 rounded w-1/3 mb-4" />
        <div className="h-16 bg-white/5 rounded mb-4" />
        <div className="h-4 bg-white/5 rounded w-2/3" />
      </div>
    );
  }

  const score = healthScore?.overallScore ?? 78;
  const tier = healthScore?.tier ?? 'GOOD';

  const tierColors = {
    EXCELLENT: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    GOOD: 'text-brand-300 bg-brand-500/10 border-brand-500/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]',
    FAIR: 'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    NEEDS_ATTENTION: 'text-rose-400 bg-rose-500/10 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
    CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="glass-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group border border-white/[0.08]"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 shadow-glow-brand">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Financial Health Score
            </h4>
            <p className="text-xs text-slate-400 font-medium">AI Vitality Index</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${
            tierColors[tier as keyof typeof tierColors] || tierColors.GOOD
          }`}
        >
          {tier.replace('_', ' ')}
        </span>
      </div>

      <div className="my-5 flex items-center justify-between relative z-10">
        <div className="flex items-baseline space-x-2">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="text-5xl font-extrabold text-white font-mono tracking-tight tabular-nums"
          >
            {score}
          </motion.span>
          <span className="text-xs font-semibold text-slate-400">/ 100</span>
        </div>

        {/* Pillar Mini Meters */}
        <div className="space-y-2 w-44 text-[11px]">
          {healthScore?.factors &&
            Object.entries(healthScore.factors).slice(0, 3).map(([key, factor]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-mono text-slate-200 font-semibold">{factor.score}</span>
                </div>
                <div className="w-full bg-obsidian-950/80 h-1.5 rounded-full overflow-hidden border border-white/[0.05]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.score}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-gradient-to-r from-brand-600 to-cyan-400 h-full rounded-full"
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="border-t border-white/[0.06] pt-3.5 flex items-center justify-between relative z-10">
        <p className="text-xs text-slate-400 line-clamp-1 max-w-[280px]">
          {healthScore?.summaryRecommendation || 'Healthy spending & savings velocity detected.'}
        </p>
        <Link
          to="/analytics"
          className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform"
        >
          <span>Deep Dive</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
};
