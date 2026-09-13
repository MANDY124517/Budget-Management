import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ShieldCheck, Lock, Unlock, Wifi } from 'lucide-react';
import { Account } from '../../types';

interface VirtualCardWidgetProps {
  accounts: Account[];
  currency?: string;
}

export const VirtualCardWidget: React.FC<VirtualCardWidgetProps> = ({
  accounts = [],
  currency = '₹',
}) => {
  const [copied, setCopied] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const activeAccount = accounts[selectedIdx] || {
    id: 1,
    name: 'Primary Vault',
    accountType: 'CHECKING',
    balance: 84250.0,
    accountNumberMask: '4928',
    institutionName: 'SmartBudget Platinum',
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText?.(`4532 •••• •••• ${activeAccount.accountNumberMask || '4928'}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between border border-white/[0.08]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-300">
            Smart Virtual Card
          </span>
          <h3 className="text-sm font-bold text-white tracking-tight">Active Payment Instrument</h3>
        </div>

        {/* Account Selector Pill */}
        {accounts.length > 1 && (
          <div className="flex items-center space-x-1 bg-obsidian-950/80 p-1 rounded-xl border border-white/10 text-[10px]">
            {accounts.slice(0, 3).map((acc, i) => (
              <button
                key={acc.id}
                onClick={() => setSelectedIdx(i)}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                  selectedIdx === i ? 'bg-brand-500 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {acc.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Realistic 3D Tactile Physical Card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`relative h-48 w-full rounded-2xl p-5 flex flex-col justify-between overflow-hidden shadow-2xl transition-opacity duration-200 ${
          isFrozen ? 'opacity-60 grayscale' : 'card-metal'
        }`}
      >
        {/* Background glow & mesh */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Card Row */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black tracking-widest text-white uppercase font-sans">
              SMART<span className="text-brand-400">BUDGET</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono font-bold">
              PLATINUM
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-slate-300 rotate-90" />
            <span className="text-xs font-mono font-bold text-slate-400">DEBIT</span>
          </div>
        </div>

        {/* EMV Metallic Chip */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 border border-amber-300/40 p-1 flex flex-col justify-between shadow-inner">
            <div className="border-b border-amber-800/40 w-full h-1/2" />
            <div className="border-t border-amber-800/40 w-full h-1/2" />
          </div>
          {isFrozen && (
            <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-500/30">
              CARD LOCKED
            </span>
          )}
        </div>

        {/* Card Number & Balance */}
        <div className="relative z-10">
          <div className="flex items-center justify-between text-white/90">
            <p className="font-mono text-sm tracking-widest font-semibold tabular-nums">
              •••• •••• •••• {activeAccount.accountNumberMask || '4928'}
            </p>
            <p className="font-mono text-xs text-slate-400 tabular-nums">09/28</p>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
            <div>
              <p className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">Available Balance</p>
              <p className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                {currency} {activeAccount.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <p className="text-xs font-semibold text-slate-200 tracking-tight">
              {activeAccount.name}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Card Controls Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] mt-4 text-xs font-medium">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className="flex items-center space-x-1.5 text-slate-300 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copied ? 'Copied Number' : 'Copy Card Info'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFrozen(!isFrozen)}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl border transition-all ${
            isFrozen
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white'
          }`}
        >
          {isFrozen ? <Lock className="w-3.5 h-3.5 text-rose-400" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
          <span>{isFrozen ? 'Unlock Card' : 'Freeze Card'}</span>
        </motion.button>
      </div>
    </div>
  );
};
