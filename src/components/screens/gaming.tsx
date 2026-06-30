import { useEffect, useState } from 'react';

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    name: params.get('name') ?? 'Name',
    game: params.get('game') ?? 'Game Title',
    social: params.get('social') ?? '@handle',
    accent1: params.get('accent1') ?? '#22d3ee',
    accent2: params.get('accent2') ?? '#6366f1',
    camSize: params.get('cam') ?? 'medium',
    camPos: params.get('pos') ?? 'bottom-right',
    showClock: params.get('clock') !== 'false',
    format12h: params.get('12h') === 'true',
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

const CAM_SIZES: Record<string, { w: number; h: number }> = {
  small: { w: 320, h: 320 },
  medium: { w: 420, h: 420 },
  large: { w: 520, h: 520 },
};

export const GamingScreen = () => {
  const [config] = useState(parseParams);
  const [time, setTime] = useState({ h: '00', m: '00', ampm: '' });
  const [visible, setVisible] = useState(false);

  const cam = CAM_SIZES[config.camSize] ?? CAM_SIZES.medium;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!config.showClock) return;
    const tick = () => {
      const now = new Date();
      let hour = now.getHours();
      let ampm = '';
      if (config.format12h) {
        ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
      }
      setTime({ h: pad(hour), m: pad(now.getMinutes()), ampm });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [config.showClock, config.format12h]);

  const camPosition = (() => {
    switch (config.camPos) {
      case 'bottom-left':
        return { bottom: 72, left: 24 };
      case 'top-right':
        return { top: 24, right: 24 };
      case 'top-left':
        return { top: 24, left: 24 };
      default:
        return { bottom: 72, right: 24 };
    }
  })();

  return (
    <>
      <style>{`
        .gm-root {
          width: 1920px;
          height: 1080px;
          position: relative;
          overflow: hidden;
          font-family: var(--font-inter), var(--font-noto-sans-jp), sans-serif;
        }

        .gm-root * {
          box-sizing: border-box;
        }

        /* --- Webcam Frame --- */
        .gm-cam-wrap {
          position: absolute;
          z-index: 10;
          opacity: 0;
          transform: scale(0.9);
          transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
        }

        .gm-visible .gm-cam-wrap {
          opacity: 1;
          transform: scale(1);
        }

        .gm-cam-border {
          position: absolute;
          inset: -2px;
          border-radius: 16px;
          background: linear-gradient(135deg, ${config.accent1}, ${config.accent2});
          opacity: 0.7;
        }

        .gm-cam {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 14px;
          background: rgba(0, 0, 0, 0.3);
          overflow: hidden;
          z-index: 1;
        }

        .gm-cam-glow {
          position: absolute;
          inset: -20px;
          border-radius: 30px;
          background: radial-gradient(ellipse, ${config.accent1}15, transparent 70%);
          z-index: -1;
          pointer-events: none;
        }

        .gm-cam-name {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 10px 16px;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          z-index: 2;
        }

        .gm-cam-name-text {
          font-size: 24px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
        }

        .gm-cam-live {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          z-index: 2;
        }

        .gm-cam-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 8px #ef4444;
          animation: gm-live-pulse 1.5s ease-in-out infinite;
        }

        @keyframes gm-live-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .gm-cam-live-text {
          font-size: 24px;
          font-weight: 700;
          color: #ef4444;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* --- Bottom Bar --- */
        .gm-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 72px;
          background: linear-gradient(135deg, rgba(8, 8, 16, 0.95), rgba(15, 15, 30, 0.92));
          backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          padding: 0 28px;
          z-index: 20;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s;
        }

        .gm-visible .gm-bar {
          opacity: 1;
          transform: translateY(0);
        }

        .gm-bar-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, ${config.accent1}, ${config.accent2}, transparent 70%);
        }

        .gm-bar-game-icon {
          width: 28px;
          height: 28px;
          color: ${config.accent1};
          margin-right: 10px;
        }

        .gm-bar-game {
          font-size: 24px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.85);
        }

        .gm-bar-sep {
          width: 1px;
          height: 20px;
          background: rgba(255, 255, 255, 0.08);
          margin: 0 16px;
        }

        .gm-bar-name {
          font-size: 24px;
          font-weight: 500;
          background: linear-gradient(135deg, ${config.accent1}, ${config.accent2});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .gm-bar-social {
          font-size: 24px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.3);
          margin-left: 12px;
        }

        .gm-bar-right {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .gm-bar-clock {
          font-family: var(--font-jetbrains-mono), monospace;
          font-size: 24px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
        }

        .gm-bar-clock-sep {
          color: ${config.accent1};
          animation: gm-blink 1s steps(1) infinite;
        }

        @keyframes gm-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .gm-bar-clock-ampm {
          font-size: 24px;
          color: ${config.accent1};
          margin-left: 3px;
        }

        /* --- Top edge decoration --- */
        .gm-top-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 10%, ${config.accent1}20, ${config.accent2}20, transparent 90%);
          z-index: 5;
        }
      `}</style>
      <div className={`gm-root ${visible ? 'gm-visible' : ''}`}>
        <div className="gm-top-line" />

        {/* Webcam Frame */}
        <div className="gm-cam-wrap" style={{ ...camPosition, width: cam.w, height: cam.h }}>
          <div className="gm-cam-glow" />
          <div className="gm-cam-border" />
          <div className="gm-cam">
            <div className="gm-cam-live">
              <div className="gm-cam-live-dot" />
              <span className="gm-cam-live-text">Live</span>
            </div>
            <div className="gm-cam-name">
              <div className="gm-cam-name-text">{config.name}</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="gm-bar">
          <div className="gm-bar-accent" />
          <svg className="gm-bar-game-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="6" y1="11" x2="10" y2="11" />
            <line x1="8" y1="9" x2="8" y2="13" />
            <line x1="15" y1="12" x2="15.01" y2="12" />
            <line x1="18" y1="10" x2="18.01" y2="10" />
            <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.544-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
          </svg>
          <span className="gm-bar-game">{config.game}</span>
          <div className="gm-bar-sep" />
          <span className="gm-bar-name">{config.name}</span>
          <span className="gm-bar-social">{config.social}</span>
          <div className="gm-bar-right">
            {config.showClock && (
              <div className="gm-bar-clock">
                {time.h}<span className="gm-bar-clock-sep">:</span>{time.m}
                {time.ampm && <span className="gm-bar-clock-ampm">{time.ampm}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
