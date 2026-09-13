import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notificationsApi';
import { AnimatePresence, motion } from 'framer-motion';

export const AppLayout: React.FC = () => {
  const location = useLocation();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 30000,
  });

  return (
    <div className="flex min-h-screen bg-obsidian-950 text-slate-100 selection:bg-brand-500/30 selection:text-brand-200">
      <Sidebar unreadNotificationsCount={unreadCount} />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Header unreadCount={unreadCount} />
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
