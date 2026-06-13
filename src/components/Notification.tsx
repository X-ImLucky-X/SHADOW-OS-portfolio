import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../store/notificationStore';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { Terminal, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export const Notification: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();
  const shouldReduceMotion = useReducedMotion();

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-[#008000]';
      case 'warning':
        return 'border-[#808000]';
      case 'error':
        return 'border-[#800080]';
      case 'info':
      default:
        return 'border-[#008080]';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-accent-green" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-accent-amber" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-accent-pink" />;
      case 'info':
      default:
        return <Terminal className="w-4 h-4 text-accent-cyan" />;
    }
  };

  return (
    <div className="fixed bottom-20 right-6 z-[9998] flex flex-col gap-3 w-80 max-w-[calc(100vw-3rem)]">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            layout={!shouldReduceMotion}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
            className={`p-3 flex items-start gap-3 relative overflow-hidden bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black shadow-md ${getBorderColor(
              n.type
            )}`}
          >
            {/* Color Accent Stripe */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 ${
                n.type === 'success'
                  ? 'bg-accent-green'
                  : n.type === 'warning'
                  ? 'bg-accent-amber'
                  : n.type === 'error'
                  ? 'bg-accent-pink'
                  : 'bg-accent-cyan'
              }`}
            />

            <div className="mt-0.5">{getIcon(n.type)}</div>
            
            <div className="flex-1 text-sm font-pixel leading-relaxed select-text pr-2 text-black font-bold">
              {n.message}
            </div>

            <button
              onClick={() => removeNotification(n.id)}
              className="text-black/50 hover:text-black transition-colors clickable shrink-0 self-center"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
