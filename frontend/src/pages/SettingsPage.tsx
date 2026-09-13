import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { User, Lock, Server } from 'lucide-react';
import { motion } from 'framer-motion';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();

  // Profile Form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [defaultCurrency, setDefaultCurrency] = useState(user?.defaultCurrency || 'INR');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPwdSaving, setIsPwdSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setIsProfileSaving(true);

    try {
      const updated = await authApi.updateProfile({ fullName, defaultCurrency });
      updateUser(updated);
      setProfileMsg({ type: 'success', text: 'Profile preferences updated successfully.' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsPwdSaving(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setPwdMsg({ type: 'success', text: 'Password successfully updated.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setIsPwdSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-7 max-w-4xl mx-auto"
    >
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Account &amp; System Settings</h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          Manage your personal profile, security credentials, and system environment configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="glass-card rounded-3xl p-6 space-y-4 border border-white/[0.08]">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-white/[0.06]">
            <User className="w-5 h-5 text-brand-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Profile Preferences</h3>
          </div>

          {profileMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl text-xs font-semibold ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              {profileMsg.text}
            </motion.div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-obsidian-950/60 border border-white/[0.06] rounded-xl px-3.5 py-2 text-xs text-slate-400 cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Default Currency
              </label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white font-medium"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isProfileSaving}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs shadow-glow-brand transition-all disabled:opacity-50"
            >
              {isProfileSaving ? 'Saving...' : 'Save Profile Changes'}
            </motion.button>
          </form>
        </div>

        {/* Security & Password Card */}
        <div className="glass-card rounded-3xl p-6 space-y-4 border border-white/[0.08]">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-white/[0.06]">
            <Lock className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Security &amp; Password</h3>
          </div>

          {pwdMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl text-xs font-semibold ${
                pwdMsg.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              {pwdMsg.text}
            </motion.div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isPwdSaving}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold text-xs shadow-[0_0_20px_-3px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50"
            >
              {isPwdSaving ? 'Updating...' : 'Update Password'}
            </motion.button>
          </form>
        </div>
      </div>

      {/* System Architecture Status Card */}
      <div className="glass-card rounded-3xl p-6 space-y-4 border border-white/[0.08]">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-white/[0.06]">
          <Server className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white tracking-tight">Microservice &amp; Topology Telemetry</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <motion.div whileHover={{ y: -2 }} className="p-4 rounded-2xl bg-obsidian-950/70 border border-white/[0.06] space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              <p className="font-bold text-white">Java Spring Boot 3</p>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">Core Financial &amp; Auth API</p>
            <p className="text-[10px] text-emerald-400 font-semibold">Port 8080 • Active</p>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="p-4 rounded-2xl bg-obsidian-950/70 border border-white/[0.06] space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              <p className="font-bold text-white">Python 3.14 FastAPI</p>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">ML &amp; Statistical Engine</p>
            <p className="text-[10px] text-emerald-400 font-semibold">Port 8001 • Active</p>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="p-4 rounded-2xl bg-obsidian-950/70 border border-white/[0.06] space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              <p className="font-bold text-white">PostgreSQL / H2</p>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">Relational Persistence DB</p>
            <p className="text-[10px] text-emerald-400 font-semibold">Auto-Synced • Active</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
