import React from 'react';
import { Transaction } from '../../types';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface RecentTransactionsWidgetProps {
  transactions: Transaction[];
  currency?: string;
  isLoading?: boolean;
}

export const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({
  transactions,
  currency = '₹',
  isLoading,
}) => {
  if (isLoading) {
    return <div className="h-80 glass-card rounded-2xl animate-pulse border border-white/[0.06]" />;
  }

  const getTxIcon = (type: string) => {
    switch (type) {
      case 'INCOME':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case 'EXPENSE':
        return <ArrowUpRight className="w-4 h-4 text-rose-400" />;
      case 'TRANSFER':
        return <ArrowLeftRight className="w-4 h-4 text-brand-300" />;
      default:
        return null;
    }
  };

  const getTxColor = (type: string) => {
    switch (type) {
      case 'INCOME':
        return 'text-emerald-400';
      case 'EXPENSE':
        return 'text-slate-100';
      case 'TRANSFER':
        return 'text-brand-300';
      default:
        return 'text-slate-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
      className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-white/[0.08]"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Recent Activity</h3>
          <p className="text-xs text-slate-400 font-medium">Latest recorded transactions</p>
        </div>
        <Link
          to="/transactions"
          className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1 group"
        >
          <span>View Ledger</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="space-y-1.5">
        {transactions && transactions.length > 0 ? (
          transactions.map((tx, idx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ x: 2 }}
              className="p-2.5 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.05] transition-all flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-xl border ${
                    tx.transactionType === 'INCOME'
                      ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      : tx.transactionType === 'TRANSFER'
                      ? 'bg-brand-500/10 border-brand-500/20 shadow-[0_0_8px_rgba(99,102,241,0.2)]'
                      : 'bg-rose-500/10 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.2)]'
                  }`}
                >
                  {getTxIcon(tx.transactionType)}
                </div>
                <div>
                  <p className="text-xs font-bold text-white line-clamp-1 max-w-[180px] tracking-tight">
                    {tx.description}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {tx.category?.name || 'General'} • {tx.account?.name} •{' '}
                    {new Date(tx.transactionDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-xs font-bold font-mono tabular-nums ${getTxColor(tx.transactionType)}`}>
                  {tx.transactionType === 'INCOME' ? '+' : tx.transactionType === 'EXPENSE' ? '-' : ''}
                  {currency} {tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[9px] text-slate-500 uppercase font-semibold">{tx.paymentMethod?.toLowerCase()}</span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-slate-500 font-medium">
            No transactions found. Log your first transaction to populate activity.
          </div>
        )}
      </div>
    </motion.div>
  );
};
