import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsApi } from '../api/goalsApi';
import { accountsApi } from '../api/accountsApi';
import { Account, GoalPriority, SavingsGoal } from '../types';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { Target, Plus, PiggyBank, Calendar, Trash2, CheckCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export const GoalsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState<GoalPriority>('HIGH');
  const [description, setDescription] = useState('');
  const [targetAccountId, setTargetAccountId] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  // Contribution Form State
  const [contributeAmount, setContributeAmount] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState<number | ''>('');

  const { data: goals = [] } = useQuery<SavingsGoal[]>({
    queryKey: ['goals'],
    queryFn: goalsApi.getGoals,
  });

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAccounts,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
        targetDate,
        priority,
        description: description.trim() || undefined,
        targetAccountId: targetAccountId ? Number(targetAccountId) : undefined,
      };

      if (selectedGoal) {
        return await goalsApi.updateGoal(selectedGoal.id, {
          ...payload,
          status: selectedGoal.status,
        });
      } else {
        return await goalsApi.createGoal(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to save goal');
    },
  });

  const contributeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedGoal) return;
      return await goalsApi.contributeGoal(selectedGoal.id, {
        amount: parseFloat(contributeAmount),
        sourceAccountId: sourceAccountId ? Number(sourceAccountId) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setIsContributeModalOpen(false);
      setContributeAmount('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to add contribution');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => goalsApi.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleOpenCreate = () => {
    setSelectedGoal(null);
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);
    setTargetDate(futureDate.toISOString().split('T')[0]);
    setPriority('MEDIUM');
    setDescription('');
    setTargetAccountId('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenContribute = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setContributeAmount('');
    if (accounts.length > 0) setSourceAccountId(accounts[0].id);
    setError(null);
    setIsContributeModalOpen(true);
  };

  const getPriorityBadgeVariant = (p: GoalPriority) => {
    switch (p) {
      case 'CRITICAL':
        return 'danger';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'brand';
      case 'LOW':
        return 'neutral';
    }
  };

  const currencySymbol = '₹';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-7"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Savings Goals</span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Wealth Milestones
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Track milestones, automate monthly required savings velocity, and project target completion dates.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs transition-all shadow-glow-brand flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </motion.button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals && goals.length > 0 ? (
          goals.map((goal: SavingsGoal, idx: number) => {
            const isCompleted = goal.status === 'COMPLETED' || goal.progressPercentage >= 100;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -3 }}
                className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between border border-white/[0.08] group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-3 rounded-2xl border ${
                          isCompleted
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                            : 'bg-purple-500/10 border-purple-500/20 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                        }`}
                      >
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white line-clamp-1 tracking-tight">{goal.name}</h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <Badge variant={getPriorityBadgeVariant(goal.priority)} size="sm">
                            {goal.priority}
                          </Badge>
                          {isCompleted && (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-sm font-mono font-bold text-purple-400 tabular-nums">
                      {goal.progressPercentage}%
                    </span>
                  </div>

                  {goal.description && (
                    <p className="text-xs text-slate-400 mt-3 line-clamp-2 font-medium">{goal.description}</p>
                  )}

                  <div className="my-5 space-y-2">
                    <ProgressBar
                      value={goal.progressPercentage}
                      showPercentage={false}
                      colorVariant={isCompleted ? 'emerald' : 'brand'}
                      size="md"
                    />

                    <div className="flex justify-between text-xs font-mono tabular-nums">
                      <span className="text-emerald-400 font-bold">
                        {currencySymbol} {goal.currentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-slate-400 font-medium">
                        Target: {currencySymbol} {goal.targetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-obsidian-950/70 border border-white/[0.06] text-[11px] space-y-1.5 font-medium">
                    <div className="flex justify-between text-slate-400">
                      <span className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Target Date:</span>
                      </span>
                      <span className="text-slate-200 font-mono">
                        {new Date(goal.targetDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {!isCompleted && (
                      <div className="flex justify-between text-slate-400">
                        <span className="flex items-center space-x-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-brand-400" />
                          <span>Required Velocity:</span>
                        </span>
                        <span className="text-brand-300 font-bold font-mono tabular-nums">
                          {currencySymbol} {goal.requiredMonthlySavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/mo
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] mt-5">
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleOpenContribute(goal)}
                      disabled={isCompleted}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:opacity-40 text-white font-semibold text-xs transition-all shadow-glow-brand flex items-center space-x-1.5"
                    >
                      <PiggyBank className="w-3.5 h-3.5" />
                      <span>Contribute</span>
                    </motion.button>

                    {!isCompleted && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedGoal(goal);
                          setContributeAmount('500');
                          if (accounts.length > 0) setSourceAccountId(accounts[0].id);
                          setIsContributeModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-mono font-semibold text-emerald-400 transition-colors"
                      >
                        +₹500 Boost
                      </motion.button>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        if (window.confirm(`Delete savings goal '${goal.name}'?`)) {
                          deleteMutation.mutate(goal.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="py-12 text-center text-xs text-slate-500 col-span-3 glass-card rounded-2xl border border-white/[0.06] font-medium">
            No savings goals defined. Set targets like Emergency Fund, Laptop, or Vacation above.
          </div>
        )}
      </div>

      {/* Create / Edit Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
        subtitle="Define wealth milestones with automatic monthly velocity calculation"
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
              Goal Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Emergency Fund, New Laptop, Japan Trip"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Target Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Current Saved (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Target Deadline *
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as GoalPriority)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="Why this goal matters..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white"
            />
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
              {saveMutation.isPending ? 'Saving...' : selectedGoal ? 'Update Goal' : 'Create Goal'}
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Contribute Modal */}
      <Modal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        title={`Add Savings to ${selectedGoal?.name}`}
        subtitle="Transfer funds to progress this financial milestone"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            contributeMutation.mutate();
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
              Contribution Amount (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              required
              placeholder="e.g. 5000"
              value={contributeAmount}
              onChange={(e) => setContributeAmount(e.target.value)}
              className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white font-mono tabular-nums"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Deduct from Source Account (Optional)
            </label>
            <select
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value ? Number(e.target.value) : '')}
              className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white"
            >
              <option value="">Do not deduct (External savings)</option>
              {accounts.map((acc: Account) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (Balance: ₹{acc.balance.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-white/[0.08]">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setIsContributeModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.06]"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={contributeMutation.isPending}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 rounded-xl shadow-glow-brand"
            >
              {contributeMutation.isPending ? 'Allocating...' : 'Confirm Contribution'}
            </motion.button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
