'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { socket, syncSocketAuth } from '@/lib/socketServer';
import { useAuth } from './AuthContext';
import api from '@/lib/api';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body?: string;
  message?: string;
  referenceType?: string | null;
  referenceId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ToastItem extends AppNotification {
  toastId: string;
}

export interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  toasts: ToastItem[];
  dismissToast: (toastId: string) => void;
  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// Gentle Web Audio API synthesizer for incoming notification chime
function playNotificationSound() {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.1); // A5
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3); // D6

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.08);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.4);
  } catch {
    // Audio autostart may be prevented by browser policy if no interaction yet
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<{ [toastId: string]: NodeJS.Timeout }>({});

  const dismissToast = useCallback((toastId: string) => {
    if (timeoutsRef.current[toastId]) {
      clearTimeout(timeoutsRef.current[toastId]);
      delete timeoutsRef.current[toastId];
    }
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  }, []);

  const addToast = useCallback((notif: AppNotification) => {
    const toastId = `${notif.id}-${Date.now()}`;
    const newToast: ToastItem = { ...notif, toastId };

    playNotificationSound();

    setToasts((prev) => [newToast, ...prev].slice(0, 4));

    timeoutsRef.current[toastId] = setTimeout(() => {
      dismissToast(toastId);
    }, 6500);
  }, [dismissToast]);

  const fetchNotifications = useCallback(
    async (unreadOnly: boolean = false) => {
      if (!token || !isAuthenticated) return;
      try {
        setLoading(true);
        const res = await api.get(`/api/notifications${unreadOnly ? '?unread=true' : ''}`);
        const data = res.data;
        const list = data.notifications || data.data?.notifications || [];
        setNotifications(list);
        if (typeof data.unreadCount === 'number') {
          setUnreadCount(data.unreadCount);
        } else if (typeof data.data?.unreadCount === 'number') {
          setUnreadCount(data.data.unreadCount);
        } else {
          setUnreadCount(list.filter((n: AppNotification) => !n.isRead).length);
        }
      } catch (err) {
        console.error('[NotificationContext] Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    },
    [token, isAuthenticated]
  );

  const markAsRead = useCallback(async (id: string) => {
    try {
      // Optimistic state update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Emit via socket for instant multi-tab sync
      if (socket.connected) {
        socket.emit('notification:read', id);
      }

      // Also call REST endpoint
      await api.patch(`/api/notifications/${id}/read`);
    } catch (err) {
      console.error('[NotificationContext] Failed to mark as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      if (socket.connected) {
        socket.emit('notification:readAll');
      }

      await api.patch('/api/notifications');
    } catch (err) {
      console.error('[NotificationContext] Failed to mark all as read:', err);
    }
  }, []);

  // Sync socket authentication and initial fetch
  useEffect(() => {
    if (isAuthenticated && token) {
      syncSocketAuth(token);
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setToasts([]);
    }
  }, [isAuthenticated, token, fetchNotifications]);

  // Socket event listeners
  useEffect(() => {
    const handleNewNotification = (notification: AppNotification) => {
      // Prepend to notifications list
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Trigger floating live toast
      addToast(notification);
    };

    const handleNotificationRead = (data: { id: string }) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === data.id ? { ...n, isRead: true } : n))
      );
    };

    const handleAllRead = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    };

    const handleCountUpdate = (data: { unreadCount: number }) => {
      if (typeof data?.unreadCount === 'number') {
        setUnreadCount(data.unreadCount);
      }
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('notification:read', handleNotificationRead);
    socket.on('notification:allRead', handleAllRead);
    socket.on('notification:count', handleCountUpdate);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:read', handleNotificationRead);
      socket.off('notification:allRead', handleAllRead);
      socket.off('notification:count', handleCountUpdate);
    };
  }, [addToast]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        toasts,
        dismissToast,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
