import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';
import { Badge } from '../components/ui/Badge';
import { Anomaly, Insight } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShieldAlert,
  BrainCircuit,
  TrendingUp,
  Activity,
  Lightbulb,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'forecast' | 'anomalies' | 'insights'>('overview');

  const { data: healthScore } = useQuery({
    queryKey: ['analytics', 'health-score'],
    queryFn: analyticsApi.getFinancialHealthScore,
  });

  const { data: forecast } = useQuery({
    queryKey: ['analytics', 'forecast'],
    queryFn: analyticsApi.getExpenseForecast,
  });

  const { data: anomalies } = useQuery({
    queryKey: ['analytics', 'anomalies'],
    queryFn: analyticsApi.getAnomalies,
  });

  const { data: insights = [] } = useQuery<Insight[]>({
    queryKey: ['analytics', 'insights'],
    queryFn: analyticsApi.getInsights,
  });

  const currencySymbol = '₹';

  const customForecastTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card-elevated border border-white/15 p-3.5 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[190px]">
          <p className="font-semibold text-slate-300 text-xs pb-1 border-b border-white/[0.08]">
            {label} {data.isProjection ? '(ML Forecast)' : '(Historical Outflow)'}
          </p>
          {data.actualExpense !== undefined && data.actualExpense !== null && (
            <p className="text-white font-mono tabular-nums font-medium">
              Actual: {currencySymbol} {data.actualExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          )}
          {data.projectedExpense !== undefined && data.projectedExpense !== null && (
            <p className="text-brand-300 font-bold font-mono tabular-nums">
              Projected: {currencySymbol} {data.projectedExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const tabs = [
    { id: 'overview', label: 'Health Overview', icon: Activity },
    { id: 'forecast', label: 'ML Expense Forecast', icon: BrainCircuit },
    { id: 'anomalies', label: 'Anomaly Detector', icon: ShieldAlert, count: anomalies?.totalAnomaliesDetected },
    { id: 'insights', label: 'Actionable Digest', icon: Lightbulb, count: insights.length },
  ];

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
            <span>AI Financial Intelligence &amp; ML</span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-wide">
              Scikit-learn Engine
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Explainable financial health scores, time-series regression forecasting, and Z-score anomaly detection.
          </p>
        </div>
      </div>

      {/* Segmented Filter Navigation with layoutId */}
      <div className="flex items-center space-x-1 p-1.5 rounded-2xl bg-obsidian-950/80 border border-white/[0.08] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all duration-200 z-10 ${
              activeTab === tab.id ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="analyticsTabPill"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500 rounded-xl shadow-glow-brand"
              />
            )}
            <tab.icon className={`w-3.5 h-3.5 relative z-10 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
            <span className="relative z-10">{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`relative z-10 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/[0.08] text-slate-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Tab View Body */}
      <AnimatePresence mode="wait">
        {(activeTab === 'overview' || activeTab === 'forecast') && (
          <motion.div
            key="overview-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="glass-card rounded-3xl p-8 border border-brand-500/20 relative overflow-hidden"
          >
            {/* Ambient Lighting */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.06] pb-6 relative z-10">
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600/30 to-indigo-500/20 border border-brand-500/40 flex items-center justify-center shadow-glow-brand"
                >
                  <span className="text-3xl font-black font-mono text-brand-300 tabular-nums">
                    {healthScore?.overallScore ?? 78}
                  </span>
                </motion.div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">Financial Vitality Index</h2>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 uppercase tracking-wide">
                      {healthScore?.tier ?? 'GOOD'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    Weighted algorithmic evaluation across 5 liquidity &amp; capital longevity pillars
                  </p>
                </div>
              </div>

              <div className="max-w-md bg-obsidian-950/70 p-4 rounded-2xl border border-white/[0.08] text-xs text-slate-300 shadow-sm">
                <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  Strategic AI Recommendation
                </p>
                <p className="text-slate-400 font-medium">
                  {healthScore?.summaryRecommendation ||
                    'Continue maintaining balanced savings and debt allocations to maximize fiscal health.'}
                </p>
              </div>
            </div>

            {/* 5 Pillar Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6 relative z-10">
              {healthScore?.factors &&
                Object.entries(healthScore.factors).map(([key, factor]) => (
                  <motion.div
                    key={key}
                    whileHover={{ y: -2 }}
                    className="p-4 rounded-2xl bg-obsidian-950/60 border border-white/[0.06] flex flex-col justify-between space-y-3 hover:border-white/15 transition-all"
                  >
                    <div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-200 capitalize tracking-tight">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="font-bold font-mono text-brand-300 tabular-nums">{factor.score}/100</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 font-semibold">
                        Impact Weight: {(factor.weight * 100).toFixed(0)}%
                      </p>
                    </div>

                    <div className="w-full bg-obsidian-900 h-1.5 rounded-full overflow-hidden border border-white/[0.05]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${factor.score}%` }}
                        transition={{ duration: 0.8 }}
                        className="bg-gradient-to-r from-brand-500 to-cyan-400 h-full rounded-full"
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug font-medium">{factor.feedback}</p>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expense Forecasting & Time Series Chart */}
      <AnimatePresence mode="wait">
        {(activeTab === 'overview' || activeTab === 'forecast') && (
          <motion.div
            key="forecast-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="glass-card rounded-3xl p-8 border border-white/[0.08]"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <BrainCircuit className="w-5 h-5 text-brand-400" />
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Next-Month Outflow Regression Forecast
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Model: <span className="text-brand-300 font-mono font-semibold">{forecast?.modelUsed}</span> •{' '}
                  {forecast?.rationale}
                </p>
              </div>

              {forecast && (
                <div className="flex items-center space-x-4 bg-obsidian-950/80 border border-white/[0.08] px-4 py-2.5 rounded-2xl font-mono">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Projected Outflow ({forecast.nextMonth})</p>
                    <p className="text-base font-bold text-brand-300 tabular-nums">
                      {currencySymbol} {forecast.predictedExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-400 border-l border-white/[0.08] pl-4 font-mono">
                    <p className="font-semibold text-slate-300">Confidence: {(forecast.confidenceScore * 100).toFixed(0)}%</p>
                    <p className="text-[10px] text-slate-500 tabular-nums">
                      Range: {currencySymbol} {forecast.lowerBound?.toLocaleString('en-IN')} -{' '}
                      {currencySymbol} {forecast.upperBound?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Forecast Chart */}
            <div className="h-72 w-full">
              {forecast?.historicalAndProjected && forecast.historicalAndProjected.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={forecast.historicalAndProjected}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                    />
                    <Tooltip content={customForecastTooltip} />
                    <Area
                      type="monotone"
                      dataKey="actualExpense"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      fillOpacity={0.15}
                      fill="#10B981"
                    />
                    <Area
                      type="monotone"
                      dataKey="projectedExpense"
                      stroke="#6366F1"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      fillOpacity={1}
                      fill="url(#forecastGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 font-medium">
                  Need at least 1 month of expense records to generate time-series forecasts.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spending Anomaly Detection Section */}
      <AnimatePresence mode="wait">
        {(activeTab === 'overview' || activeTab === 'anomalies') && (
          <motion.div
            key="anomalies-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="glass-card rounded-3xl p-8 space-y-4 border border-white/[0.08]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">Spending Anomalies &amp; Deviation Outliers</h3>
              </div>
              <span className="text-xs font-mono text-slate-400 font-medium">
                {anomalies?.totalAnomaliesDetected || 0} unusual transactions flagged
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {anomalies?.anomalies && anomalies.anomalies.length > 0 ? (
                anomalies.anomalies.map((a: Anomaly, idx: number) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -2 }}
                    className="p-4 rounded-2xl bg-obsidian-950/70 border border-white/[0.06] space-y-2 hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight">{a.description || a.category}</h4>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Category: {a.category} • Date: {a.date}
                        </p>
                      </div>
                      <Badge variant={a.severity === 'HIGH' ? 'danger' : 'warning'} size="sm">
                        {a.severity} Dev ({a.zScore}σ)
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-obsidian-900/60 p-2.5 rounded-xl border border-white/[0.05] font-medium">
                      {a.reason}
                    </p>

                    <div className="flex justify-between text-xs font-mono pt-1 text-slate-400 tabular-nums">
                      <span>Actual: <strong className="text-rose-400">{currencySymbol} {a.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
                      <span>Typical Mean: {currencySymbol} {a.categoryMean.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-8 text-center col-span-2 font-medium">
                  No anomalies detected. All transaction amounts are within expected standard deviation bounds.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Natural Language Insights Feed */}
      <AnimatePresence mode="wait">
        {(activeTab === 'overview' || activeTab === 'insights') && (
          <motion.div
            key="insights-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="glass-card rounded-3xl p-8 space-y-4 border border-white/[0.08]"
          >
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              Actionable Intelligence Digest
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.map((ins: Insight, idx: number) => (
                <motion.div
                  key={ins.id || idx}
                  whileHover={{ y: -2 }}
                  className="p-5 rounded-2xl bg-obsidian-950/70 border border-white/[0.06] flex flex-col justify-between space-y-3 hover:border-white/15 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-white tracking-tight">{ins.title}</h4>
                      <Badge
                        variant={
                          ins.severity === 'SUCCESS'
                            ? 'success'
                            : ins.severity === 'WARNING'
                            ? 'warning'
                            : 'info'
                        }
                        size="sm"
                      >
                        {ins.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">{ins.summary}</p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] text-[10px] text-slate-500 font-mono font-semibold">
                    Confidence: {(ins.confidenceScore * 100).toFixed(0)}%
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
