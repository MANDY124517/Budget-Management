import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Compass, Zap, Flame, Coffee, Sparkles } from 'lucide-react';

interface SafeSpendRadarProps {
  totalBalance: number;
  monthlyExpenses: number;
  activeBudgetCapex?: number;
  currency?: string;
  userName?: string;
}

export const SafeSpendRadar: React.FC<SafeSpendRadarProps> = ({
  totalBalance = 0,
  monthlyExpenses = 0,
  activeBudgetCapex = 50000,
  currency = '₹',
  userName = 'Friend',
}) => {
  const daysInMonth = 30;
  const currentDay = new Date().getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay);
  
  // Safe-to-spend calculation
  const remainingBudget = Math.max(0, activeBudgetCapex - monthlyExpenses);
  const safeDailySpend = Math.round(remainingBudget / daysRemaining);
  const safeWeeklySpend = Math.round(safeDailySpend * 7);

  // Runway calculation (months)
  const monthlyBurn = monthlyExpenses > 0 ? monthlyExpenses : 25000;
  const runwayMonths = (totalBalance / monthlyBurn).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card-elevated rounded-3xl p-6 border border-white/[0.09] relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Friendly Editorial Summary */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Safe-to-Spend Radar
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {daysRemaining} days left in cycle
            </span>
          </div>

          <h2 className="text-lg font-bold text-white tracking-tight">
            You have <span className="text-emerald-400 font-mono font-black">{currency} {safeDailySpend.toLocaleString('en-IN')}</span> / day of guilt-free spending power.
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            At your current pace, you are on track to preserve <strong className="text-white">{currency} {remainingBudget.toLocaleString('en-IN')}</strong> before the next cycle starts. Great financial discipline!
          </p>
        </div>

        {/* Right: Tactile Quick Metrics */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="p-3.5 rounded-2xl bg-obsidian-950/70 border border-white/[0.06] text-center space-y-1">
            <p className="text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider">Weekly Cap</p>
            <p className="text-sm font-bold font-mono text-white tabular-nums">
              {currency} {safeWeeklySpend.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-obsidian-950/70 border border-white/[0.06] text-center space-y-1">
            <p className="text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider">Runway</p>
            <p className="text-sm font-bold font-mono text-brand-300 tabular-nums">
              {runwayMonths} Mo
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-obsidian-950/70 border border-white/[0.06] text-center space-y-1">
            <p className="text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider">Pacing</p>
            <p className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
              +14% Safe
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
