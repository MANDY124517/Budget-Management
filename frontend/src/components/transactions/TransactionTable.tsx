import React from 'react';
import { Transaction, TransactionType } from '../../types';
import { Edit2, Trash2, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { motion } from 'framer-motion';

interface TransactionTableProps {
  transactions: Transaction[];
  currency?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  currency = '₹',
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  isLoading,
}) => {
  if (isLoading) {
    return <div className="h-96 glass-card rounded-2xl animate-pulse border border-white/[0.06]" />;
  }

  const getBadgeVariant = (type: TransactionType) => {
    switch (type) {
      case 'INCOME':
        return 'success';
      case 'EXPENSE':
        return 'danger';
      case 'TRANSFER':
        return 'brand';
      default:
        return 'neutral';
    }
  };

  const getTxIcon = (type: TransactionType) => {
    switch (type) {
      case 'INCOME':
        return <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />;
      case 'EXPENSE':
        return <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />;
      case 'TRANSFER':
        return <ArrowLeftRight className="w-3.5 h-3.5 text-brand-300" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between border border-white/[0.08]"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-obsidian-950/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-white/[0.06]">
            <tr>
              <th className="py-3.5 px-6">Date</th>
              <th className="py-3.5 px-6">Description</th>
              <th className="py-3.5 px-6">Category</th>
              <th className="py-3.5 px-6">Account</th>
              <th className="py-3.5 px-6">Type</th>
              <th className="py-3.5 px-6 text-right">Amount</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {transactions && transactions.length > 0 ? (
              transactions.map((tx, idx) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-white/[0.03] transition-colors group"
                >
                  <td className="py-3.5 px-6 text-slate-400 font-mono text-[11px] tabular-nums">
                    {new Date(tx.transactionDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3.5 px-6">
                    <p className="font-semibold text-white tracking-tight">{tx.description}</p>
                    {tx.notes && <p className="text-[10px] text-slate-400 truncate max-w-xs">{tx.notes}</p>}
                  </td>
                  <td className="py-3.5 px-6">
                    <span
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-slate-200 font-semibold text-[11px] border border-white/[0.04]"
                      style={{ backgroundColor: `${tx.category?.color || '#6366F1'}18` }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shadow-sm"
                        style={{ backgroundColor: tx.category?.color || '#6366F1', boxShadow: `0 0 6px ${tx.category?.color || '#6366F1'}80` }}
                      />
                      <span>{tx.category?.name || 'General'}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-300">
                    <p className="font-medium text-[11px]">{tx.account?.name}</p>
                    {tx.transferTargetAccount && (
                      <p className="text-[10px] text-brand-400">→ {tx.transferTargetAccount.name}</p>
                    )}
                  </td>
                  <td className="py-3.5 px-6">
                    <Badge variant={getBadgeVariant(tx.transactionType)} size="sm">
                      <span className="flex items-center space-x-1 font-semibold text-[10px]">
                        {getTxIcon(tx.transactionType)}
                        <span>{tx.transactionType}</span>
                      </span>
                    </Badge>
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono font-bold text-xs tabular-nums">
                    <span
                      className={
                        tx.transactionType === 'INCOME'
                          ? 'text-emerald-400'
                          : tx.transactionType === 'EXPENSE'
                          ? 'text-white'
                          : 'text-brand-300'
                      }
                    >
                      {tx.transactionType === 'INCOME' ? '+' : tx.transactionType === 'EXPENSE' ? '-' : ''}
                      {currency} {tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(tx)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this transaction? Account balance will be restored.')) {
                            onDelete(tx.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                  No transactions match your current search/filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-3.5 border-t border-white/[0.06] bg-obsidian-950/40 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page <span className="text-white font-semibold font-mono tabular-nums">{currentPage + 1}</span> of{' '}
            <span className="text-white font-semibold font-mono tabular-nums">{totalPages}</span>
          </span>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={currentPage === 0}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 rounded-lg border border-white/10 hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={currentPage >= totalPages - 1}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg border border-white/10 hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
