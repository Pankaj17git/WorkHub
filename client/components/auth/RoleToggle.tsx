'use client';

import React from 'react';
import { Home, Wrench } from 'lucide-react';

export type AuthRole = 'CUSTOMER' | 'WORKER';

interface RoleToggleProps {
  value: AuthRole;
  onChange: (role: AuthRole) => void;
  /** Short verb for each side, e.g. "Log in" / "Sign up" — kept generic by default. */
  customerLabel?: string;
  workerLabel?: string;
}

/**
 * Segmented control that switches the auth experience between the two audiences.
 * On sign up this choice is real — it sets the account role. On login it themes
 * the page and points the "create account" link the right way; the actual
 * destination always follows the real account role returned by the API.
 */
export default function RoleToggle({
  value,
  onChange,
  customerLabel = 'I need a service',
  workerLabel = 'I do the work',
}: RoleToggleProps) {
  return (
    <div className="wha-toggle" role="group" aria-label="Choose account type">
      <button
        type="button"
        data-role="CUSTOMER"
        aria-pressed={value === 'CUSTOMER'}
        onClick={() => onChange('CUSTOMER')}
      >
        <Home className="ic" strokeWidth={2.25} aria-hidden="true" />
        <span>{customerLabel}</span>
      </button>
      <button
        type="button"
        data-role="WORKER"
        aria-pressed={value === 'WORKER'}
        onClick={() => onChange('WORKER')}
      >
        <Wrench className="ic" strokeWidth={2.25} aria-hidden="true" />
        <span>{workerLabel}</span>
      </button>
    </div>
  );
}
