'use client';

import React, { useEffect, useRef } from 'react';

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  baseOpacity: number;
  twinkleSpeed: number;
  speedY: number;
  swaySpeed: number;
  swayWidth: number;
  swayPhase: number;
  isGlitter?: boolean;
}

interface SnowEffectProps {
  className?: string;
  particleCount?: number;
}

export default function SnowEffect({
  className = 'absolute inset-0 pointer-events-none z-10 overflow-hidden',
  particleCount = 65,
}: SnowEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isRunning = true;

    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize alpine snow & micro-ice powder
    const snowflakes: Snowflake[] = [];
    const count = Math.min(Math.max(particleCount, 50), 90);

    for (let i = 0; i < count; i++) {
      const isGlitter = i % 3 === 0;
      const baseOpacity = isGlitter ? 0.3 + Math.random() * 0.5 : 0.15 + Math.random() * 0.45;
      snowflakes.push({
        x: Math.random() * (canvas.width || window.innerWidth),
        y: Math.random() * (canvas.height || window.innerHeight),
        radius: isGlitter ? 0.8 + Math.random() * 1.2 : 1.5 + Math.random() * 2.2, // fine ice dust vs soft flakes
        opacity: baseOpacity,
        baseOpacity,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        speedY: isGlitter ? 0.25 + Math.random() * 0.5 : 0.45 + Math.random() * 0.85,
        swaySpeed: 0.008 + Math.random() * 0.018,
        swayWidth: isGlitter ? 0.3 + Math.random() * 0.8 : 0.8 + Math.random() * 1.5,
        swayPhase: Math.random() * Math.PI * 2,
        isGlitter,
      });
    }

    let frame = 0;

    const render = () => {
      if (!isRunning) return;

      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < snowflakes.length; i++) {
        const flake = snowflakes[i];

        // Downward motion + horizontal organic sine wave drift
        flake.y += flake.speedY;
        flake.x += Math.sin(frame * flake.swaySpeed + flake.swayPhase) * flake.swayWidth;

        // Twinkle subtle glittering on high-altitude powder
        flake.opacity = flake.baseOpacity + Math.sin(frame * flake.twinkleSpeed + flake.swayPhase) * 0.2;

        // Wrap around boundaries
        if (flake.y > canvas.height + flake.radius) {
          flake.y = -flake.radius;
          flake.x = Math.random() * canvas.width;
        }
        if (flake.x > canvas.width + flake.radius) {
          flake.x = -flake.radius;
        } else if (flake.x < -flake.radius) {
          flake.x = canvas.width + flake.radius;
        }

        // Draw soft circular snow particle
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.08, flake.opacity)})`;
        if (flake.isGlitter) {
          ctx.shadowColor = 'rgba(210, 245, 255, 0.7)';
          ctx.shadowBlur = 4;
        } else {
          ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
          ctx.shadowBlur = 2;
        }
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Start loop
    animationFrameId = requestAnimationFrame(render);

    // Battery / CPU conservation: pause on window blur or hidden tab
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        if (!isRunning) {
          isRunning = true;
          animationFrameId = requestAnimationFrame(render);
        }
      }
    };

    const handleWindowBlur = () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
    };

    const handleWindowFocus = () => {
      if (!isRunning && !document.hidden) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
