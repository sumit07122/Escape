'use client';

import React, { useEffect, useRef } from 'react';

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speedY: number;
  swaySpeed: number;
  swayWidth: number;
  swayPhase: number;
}

interface SnowEffectProps {
  className?: string;
  particleCount?: number;
}

export default function SnowEffect({
  className = 'absolute inset-0 pointer-events-none z-10 overflow-hidden',
  particleCount = 45,
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

    // Initialize 40-50 snowflakes with organic radii and speeds
    const snowflakes: Snowflake[] = [];
    const count = Math.min(Math.max(particleCount, 30), 60);

    for (let i = 0; i < count; i++) {
      snowflakes.push({
        x: Math.random() * (canvas.width || window.innerWidth),
        y: Math.random() * (canvas.height || window.innerHeight),
        radius: 1 + Math.random() * 2, // 1px to 3px
        opacity: 0.2 + Math.random() * 0.5, // 0.2 to 0.7
        speedY: 0.4 + Math.random() * 0.8, // Slow gentle fall
        swaySpeed: 0.01 + Math.random() * 0.02,
        swayWidth: 0.5 + Math.random() * 1.2,
        swayPhase: Math.random() * Math.PI * 2,
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
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = 2;
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
