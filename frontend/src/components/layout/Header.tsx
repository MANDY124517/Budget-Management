import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, User as UserIcon, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ unreadCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="h-16 border-b border-white/[0.06] bg-obsidian-950/70 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-4">
        <div>
          <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">{currentDate}</p>
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
            {getGreeting()}, <span className="text-brand-300 font-bold">{user?.fullName?.split(' ')[0] || 'Friend'}</span>
            <span className="inline-block animate-pulse">✨</span>
          </h2>
        </div>

        {/* Human Financial Streak Badge */}
        <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-medium">
          <span className="text-xs">🔥</span>
          <span className="font-mono font-semibold">14-Day</span>
          <span className="text-amber-200/70">Budget Streak</span>
        </div>
      </div>

      <div className="flex items-center space-x-3.5">
        {/* Quick Link Badge */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            to="/transactions"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 text-xs font-semibold hover:border-brand-500/40 hover:text-white transition-all shadow-sm"
          >
            <span className="text-brand-400 font-bold">+</span>
            <span>Quick Record</span>
          </Link>
        </motion.div>

        {/* Currency Tag */}
        <div className="px-2.5 py-1 rounded-lg bg-obsidian-900/80 border border-white/[0.08] text-xs font-mono font-semibold text-slate-300">
          {user?.defaultCurrency || 'INR'}
        </div>

        {/* Notification Bell */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/notifications"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors relative block"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-obsidian-950 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" />
            )}
          </Link>
        </motion.div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center font-bold text-xs text-white shadow-glow-brand">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </motion.button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 glass-card-elevated rounded-2xl border border-white/10 shadow-2xl p-2 z-50"
                onClick={() => setShowProfileMenu(false)}
              >
                <div className="px-3 py-2 border-b border-white/[0.06]">
                  <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>
                <div className="py-1 space-y-0.5">
                  <Link
                    to="/settings"
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>Profile Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
