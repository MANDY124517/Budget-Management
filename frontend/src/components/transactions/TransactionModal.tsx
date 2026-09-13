import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Account, Category, PaymentMethod, Transaction, TransactionType } from '../../types';
import { transactionsApi } from '../../api/transactionsApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  accounts,
  categories,
  editingTransaction,
}) => {
  const queryClient = useQueryClient();

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [accountId, setAccountId] = useState<number | ''>('');
  const [transferTargetAccountId, setTransferTargetAccountId] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.transactionType);
      setAmount(editingTransaction.amount.toString());
      setAccountId(editingTransaction.account.id);
      setTransferTargetAccountId(editingTransaction.transferTargetAccount?.id || '');
      setCategoryId(editingTransaction.category.id);
      setTransactionDate(editingTransaction.transactionDate);
      setDescription(editingTransaction.description);
      setPaymentMethod(editingTransaction.paymentMethod || 'OTHER');
      setNotes(editingTransaction.notes || '');
    } else {
      setType('EXPENSE');
      setAmount('');
      if (accounts.length > 0) setAccountId(accounts[0].id);
      if (categories.length > 0) {
        const defaultCat = categories.find((c) => c.categoryType === 'EXPENSE') || categories[0];
        setCategoryId(defaultCat.id);
      }
      setTransferTargetAccountId('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setPaymentMethod('UPI');
      setNotes('');
    }
    setError(null);
  }, [editingTransaction, isOpen, accounts, categories]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        accountId: Number(accountId),
        categoryId: Number(categoryId),
        transferTargetAccountId: type === 'TRANSFER' ? Number(transferTargetAccountId) : undefined,
        transactionType: type,
        amount: parseFloat(amount),
        transactionDate,
        description: description.trim(),
        paymentMethod,
        notes: notes.trim() || undefined,
      };

      if (editingTransaction) {
        return await transactionsApi.updateTransaction(editingTransaction.id, payload);
      } else {
        return await transactionsApi.createTransaction(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to save transaction');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    if (!accountId) {
      setError('Please select an account');
      return;
    }
    if (type === 'TRANSFER' && (!transferTargetAccountId || transferTargetAccountId === accountId)) {
      setError('Please select a different target account for transfers');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    mutation.mutate();
  };

  const filteredCategories = categories.filter((c) =>
    type === 'TRANSFER' ? c.categoryType === 'TRANSFER' : c.categoryType === type
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTransaction ? 'Edit Transaction' : 'Record New Transaction'}
      subtitle="Track your incoming and outgoing capital with instant reconciliation"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold"
          >
            {error}
          </motion.div>
        )}

        {/* Transaction Type Segmented Switch with Framer Motion layoutId */}
        <div className="grid grid-cols-3 p-1 rounded-xl bg-obsidian-950 border border-white/[0.08] relative">
          {(['EXPENSE', 'INCOME', 'TRANSFER'] as TransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                const matching = categories.find((c) => (t === 'TRANSFER' ? c.categoryType === 'TRANSFER' : c.categoryType === t));
                if (matching) setCategoryId(matching.id);
              }}
              className={`relative py-2 text-xs font-bold rounded-lg transition-colors z-10 ${
                type === t ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type === t && (
                <motion.div
                  layoutId="modalTypePill"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className={`absolute inset-0 rounded-lg shadow-sm ${
                    t === 'INCOME'
                      ? 'bg-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : t === 'EXPENSE'
                      ? 'bg-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                      : 'bg-brand-600 shadow-glow-brand'
                  }`}
                />
              )}
              <span className="relative z-20 tracking-wide">{t}</span>
            </button>
          ))}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Amount (₹) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-base font-bold">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full glass-input rounded-xl pl-8 pr-4 py-2.5 text-white font-mono text-lg font-bold tabular-nums"
            />
          </div>
        </div>

        {/* Account and Target Account (if transfer) */}
        <div className={`grid ${type === 'TRANSFER' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {type === 'TRANSFER' ? 'Source Account *' : 'Account *'}
            </label>
            <select
              required
              value={accountId}
              onChange={(e) => setAccountId(Number(e.target.value))}
              className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-medium text-white"
            >
              <option value="">Select Account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (₹{acc.balance?.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {type === 'TRANSFER' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Destination Account *
              </label>
              <select
                required
                value={transferTargetAccountId}
                onChange={(e) => setTransferTargetAccountId(Number(e.target.value))}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-medium text-white"
              >
                <option value="">Select Target Account</option>
                {accounts
                  .filter((a) => a.id !== Number(accountId))
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Category & Payment Method */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-medium text-white"
            >
              <option value="">Select Category</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-medium text-white"
            >
              <option value="UPI">UPI</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="CASH">Cash</option>
              <option value="NET_BANKING">Net Banking</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Date & Description */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Date *
            </label>
            <input
              type="date"
              required
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Swiggy Order, Fuel, Salary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="Tags, reimbursement status, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-white/[0.08]">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={mutation.isPending}
            className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 rounded-xl transition-all shadow-glow-brand disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : editingTransaction ? 'Update Transaction' : 'Save Transaction'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};
