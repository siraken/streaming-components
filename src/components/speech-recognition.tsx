import { useEffect, useRef, useState } from 'react';

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: {
    transcript: string;
  };
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResult[];
  resultIndex: number;
}

interface SpeechRecognitionAPI {
  new (): {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    onsoundstart: ((event: Event) => void) | null;
    onnomatch: ((event: Event) => void) | null;
    onerror: ((event: Event) => void) | null;
    onsoundend: ((event: Event) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    start: () => void;
  };
}

declare global {
  interface Window {
    speechRecognition?: SpeechRecognitionAPI;
    webkitSpeechRecognition?: SpeechRecognitionAPI;
  }
}

const LANGUAGES = [
  { value: 'ja-JP', label: '日本語' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'ko-KR', label: '한국어' },
  { value: 'cmn-Hans-CN', label: '中文 (简体)' },
  { value: 'cmn-Hant-TW', label: '中文 (繁體)' },
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'es-ES', label: 'Español' },
  { value: 'fr-FR', label: 'Français' },
  { value: 'it-IT', label: 'Italiano' },
  { value: 'id-ID', label: 'Bahasa Indonesia' },
  { value: 'fil-PH', label: 'Filipino' },
  { value: 'nb-NO', label: 'Norsk bokmål' },
  { value: 'ru-RU', label: 'Русский' },
  { value: 'uk-UA', label: 'Українська' },
];

type Status = 'idle' | 'listening' | 'paused' | 'error';

export const SpeechRecognition = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(2);
  const [textColor, setTextColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('transparent');
  const [language, setLanguage] = useState('ja-JP');
  const [panelOpen, setPanelOpen] = useState(true);

  const viewRef = useRef<HTMLDivElement>(null);
  const speechFlagRef = useRef(false);

  const SpeechRecognitionImpl =
    window.speechRecognition || window.webkitSpeechRecognition;

  const startRecognition = () => {
    if (!SpeechRecognitionImpl) {
      setStatus('error');
      return;
    }

    const recognition = new SpeechRecognitionImpl();
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onsoundstart = () => setStatus('listening');

    recognition.onnomatch = () => setStatus('paused');

    recognition.onerror = () => {
      setStatus('error');
      if (!speechFlagRef.current) startRecognition();
    };

    recognition.onsoundend = () => {
      setStatus('paused');
      startRecognition();
    };

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        setText(e.results[i][0].transcript);
        if (e.results[i].isFinal) {
          startRecognition();
        } else {
          speechFlagRef.current = true;
        }
      }
      if (viewRef.current) {
        viewRef.current.scrollTop = viewRef.current.scrollHeight;
      }
    };

    speechFlagRef.current = false;
    recognition.start();
  };

  const handleStart = () => {
    startRecognition();
    setText('');
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanelOpen((v) => !v);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const statusLabel: Record<Status, string> = {
    idle: 'Ready',
    listening: 'Listening',
    paused: 'Paused',
    error: 'Error',
  };

  const statusColor: Record<Status, string> = {
    idle: 'rgba(255,255,255,0.4)',
    listening: '#22c55e',
    paused: '#eab308',
    error: '#ef4444',
  };

  return (
    <>
      <style>{`
        .sr-root {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          font-family: var(--font-inter), var(--font-noto-sans-jp), sans-serif;
          overflow: hidden;
        }

        /* --- Control Panel --- */
        .sr-panel {
          background: #1a1a2e;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          z-index: 10;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }

        .sr-panel.sr-hidden {
          transform: translateY(-100%);
          opacity: 0;
          pointer-events: none;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
        }

        .sr-start-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: 8px;
          border: none;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          background: #6366f1;
          color: white;
        }

        .sr-start-btn:hover {
          background: #4f46e5;
        }

        .sr-start-btn svg {
          width: 14px;
          height: 14px;
          fill: currentColor;
        }

        .sr-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
        }

        .sr-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .sr-divider {
          width: 1px;
          height: 24px;
          background: rgba(255,255,255,0.08);
        }

        .sr-control-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sr-control-label {
          font-size: 0.7rem;
          font-weight: 500;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }

        .sr-select {
          padding: 5px 10px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.8);
          font-size: 0.8rem;
          font-family: inherit;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .sr-select:hover, .sr-select:focus {
          border-color: rgba(255,255,255,0.2);
        }

        .sr-select option {
          background: #1a1a2e;
        }

        .sr-size-btns {
          display: flex;
          gap: 2px;
        }

        .sr-size-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.5);
          font-size: 0.8rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, color 0.2s;
        }

        .sr-size-btn:hover {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.9);
        }

        .sr-color-input {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 2px;
          background: transparent;
          cursor: pointer;
        }

        /* --- Display Area --- */
        .sr-display {
          flex: 1;
          display: flex;
          align-items: flex-end;
          padding: 40px;
          overflow-y: auto;
        }

        .sr-text {
          font-weight: 500;
          line-height: 1.5;
          max-width: 90%;
          word-break: break-word;
        }

        .sr-text-empty {
          color: rgba(255,255,255,0.15);
          font-style: italic;
        }

        .sr-hint {
          position: fixed;
          bottom: 12px;
          right: 16px;
          font-size: 0.65rem;
          color: rgba(255,255,255,0.15);
          pointer-events: none;
        }
      `}</style>
      <div className="sr-root">
        <div className={`sr-panel ${panelOpen ? '' : 'sr-hidden'}`}>
          <button type="button" className="sr-start-btn" onClick={handleStart}>
            <svg viewBox="0 0 24 24">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" fill="none" strokeWidth="2" />
            </svg>
            Start
          </button>

          <div className="sr-status">
            <div
              className="sr-status-dot"
              style={{
                backgroundColor: statusColor[status],
                boxShadow: status === 'listening' ? `0 0 6px ${statusColor[status]}` : 'none',
              }}
            />
            {statusLabel[status]}
          </div>

          <div className="sr-divider" />

          <div className="sr-control-group">
            <span className="sr-control-label">Lang</span>
            <select
              className="sr-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="sr-divider" />

          <div className="sr-control-group">
            <span className="sr-control-label">Size</span>
            <div className="sr-size-btns">
              <button
                type="button"
                className="sr-size-btn"
                onClick={() => setFontSize((s) => Math.max(0.5, s - 0.5))}
              >
                -
              </button>
              <button
                type="button"
                className="sr-size-btn"
                onClick={() => setFontSize((s) => s + 0.5)}
              >
                +
              </button>
            </div>
          </div>

          <div className="sr-control-group">
            <span className="sr-control-label">Text</span>
            <input
              type="color"
              className="sr-color-input"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
          </div>

          <div className="sr-control-group">
            <span className="sr-control-label">BG</span>
            <input
              type="color"
              className="sr-color-input"
              value={bgColor === 'transparent' ? '#000000' : bgColor}
              onChange={(e) => setBgColor(e.target.value)}
            />
          </div>
        </div>

        <div
          ref={viewRef}
          className="sr-display"
          style={{ backgroundColor: bgColor }}
        >
          <div
            className={`sr-text ${!text ? 'sr-text-empty' : ''}`}
            style={{
              fontSize: `${fontSize}rem`,
              color: textColor,
            }}
          >
            {text || (status === 'idle' ? 'Press Start to begin' : 'Waiting for speech...')}
          </div>
        </div>

        <div className="sr-hint">ESC to toggle panel</div>
      </div>
    </>
  );
};
