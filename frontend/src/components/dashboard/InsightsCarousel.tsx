import React, { useState } from 'react';
import { Insight } from '../../types';
import { Sparkles, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InsightsCarouselProps {
  insights?: Insight[];
}

export const InsightsCarousel: React.FC<InsightsCarouselProps> = ({ insights = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!insights || insights.length === 0) return null;

  const current = insights[currentIndex % insights.length];

  const severityIcons = {
    INFO: <Info className="w-4 h-4 text-cyan-400 shrink-0" />,
    SUCCESS: <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />,
    WARNING: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />,
    DANGER: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
  };

  const severityStyles = {
    INFO: 'border-cyan-500/20 bg-cyan-950/25 shadow-[0_0_20px_-5px_rgba(6,182,212,0.15)]',
    SUCCESS: 'border-emerald-500/20 bg-emerald-950/25 shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)]',
    WARNING: 'border-amber-500/20 bg-amber-950/25 shadow-[0_0_20px_-5px_rgba(245,158,11,0.15)]',
    DANGER: 'border-rose-500/20 bg-rose-950/25 shadow-[0_0_20px_-5px_rgba(244,63,94,0.15)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl p-4 border flex items-center justify-between backdrop-blur-xl relative overflow-hidden ${
        severityStyles[current.severity as keyof typeof severityStyles] || severityStyles.INFO
      }`}
    >
      <div className="flex items-center space-x-3.5 pr-4 relative z-10">
        <div className="p-2.5 rounded-xl bg-obsidian-950 border border-white/10 shadow-inner flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id || currentIndex}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-2">
              {severityIcons[current.severity as keyof typeof severityIcons]}
              <h4 className="text-xs font-bold text-white tracking-tight">{current.title}</h4>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-medium">{current.summary}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {insights.length > 1 && (
        <div className="flex items-center space-x-1 shrink-0 relative z-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() =>
              setCurrentIndex((prev) => (prev === 0 ? insights.length - 1 : prev - 1))
            }
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          <span className="text-[11px] font-mono tabular-nums text-slate-400 px-1.5 font-semibold">
            {currentIndex + 1}/{insights.length}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentIndex((prev) => (prev + 1) % insights.length)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};
