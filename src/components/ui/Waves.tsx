'use client';

import { useRef, useEffect } from 'react';
import './Waves.css';

interface WavesProps {
  color1?: string;
  color2?: string;
  speed?: number;
  amplitude?: number;
  frequency?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function Waves({
  color1 = 'rgba(75, 18, 24, 0.15)',
  color2 = 'rgba(139, 38, 53, 0.1)',
  speed = 0.03,
  amplitude = 40,
  frequency = 0.015,
  className = '',
  style,
}: WavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.clearRect(0, 0, w, h);

      // First wave
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 2) {
        const y = h / 2 + Math.sin(x * frequency + time) * amplitude
                        + Math.sin(x * frequency * 0.5 + time * 1.3) * (amplitude * 0.5);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = color1;
      ctx.fill();

      // Second wave
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 2) {
        const y = h / 2 + Math.sin(x * frequency * 0.8 + time * 0.7 + 1.5) * (amplitude * 0.8)
                        + Math.cos(x * frequency * 0.3 + time * 1.1) * (amplitude * 0.4);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = color2;
      ctx.fill();

      time += speed;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [color1, color2, speed, amplitude, frequency]);

  return (
    <div className={`waves ${className}`} style={style}>
      <canvas ref={canvasRef} className="waves-canvas" />
    </div>
  );
}
