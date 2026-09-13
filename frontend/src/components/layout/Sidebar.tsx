import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Wallet,
  Target,
  Sparkles,
  FileText,
  Bell,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  unreadNotificationsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ unreadNotificationsCount = 0 }) => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: Receipt },
    { to: '/budgets', label: 'Budgets', icon: PieChart },
    { to: '/accounts', label: 'Accounts', icon: Wallet },
    { to: '/goals', label: 'Savings Goals', icon: Target },
    { to: '/analytics', label: 'AI Analytics', icon: Sparkles, badge: 'ML' },
    { to: '/reports', label: 'Reports', icon: FileText },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
      count: unreadNotificationsCount,
    },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-obsidian-950/80 border-r border-white/[0.07] flex flex-col justify-between h-screen sticky top-0 backdrop-blur-xl select-none z-30">
      <div>
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center px-6 border-b border-white/[0.06] space-x-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-400 flex items-center justify-center shadow-glow-brand"
          >
            <ShieldCheck className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-white tracking-tight">SmartBudget</h1>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Financial Intelligence</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-200 group ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Framer Motion Active Background Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500 rounded-xl shadow-glow-brand"
                    />
                  )}

                  <div className="flex items-center space-x-3 relative z-10">
                    <item.icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="relative z-10 flex items-center space-x-1.5">
                    {item.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.count && item.count > 0 ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                        {item.count}
                      </span>
                    ) : null}
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Security Badge */}
      <div className="p-3 border-t border-white/[0.06]">
        <motion.div
          whileHover={{ y: -1 }}
          className="p-3 rounded-xl bg-obsidian-900/60 border border-white/[0.06] flex items-center space-x-3"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
          <div className="text-xs">
            <p className="font-semibold text-slate-200 text-[11px]">Bank-Grade Security</p>
            <p className="text-[10px] text-slate-400">Zero floating-point drift</p>
          </div>
        </motion.div>
      </div>
    </aside>
  );
};
