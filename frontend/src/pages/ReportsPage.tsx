import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';
import { transactionsApi } from '../api/transactionsApi';
import { CategorySpending } from '../types';
import { Download, Printer, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const ReportsPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const startDate = `${selectedMonth}-01`;
  const [year, month] = selectedMonth.split('-').map(Number);
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data: spending } = useQuery({
    queryKey: ['analytics', 'spending', startDate, endDate],
    queryFn: () => analyticsApi.getSpendingAnalysis(startDate, endDate),
  });

  const { data: categories = [] } = useQuery<CategorySpending[]>({
    queryKey: ['transactions', 'category-summary', startDate, endDate],
    queryFn: () => transactionsApi.getCategorySummary(startDate, endDate),
  });

  const currencySymbol = '₹';

  const handleExportCsv = () => {
    const url = transactionsApi.exportCsvUrl(startDate, endDate);
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-7 print:p-0 print:m-0"
    >
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-brand-400" />
            <span>Monthly Financial Statements &amp; Reports</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Audited monthly breakdown of all inflows, category burns, net savings, and exportable ledger.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="glass-input rounded-xl px-3 py-2 text-xs text-white font-mono"
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl glass-card text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-obsidian-900 border border-white/10 hover:bg-white/[0.08] text-xs font-semibold text-white flex items-center space-x-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </motion.button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="glass-card rounded-3xl p-8 space-y-6 border border-white/[0.08] print:border-none print:shadow-none print:bg-white print:text-black">
        <div className="border-b border-white/[0.06] pb-6 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Statement of Accounts —{' '}
              {new Date(startDate).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Period: {startDate} to {endDate}
            </p>
          </div>
          <div className="text-right text-xs font-mono text-slate-400 tabular-nums">
            <p className="font-semibold text-slate-300">SmartBudget Audited Ledger</p>
            <p className="text-[10px]">Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <motion.div whileHover={{ y: -2 }} className="p-5 rounded-2xl bg-obsidian-950/70 border border-white/[0.06]">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Monthly Inflows</p>
            <h3 className="text-2xl font-bold text-emerald-400 font-mono mt-1 tabular-nums">
              {currencySymbol} {(spending?.totalIncome ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="p-5 rounded-2xl bg-obsidian-950/70 border border-white/[0.06]">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Monthly Outflows</p>
            <h3 className="text-2xl font-bold text-rose-400 font-mono mt-1 tabular-nums">
              {currencySymbol} {(spending?.totalExpenses ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="p-5 rounded-2xl bg-obsidian-950/70 border border-white/[0.06]">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Net Retained Savings</p>
            <h3 className="text-2xl font-bold text-brand-300 font-mono mt-1 tabular-nums">
              {currencySymbol} {(spending?.totalSavings ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 font-mono tabular-nums font-semibold">
              Savings Rate: {spending?.savingsRate ?? 0}%
            </p>
          </motion.div>
        </div>

        {/* Detailed Category Expense Table */}
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Expense Breakdown by Category
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full text-left text-xs">
              <thead className="bg-obsidian-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-white/[0.06]">
                <tr>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-right">% of Total Spending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] font-mono text-xs tabular-nums">
                {categories && categories.length > 0 ? (
                  categories.map((c: CategorySpending) => (
                    <tr key={c.categoryId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-white font-sans flex items-center space-x-2.5">
                        <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: c.color, boxShadow: `0 0 6px ${c.color}80` }} />
                        <span className="font-medium">{c.categoryName}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-200 font-semibold">
                        {currencySymbol} {c.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-brand-300 font-bold">
                        {c.percentage}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500 font-medium">
                      No expense transactions logged for this statement period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
