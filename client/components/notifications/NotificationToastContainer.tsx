'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Briefcase,
  UserCheck,
  MessageSquare,
  Star,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useNotification, ToastItem } from '@/context/NotificationContext';

export default function NotificationToastContainer() {
  const { toasts, dismissToast, markAsRead } = useNotification();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'DIRECT_HIRE_REQUESTED':
        return <UserCheck className="w-5 h-5 text-amber-500" />;
      case 'DIRECT_HIRE_ACCEPTED':
      case 'ASSIGNMENT_CONFIRMED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'JOB_APPLICATION_SUBMITTED':
      case 'JOB_APPLICATION_SELECTED':
        return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'ASSIGNMENT_ON_THE_WAY':
      case 'ASSIGNMENT_ARRIVED':
      case 'ASSIGNMENT_STARTED':
        return <Sparkles className="w-5 h-5 text-indigo-500" />;
      case 'NEW_REVIEW':
        return <Star className="w-5 h-5 text-amber-400 fill-amber-400" />;
      case 'NEW_MESSAGE':
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getActionLink = (n: ToastItem) => {
    if (n.referenceType === 'DIRECT_HIRE_REQUEST') return '/worker/jobs';
    if (n.referenceType === 'ASSIGNMENT' && n.referenceId) return `/bookings/${n.referenceId}/track`;
    if (n.referenceType === 'JOB' && n.referenceId) return `/jobs/${n.referenceId}`;
    if (n.referenceType === 'CONVERSATION' && n.referenceId) return `/messages?conversationId=${n.referenceId}`;
    return '/notifications';
  };

  return (
    <>
      <style>{`
        @keyframes wh-toast-slide-in {
          0% {
            opacity: 0;
            transform: translateY(-16px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .wh-toast-card {
          animation: wh-toast-slide-in 260ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100%-2rem)] pointer-events-none"
        aria-live="polite"
        role="region"
      >
        {toasts.map((toast) => {
          const actionUrl = getActionLink(toast);
          const bodyText = toast.body || toast.message || '';

          return (
            <div
              key={toast.toastId}
              className="wh-toast-card pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-2xl p-4 transition-all hover:shadow-blue-500/10 hover:border-blue-200 flex items-start gap-3.5"
            >
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                {getIcon(toast.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                    Live Notification
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Just now</span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug truncate">
                  {toast.title}
                </h4>

                {bodyText && (
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {bodyText}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-1.5">
                  <Link
                    href={actionUrl}
                    onClick={() => {
                      markAsRead(toast.id);
                      dismissToast(toast.toastId);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      markAsRead(toast.id);
                      dismissToast(toast.toastId);
                    }}
                    className="text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Mark as read
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.toastId)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
