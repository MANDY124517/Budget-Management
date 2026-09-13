import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CategorySpending } from '../../types';
import { motion } from 'framer-motion';

interface CategoryDonutChartProps {
  categories: CategorySpending[];
  currency?: string;
  isLoading?: boolean;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  categories,
  currency = '₹',
  isLoading,
}) => {
  if (isLoading) {
    return <div className="h-72 glass-card rounded-2xl animate-pulse border border-white/[0.06]" />;
  }

  const defaultColors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6', '#EC4899', '#64748B'];

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card-elevated border border-white/15 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <p className="font-semibold text-white">{data.categoryName}</p>
          <p className="text-brand-300 font-mono font-medium tabular-nums">
            {currency} {data.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-white/[0.08]"
    >
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">Spending by Category</h3>
        <p className="text-xs text-slate-400 font-medium">Expense allocation distribution</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 items-center my-2 gap-4">
        <div className="h-52 w-full">
          {categories && categories.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="totalAmount"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {categories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || defaultColors[index % defaultColors.length]}
                      stroke="#07090e"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={customTooltip} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 font-medium">
              No category expense data recorded.
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2">
          {categories && categories.length > 0 ? (
            categories.slice(0, 5).map((cat, idx) => {
              const color = cat.color || defaultColors[idx % defaultColors.length];
              return (
                <div key={cat.categoryId || idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center space-x-2.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
                    />
                    <span className="text-slate-300 font-medium truncate">{cat.categoryName}</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono text-slate-400 shrink-0">
                    <span className="text-white font-semibold tabular-nums">{cat.percentage}%</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-500">No categories to display</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
