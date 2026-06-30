import { useEffect, useState } from 'react';

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    name: params.get('name') ?? 'Name',
    song: params.get('song') ?? '',
    artist: params.get('artist') ?? '',
    accent1: params.get('accent1') ?? '#f472b6',
    accent2: params.get('accent2') ?? '#c084fc',
  };
}

export const KaraokeScreen = () => {
  const [config] = useState(parseParams);
  const [visible, setVisible] = useState(false);
  const [noteIndex, setNoteIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setNoteIndex((i) => (i + 1) % 4);
    }, 800);
    return () => clearInterval(id);
  }, []);

  const notes = ['♪', '♫', '♬', '♩'];

  return (
    <>
      <style>{`
        .kr-root {
          width: 1920px;
          height: 1080px;
          position: relative;
          overflow: hidden;
          font-family: var(--font-inter), var(--font-noto-sans-jp), sans-serif;
        }

        .kr-root * {
          box-sizing: border-box;
        }

        /* --- Top Bar --- */
        .kr-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: linear-gradient(135deg, rgba(20, 10, 30, 0.92), rgba(30, 15, 40, 0.88));
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s;
        }

        .kr-visible .kr-top {
          opacity: 1;
          transform: translateY(0);
        }

        .kr-top-accent {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 10%, ${config.accent1}, ${config.accent2}, transparent 90%);
        }

        .kr-top-title {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.3em;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
        }

        .kr-top-note {
          font-size: 24px;
          margin: 0 12px;
          background: linear-gradient(135deg, ${config.accent1}, ${config.accent2});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* --- Camera Frame --- */
        .kr-camera-wrap {
          position: absolute;
          top: 84px;
          left: 40px;
          width: 1280px;
          height: 880px;
          opacity: 0;
          transform: scale(0.98);
          transition: opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s;
        }

        .kr-visible .kr-camera-wrap {
          opacity: 1;
          transform: scale(1);
        }

        .kr-camera-border {
          position: absolute;
          inset: -2px;
          border-radius: 20px;
          background: linear-gradient(135deg, ${config.accent1}50, ${config.accent2}50, ${config.accent1}30);
          z-index: 0;
        }

        .kr-camera {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 18px;
          background: rgba(0, 0, 0, 0.2);
          overflow: hidden;
          z-index: 1;
        }

        /* --- Song Info Panel --- */
        .kr-panel {
          position: absolute;
          top: 84px;
          right: 40px;
          width: 520px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(20, 10, 30, 0.88), rgba(30, 15, 40, 0.84));
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          overflow: hidden;
          opacity: 0;
          transform: translateX(10px);
          transition: opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s;
        }

        .kr-visible .kr-panel {
          opacity: 1;
          transform: translateX(0);
        }

        .kr-panel-header {
          padding: 20px 24px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .kr-now-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 24px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: ${config.accent1};
          margin-bottom: 12px;
        }

        .kr-now-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${config.accent1};
          box-shadow: 0 0 8px ${config.accent1};
          animation: kr-dot 1.5s ease-in-out infinite;
        }

        @keyframes kr-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .kr-song-title {
          font-size: 28px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.3;
          margin-bottom: 4px;
        }

        .kr-song-artist {
          font-size: 24px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.4);
        }

        .kr-empty-hint {
          font-size: 24px;
          color: rgba(255, 255, 255, 0.2);
          font-style: italic;
        }

        /* --- Visualizer Bars --- */
        .kr-vis {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          padding: 16px 24px 20px;
          height: 60px;
        }

        .kr-vis-bar {
          flex: 1;
          border-radius: 2px;
          background: linear-gradient(to top, ${config.accent1}40, ${config.accent2}40);
          animation: kr-bar 0.8s ease-in-out infinite alternate;
        }

        @keyframes kr-bar {
          from { height: 20%; }
          to { height: 100%; }
        }

        /* --- Request Panel --- */
        .kr-request {
          position: absolute;
          right: 40px;
          bottom: 100px;
          width: 520px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(20, 10, 30, 0.85), rgba(30, 15, 40, 0.8));
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 20px 24px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.8s ease 0.6s, transform 0.8s ease 0.6s;
        }

        .kr-visible .kr-request {
          opacity: 1;
          transform: translateY(0);
        }

        .kr-request-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 24px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: ${config.accent2};
          margin-bottom: 10px;
        }

        .kr-request-label svg {
          width: 14px;
          height: 14px;
          color: ${config.accent2};
        }

        .kr-request-hint {
          font-size: 24px;
          color: rgba(255, 255, 255, 0.25);
        }

        /* --- Bottom Bar --- */
        .kr-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 72px;
          background: linear-gradient(135deg, rgba(20, 10, 30, 0.92), rgba(30, 15, 40, 0.88));
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

        .kr-visible .kr-bottom {
          opacity: 1;
          transform: translateY(0);
        }

        .kr-bottom-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, ${config.accent1}, ${config.accent2}, transparent 60%);
        }

        .kr-bottom-note {
          font-size: 24px;
          background: linear-gradient(135deg, ${config.accent1}, ${config.accent2});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-right: 16px;
          transition: opacity 0.3s;
        }

        .kr-bottom-song {
          font-size: 24px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
        }

        .kr-bottom-artist {
          font-size: 24px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.35);
          margin-left: 12px;
        }

        .kr-bottom-empty {
          font-size: 24px;
          color: rgba(255, 255, 255, 0.2);
        }

        .kr-bottom-name {
          margin-left: auto;
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(135deg, ${config.accent1}, ${config.accent2});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* --- Floating Notes --- */
        .kr-float-note {
          position: absolute;
          font-size: 24px;
          background: linear-gradient(135deg, ${config.accent1}60, ${config.accent2}60);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          pointer-events: none;
          animation: kr-float 4s ease-in-out infinite;
        }

        @keyframes kr-float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(10deg); opacity: 0.6; }
        }
      `}</style>
      <div className={`kr-root ${visible ? 'kr-visible' : ''}`}>
        {/* Floating Notes */}
        <div className="kr-float-note" style={{ top: 150, right: 580, animationDelay: '0s', fontSize: 28 }}>♪</div>
        <div className="kr-float-note" style={{ top: 300, right: 600, animationDelay: '1s', fontSize: 24 }}>♫</div>
        <div className="kr-float-note" style={{ bottom: 200, right: 580, animationDelay: '2s', fontSize: 24 }}>♬</div>

        {/* Top Bar */}
        <div className="kr-top">
          <div className="kr-top-accent" />
          <span className="kr-top-note">{notes[noteIndex]}</span>
          <span className="kr-top-title">Karaoke</span>
          <span className="kr-top-note">{notes[(noteIndex + 2) % 4]}</span>
        </div>

        {/* Camera Frame */}
        <div className="kr-camera-wrap">
          <div className="kr-camera-border" />
          <div className="kr-camera" />
        </div>

        {/* Song Info Panel */}
        <div className="kr-panel">
          <div className="kr-panel-header">
            <div className="kr-now-label">
              <div className="kr-now-dot" />
              Now Playing
            </div>
            {config.song ? (
              <>
                <div className="kr-song-title">{config.song}</div>
                {config.artist && <div className="kr-song-artist">{config.artist}</div>}
              </>
            ) : (
              <div className="kr-empty-hint">Waiting for song...</div>
            )}
          </div>
          <div className="kr-vis">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="kr-vis-bar"
                style={{ animationDelay: `${i * 0.05}s`, animationDuration: `${0.5 + (i % 5) * 0.15}s` }}
              />
            ))}
          </div>
        </div>

        {/* Request Panel */}
        <div className="kr-request">
          <div className="kr-request-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Request
          </div>
          <div className="kr-request-hint">チャットでリクエスト受付中</div>
        </div>

        {/* Bottom Bar */}
        <div className="kr-bottom">
          <div className="kr-bottom-accent" />
          <div className="kr-bottom-note">{notes[noteIndex]}</div>
          {config.song ? (
            <>
              <span className="kr-bottom-song">{config.song}</span>
              {config.artist && <span className="kr-bottom-artist">- {config.artist}</span>}
            </>
          ) : (
            <span className="kr-bottom-empty">-</span>
          )}
          <span className="kr-bottom-name">{config.name}</span>
        </div>
      </div>
    </>
  );
};
