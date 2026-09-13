import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '../api/budgetsApi';
import { categoriesApi } from '../api/categoriesApi';
import { Budget, BudgetPeriod, Category, CategoryBudgetUtilization } from '../types';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Plus, Trash2, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

export const BudgetsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [period, setPeriod] = useState<BudgetPeriod>('MONTHLY');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 8) + '01');
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [totalBudgetAmount, setTotalBudgetAmount] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('80.00');
  const [allocations, setAllocations] = useState<{ categoryId: number; allocatedAmount: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: budgets = [] } = useQuery<Budget[]>({
    queryKey: ['budgets'],
    queryFn: budgetsApi.getBudgets,
  });

  const { data: currentBudget } = useQuery({
    queryKey: ['budgets', 'current'],
    queryFn: budgetsApi.getCurrentBudget,
  });

  const { data: expenseCategories = [] } = useQuery<Category[]>({
    queryKey: ['categories', 'EXPENSE'],
    queryFn: () => categoriesApi.getCategories('EXPENSE'),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        period,
        startDate,
        endDate,
        totalBudgetAmount: parseFloat(totalBudgetAmount),
        alertThresholdPercentage: parseFloat(alertThreshold),
        categoryAllocations: allocations.filter((a) => a.allocatedAmount > 0),
      };

      if (editingBudget) {
        return await budgetsApi.updateBudget(editingBudget.id, payload);
      } else {
        return await budgetsApi.createBudget(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to save budget');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => budgetsApi.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleOpenCreate = () => {
    setEditingBudget(null);
    setName(`Budget ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}`);
    setPeriod('MONTHLY');
    const start = new Date();
    start.setDate(1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    setTotalBudgetAmount('50000');
    setAlertThreshold('80.00');

    setAllocations(expenseCategories.map((c: Category) => ({ categoryId: c.id, allocatedAmount: 0 })));
    setError(null);
    setIsModalOpen(true);
  };

  const handleCategoryAllocChange = (categoryId: number, amount: number) => {
    setAllocations((prev) => {
      const exists = prev.find((a) => a.categoryId === categoryId);
      if (exists) {
        return prev.map((a) => (a.categoryId === categoryId ? { ...a, allocatedAmount: amount } : a));
      }
      return [...prev, { categoryId, allocatedAmount: amount }];
    });
  };

  const currencySymbol = '₹';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-7"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Budget Envelopes</span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Active Controls
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Create period-based envelope budgets with configurable 80%, 100%, and 120% overspending alert thresholds.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs transition-all shadow-glow-brand flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Budget</span>
        </motion.button>
      </div>

      {/* Current Active Budget Full Breakdown Card */}
      {currentBudget && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-8 border border-brand-500/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-6 relative z-10">
            <div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 uppercase tracking-wider">
                Current Active Envelope
              </span>
              <h2 className="text-xl font-bold text-white mt-1.5 tracking-tight">{currentBudget.name}</h2>
              <p className="text-xs text-slate-400 font-medium">
                Period: {currentBudget.startDate} to {currentBudget.endDate} ({currentBudget.period})
              </p>
            </div>

            <div className="flex items-center space-x-6 font-mono text-sm tabular-nums">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cap</p>
                <p className="font-bold text-white text-base">
                  {currencySymbol} {currentBudget.totalBudgetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Spent</p>
                <p className="font-bold text-rose-400 text-base">
                  {currencySymbol} {currentBudget.totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Remaining</p>
                <p className="font-bold text-emerald-400 text-base">
                  {currencySymbol} {currentBudget.remainingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="my-6 space-y-3 relative z-10">
            <ProgressBar
              value={currentBudget.utilizationPercentage}
              label="Overall Envelope Utilization"
              showPercentage={true}
              size="lg"
            />

            {/* Human Pacing Callout */}
            <div className="flex flex-wrap items-center justify-between text-xs bg-obsidian-950/70 p-3 rounded-2xl border border-white/[0.06] font-medium">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✨ Daily Allowance:</span>
                <span className="font-mono text-white font-bold">
                  {currencySymbol} {Math.max(0, Math.round(currentBudget.remainingAmount / 20)).toLocaleString('en-IN')}/day
                </span>
              </span>
              <span className="text-slate-400">
                {currentBudget.utilizationPercentage < 80 ? (
                  <span className="text-emerald-400 font-semibold">🟢 Pacing is healthy & on-track</span>
                ) : currentBudget.utilizationPercentage <= 100 ? (
                  <span className="text-amber-400 font-semibold">🟡 Approaching budget ceiling</span>
                ) : (
                  <span className="text-rose-400 font-semibold">🔴 Over budget — adjust discretionary spend</span>
                )}
              </span>
            </div>
          </div>

          {/* Category-Specific Budget Meters */}
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 relative z-10">
            Category Allocations &amp; Real-Time Utilization
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
            {currentBudget.categories.map((cat: CategoryBudgetUtilization) => (
              <motion.div
                key={cat.categoryId}
                whileHover={{ y: -2 }}
                className="p-4 rounded-2xl bg-obsidian-950/70 border border-white/[0.06] space-y-3 hover:border-white/15 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-sm"
                      style={{ backgroundColor: cat.categoryColor || '#6366F1', boxShadow: `0 0 8px ${cat.categoryColor || '#6366F1'}80` }}
                    />
                    <h4 className="text-sm font-bold text-white truncate max-w-[140px] tracking-tight">
                      {cat.categoryName}
                    </h4>
                  </div>
                  {cat.isExceeded ? (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                      Exceeded
                    </span>
                  ) : cat.alertTriggered ? (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                      &gt; {currentBudget.alertThreshold}%
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      OK
                    </span>
                  )}
                </div>

                <ProgressBar value={cat.utilizationPercentage} showPercentage={false} size="sm" />

                <div className="flex justify-between text-xs font-mono tabular-nums">
                  <span className="text-slate-400">
                    Spent: {currencySymbol} {cat.spentAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-white font-semibold">
                    Cap: {currencySymbol} {cat.allocatedAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All Historical Budgets List */}
      <div className="glass-card rounded-2xl p-6 space-y-4 border border-white/[0.08]">
        <h3 className="text-base font-bold text-white tracking-tight">All Defined Envelopes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets && budgets.length > 0 ? (
            budgets.map((b: Budget) => (
              <motion.div
                key={b.id}
                whileHover={{ y: -2 }}
                className="p-5 rounded-2xl bg-obsidian-950/70 border border-white/[0.06] flex flex-col justify-between space-y-4 hover:border-white/15 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-white tracking-tight">{b.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/[0.08] text-slate-300 uppercase">
                      {b.period}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {b.startDate} to {b.endDate}
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs font-mono pt-3 border-t border-white/[0.06] tabular-nums">
                  <span className="text-slate-400">Total Cap:</span>
                  <span className="text-base font-bold text-brand-300">
                    {currencySymbol} {b.totalBudgetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (window.confirm('Delete this budget envelope?')) {
                        deleteMutation.mutate(b.id);
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-xs text-slate-500 py-6 col-span-3 text-center font-medium">
              No budgets found. Create your first budget envelope above.
            </p>
          )}
        </div>
      </div>

      {/* Create Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Budget Envelope"
        subtitle="Set total spending threshold and optional category partitions"
        maxWidth="xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Budget Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Period *
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
                <option value="YEARLY">Yearly</option>
                <option value="CUSTOM">Custom Range</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Total Budget Cap (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={totalBudgetAmount}
                onChange={(e) => setTotalBudgetAmount(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Warning Threshold (%)
              </label>
              <select
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white"
              >
                <option value="75.00">75% of Limit</option>
                <option value="80.00">80% of Limit (Recommended)</option>
                <option value="90.00">90% of Limit</option>
                <option value="100.00">100% (Strict Cap)</option>
              </select>
            </div>
          </div>

          {/* Category Breakdown Allocations */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Category Allocations (Optional Partition)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {expenseCategories.map((cat: Category) => {
                const currentAlloc = allocations.find((a) => a.categoryId === cat.id)?.allocatedAmount || '';
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-obsidian-950/60 border border-white/[0.06]"
                  >
                    <span className="text-xs text-slate-200 font-medium">{cat.name}</span>
                    <div className="flex items-center space-x-1.5 w-32">
                      <span className="text-xs text-slate-400 font-mono font-bold">₹</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={currentAlloc}
                        onChange={(e) => handleCategoryAllocChange(cat.id, parseFloat(e.target.value) || 0)}
                        className="w-full glass-input rounded-lg px-2 py-1 text-xs text-white font-mono tabular-nums"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-white/[0.08]">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.06]"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={saveMutation.isPending}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 rounded-xl shadow-glow-brand"
            >
              {saveMutation.isPending ? 'Saving...' : 'Create Budget'}
            </motion.button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
