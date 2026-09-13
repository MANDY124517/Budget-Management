import React from 'react';
import { LucideIcon, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderOpen,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl glass-panel border border-dashed border-slate-700/60 my-6">
      <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-brand-400 mb-4 shadow-lg shadow-brand-500/5">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all shadow-md shadow-brand-600/20 active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
