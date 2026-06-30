import { useEffect, useRef } from 'react';

interface BarState {
  current: number;
  target: number;
  velocity: number;
}

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    bars: Math.min(128, Math.max(4, Number(params.get('bars') ?? 48))),
    color1: params.get('color1') ?? '#6366f1',
    color2: params.get('color2') ?? '#ec4899',
    speed: Number(params.get('speed') ?? 1),
    mirror: params.get('mirror') !== 'false',
    glow: params.get('glow') !== 'false',
  };
}

export const Visualizer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = parseParams();
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const barCount = config.mirror ? Math.ceil(config.bars / 2) : config.bars;
    const bars: BarState[] = Array.from({ length: barCount }, () => ({
      current: 0,
      target: 0,
      velocity: 0,
    }));

    const phases = Array.from(
      { length: barCount },
      (_, i) => (i / barCount) * Math.PI * 2,
    );

    let frame: number;
    let time = 0;

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      time += 0.016 * config.speed;

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < barCount; i++) {
        const wave1 = Math.sin(time * 1.2 + phases[i]) * 0.3;
        const wave2 = Math.sin(time * 0.7 + phases[i] * 1.5) * 0.25;
        const wave3 = Math.sin(time * 2.1 + phases[i] * 0.8) * 0.15;
        const pulse = Math.sin(time * 0.3) * 0.1 + 0.1;
        const noise = Math.sin(time * 3.7 + i * 7.3) * 0.08;

        bars[i].target = Math.max(
          0.03,
          Math.abs(wave1 + wave2 + wave3 + pulse + noise),
        );

        const spring = 0.08;
        const damping = 0.75;
        const force = bars[i].target - bars[i].current;
        bars[i].velocity = bars[i].velocity * damping + force * spring;
        bars[i].current += bars[i].velocity;
      }

      const totalBars = config.mirror ? barCount * 2 - 1 : barCount;
      const gap = 2;
      const barWidth = Math.max(1, (w - gap * (totalBars - 1)) / totalBars);

      const gradient = ctx.createLinearGradient(0, h, 0, 0);
      gradient.addColorStop(0, config.color1);
      gradient.addColorStop(1, config.color2);

      const drawBar = (index: number, value: number) => {
        const x = index * (barWidth + gap);
        const barHeight = value * h * 0.85;
        const y = h - barHeight;
        const radius = Math.min(barWidth / 2, 3);

        if (config.glow) {
          ctx.save();
          ctx.shadowColor = config.color2;
          ctx.shadowBlur = 12;
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + barWidth - radius, y);
          ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
          ctx.lineTo(x + barWidth, h);
          ctx.lineTo(x, h);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, h);
        ctx.lineTo(x, h);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();

        const highlightGrad = ctx.createLinearGradient(x, y, x, y + barHeight);
        highlightGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
        highlightGrad.addColorStop(0.5, 'rgba(255,255,255,0)');
        ctx.fillStyle = highlightGrad;
        ctx.fill();
      };

      if (config.mirror) {
        const mid = Math.floor(totalBars / 2);
        for (let i = 0; i < barCount; i++) {
          drawBar(mid + i, bars[i].current);
          if (i > 0) {
            drawBar(mid - i, bars[i].current);
          }
        }
      } else {
        for (let i = 0; i < barCount; i++) {
          drawBar(i, bars[i].current);
        }
      }

      const fadeGrad = ctx.createLinearGradient(0, h * 0.7, 0, h);
      fadeGrad.addColorStop(0, 'transparent');
      fadeGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
      ctx.fillStyle = fadeGrad;
      ctx.fillRect(0, h * 0.7, w, h * 0.3);

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
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
