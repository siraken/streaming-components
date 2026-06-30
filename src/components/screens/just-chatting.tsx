import { useEffect, useState } from 'react';

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    name: params.get('name') ?? 'Display Name',
    title: params.get('title') ?? 'Just Chatting',
    social: params.get('social') ?? '@handle',
    accent: params.get('accent') ?? '#6366f1',
    showClock: params.get('clock') !== 'false',
    format12h: params.get('12h') === 'true',
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

export const JustChattingScreen = () => {
  const [config] = useState(parseParams);
  const [time, setTime] = useState({ h: '00', m: '00', s: '00', ampm: '' });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
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
      setTime({
        h: pad(hour),
        m: pad(now.getMinutes()),
        s: pad(now.getSeconds()),
        ampm,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [config.showClock, config.format12h]);

  return (
    <>
      <style>{`
        .jc-root {
          width: 1920px;
          height: 1080px;
          position: relative;
          overflow: hidden;
          font-family: var(--font-inter), sans-serif;
        }

        .jc-camera {
          position: absolute;
          left: 40px;
          top: 40px;
          width: 640px;
          height: 480px;
          border-radius: 16px;
          border: 2px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.3);
          overflow: hidden;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s;
        }

        .jc-visible .jc-camera {
          opacity: 1;
          transform: translateY(0);
        }

        .jc-camera-label {
          position: absolute;
          top: 16px;
          left: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.25);
        }

        .jc-camera-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${config.accent};
          box-shadow: 0 0 8px ${config.accent};
          animation: jc-dot-pulse 2s ease-in-out infinite;
        }

        @keyframes jc-dot-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .jc-camera-corner {
          position: absolute;
          width: 24px;
          height: 24px;
          border-color: ${config.accent}60;
          border-style: solid;
          border-width: 0;
        }

        .jc-camera-corner.tl { top: -1px; left: -1px; border-top-width: 2px; border-left-width: 2px; border-radius: 16px 0 0 0; }
        .jc-camera-corner.tr { top: -1px; right: -1px; border-top-width: 2px; border-right-width: 2px; border-radius: 0 16px 0 0; }
        .jc-camera-corner.bl { bottom: -1px; left: -1px; border-bottom-width: 2px; border-left-width: 2px; border-radius: 0 0 0 16px; }
        .jc-camera-corner.br { bottom: -1px; right: -1px; border-bottom-width: 2px; border-right-width: 2px; border-radius: 0 0 16px 0; }

        .jc-info-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 72px;
          background: linear-gradient(135deg, rgba(10, 10, 15, 0.92), rgba(20, 20, 30, 0.88));
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          padding: 0 48px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.8s ease 0.6s, transform 0.8s ease 0.6s;
        }

        .jc-visible .jc-info-bar {
          opacity: 1;
          transform: translateY(0);
        }

        .jc-accent-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, ${config.accent}, ${config.accent}80, transparent 50%);
        }

        .jc-info-name {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
        }

        .jc-info-divider {
          width: 1px;
          height: 28px;
          background: rgba(255, 255, 255, 0.08);
          margin: 0 24px;
        }

        .jc-info-title {
          font-size: 14px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.45);
        }

        .jc-info-social {
          font-size: 14px;
          font-weight: 600;
          color: ${config.accent};
          margin-left: 24px;
        }

        .jc-info-right {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .jc-clock {
          font-family: var(--font-jetbrains-mono), monospace;
          font-size: 20px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          letter-spacing: 0.02em;
        }

        .jc-clock-sep {
          color: ${config.accent};
          animation: jc-blink 1s steps(1) infinite;
        }

        @keyframes jc-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .jc-clock-seconds {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.3);
          margin-left: 4px;
        }

        .jc-clock-ampm {
          font-size: 11px;
          font-weight: 500;
          color: ${config.accent};
          margin-left: 6px;
          letter-spacing: 0.06em;
        }

        .jc-chat-area {
          position: absolute;
          right: 40px;
          top: 40px;
          width: 420px;
          height: 920px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          background: rgba(0, 0, 0, 0.15);
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s;
        }

        .jc-visible .jc-chat-area {
          opacity: 1;
          transform: translateY(0);
        }

        .jc-chat-label {
          position: absolute;
          top: 16px;
          left: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.15);
        }
      `}</style>
      <div className={`jc-root ${visible ? 'jc-visible' : ''}`}>
        <div className="jc-camera">
          <div className="jc-camera-label">
            <div className="jc-camera-dot" />
            Camera
          </div>
          <div className="jc-camera-corner tl" />
          <div className="jc-camera-corner tr" />
          <div className="jc-camera-corner bl" />
          <div className="jc-camera-corner br" />
        </div>

        <div className="jc-chat-area">
          <div className="jc-chat-label">Chat</div>
        </div>

        <div className="jc-info-bar">
          <div className="jc-accent-line" />
          <div className="jc-info-name">{config.name}</div>
          <div className="jc-info-divider" />
          <div className="jc-info-title">{config.title}</div>
          <div className="jc-info-social">{config.social}</div>
          <div className="jc-info-right">
            {config.showClock && (
              <div className="jc-clock">
                {time.h}<span className="jc-clock-sep">:</span>{time.m}
                <span className="jc-clock-seconds">{time.s}</span>
                {time.ampm && <span className="jc-clock-ampm">{time.ampm}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
