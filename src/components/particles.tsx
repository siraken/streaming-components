import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  opacitySpeed: number;
  hue: number;
}

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    count: Math.min(300, Math.max(10, Number(params.get('count') ?? 80))),
    color: params.get('color') ?? '#6366f1',
    lineDistance: Number(params.get('lines') ?? 120),
    speed: Number(params.get('speed') ?? 0.5),
    mouse: params.get('mouse') !== 'false',
    rainbow: params.get('rainbow') === 'true',
    bg: params.get('bg') ?? '',
  };
}

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export const Particles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = parseParams();
    const baseHSL = hexToHSL(config.color);
    const dpr = window.devicePixelRatio || 1;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    if (config.mouse) {
      window.addEventListener('mousemove', handleMouse);
    }

    const w = () => window.innerWidth;
    const h = () => window.innerHeight;

    const particles: Particle[] = Array.from(
      { length: config.count },
      () => ({
        x: Math.random() * w(),
        y: Math.random() * h(),
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed,
        radius: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        opacitySpeed: (Math.random() - 0.5) * 0.01,
        hue: config.rainbow ? Math.random() * 360 : baseHSL.h,
      }),
    );

    let frame: number;
    let time = 0;

    const draw = () => {
      const cw = w();
      const ch = h();
      time += 0.01;

      ctx.clearRect(0, 0, cw, ch);

      if (config.bg) {
        ctx.fillStyle = config.bg;
        ctx.fillRect(0, 0, cw, ch);
      }

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = cw + 10;
        if (p.x > cw + 10) p.x = -10;
        if (p.y < -10) p.y = ch + 10;
        if (p.y > ch + 10) p.y = -10;

        p.opacity += p.opacitySpeed;
        if (p.opacity > 0.8 || p.opacity < 0.1) {
          p.opacitySpeed *= -1;
        }

        if (config.rainbow) {
          p.hue = (p.hue + 0.2) % 360;
        }

        if (config.mouse) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const force = (200 - dist) / 200;
            p.vx -= (dx / dist) * force * 0.02;
            p.vy -= (dy / dist) * force * 0.02;
          }
        }

        const maxSpeed = config.speed * 2;
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < config.lineDistance) {
            const alpha =
              (1 - dist / config.lineDistance) *
              0.3 *
              particles[i].opacity *
              particles[j].opacity;
            const hue = config.rainbow
              ? (particles[i].hue + particles[j].hue) / 2
              : baseHSL.h;
            ctx.strokeStyle = `hsla(${hue}, ${baseHSL.s}%, ${baseHSL.l}%, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        const hue = config.rainbow ? p.hue : baseHSL.h;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, ${baseHSL.s}%, ${baseHSL.l + 10}%, ${p.opacity * 0.15})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, ${baseHSL.s}%, ${baseHSL.l + 20}%, ${p.opacity})`;
        ctx.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        background: 'transparent',
      }}
    />
  );
};
