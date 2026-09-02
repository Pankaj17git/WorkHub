'use client';

import React, { useCallback, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, X } from 'lucide-react';

type Tone = 'warn' | 'info';

/**
 * Human-readable messages for the redirect reasons the edge middleware attaches
 * as `?error=...` when it bounces someone out of an area their role can't use.
 *
 * These codes land on the *destination* page (e.g. `/` or `/worker/dashboard`),
 * which otherwise wouldn't explain why the user was moved. This toast surfaces
 * that reason wherever they end up.
 */
const NOTICES: Record<string, { tone: Tone; text: string }> = {
  unauthorized_worker_access: {
    tone: 'warn',
    text: 'That’s the pro partner area. You’re signed in as a customer, so we brought you back home.',
  },
  workers_cannot_book: {
    tone: 'warn',
    text: 'Worker accounts can’t book services. Use a customer account to make a booking.',
  },
  session_expired: {
    tone: 'info',
    text: 'Your session expired. Please sign in again to pick up where you left off.',
  },
};

const TONE_ACCENT: Record<Tone, string> = {
  warn: 'var(--gesso-warning)',
  info: 'var(--gesso-accent-2-text)',
};

export default function RouteNotice() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Login/signup surface their own inline messaging, so don't double up with a
  // toast on top of them.
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const code = isAuthPage ? null : searchParams.get('error');
  const match = code ? NOTICES[code] : undefined;

  // The toast's visibility is derived purely from the URL. Dismissing it simply
  // strips the `error` param, which hides the toast and stops it resurfacing on
  // refresh or when the link is shared. Keeping the URL as the single source of
  // truth avoids cascading setState-in-effect renders and correctly re-shows the
  // same error code if it happens again.
  const dismiss = useCallback(() => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete('error');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, pathname, router]);

  // Auto-dismiss after a few seconds so it doesn't linger.
  useEffect(() => {
    if (!match) return;
    const timer = setTimeout(dismiss, 8000);
    return () => clearTimeout(timer);
  }, [match, dismiss]);

  if (!match) return null;

  const accent = TONE_ACCENT[match.tone];

  return (
    <>
      <style>{`
        @keyframes wh-route-notice-in {
          from { opacity: 0; transform: translate(-50%, -12px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .wh-route-notice { animation: none !important; }
        }
      `}</style>
      <div
        className="wh-route-notice"
        role="status"
        aria-live="polite"
        style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          zIndex: 200,
          width: 'calc(100% - 32px)',
          maxWidth: 440,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          padding: '14px 14px 14px 16px',
          background: 'var(--gesso-surface, #ffffff)',
          color: 'var(--gesso-fg, #2a2a2a)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderLeft: `4px solid ${accent}`,
          borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.14)',
          fontFamily: 'var(--gesso-font-body, system-ui, sans-serif)',
          animation: 'wh-route-notice-in 220ms cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <ShieldAlert
          size={18}
          style={{ color: accent, flexShrink: 0, marginTop: 1 }}
          aria-hidden="true"
        />
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45, flex: 1 }}>{match.text}</p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss notification"
          style={{
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            padding: 0,
            border: 'none',
            background: 'transparent',
            color: 'var(--gesso-fg-muted, #606060)',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>
      </div>
    </>
  );
}
