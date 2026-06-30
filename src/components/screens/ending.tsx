import { useEffect, useRef, useState } from 'react';

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    title: params.get('title') ?? '',
    social: params.get('social') ?? '',
    accent: params.get('accent') ?? '#6366f1',
  };
}

export const EndingScreen = () => {
  const [config] = useState(parseParams);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
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
      gradient.addColorStop(0, `hsl(${220 + hueShift}, 25%, 5%)`);
      gradient.addColorStop(0.5, `hsl(${240 + hueShift}, 20%, 8%)`);
      gradient.addColorStop(1, `hsl(${260 + hueShift}, 25%, 5%)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 3; i++) {
        const phase = (i / 3) * Math.PI * 2;
        const ox = w * 0.5 + Math.cos(t * 0.25 + phase) * w * 0.2;
        const oy = h * 0.5 + Math.sin(t * 0.35 + phase) * h * 0.15;
        const r = 350;
        const orbGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
        const hue = (220 + i * 40 + hueShift) % 360;
        orbGrad.addColorStop(0, `hsla(${hue}, 50%, 30%, 0.04)`);
        orbGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = orbGrad;
        ctx.fillRect(0, 0, w, h);
      }

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  const title = config.title || 'THANKS FOR WATCHING';

  return (
    <>
      <style>{`
        .end-root {
          width: 1920px;
          height: 1080px;
          position: relative;
          overflow: hidden;
          font-family: var(--font-inter), sans-serif;
        }

        .end-canvas {
          position: absolute;
          inset: 0;
          width: 1920px;
          height: 1080px;
        }

        .end-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 1.2s ease, transform 1.2s ease;
        }

        .end-content.end-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .end-icon {
          width: 64px;
          height: 64px;
          margin-bottom: 40px;
          color: ${config.accent};
          opacity: 0.7;
        }

        .end-heading {
          font-size: 42px;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #ffffff;
          text-shadow: 0 0 40px ${config.accent}25;
        }

        .end-divider {
          width: 80px;
          height: 1px;
          background: linear-gradient(90deg, transparent, ${config.accent}60, transparent);
          margin: 32px 0;
        }

        .end-sub {
          font-size: 18px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.3);
          letter-spacing: 0.06em;
        }

        .end-social {
          font-size: 20px;
          font-weight: 600;
          color: ${config.accent};
          margin-top: 40px;
          letter-spacing: 0.04em;
        }
      `}</style>
      <div className="end-root">
        <canvas ref={canvasRef} className="end-canvas" />
        <div className={`end-content ${visible ? 'end-visible' : ''}`}>
          <svg className="end-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <div className="end-heading">{title}</div>
          <div className="end-divider" />
          <div className="end-sub">See you next time</div>
          {config.social && <div className="end-social">{config.social}</div>}
        </div>
      </div>
    </>
  );
};
