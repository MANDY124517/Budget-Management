import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '../api/accountsApi';
import { Account, AccountType } from '../types';
import { Modal } from '../components/ui/Modal';
import { StatCard } from '../components/ui/StatCard';
import { motion } from 'framer-motion';
import {
  Wallet,
  CreditCard,
  Building,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Banknote,
} from 'lucide-react';

export const AccountsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('SAVINGS');
  const [initialBalance, setInitialBalance] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [accountNumberMask, setAccountNumberMask] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: summary } = useQuery({
    queryKey: ['accounts', 'summary'],
    queryFn: accountsApi.getSummary,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingAccount) {
        return await accountsApi.updateAccount(editingAccount.id, {
          name: name.trim(),
          accountType,
          institutionName: institutionName.trim() || undefined,
          accountNumberMask: accountNumberMask.trim() || undefined,
        });
      } else {
        return await accountsApi.createAccount({
          name: name.trim(),
          accountType,
          initialBalance: parseFloat(initialBalance) || 0,
          currency: 'INR',
          institutionName: institutionName.trim() || undefined,
          accountNumberMask: accountNumberMask.trim() || undefined,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to save account');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => accountsApi.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleOpenCreate = () => {
    setEditingAccount(null);
    setName('');
    setAccountType('SAVINGS');
    setInitialBalance('');
    setInstitutionName('');
    setAccountNumberMask('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setAccountType(acc.accountType);
    setInitialBalance(acc.balance.toString());
    setInstitutionName(acc.institutionName || '');
    setAccountNumberMask(acc.accountNumberMask || '');
    setError(null);
    setIsModalOpen(true);
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'CHECKING':
      case 'SAVINGS':
        return Building;
      case 'CREDIT_CARD':
      case 'LOAN':
        return CreditCard;
      case 'INVESTMENT':
        return TrendingUp;
      case 'CASH':
      default:
        return Banknote;
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
      {/* Header & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Financial Accounts</span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Double-Entry Ledger
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Manage your bank accounts, credit cards, cash wallets, and investment holdings with automated double-entry balance tracking.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs transition-all shadow-glow-brand flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Account</span>
        </motion.button>
      </div>

      {/* Net Worth & Assets Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Net Worth"
          amount={summary?.netWorth ?? 0}
          currency={currencySymbol}
          icon={Wallet}
          iconColor="brand"
          subtitle="Assets minus liabilities"
          delay={0.05}
        />
        <StatCard
          title="Liquid Cash & Bank"
          amount={summary?.totalCashAndBank ?? 0}
          currency={currencySymbol}
          icon={Building}
          iconColor="emerald"
          subtitle="Readily available liquidity"
          delay={0.1}
        />
        <StatCard
          title="Credit Liabilities"
          amount={summary?.totalCreditCardLiabilities ?? 0}
          currency={currencySymbol}
          icon={CreditCard}
          iconColor="rose"
          subtitle="Credit cards & loans"
          delay={0.15}
        />
        <StatCard
          title="Investments"
          amount={summary?.totalInvestments ?? 0}
          currency={currencySymbol}
          icon={TrendingUp}
          iconColor="cyan"
          subtitle="Growth portfolio value"
          delay={0.2}
        />
      </div>

      {/* Account Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">All Registered Accounts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {summary?.accounts && summary.accounts.length > 0 ? (
            summary.accounts.map((acc: Account, idx: number) => {
              const IconComponent = getAccountIcon(acc.accountType);
              const isLiability = acc.accountType === 'CREDIT_CARD' || acc.accountType === 'LOAN';

              return (
                <motion.div
                  key={acc.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -3 }}
                  className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group border border-white/[0.08]"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 shadow-glow-brand">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white line-clamp-1 tracking-tight">{acc.name}</h4>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {acc.institutionName || 'Self Managed'} • {acc.accountType}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-obsidian-950 text-slate-400 border border-white/10">
                        {acc.accountNumberMask || '••••'}
                      </span>
                    </div>

                    <div className="my-6">
                      <p className="text-[11px] text-slate-400 font-medium">Reconciled Balance</p>
                      <h3
                        className={`text-2xl font-bold font-mono tracking-tight mt-1 tabular-nums ${
                          isLiability ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {isLiability && '-'}
                        {currencySymbol} {Math.abs(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-xs">
                    <span className="text-slate-500 text-[11px]">
                      Created {new Date(acc.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleOpenEdit(acc)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
                        title="Edit Account"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          if (window.confirm(`Deactivate account '${acc.name}'?`)) {
                            deleteMutation.mutate(acc.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Deactivate Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <p className="text-xs text-slate-500 py-8 text-center col-span-3 glass-card rounded-2xl border border-white/[0.06] font-medium">
              No accounts created yet. Add your bank accounts or cash wallets above.
            </p>
          )}
        </div>
      </div>

      {/* Create / Edit Account Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAccount ? 'Edit Account' : 'Add Financial Account'}
        subtitle="Register checking, savings, credit cards, or investment portfolios"
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
              Account Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. HDFC Salary, Emergency Cash, SBI Savings"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Account Type *
            </label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as AccountType)}
              className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white"
            >
              <option value="SAVINGS">Savings Account</option>
              <option value="CHECKING">Checking Account</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="CASH">Cash / Wallet</option>
              <option value="INVESTMENT">Investment Holding</option>
              <option value="LOAN">Loan / Debt</option>
            </select>
          </div>

          {!editingAccount && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Initial Balance (₹)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white font-mono tabular-nums"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Institution
              </label>
              <input
                type="text"
                placeholder="e.g. HDFC Bank, ICICI"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Card / Account Mask
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder="••••4912"
                value={accountNumberMask}
                onChange={(e) => setAccountNumberMask(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white font-mono"
              />
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
              {saveMutation.isPending ? 'Saving...' : editingAccount ? 'Update Account' : 'Add Account'}
            </motion.button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
