import { useEffect, useState } from 'react';

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    label: params.get('label') ?? '',
    initial: Number(params.get('initial') ?? 0),
    accent: params.get('accent') ?? '#6366f1',
    card: params.get('card') !== 'false',
  };
}

export const Counter = () => {
  const [config] = useState(parseParams);
  const [count, setCount] = useState(config.initial);
  const [flash, setFlash] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === '+') {
        setCount((c) => c + 1);
        setFlash('up');
      } else if (e.key === 'ArrowDown' || e.key === '-') {
        setCount((c) => Math.max(0, c - 1));
        setFlash('down');
      } else if (e.key === 'r' || e.key === '0') {
        setCount(config.initial);
        setFlash('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [config.initial]);

  useEffect(() => {
    if (!flash) return;
    const id = setTimeout(() => setFlash(''), 300);
    return () => clearTimeout(id);
  }, [flash, count]);

  return (
    <>
      <style>{`
        .ct-root {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-inter), sans-serif;
        }

        .ct-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 48px;
        }

        .ct-card-bg {
          background: linear-gradient(135deg, rgba(15, 15, 20, 0.88), rgba(25, 25, 35, 0.84));
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .ct-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.35);
          margin-bottom: 8px;
        }

        .ct-number {
          font-family: var(--font-jetbrains-mono), monospace;
          font-size: 6rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1;
          text-shadow: 0 0 30px ${config.accent}30,
                       0 0 60px ${config.accent}15;
          transition: transform 0.15s ease, color 0.15s ease;
        }

        .ct-number.ct-flash-up {
          transform: scale(1.05);
          color: ${config.accent};
        }

        .ct-number.ct-flash-down {
          transform: scale(0.95);
        }

        .ct-controls {
          display: flex;
          gap: 6px;
          margin-top: 20px;
        }

        .ct-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          font-size: 0;
        }

        .ct-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.9);
        }

        .ct-btn-accent:hover {
          background: ${config.accent}20;
          border-color: ${config.accent}40;
          color: ${config.accent};
        }

        .ct-btn svg {
          width: 18px;
          height: 18px;
          stroke: currentColor;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
      `}</style>
      <div className="ct-root">
        <div className={`ct-card ${config.card ? 'ct-card-bg' : ''}`}>
          {config.label && <div className="ct-label">{config.label}</div>}
          <div className={`ct-number ${flash ? `ct-flash-${flash}` : ''}`}>
            {count}
          </div>
          <div className="ct-controls">
            <button
              type="button"
              className="ct-btn ct-btn-accent"
              onClick={() => {
                setCount((c) => c + 1);
                setFlash('up');
              }}
            >
              <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            </button>
            <button
              type="button"
              className="ct-btn"
              onClick={() => {
                setCount((c) => Math.max(0, c - 1));
                setFlash('down');
              }}
            >
              <svg viewBox="0 0 24 24"><path d="M5 12h14" /></svg>
            </button>
            <button
              type="button"
              className="ct-btn"
              onClick={() => {
                setCount(config.initial);
                setFlash('');
              }}
            >
              <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 5 5 0 0 0-4 2" /><polyline points="3 3 3 7 7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
