import { useEffect, useRef, useState } from 'react';

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    title: params.get('title') ?? '',
    accent: params.get('accent') ?? '#8b5cf6',
  };
}

export const BrbScreen = () => {
  const [config] = useState(parseParams);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : `${d}.`));
    }, 600);
    return () => clearInterval(id);
  }, []);

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
      t += 0.002;
      const w = 1920;
      const h = 1080;

      const gradient = ctx.createLinearGradient(0, 0, w, h);
      const hueShift = Math.sin(t) * 10;
      gradient.addColorStop(0, `hsl(${260 + hueShift}, 30%, 6%)`);
      gradient.addColorStop(0.5, `hsl(${275 + hueShift}, 25%, 9%)`);
      gradient.addColorStop(1, `hsl(${240 + hueShift}, 30%, 6%)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 3; i++) {
        const phase = (i / 3) * Math.PI * 2;
        const ox = w * 0.5 + Math.cos(t * 0.3 + phase) * w * 0.25;
        const oy = h * 0.5 + Math.sin(t * 0.5 + phase) * h * 0.2;
        const r = 400;
        const orbGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
        const hue = (260 + i * 30 + hueShift) % 360;
        orbGrad.addColorStop(0, `hsla(${hue}, 50%, 35%, 0.05)`);
        orbGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = orbGrad;
        ctx.fillRect(0, 0, w, h);
      }

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  const title = config.title || 'BE RIGHT BACK';

  return (
    <>
      <style>{`
        .brb-root {
          width: 1920px;
          height: 1080px;
          position: relative;
          overflow: hidden;
          font-family: var(--font-inter), sans-serif;
        }

        .brb-canvas {
          position: absolute;
          inset: 0;
          width: 1920px;
          height: 1080px;
        }

        .brb-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        .brb-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 2px solid ${config.accent}40;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 48px;
          animation: brb-breathe 3s ease-in-out infinite;
        }

        @keyframes brb-breathe {
          0%, 100% { box-shadow: 0 0 0 0 ${config.accent}20, 0 0 30px ${config.accent}10; }
          50% { box-shadow: 0 0 0 20px ${config.accent}00, 0 0 60px ${config.accent}20; }
        }

        .brb-icon svg {
          width: 32px;
          height: 32px;
          color: ${config.accent};
        }

        .brb-heading {
          font-size: 48px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #ffffff;
          text-shadow: 0 0 40px ${config.accent}30;
        }

        .brb-sub {
          font-size: 18px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.35);
          margin-top: 20px;
          letter-spacing: 0.06em;
        }

        .brb-dots {
          display: inline-block;
          width: 24px;
          text-align: left;
        }

        .brb-line {
          width: 60px;
          height: 2px;
          background: ${config.accent}60;
          border-radius: 1px;
          margin-top: 48px;
          box-shadow: 0 0 12px ${config.accent}30;
        }
      `}</style>
      <div className="brb-root">
        <canvas ref={canvasRef} className="brb-canvas" />
        <div className="brb-content">
          <div className="brb-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="10" y1="15" x2="10" y2="9" />
              <line x1="14" y1="15" x2="14" y2="9" />
            </svg>
          </div>
          <div className="brb-heading">{title}</div>
          <div className="brb-sub">
            Stream will resume shortly<span className="brb-dots">{dots}</span>
          </div>
          <div className="brb-line" />
        </div>
      </div>
    </>
  );
};
