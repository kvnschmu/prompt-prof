import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import type { Toast } from '../stores/uiStore';

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useUIStore((s) => s.removeToast);
  const icon = toast.variant === 'success' ? CheckCircle
    : toast.variant === 'error' ? AlertCircle
    : Info;
  const Icon = icon;
  const borderColor = toast.variant === 'success' ? 'border-emerald-500/30'
    : toast.variant === 'error' ? 'border-red-500/30'
    : 'border-indigo-500/30';

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      className={`glass-card !p-4 flex items-start gap-3 max-w-sm border ${borderColor}`}
    >
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0 text-indigo-400" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{toast.description}</p>
        )}
      </div>
      <button onClick={() => removeToast(toast.id)} className="text-muted-foreground hover:text-foreground">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
