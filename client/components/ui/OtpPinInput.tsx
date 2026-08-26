'use client';

import React, { useRef, useEffect } from 'react';

interface OtpPinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  isMasked?: boolean;
  autoFocus?: boolean;
  hasError?: boolean;
}

export default function OtpPinInput({
  length = 4,
  value,
  onChange,
  isMasked = false,
  autoFocus = true,
  hasError = false,
}: OtpPinInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Take only the last entered char if multiple
    const char = val.slice(-1);

    if (char && !/^\d+$/.test(char)) return; // numbers only

    const newDigits = [...digits];
    newDigits[index] = char;
    const newValue = newDigits.join('');
    onChange(newValue);

    // Auto-focus next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    if (!/^\d+$/.test(pastedData)) return;

    const sliced = pastedData.slice(0, length);
    onChange(sliced);

    // Focus last filled or next empty
    const nextFocusIndex = Math.min(sliced.length, length - 1);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2.5 sm:gap-3">
      {Array.from({ length }, (_, index) => {
        const digit = digits[index];
        const isFilled = digit !== '';

        return (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type={isMasked ? 'password' : 'text'}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-extrabold font-geist rounded-xl border-2 transition-all outline-none ${
              hasError
                ? 'border-[#DC2626] bg-[#DC2626]/10 text-[#DC2626] focus:ring-4 focus:ring-[#DC2626]/10'
                : isFilled
                ? 'border-[#f5a623] bg-white text-[#2a2a2a]'
                : 'border-[#bcbcbc] bg-white text-[#2a2a2a] hover:border-[#9c9c9c] focus:border-[#f5a623] focus:ring-4 focus:ring-[#f5a623]/15'
            }`}
          />
        );
      })}
    </div>
  );
}
