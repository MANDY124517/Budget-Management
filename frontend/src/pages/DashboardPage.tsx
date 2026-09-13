import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import { accountsApi } from '../api/accountsApi';
import { categoriesApi } from '../api/categoriesApi';
import { analyticsApi } from '../api/analyticsApi';
import { StatCard } from '../components/ui/StatCard';
import { HealthScoreWidget } from '../components/dashboard/HealthScoreWidget';
import { IncomeExpenseChart } from '../components/dashboard/IncomeExpenseChart';
import { CategoryDonutChart } from '../components/dashboard/CategoryDonutChart';
import { BudgetProgressWidget } from '../components/dashboard/BudgetProgressWidget';
import { RecentTransactionsWidget } from '../components/dashboard/RecentTransactionsWidget';
import { InsightsCarousel } from '../components/dashboard/InsightsCarousel';
import { SafeSpendRadar } from '../components/dashboard/SafeSpendRadar';
import { VirtualCardWidget } from '../components/dashboard/VirtualCardWidget';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { SavingsGoal } from '../types';
import { motion } from 'framer-motion';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  Plus,
  Target,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Queries
  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getOverview,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAccounts,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
  });

  const { data: healthScore, isLoading: isHealthLoading } = useQuery({
    queryKey: ['analytics', 'health-score'],
    queryFn: analyticsApi.getFinancialHealthScore,
  });

  const { data: spendingAnalysis } = useQuery({
    queryKey: ['analytics', 'spending'],
    queryFn: () => analyticsApi.getSpendingAnalysis(),
  });

  const currencySymbol = '₹';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-7"
    >
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Financial Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Real-time balance synchronization, automated budget tracking, and predictive intelligence.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/analytics"
              className="px-4 py-2 rounded-xl glass-card text-xs font-semibold text-brand-300 hover:text-white hover:border-brand-500/40 flex items-center space-x-2 transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
              <span>AI Forecasting</span>
            </Link>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs transition-all shadow-glow-brand flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </motion.button>
        </div>
      </div>

      {/* Dynamic AI Insights Carousel */}
      <InsightsCarousel insights={dashboard?.topInsights} />

      {/* Safe-to-Spend Editorial Radar */}
      <SafeSpendRadar
        totalBalance={dashboard?.totalBalance ?? 0}
        monthlyExpenses={dashboard?.monthlyExpenses ?? 0}
        activeBudgetCapex={dashboard?.activeBudget?.totalBudgetAmount ?? 50000}
        currency={currencySymbol}
      />

      {/* Core KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Net Balance"
          amount={dashboard?.totalBalance ?? 0}
          currency={currencySymbol}
          icon={Wallet}
          iconColor="brand"
          subtitle={`${dashboard?.accounts?.length || 0} active accounts`}
          delay={0.05}
        />

        <StatCard
          title="Monthly Income"
          amount={dashboard?.monthlyIncome ?? 0}
          currency={currencySymbol}
          icon={ArrowDownLeft}
          iconColor="emerald"
          subtitle="Cash Inflow this month"
          delay={0.1}
        />

        <StatCard
          title="Monthly Expenses"
          amount={dashboard?.monthlyExpenses ?? 0}
          currency={currencySymbol}
          icon={ArrowUpRight}
          iconColor="rose"
          subtitle="Total Outflows"
          delay={0.15}
        />

        <StatCard
          title="Net Savings"
          amount={dashboard?.monthlySavings ?? 0}
          currency={currencySymbol}
          icon={PiggyBank}
          iconColor="cyan"
          delay={0.2}
          trend={{
            value: dashboard?.savingsRate ?? 0,
            isPositiveGood: true,
            label: 'savings rate',
          }}
        />
      </div>

      {/* Main Visualizations: Cashflow Trend & AI Health Scoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IncomeExpenseChart
            data={spendingAnalysis?.monthlyTrends || []}
            currency={currencySymbol}
            isLoading={isDashboardLoading}
          />
        </div>

        <div className="lg:col-span-1">
          <HealthScoreWidget healthScore={healthScore} isLoading={isHealthLoading} />
        </div>
      </div>

      {/* Secondary Row: Virtual Smart Card, Active Budget, Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <VirtualCardWidget
            accounts={accounts}
            currency={currencySymbol}
          />
        </div>

        <div className="lg:col-span-1">
          <BudgetProgressWidget
            budget={dashboard?.activeBudget}
            currency={currencySymbol}
            isLoading={isDashboardLoading}
          />
        </div>

        <div className="lg:col-span-1">
          <RecentTransactionsWidget
            transactions={dashboard?.recentTransactions || []}
            currency={currencySymbol}
            isLoading={isDashboardLoading}
          />
        </div>
      </div>

      {/* Category Breakdown & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CategoryDonutChart
            categories={dashboard?.topExpenseCategories || []}
            currency={currencySymbol}
            isLoading={isDashboardLoading}
          />
        </div>

        <div className="lg:col-span-2">
          {/* Quick Spending Tip / Human Narrative */}
          <div className="glass-card rounded-3xl p-6 h-full flex flex-col justify-between border border-white/[0.08]">
            <div>
              <div className="flex items-center space-x-2.5 mb-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">Financial Coach Narrative</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Your recurring subscriptions represent <strong className="text-brand-300">4.2%</strong> of your total monthly outflow. If you consolidate streaming services and divert the delta into your <strong className="text-purple-300">Emergency Fund</strong>, you will reach full financial independence <strong className="text-emerald-400">2.4 months sooner</strong>.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] mt-4">
              <span className="text-[11px] text-slate-400 font-mono">Status: Optimized Pacing 🟢</span>
              <Link to="/analytics" className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors">
                Explore Analytics →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Goals Widget Banner */}
      {dashboard?.activeGoals && dashboard.activeGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 border border-white/[0.08]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">Active Savings Goals</h3>
            </div>
            <Link
              to="/goals"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              View All Goals →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboard.activeGoals.slice(0, 3).map((goal: SavingsGoal) => (
              <div
                key={goal.id}
                className="p-4 rounded-xl bg-obsidian-950/60 border border-white/[0.06] space-y-3 hover:border-white/10 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">{goal.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono tabular-nums">
                      Target: {currencySymbol} {goal.targetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-400 tabular-nums">
                    {goal.progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-obsidian-950 h-2 rounded-full overflow-hidden border border-white/[0.05]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progressPercentage}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-400 h-full rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono tabular-nums">
                  <span>Saved: {currencySymbol} {goal.currentAmount.toLocaleString('en-IN')}</span>
                  <span>Need: {currencySymbol} {goal.requiredMonthlySavings.toLocaleString('en-IN')}/mo</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accounts={accounts}
        categories={categories}
      />
    </motion.div>
  );
};
