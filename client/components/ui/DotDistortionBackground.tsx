'use client';

import React, { useRef, useEffect } from 'react';

export interface DotDistortionBackgroundProps {
  dotSize?: number;
  dotSpacing?: number;
  animationSpeed?: number;
  distortionIntensity?: number;
  interactionRadius?: number;
  interactionStrength?: number;
  dotOpacity?: number;
  dotColor?: string;
  className?: string;
  containerRef?: React.RefObject<HTMLDivElement | null>
}

export default function DotDistortionBackground({
  dotSize = 1.5,
  dotSpacing = 28,
  animationSpeed = 0.0018,
  distortionIntensity = 8,
  interactionRadius = 130,
  interactionStrength = 22,
  dotOpacity = 0.4,
  dotColor = '#60a5fa',
  containerRef,
  className = '',
}: DotDistortionBackgroundProps) {
  // const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mousePos = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  const smoothMouse = useRef<{ x: number; y: number }>({
    x: -1000,
    y: -1000,
  });

  useEffect(() => {
    const container = containerRef?.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Handle high DPI retina display sizing
    const handleResize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance

      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Mouse & Touch interaction handlers on the container
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mousePos.current.active = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = container.getBoundingClientRect();
        mousePos.current = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
          active: true,
        };
      }
    };

    const handleTouchEnd = () => {
      mousePos.current.active = false;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    const startTime = performance.now();

    // Render loop with continuous fluid organic waves and pointer easing
    const render = (now: number) => {
      const elapsed = (now - startTime) * animationSpeed;

      // Smooth pointer easing
      if (mousePos.current.active) {
        smoothMouse.current.x += (mousePos.current.x - smoothMouse.current.x) * 0.12;
        smoothMouse.current.y += (mousePos.current.y - smoothMouse.current.y) * 0.12;
      } else {
        smoothMouse.current.x += (-1000 - smoothMouse.current.x) * 0.05;
        smoothMouse.current.y += (-1000 - smoothMouse.current.y) * 0.05;
      }

      ctx.clearRect(0, 0, width, height);

      // Adaptive grid spacing for mobile
      const effectiveSpacing = width < 640 ? Math.max(dotSpacing, 22) : dotSpacing;
      const cols = Math.ceil(width / effectiveSpacing) + 2;
      const rows = Math.ceil(height / effectiveSpacing) + 2;

      ctx.fillStyle = dotColor;

      for (let i = -1; i <= cols; i++) {
        for (let j = -1; j <= rows; j++) {
          const originX = i * effectiveSpacing;
          const originY = j * effectiveSpacing;

          // Multi-harmonic organic sine/cosine fluid wave distortion
          const waveX =
            Math.sin(originX * 0.007 + originY * 0.004 + elapsed) * distortionIntensity +
            Math.cos(originX * 0.003 - originY * 0.006 + elapsed * 0.7) * (distortionIntensity * 0.5);

          const waveY =
            Math.cos(originX * 0.005 + originY * 0.008 + elapsed * 1.1) * distortionIntensity +
            Math.sin(originX * 0.006 - originY * 0.003 + elapsed * 0.8) * (distortionIntensity * 0.5);

          let currentX = originX + waveX;
          let currentY = originY + waveY;

          // Mouse distortion calculation
          const dx = currentX - smoothMouse.current.x;
          const dy = currentY - smoothMouse.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let pointAlpha = dotOpacity;
          let currentDotSize = dotSize;

          if (dist < interactionRadius && dist > 0) {
            const force = 1 - dist / interactionRadius;
            const push = Math.pow(force, 2) * interactionStrength;
            const angle = Math.atan2(dy, dx);

            currentX += Math.cos(angle) * push;
            currentY += Math.sin(angle) * push;

            // Subtle glow boost near cursor
            pointAlpha = Math.min(1, dotOpacity + force * 0.45);
            currentDotSize = dotSize + force * 0.6;
          }

          // Draw the dot
          ctx.globalAlpha = pointAlpha;
          ctx.beginPath();
          ctx.arc(currentX, currentY, currentDotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    dotSize,
    dotSpacing,
    animationSpeed,
    distortionIntensity,
    interactionRadius,
    interactionStrength,
    dotOpacity,
    dotColor,
  ]);

  return (
    <div
      // ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-auto select-none ${className}`}
      style={{ zIndex: 0 }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full pointer-events-none"
      />
    </div>
  );
}
