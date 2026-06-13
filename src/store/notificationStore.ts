import { create } from 'zustand';

export interface SystemNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface NotificationStore {
  notifications: SystemNotification[];
  addNotification: (message: string, type?: SystemNotification['type'], duration?: number) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    set((state) => {
      // Prevent duplicate active notifications of the same message and type
      const hasDuplicate = state.notifications.some(
        (n) => n.message === message && n.type === type
      );
      if (hasDuplicate) {
        return state;
      }

      // Auto dismiss
      if (duration > 0) {
        setTimeout(() => {
          set((s) => ({
            notifications: s.notifications.filter((n) => n.id !== id),
          }));
        }, duration);
      }

      return {
        notifications: [...state.notifications, { id, message, type, duration }],
      };
    });
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
