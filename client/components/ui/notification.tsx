'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCircle2,
  Briefcase,
  UserCheck,
  MessageSquare,
  Check,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  referenceType?: string | null;
  referenceId?: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition()

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const url = `/api/notifications${unreadOnly ? '?unread=true' : ''}`;
      const res = await api.get(url, {
        metadata: { feature: 'notifications' },
      });
      const data = res.data;
      startTransition(() => setNotifications(data.notifications || data.data?.notifications || []));
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [token, unreadOnly]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/login?redirect=/notifications');
      return;
    }

    fetchNotifications();
  }, [authLoading, isAuthenticated, fetchNotifications, router]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.all(unread.map((n) => handleMarkAsRead(n.id)));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'JOB_APPLICATION':
        return <Briefcase className="w-5 h-5 text-[#0051d5]" />;
      case 'ASSIGNMENT_CONFIRMED':
        return <CheckCircle2 className="w-5 h-5 text-[#0d9488]" />;
      case 'DIRECT_HIRE_REQUEST':
        return <UserCheck className="w-5 h-5 text-[#f59e0b]" />;
      case 'MESSAGE_RECEIVED':
        return <MessageSquare className="w-5 h-5 text-[#6366f1]" />;
      default:
        return <Bell className="w-5 h-5 text-[#0051d5]" />;
    }
  };

  const getActionLink = (n: AppNotification) => {
    if (n.referenceType === 'JOB' && n.referenceId) return `/jobs/${n.referenceId}`;
    if (n.referenceType === 'ASSIGNMENT' && n.referenceId) return `/bookings/${n.referenceId}/track`;
    if (n.referenceType === 'DIRECT_HIRE_REQUEST') return '/worker/jobs';
    if (n.referenceType === 'CONVERSATION' && n.referenceId) return `/messages?conversationId=${n.referenceId}`;
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#091426] tracking-tight">
              Notification Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-[#0051d5] text-xs font-bold font-geist border border-[#bfdbfe]">
              {notifications.filter((n) => !n.isRead).length} Unread
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Stay informed on job bids, booking confirmations, travel updates, and direct messages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3.5 py-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#091426] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-[#0d9488]" />
              <span>Mark All as Read</span>
            </button>
          )}

          <div className="flex items-center gap-1 p-1 bg-[#f1f5f9] rounded-xl border border-[#e2e8f0]">
            <button
              onClick={() => setUnreadOnly(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-geist transition-all ${
                !unreadOnly ? 'bg-[#0051d5] text-white shadow-xs' : 'text-[#475569]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setUnreadOnly(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-geist transition-all ${
                unreadOnly ? 'bg-[#0051d5] text-white shadow-xs' : 'text-[#475569]'
              }`}
            >
              Unread
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#64748b]">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center bg-white border border-[#e2e8f0] rounded-3xl space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] text-[#0051d5] flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#091426]">No notifications right now</h3>
            <p className="text-xs text-[#64748b] max-w-sm mx-auto">
              You will receive live updates here when customers book or specialists apply.
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const actionUrl = getActionLink(n);

            return (
              <div
                key={n.id}
                className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                  !n.isRead
                    ? 'bg-[#ffffff] border-[#bfdbfe] shadow-xs ring-1 ring-[#0051d5]/10'
                    : 'bg-[#f8f9ff]/60 border-[#e2e8f0]'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-[#eff6ff] shrink-0 mt-0.5">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-[#091426]">{n.title}</h4>
                    <span className="text-[10px] text-[#94a3b8] font-geist shrink-0">
                      {new Date(n.createdAt).toLocaleDateString()}{' '}
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-[#475569] leading-relaxed">{n.message}</p>

                  <div className="flex items-center gap-3 pt-2">
                    {actionUrl && (
                      <Link
                        href={actionUrl}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0051d5] hover:underline"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="text-[11px] font-semibold text-[#64748b] hover:text-[#091426]"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
