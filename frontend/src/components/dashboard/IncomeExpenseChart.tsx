import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { motion } from 'framer-motion';

interface ChartDataPoint {
  month: string;
  income: number;
  expense: number;
  savings?: number;
}

interface IncomeExpenseChartProps {
  data: ChartDataPoint[];
  currency?: string;
  isLoading?: boolean;
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
  data,
  currency = '₹',
  isLoading,
}) => {
  if (isLoading) {
    return <div className="h-72 glass-card rounded-2xl animate-pulse border border-white/[0.06]" />;
  }

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card-elevated p-3.5 rounded-xl border border-white/15 shadow-2xl text-xs space-y-1.5 min-w-[170px]">
          <p className="font-semibold text-slate-300 text-xs pb-1 border-b border-white/[0.08]">{label}</p>
          <div className="flex items-center justify-between space-x-4 text-emerald-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              Income:
            </span>
            <span className="font-mono font-semibold tabular-nums">{currency} {payload[0]?.value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between space-x-4 text-rose-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
              Expense:
            </span>
            <span className="font-mono font-semibold tabular-nums">{currency} {payload[1]?.value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="glass-card rounded-2xl p-6 border border-white/[0.08]"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Cashflow Trends</h3>
          <p className="text-xs text-slate-400 font-medium">Monthly income vs. expense performance</p>
        </div>
        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-slate-300">Income</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            <span className="text-slate-300">Expenses</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={customTooltip} />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#incomeGradient)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#F43F5E"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 font-medium">
            No historical trend data recorded yet.
          </div>
        )}
      </div>
    </motion.div>
  );
};
