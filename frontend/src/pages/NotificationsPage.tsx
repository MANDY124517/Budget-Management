import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notificationsApi';
import { NotificationItem, NotificationSeverity } from '../types';
import { Badge } from '../components/ui/Badge';
import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: pagedData } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationsApi.getNotifications(0, 50),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getSeverityIcon = (sev: NotificationSeverity) => {
    switch (sev) {
      case 'DANGER':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'INFO':
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getSeverityBadgeVariant = (sev: NotificationSeverity) => {
    switch (sev) {
      case 'DANGER':
        return 'danger';
      case 'WARNING':
        return 'warning';
      case 'SUCCESS':
        return 'success';
      case 'INFO':
      default:
        return 'info';
    }
  };

  const notifications = pagedData?.content || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-brand-400" />
            <span>Notification &amp; Alert Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Real-time notifications for 80%, 100%, 120% budget thresholds, recurrence executions, and unusual spending spikes.
          </p>
        </div>

        {notifications.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => markAllReadMutation.mutate()}
            className="px-4 py-2 rounded-xl glass-card text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1.5 transition-all shadow-sm self-start md:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-brand-400" />
            <span>Mark All as Read</span>
          </motion.button>
        )}
      </div>

      <div className="glass-card rounded-3xl p-6 divide-y divide-white/[0.06] border border-white/[0.08]">
        {notifications.length > 0 ? (
          notifications.map((n: NotificationItem, idx: number) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 transition-colors ${
                !n.isRead ? 'bg-brand-500/5 -mx-6 px-6 rounded-2xl' : ''
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-xl bg-obsidian-950 border border-white/10 shrink-0 mt-0.5 shadow-inner">
                  {getSeverityIcon(n.severity)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white tracking-tight">{n.title}</h3>
                    <Badge variant={getSeverityBadgeVariant(n.severity)} size="sm">
                      {n.notificationType.replace('_', ' ')}
                    </Badge>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-medium">{n.message}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1.5 tabular-nums font-semibold">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {!n.isRead && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => markReadMutation.mutate(n.id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.08] shrink-0 transition-colors"
                >
                  Mark read
                </motion.button>
              )}
            </motion.div>
          ))
        ) : (
          <div className="py-12 text-center text-xs text-slate-500 font-medium">
            No notifications to display.
          </div>
        )}
      </div>
    </motion.div>
  );
};
