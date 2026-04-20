import { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';
import type { ChannelShape } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface FlowAnimationProps {
  shape: ChannelShape;
  b?: number;
  m?: number;
  d?: number;
  y: number;
  V: number;
}

interface Particle {
  x: number;
  y: number;
  speed: number;
  size: number;
}

export function FlowAnimation({ shape, b = 5, m = 1.5, d = 2, y, V }: FlowAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const [playing, setPlaying] = useState(false);
  const { isDark } = useTheme();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Channel geometry in pixel space
  const getChannelPath = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const margin = 40;
    const drawW = w - 2 * margin;
    const drawH = h - 2 * margin;

    // Scale: map channel width to canvas
    let channelWidth: number;
    let channelDepth: number;

    if (shape === 'rectangular') {
      channelWidth = b;
      channelDepth = y * 1.5;
    } else if (shape === 'trapezoidal') {
      channelWidth = b + 2 * m * y * 1.5;
      channelDepth = y * 1.5;
    } else if (shape === 'triangular') {
      channelWidth = 2 * m * y * 1.5;
      channelDepth = y * 1.5;
    } else {
      channelWidth = d;
      channelDepth = d;
    }

    const scaleX = drawW / channelWidth;
    const scaleY = drawH / channelDepth;
    const scale = Math.min(scaleX, scaleY);

    const cx = w / 2;
    const bottomY = h - margin;

    ctx.beginPath();
    if (shape === 'rectangular') {
      const hw = (b * scale) / 2;
      ctx.moveTo(cx - hw, bottomY - channelDepth * scale);
      ctx.lineTo(cx - hw, bottomY);
      ctx.lineTo(cx + hw, bottomY);
      ctx.lineTo(cx + hw, bottomY - channelDepth * scale);
    } else if (shape === 'trapezoidal') {
      const hwBottom = (b * scale) / 2;
      const hwTop = ((b + 2 * m * channelDepth) * scale) / 2;
      ctx.moveTo(cx - hwTop, bottomY - channelDepth * scale);
      ctx.lineTo(cx - hwBottom, bottomY);
      ctx.lineTo(cx + hwBottom, bottomY);
      ctx.lineTo(cx + hwTop, bottomY - channelDepth * scale);
    } else if (shape === 'triangular') {
      const hwTop = (m * channelDepth * scale);
      ctx.moveTo(cx - hwTop, bottomY - channelDepth * scale);
      ctx.lineTo(cx, bottomY);
      ctx.lineTo(cx + hwTop, bottomY - channelDepth * scale);
    } else {
      // Circular: approximate with arc
      const r = (d * scale) / 2;
      ctx.arc(cx, bottomY - r, r, 0, Math.PI, false);
    }

    return { cx, bottomY, scale, channelWidth, channelDepth };
  }, [shape, b, m, d, y]);

  // Initialize particles
  const initParticles = useCallback((w: number, h: number) => {
    const count = Math.max(15, Math.min(60, Math.floor(y * V * 10)));
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: h - 40 - Math.random() * y * 30,
        speed: (0.5 + Math.random() * 0.5) * Math.min(Math.abs(V), 5),
        size: 2 + Math.random() * 2,
      });
    }
    particlesRef.current = particles;
  }, [y, V]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Draw channel walls
    ctx.strokeStyle = isDark ? '#555' : '#888';
    ctx.lineWidth = 2;
    const geo = getChannelPath(ctx, w, h);
    ctx.stroke();

    // Water fill
    const waterY = geo.bottomY - y * geo.scale;
    ctx.fillStyle = isDark ? 'rgba(82, 183, 136, 0.15)' : 'rgba(45, 106, 79, 0.1)';

    ctx.beginPath();
    if (shape === 'rectangular') {
      const hw = (b * geo.scale) / 2;
      ctx.rect(geo.cx - hw, waterY, b * geo.scale, y * geo.scale);
    } else if (shape === 'trapezoidal') {
      const hwBottom = (b * geo.scale) / 2;
      const hwWater = ((b + 2 * m * y) * geo.scale) / 2;
      ctx.moveTo(geo.cx - hwWater, waterY);
      ctx.lineTo(geo.cx - hwBottom, geo.bottomY);
      ctx.lineTo(geo.cx + hwBottom, geo.bottomY);
      ctx.lineTo(geo.cx + hwWater, waterY);
      ctx.closePath();
    } else if (shape === 'triangular') {
      const hwWater = m * y * geo.scale;
      ctx.moveTo(geo.cx - hwWater, waterY);
      ctx.lineTo(geo.cx, geo.bottomY);
      ctx.lineTo(geo.cx + hwWater, waterY);
      ctx.closePath();
    } else {
      const r = (d * geo.scale) / 2;
      const angle = Math.acos(1 - (y / (d / 2)));
      ctx.arc(geo.cx, geo.bottomY - r, r, Math.PI / 2 - angle, Math.PI / 2 + angle, false);
      ctx.closePath();
    }
    ctx.fill();

    // Water surface line with wave
    ctx.strokeStyle = isDark ? '#52b788' : '#2d6a4f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const surfWidth = shape === 'rectangular' ? b * geo.scale :
      shape === 'trapezoidal' ? (b + 2 * m * y) * geo.scale :
      shape === 'triangular' ? 2 * m * y * geo.scale : d * geo.scale;
    const surfLeft = geo.cx - surfWidth / 2;

    for (let px = 0; px <= surfWidth; px += 2) {
      const wave = playing && !reducedMotion ? Math.sin((px / 20) + Date.now() / 500) * 1.5 : 0;
      const sy = waterY + wave;
      if (px === 0) ctx.moveTo(surfLeft + px, sy);
      else ctx.lineTo(surfLeft + px, sy);
    }
    ctx.stroke();

    // Draw particles
    const particleColor = isDark ? 'rgba(116, 198, 157, 0.7)' : 'rgba(45, 106, 79, 0.6)';
    for (const p of particlesRef.current) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = particleColor;
      ctx.fill();
    }

    // Move particles
    if (playing && !reducedMotion) {
      for (const p of particlesRef.current) {
        p.x += p.speed;
        if (p.x > w + 10) {
          p.x = -10;
          p.y = geo.bottomY - Math.random() * y * geo.scale;
        }
      }
    }

    if (playing && !reducedMotion) {
      animRef.current = requestAnimationFrame(draw);
    }
  }, [playing, isDark, y, V, shape, b, m, d, getChannelPath, reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 300;
    initParticles(canvas.width, canvas.height);
    draw();
  }, [y, V, shape, b, m, d, isDark, initParticles, draw]);

  useEffect(() => {
    if (playing && !reducedMotion) {
      animRef.current = requestAnimationFrame(draw);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, draw, reducedMotion]);

  return (
    <div className="bg-[var(--color-surface)] rounded-[6px] border border-[var(--color-border)] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--color-bg-alt)] border-b border-[var(--color-border)]">
        <span className="text-xs font-medium text-[var(--color-text-muted)]">Flow Animation</span>
        <button
          onClick={() => setPlaying(!playing)}
          className="flex items-center gap-1 text-xs text-[var(--color-accent)] hover:opacity-80"
        >
          {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: 150 }}
      />
    </div>
  );
}
