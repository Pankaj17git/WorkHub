import React from 'react';

interface WorkHubLogoProps {
  className?: string;
  size?: number;
}

export default function WorkHubLogo({ className = 'shrink-0', size = 34 }: WorkHubLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="whGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="whGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="whGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      {/* Left folded stroke */}
      <path
        d="M6 12L13 32C13.5 33.2 15.2 33.2 15.7 32L20 20L13 12H6Z"
        fill="url(#whGrad1)"
      />
      {/* Center diagonal fold */}
      <path
        d="M17 12L20 20L24.3 32C24.8 33.2 26.5 33.2 27 32L34 12H27L23 23L20.5 15L19 12H17Z"
        fill="url(#whGrad2)"
      />
      {/* Right folded stroke */}
      <path
        d="M27 12L23 23L25.8 31.5C26.1 32.5 27.5 32.5 27.8 31.5L34 12H27Z"
        fill="url(#whGrad3)"
      />
    </svg>
  );
}
