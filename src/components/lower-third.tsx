import { useEffect, useRef, useState } from 'react';
import { useOBSStudio } from '../hooks/use-obs-studio';

interface Config {
  name: string;
  title: string;
  social: string;
  accent: string;
  duration: number;
}

function parseConfig(): Config {
  const params = new URLSearchParams(window.location.search);
  return {
    name: params.get('name') ?? 'Display Name',
    title: params.get('title') ?? 'Streamer / Content Creator',
    social: params.get('social') ?? '@handle',
    accent: params.get('accent') ?? '#6366f1',
    duration: Number(params.get('duration') ?? 0),
  };
}

export const LowerThird = () => {
  const [config] = useState(parseConfig);
  const [visible, setVisible] = useState(false);
  const obs = useOBSStudio();
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const sourceVisible = obs.available ? obs.visible : true;

    if (sourceVisible) {
      const showTimer = setTimeout(() => setVisible(true), 300);

      if (config.duration > 0) {
        hideTimer.current = setTimeout(
          () => setVisible(false),
          config.duration * 1000 + 300,
        );
      }

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer.current);
      };
    }

    setVisible(false);
    clearTimeout(hideTimer.current);
  }, [obs.available, obs.visible, config.duration]);

  const accentRgb = hexToRgb(config.accent);
  const glowColor = accentRgb
    ? `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.6)`
    : 'rgba(99, 102, 241, 0.6)';

  return (
    <>
      <style>{`
        .lt-root {
          position: fixed;
          bottom: 60px;
          left: 60px;
          font-family: var(--font-inter), sans-serif;
          pointer-events: none;
        }

        .lt-container {
          display: flex;
          align-items: stretch;
          transform: translateX(-120%);
          opacity: 0;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.6s ease;
        }

        .lt-container.lt-visible {
          transform: translateX(0);
          opacity: 1;
        }

        .lt-accent-bar {
          width: 4px;
          background: ${config.accent};
          border-radius: 2px 0 0 2px;
          box-shadow: 0 0 20px ${glowColor},
                      0 0 40px ${glowColor};
          animation: lt-pulse 2s ease-in-out infinite;
        }

        @keyframes lt-pulse {
          0%, 100% { box-shadow: 0 0 20px ${glowColor}, 0 0 40px ${glowColor}; }
          50% { box-shadow: 0 0 30px ${glowColor}, 0 0 60px ${glowColor}; }
        }

        .lt-content {
          background: linear-gradient(
            135deg,
            rgba(15, 15, 20, 0.92),
            rgba(25, 25, 35, 0.88)
          );
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-left: none;
          border-radius: 0 8px 8px 0;
          padding: 16px 28px 16px 20px;
          min-width: 260px;
        }

        .lt-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
          letter-spacing: -0.02em;
          transform: translateY(8px);
          opacity: 0;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s,
                      opacity 0.5s ease 0.3s;
        }

        .lt-visible .lt-name {
          transform: translateY(0);
          opacity: 1;
        }

        .lt-title {
          font-size: 0.85rem;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.55);
          margin-top: 2px;
          letter-spacing: 0.02em;
          transform: translateY(8px);
          opacity: 0;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.45s,
                      opacity 0.5s ease 0.45s;
        }

        .lt-visible .lt-title {
          transform: translateY(0);
          opacity: 1;
        }

        .lt-divider {
          height: 1px;
          background: linear-gradient(
            90deg,
            ${config.accent}80,
            transparent
          );
          margin: 8px 0;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s;
        }

        .lt-visible .lt-divider {
          transform: scaleX(1);
        }

        .lt-social {
          font-size: 0.8rem;
          font-weight: 600;
          color: ${config.accent};
          letter-spacing: 0.04em;
          transform: translateY(8px);
          opacity: 0;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s,
                      opacity 0.5s ease 0.6s;
        }

        .lt-visible .lt-social {
          transform: translateY(0);
          opacity: 1;
        }
      `}</style>
      <div className="lt-root">
        <div className={`lt-container ${visible ? 'lt-visible' : ''}`}>
          <div className="lt-accent-bar" />
          <div className="lt-content">
            <div className="lt-name">{config.name}</div>
            <div className="lt-title">{config.title}</div>
            <div className="lt-divider" />
            <div className="lt-social">{config.social}</div>
          </div>
        </div>
      </div>
    </>
  );
};

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null;
}
