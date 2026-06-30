import { useEffect, useState } from 'react';

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    name: params.get('name') ?? 'Name',
    title: params.get('title') ?? '雑談配信',
    social: params.get('social') ?? '@handle',
    topic: params.get('topic') ?? '',
    accent1: params.get('accent1') ?? '#a78bfa',
    accent2: params.get('accent2') ?? '#f472b6',
    showClock: params.get('clock') !== 'false',
    format12h: params.get('12h') === 'true',
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

export const ZatsudanScreen = () => {
  const [config] = useState(parseParams);
  const [time, setTime] = useState({ h: '00', m: '00', ampm: '' });
  const [visible, setVisible] = useState(false);

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

  return (
    <>
      <style>{`
        .zt-root {
          width: 1920px;
          height: 1080px;
          position: relative;
          overflow: hidden;
          font-family: var(--font-inter), var(--font-noto-sans-jp), sans-serif;
        }

        .zt-root * {
          box-sizing: border-box;
        }

        /* --- Top Bar --- */
        .zt-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 56px;
          background: linear-gradient(135deg, rgba(15, 10, 25, 0.92), rgba(25, 15, 40, 0.88));
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          padding: 0 32px;
          z-index: 10;
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s;
        }

        .zt-visible .zt-top {
          opacity: 1;
          transform: translateY(0);
        }

        .zt-top-accent {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, ${config.accent1}, ${config.accent2}, transparent 60%);
        }

        .zt-channel {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .zt-channel-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${config.accent1}, ${config.accent2});
          box-shadow: 0 0 10px ${config.accent1}80;
          animation: zt-dot 2s ease-in-out infinite;
        }

        @keyframes zt-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 10px ${config.accent1}80; }
          50% { opacity: 0.6; box-shadow: 0 0 20px ${config.accent1}60; }
        }

        .zt-channel-name {
          font-size: 24px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.9);
        }

        .zt-stream-title {
          margin-left: 24px;
          font-size: 24px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.4);
        }

        .zt-top-right {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .zt-clock {
          font-family: var(--font-jetbrains-mono), monospace;
          font-size: 24px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
        }

        .zt-clock-sep {
          color: ${config.accent1};
          animation: zt-blink 1s steps(1) infinite;
        }

        @keyframes zt-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .zt-clock-ampm {
          font-size: 24px;
          color: ${config.accent1};
          margin-left: 4px;
        }

        /* --- Camera Frame --- */
        .zt-camera-wrap {
          position: absolute;
          top: 80px;
          left: 40px;
          width: 1220px;
          height: 880px;
          opacity: 0;
          transform: scale(0.98);
          transition: opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s;
        }

        .zt-visible .zt-camera-wrap {
          opacity: 1;
          transform: scale(1);
        }

        .zt-camera-border {
          position: absolute;
          inset: -2px;
          border-radius: 20px;
          background: linear-gradient(135deg, ${config.accent1}60, ${config.accent2}60, ${config.accent1}30);
          z-index: 0;
        }

        .zt-camera {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 18px;
          background: rgba(0, 0, 0, 0.2);
          overflow: hidden;
          z-index: 1;
        }

        .zt-camera-corner {
          position: absolute;
          width: 32px;
          height: 32px;
          z-index: 2;
        }

        .zt-camera-corner svg {
          width: 32px;
          height: 32px;
        }

        .zt-camera-corner.tl { top: 8px; left: 8px; }
        .zt-camera-corner.tr { top: 8px; right: 8px; transform: scaleX(-1); }
        .zt-camera-corner.bl { bottom: 8px; left: 8px; transform: scaleY(-1); }
        .zt-camera-corner.br { bottom: 8px; right: 8px; transform: scale(-1); }

        /* --- Chat Area --- */
        .zt-chat {
          position: absolute;
          top: 80px;
          right: 40px;
          width: 560px;
          height: 700px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          background: rgba(0, 0, 0, 0.1);
          opacity: 0;
          transform: translateX(10px);
          transition: opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s;
        }

        .zt-visible .zt-chat {
          opacity: 1;
          transform: translateX(0);
        }

        .zt-chat-header {
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .zt-chat-header-icon {
          width: 16px;
          height: 16px;
          color: ${config.accent1};
          opacity: 0.6;
        }

        .zt-chat-header-text {
          font-size: 24px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.2);
        }

        /* --- Topic Panel --- */
        .zt-topic {
          position: absolute;
          right: 40px;
          bottom: 100px;
          width: 560px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(15, 10, 25, 0.85), rgba(25, 15, 40, 0.8));
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 20px 24px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.8s ease 0.6s, transform 0.8s ease 0.6s;
        }

        .zt-visible .zt-topic {
          opacity: 1;
          transform: translateY(0);
        }

        .zt-topic-label {
          font-size: 24px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: ${config.accent2};
          margin-bottom: 6px;
        }

        .zt-topic-text {
          font-size: 24px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
        }

        /* --- Bottom Bar --- */
        .zt-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 72px;
          background: linear-gradient(135deg, rgba(15, 10, 25, 0.92), rgba(25, 15, 40, 0.88));
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          padding: 0 40px;
          z-index: 10;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s;
        }

        .zt-visible .zt-bottom {
          opacity: 1;
          transform: translateY(0);
        }

        .zt-bottom-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, ${config.accent2}, ${config.accent1}, transparent 60%);
        }

        .zt-bottom-name {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, ${config.accent1}, ${config.accent2});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .zt-bottom-sep {
          width: 1px;
          height: 24px;
          background: rgba(255, 255, 255, 0.08);
          margin: 0 20px;
        }

        .zt-bottom-title {
          font-size: 24px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.4);
        }

        .zt-bottom-social {
          font-size: 24px;
          font-weight: 600;
          color: ${config.accent1};
          margin-left: auto;
        }

        /* --- Decorative Elements --- */
        .zt-deco-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid;
          opacity: 0.08;
          pointer-events: none;
        }
      `}</style>
      <div className={`zt-root ${visible ? 'zt-visible' : ''}`}>
        {/* Decorative circles */}
        <div className="zt-deco-circle" style={{ width: 300, height: 300, top: -80, right: -60, borderColor: config.accent1 }} />
        <div className="zt-deco-circle" style={{ width: 200, height: 200, bottom: 80, left: -40, borderColor: config.accent2 }} />
        <div className="zt-deco-circle" style={{ width: 150, height: 150, top: 200, right: 300, borderColor: config.accent1 }} />

        {/* Top Bar */}
        <div className="zt-top">
          <div className="zt-top-accent" />
          <div className="zt-channel">
            <div className="zt-channel-dot" />
            <span className="zt-channel-name">{config.name}</span>
          </div>
          <span className="zt-stream-title">{config.title}</span>
          <div className="zt-top-right">
            {config.showClock && (
              <div className="zt-clock">
                {time.h}<span className="zt-clock-sep">:</span>{time.m}
                {time.ampm && <span className="zt-clock-ampm">{time.ampm}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Camera Frame */}
        <div className="zt-camera-wrap">
          <div className="zt-camera-border" />
          <div className="zt-camera">
            <div className="zt-camera-corner tl">
              <svg viewBox="0 0 32 32" fill="none">
                <path d="M2 12V4a2 2 0 012-2h8" stroke={config.accent1} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="zt-camera-corner tr">
              <svg viewBox="0 0 32 32" fill="none">
                <path d="M2 12V4a2 2 0 012-2h8" stroke={config.accent2} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="zt-camera-corner bl">
              <svg viewBox="0 0 32 32" fill="none">
                <path d="M2 12V4a2 2 0 012-2h8" stroke={config.accent2} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="zt-camera-corner br">
              <svg viewBox="0 0 32 32" fill="none">
                <path d="M2 12V4a2 2 0 012-2h8" stroke={config.accent1} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="zt-chat">
          <div className="zt-chat-header">
            <svg className="zt-chat-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="zt-chat-header-text">Chat</span>
          </div>
        </div>

        {/* Topic Panel */}
        {config.topic && (
          <div className="zt-topic">
            <div className="zt-topic-label">Topic</div>
            <div className="zt-topic-text">{config.topic}</div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="zt-bottom">
          <div className="zt-bottom-accent" />
          <div className="zt-bottom-name">{config.name}</div>
          <div className="zt-bottom-sep" />
          <div className="zt-bottom-title">{config.title}</div>
          <div className="zt-bottom-social">{config.social}</div>
        </div>
      </div>
    </>
  );
};
