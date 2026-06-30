import { useEffect, useRef, useState } from 'react';

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    minutes: Math.max(0, Number(params.get('min') ?? 5)),
    title: params.get('title') ?? '',
    accent: params.get('accent') ?? '#6366f1',
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

export const StartingSoonScreen = () => {
  const [config] = useState(parseParams);
  const [remaining, setRemaining] = useState(config.minutes * 60);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [remaining]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1920;
    canvas.height = 1080;

    let frame: number;
    let t = 0;

    const draw = () => {
      t += 0.003;
      const w = 1920;
      const h = 1080;

      const gradient = ctx.createLinearGradient(0, 0, w, h);
      const hueShift = Math.sin(t) * 15;
      gradient.addColorStop(0, `hsl(${230 + hueShift}, 25%, 6%)`);
      gradient.addColorStop(0.5, `hsl(${250 + hueShift}, 30%, 10%)`);
      gradient.addColorStop(1, `hsl(${270 + hueShift}, 25%, 6%)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 5; i++) {
        const phase = (i / 5) * Math.PI * 2;
        const ox = w * 0.5 + Math.cos(t * 0.4 + phase) * w * 0.35;
        const oy = h * 0.5 + Math.sin(t * 0.6 + phase) * h * 0.3;
        const r = Math.min(w, h) * 0.3;
        const orbGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
        const hue = (230 + i * 35 + hueShift) % 360;
        orbGrad.addColorStop(0, `hsla(${hue}, 60%, 40%, 0.06)`);
        orbGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = orbGrad;
        ctx.fillRect(0, 0, w, h);
      }

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const progress = config.minutes > 0 ? 1 - remaining / (config.minutes * 60) : 1;
  const title = config.title || 'STARTING SOON';

  return (
    <>
      <style>{`
        .ss-root {
          width: 1920px;
          height: 1080px;
          position: relative;
          overflow: hidden;
          font-family: var(--font-inter), sans-serif;
        }

        .ss-canvas {
          position: absolute;
          inset: 0;
          width: 1920px;
          height: 1080px;
        }

        .ss-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        .ss-heading {
          font-size: 28px;
          font-weight: 600;
          letter-spacing: 0.35em;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          margin-bottom: 40px;
        }

        .ss-timer {
          font-family: var(--font-jetbrains-mono), monospace;
          font-size: 120px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.05em;
          text-shadow: 0 0 60px ${config.accent}40,
                       0 0 120px ${config.accent}20;
        }

        .ss-timer-sep {
          color: ${config.accent};
          animation: ss-blink 1s steps(1) infinite;
        }

        @keyframes ss-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .ss-progress {
          width: 400px;
          height: 3px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 2px;
          margin-top: 48px;
          overflow: hidden;
        }

        .ss-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, ${config.accent}, ${config.accent}cc);
          border-radius: 2px;
          box-shadow: 0 0 16px ${config.accent}60;
          transition: width 1s linear;
        }

        .ss-sub {
          font-size: 24px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.3);
          margin-top: 28px;
          letter-spacing: 0.08em;
        }

        .ss-done .ss-timer {
          animation: ss-pulse 1.5s ease-in-out infinite;
        }

        @keyframes ss-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .ss-line {
          position: absolute;
          bottom: 120px;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 1px;
          background: linear-gradient(90deg, transparent, ${config.accent}40, transparent);
        }
      `}</style>
      <div className="ss-root">
        <canvas ref={canvasRef} className="ss-canvas" />
        <div className={`ss-content ${remaining <= 0 ? 'ss-done' : ''}`}>
          <div className="ss-heading">{title}</div>
          <div className="ss-timer">
            {pad(m)}<span className="ss-timer-sep">:</span>{pad(s)}
          </div>
          {config.minutes > 0 && (
            <div className="ss-progress">
              <div className="ss-progress-bar" style={{ width: `${progress * 100}%` }} />
            </div>
          )}
          <div className="ss-sub">Please wait a moment</div>
        </div>
        <div className="ss-line" />
      </div>
    </>
  );
};
