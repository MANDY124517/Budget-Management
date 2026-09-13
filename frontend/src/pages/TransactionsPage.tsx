import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../api/transactionsApi';
import { accountsApi } from '../api/accountsApi';
import { categoriesApi } from '../api/categoriesApi';
import { Account, Category, Transaction, TransactionFilter, TransactionType } from '../types';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { Plus, Download, Search, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export const TransactionsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [pageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<TransactionType | ''>('');
  const [accountId, setAccountId] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const filter: TransactionFilter = {
    page,
    size: pageSize,
    search: search.trim() || undefined,
    type: type ? (type as TransactionType) : undefined,
    accountId: accountId ? Number(accountId) : undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sort: 'transactionDate,desc',
  };

  const { data: pagedData, isLoading } = useQuery({
    queryKey: ['transactions', filter],
    queryFn: () => transactionsApi.getTransactions(filter),
  });

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAccounts,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => transactionsApi.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearch('');
    setType('');
    setAccountId('');
    setCategoryId('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const handleExportCsv = () => {
    const url = transactionsApi.exportCsvUrl(startDate || undefined, endDate || undefined);
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Transactions Ledger</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Search, filter, and audit every incoming and outgoing transaction with full balance reconciliation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-xl glass-card text-xs font-semibold text-slate-300 hover:text-white hover:border-white/20 flex items-center space-x-2 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs transition-all shadow-glow-brand flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </motion.button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="glass-card rounded-2xl p-4 space-y-4 border border-white/[0.08]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search description or note..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 font-medium"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as TransactionType | '');
                setPage(0);
              }}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white font-medium"
            >
              <option value="">All Types (All Flows)</option>
              <option value="EXPENSE">Expenses Only</option>
              <option value="INCOME">Income Only</option>
              <option value="TRANSFER">Transfers Only</option>
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={accountId}
              onChange={(e) => {
                setAccountId(e.target.value ? Number(e.target.value) : '');
                setPage(0);
              }}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white font-medium"
            >
              <option value="">All Accounts</option>
              {accounts.map((acc: Account) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value ? Number(e.target.value) : '');
                setPage(0);
              }}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white font-medium"
            >
              <option value="">All Categories</option>
              {categories.map((cat: Category) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter Quick Reset */}
          <div className="flex items-center space-x-2">
            <input
              type="date"
              placeholder="From"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(0);
              }}
              className="w-1/2 glass-input rounded-xl px-2 py-2 text-xs text-white"
            />
            <input
              type="date"
              placeholder="To"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(0);
              }}
              className="w-1/2 glass-input rounded-xl px-2 py-2 text-xs text-white"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleResetFilters}
              title="Reset Filters"
              className="p-2 rounded-xl bg-obsidian-950 border border-white/10 hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Transactions Data Table */}
      <TransactionTable
        transactions={pagedData?.content || []}
        currentPage={pagedData?.page || 0}
        totalPages={pagedData?.totalPages || 0}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={(id: number) => deleteMutation.mutate(id)}
        isLoading={isLoading}
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        accounts={accounts}
        categories={categories}
        editingTransaction={editingTransaction}
      />
    </motion.div>
  );
};
