import React from 'react';
import { BudgetUtilization } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';
import { AlertTriangle, CheckCircle2, ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface BudgetProgressWidgetProps {
  budget?: BudgetUtilization | null;
  currency?: string;
  isLoading?: boolean;
}

export const BudgetProgressWidget: React.FC<BudgetProgressWidgetProps> = ({
  budget,
  currency = '₹',
  isLoading,
}) => {
  if (isLoading) {
    return <div className="h-64 glass-card rounded-2xl animate-pulse border border-white/[0.06]" />;
  }

  if (!budget) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-white/[0.08]"
      >
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Active Budget Envelope</h3>
          <p className="text-xs text-slate-400 font-medium">Monthly expenditure threshold</p>
        </div>
        <div className="my-6 text-center py-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
          <p className="text-xs text-slate-400 mb-3 font-medium">No active budget set for this cycle.</p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/budgets"
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 rounded-xl transition-all shadow-glow-brand"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Budget</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const isWarning = budget.status === 'NEAR_LIMIT';
  const isExceeded = budget.status === 'EXCEEDED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-white/[0.08]"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">{budget.name}</h3>
          <p className="text-xs text-slate-400 font-medium font-mono tabular-nums">
            {currency} {budget.totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })} of {currency}{' '}
            {budget.totalBudgetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="flex items-center space-x-1.5">
          {isExceeded ? (
            <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
              <AlertTriangle className="w-3 h-3" />
              <span>Exceeded</span>
            </span>
          ) : isWarning ? (
            <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              <AlertTriangle className="w-3 h-3" />
              <span>Near Limit</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-3 h-3" />
              <span>On Track</span>
            </span>
          )}
        </div>
      </div>

      <div className="my-4">
        <ProgressBar
          value={budget.utilizationPercentage}
          showPercentage={true}
          label="Envelope Utilization"
          size="lg"
        />
        <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-mono tabular-nums">
          <span>Remaining: <strong className="text-slate-200">{currency} {budget.remainingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
          <span>Alert at &gt;{budget.alertThreshold}%</span>
        </div>
      </div>

      {/* Top 3 Category Allocations */}
      <div className="space-y-2.5 border-t border-white/[0.06] pt-3.5">
        {budget.categories?.slice(0, 3).map((cat) => (
          <div key={cat.categoryId} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium truncate">{cat.categoryName}</span>
              <span className="font-mono text-slate-400 text-[11px] tabular-nums">
                {currency} {cat.spentAmount.toLocaleString('en-IN')} / {currency}{' '}
                {cat.allocatedAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <ProgressBar value={cat.utilizationPercentage} showPercentage={false} size="sm" />
          </div>
        ))}
      </div>

      <div className="pt-3 text-right">
        <Link
          to="/budgets"
          className="text-xs font-semibold text-brand-400 hover:text-brand-300 inline-flex items-center space-x-1 group"
        >
          <span>Manage All Budgets</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};
