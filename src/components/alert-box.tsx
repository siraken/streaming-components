import { useCallback, useEffect, useRef, useState } from 'react';
import { useOBSStudio } from '../hooks/use-obs-studio';

type AlertStyle = 'slide' | 'pop' | 'fade';

interface AlertItem {
  id: number;
  message: string;
  visible: boolean;
}

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    style: (params.get('style') ?? 'slide') as AlertStyle,
    accent: params.get('accent') ?? '#6366f1',
    duration: Number(params.get('duration') ?? 5),
    position: params.get('pos') ?? 'top-right',
    demo: params.get('demo') === 'true',
  };
}

const DEMO_MESSAGES = [
  'New follower: StreamViewer42',
  'Subscription: CodeMaster99 (Tier 1)',
  'Donation: $10 from PixelPanda',
  'Raid: 150 viewers from TechStreamer',
  'Gift Sub: DevNinja gifted 5 subs',
];

export const AlertBox = () => {
  const [config] = useState(parseParams);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const nextId = useRef(0);
  const obs = useOBSStudio();

  const addAlert = useCallback(
    (message: string) => {
      const id = nextId.current++;
      setAlerts((prev) => [...prev, { id, message, visible: false }]);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAlerts((prev) =>
            prev.map((a) => (a.id === id ? { ...a, visible: true } : a)),
          );
        });
      });

      setTimeout(() => {
        setAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, visible: false } : a)),
        );
        setTimeout(() => {
          setAlerts((prev) => prev.filter((a) => a.id !== id));
        }, 600);
      }, config.duration * 1000);
    },
    [config.duration],
  );

  const sourceVisible = obs.available ? obs.visible : true;

  useEffect(() => {
    if (!config.demo || !sourceVisible) return;

    let idx = 0;
    const interval = setInterval(() => {
      addAlert(DEMO_MESSAGES[idx % DEMO_MESSAGES.length]);
      idx++;
    }, 3000);

    addAlert(DEMO_MESSAGES[0]);
    idx = 1;

    return () => clearInterval(interval);
  }, [config.demo, addAlert, sourceVisible]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (typeof e.data === 'string') {
        addAlert(e.data);
      } else if (e.data?.type === 'alert' && typeof e.data.message === 'string') {
        addAlert(e.data.message);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [addAlert]);

  const positionStyles = getPositionStyles(config.position);

  return (
    <>
      <style>{`
        .ab-container {
          position: fixed;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
          z-index: 9999;
          font-family: var(--font-inter), sans-serif;
        }

        .ab-alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          background: linear-gradient(
            135deg,
            rgba(15, 15, 20, 0.92),
            rgba(25, 25, 35, 0.88)
          );
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
                      0 0 0 1px rgba(255, 255, 255, 0.04) inset;
          min-width: 280px;
          max-width: 400px;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ab-alert.ab-slide {
          transform: translateX(120%);
          opacity: 0;
        }
        .ab-alert.ab-slide.ab-visible {
          transform: translateX(0);
          opacity: 1;
        }

        .ab-alert.ab-pop {
          transform: scale(0.5);
          opacity: 0;
        }
        .ab-alert.ab-pop.ab-visible {
          transform: scale(1);
          opacity: 1;
        }

        .ab-alert.ab-fade {
          transform: translateY(-10px);
          opacity: 0;
        }
        .ab-alert.ab-fade.ab-visible {
          transform: translateY(0);
          opacity: 1;
        }

        .ab-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: linear-gradient(135deg, ${config.accent}, ${config.accent}aa);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 16px ${config.accent}40;
        }

        .ab-icon svg {
          width: 18px;
          height: 18px;
          fill: white;
        }

        .ab-message {
          font-size: 0.9rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.4;
        }

        .ab-progress {
          position: absolute;
          bottom: 0;
          left: 12px;
          right: 12px;
          height: 2px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 1px;
          overflow: hidden;
        }

        .ab-progress-bar {
          height: 100%;
          background: ${config.accent};
          border-radius: 1px;
          animation: ab-shrink ${config.duration}s linear forwards;
        }

        @keyframes ab-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      <div className="ab-container" style={positionStyles}>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`ab-alert ab-${config.style} ${alert.visible ? 'ab-visible' : ''}`}
            style={{ position: 'relative' }}
          >
            <div className="ab-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <span className="ab-message">{alert.message}</span>
            <div className="ab-progress">
              <div className="ab-progress-bar" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

function getPositionStyles(
  position: string,
): React.CSSProperties {
  switch (position) {
    case 'top-left':
      return { top: 24, left: 24 };
    case 'top-center':
      return { top: 24, left: '50%', transform: 'translateX(-50%)' };
    case 'bottom-left':
      return { bottom: 24, left: 24 };
    case 'bottom-right':
      return { bottom: 24, right: 24 };
    case 'bottom-center':
      return { bottom: 24, left: '50%', transform: 'translateX(-50%)' };
    default:
      return { top: 24, right: 24 };
  }
}
