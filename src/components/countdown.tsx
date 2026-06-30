import { useEffect, useRef, useState } from 'react';

type Mode = 'starting' | 'brb' | 'ending';

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    minutes: Math.max(0, Number(params.get('min') ?? 5)),
    mode: (params.get('mode') ?? 'starting') as Mode,
    title: params.get('title') ?? '',
    accent: params.get('accent') ?? '#6366f1',
  };
}

const MODE_LABELS: Record<Mode, { heading: string; sub: string }> = {
  starting: { heading: 'STARTING SOON', sub: 'Please wait a moment' },
  brb: { heading: 'BE RIGHT BACK', sub: "Stream will resume shortly" },
  ending: { heading: 'STREAM ENDING', sub: 'Thanks for watching' },
};

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const Countdown = () => {
  const [config] = useState(parseParams);
  const [remaining, setRemaining] = useState(config.minutes * 60);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labels = config.title
    ? { heading: config.title, sub: MODE_LABELS[config.mode].sub }
    : MODE_LABELS[config.mode];

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [remaining]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();
    window.addEventListener('resize', resize);

    let frame: number;
    let t = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      t += 0.003;

      const gradient = ctx.createLinearGradient(0, 0, w, h);
      const hueShift = Math.sin(t) * 20;
      gradient.addColorStop(
        0,
        `hsl(${230 + hueShift}, 25%, 8%)`,
      );
      gradient.addColorStop(
        0.5,
        `hsl(${250 + hueShift}, 30%, 12%)`,
      );
      gradient.addColorStop(
        1,
        `hsl(${270 + hueShift}, 25%, 8%)`,
      );
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      const orbCount = 4;
      for (let i = 0; i < orbCount; i++) {
        const phase = (i / orbCount) * Math.PI * 2;
        const ox = w * 0.5 + Math.cos(t * 0.5 + phase) * w * 0.3;
        const oy = h * 0.5 + Math.sin(t * 0.7 + phase) * h * 0.25;
        const r = Math.min(w, h) * 0.25;

        const orbGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
        const hue = (230 + i * 40 + hueShift) % 360;
        orbGrad.addColorStop(0, `hsla(${hue}, 60%, 40%, 0.08)`);
        orbGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = orbGrad;
        ctx.fillRect(0, 0, w, h);
      }

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const progress =
    config.minutes > 0 ? 1 - remaining / (config.minutes * 60) : 1;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=JetBrains+Mono:wght@400;700&display=swap');

        .cd-canvas {
          position: fixed;
          inset: 0;
          z-index: 0;
        }

        .cd-overlay {
          position: fixed;
          inset: 0;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
        }

        .cd-heading {
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.35em;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          margin-bottom: 24px;
          animation: cd-fadeIn 1s ease 0.2s both;
        }

        .cd-timer {
          font-family: 'JetBrains Mono', monospace;
          font-size: 5rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.05em;
          text-shadow: 0 0 40px ${config.accent}40,
                       0 0 80px ${config.accent}20;
          animation: cd-fadeIn 1s ease 0.4s both;
        }

        .cd-progress-track {
          width: 280px;
          height: 3px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 2px;
          margin-top: 32px;
          overflow: hidden;
          animation: cd-fadeIn 1s ease 0.6s both;
        }

        .cd-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, ${config.accent}, ${config.accent}cc);
          border-radius: 2px;
          box-shadow: 0 0 12px ${config.accent}60;
          transition: width 1s linear;
        }

        .cd-sub {
          font-size: 0.85rem;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.35);
          margin-top: 20px;
          letter-spacing: 0.08em;
          animation: cd-fadeIn 1s ease 0.8s both;
        }

        @keyframes cd-fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .cd-done .cd-timer {
          animation: cd-pulse 1.5s ease-in-out infinite;
        }

        @keyframes cd-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <canvas ref={canvasRef} className="cd-canvas" />
      <div className={`cd-overlay ${remaining <= 0 ? 'cd-done' : ''}`}>
        <div className="cd-heading">{labels.heading}</div>
        <div className="cd-timer">{formatTime(remaining)}</div>
        {config.minutes > 0 && (
          <div className="cd-progress-track">
            <div
              className="cd-progress-bar"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}
        <div className="cd-sub">{labels.sub}</div>
      </div>
    </>
  );
};
