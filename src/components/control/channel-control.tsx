import { useCallback, useEffect, useState } from 'react';
import { useChannel } from '../../hooks/use-channel';

interface Field {
  key: string;
  label: string;
  placeholder?: string;
}

interface Props {
  channel: string;
  fields: Field[];
  accent?: string;
  screenPath?: string;
}

function loadToken(): string {
  return localStorage.getItem('control-token') ?? '';
}

function saveToken(token: string) {
  localStorage.setItem('control-token', token);
}

export const ChannelControl = ({ channel, fields, accent = '#6366f1', screenPath }: Props) => {
  const [token, setToken] = useState('');
  const [tokenSaved, setTokenSaved] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const live = useChannel(channel);

  useEffect(() => {
    const saved = loadToken();
    if (saved) {
      setToken(saved);
      setTokenSaved(true);
    }
  }, []);

  const handleTokenSave = () => {
    saveToken(token);
    setTokenSaved(true);
  };

  const handleTokenClear = () => {
    localStorage.removeItem('control-token');
    setToken('');
    setTokenSaved(false);
  };

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSend = useCallback(async () => {
    const payload: Record<string, string> = {};
    for (const f of fields) {
      if (values[f.key]?.trim()) {
        payload[f.key] = values[f.key].trim();
      }
    }
    if (Object.keys(payload).length === 0) return;

    setSending(true);
    setResult(null);

    try {
      const resp = await fetch(`/api/control/${channel}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (resp.ok) {
        setResult({ ok: true, message: '更新しました' });
        setValues({});
      } else if (resp.status === 401) {
        setResult({ ok: false, message: '認証エラー: トークンを確認してください' });
      } else {
        setResult({ ok: false, message: `エラー: ${resp.status}` });
      }
    } catch {
      setResult({ ok: false, message: 'ネットワークエラー' });
    } finally {
      setSending(false);
    }
  }, [channel, fields, token, values]);

  const handleClear = useCallback(async () => {
    setSending(true);
    setResult(null);
    const empty: Record<string, string> = {};
    for (const f of fields) {
      empty[f.key] = '';
    }

    try {
      const resp = await fetch(`/api/control/${channel}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(empty),
      });
      if (resp.ok) {
        setResult({ ok: true, message: 'クリアしました' });
        setValues({});
      } else {
        setResult({ ok: false, message: `エラー: ${resp.status}` });
      }
    } catch {
      setResult({ ok: false, message: 'ネットワークエラー' });
    } finally {
      setSending(false);
    }
  }, [channel, fields, token]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSend();
    }
  };

  return (
    <>
      <style>{`
        .cc-root {
          min-height: 100vh;
          background-color: #1e1e2e;
          background-image:
            radial-gradient(ellipse at 20% 0%, ${accent}10 0%, transparent 60%);
          font-family: var(--font-inter), var(--font-noto-sans-jp), -apple-system, sans-serif;
          color: #cdd6f4;
          -webkit-font-smoothing: antialiased;
          display: flex;
          justify-content: center;
          padding: 40px 24px;
        }

        .cc-container {
          width: 100%;
          max-width: 480px;
        }

        .cc-header {
          margin-bottom: 32px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .cc-back {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.4);
          text-decoration: none;
          flex-shrink: 0;
          transition: background 0.2s, color 0.2s;
          margin-top: 2px;
        }

        .cc-back:hover {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.8);
        }

        .cc-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.9);
        }

        .cc-channel {
          font-size: 0.8rem;
          color: ${accent};
          font-weight: 500;
          margin-top: 4px;
        }

        .cc-screen-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          font-size: 0.75rem;
          font-weight: 500;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }

        .cc-screen-link:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: ${accent}40;
          color: ${accent};
        }

        .cc-screen-link svg {
          width: 14px;
          height: 14px;
        }

        .cc-section {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 16px;
        }

        .cc-section-title {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.3);
          margin-bottom: 16px;
        }

        .cc-field {
          margin-bottom: 14px;
        }

        .cc-field:last-child {
          margin-bottom: 0;
        }

        .cc-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 6px;
        }

        .cc-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .cc-input:focus {
          border-color: ${accent}60;
        }

        .cc-input::placeholder {
          color: rgba(255, 255, 255, 0.15);
        }

        .cc-input-token {
          font-family: var(--font-jetbrains-mono), monospace;
          font-size: 0.8rem;
        }

        .cc-actions {
          display: flex;
          gap: 8px;
          margin-top: 20px;
        }

        .cc-btn {
          flex: 1;
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          font-size: 0.85rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s, opacity 0.2s;
        }

        .cc-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cc-btn-primary {
          background: ${accent};
          color: white;
        }

        .cc-btn-primary:hover:not(:disabled) {
          filter: brightness(1.1);
        }

        .cc-btn-secondary {
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.6);
        }

        .cc-btn-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
        }

        .cc-btn-danger {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          flex: 0;
          padding: 10px 16px;
        }

        .cc-btn-danger:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.25);
        }

        .cc-result {
          margin-top: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .cc-result-ok {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.15);
        }

        .cc-result-err {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.15);
        }

        .cc-live {
          margin-top: 8px;
        }

        .cc-live-title {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.3);
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cc-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px #22c55e;
          animation: cc-pulse 2s ease-in-out infinite;
        }

        @keyframes cc-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .cc-live-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .cc-live-item:last-child {
          border-bottom: none;
        }

        .cc-live-key {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.35);
        }

        .cc-live-val {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .cc-live-empty {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.15);
          font-style: italic;
        }

        .cc-token-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .cc-token-row .cc-input {
          flex: 1;
        }

        .cc-hint {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.2);
          margin-top: 16px;
        }
      `}</style>
      <div className="cc-root">
        <div className="cc-container">
          <div className="cc-header">
            <a href="/control/" className="cc-back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </a>
            <div>
            <div className="cc-title">Control Panel</div>
            <div className="cc-channel">{channel}</div>
            {screenPath && (
              <a href={screenPath} target="_blank" rel="noopener noreferrer" className="cc-screen-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                画面を開く
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
            </div>
          </div>

          {/* Token */}
          <div className="cc-section">
            <div className="cc-section-title">認証トークン</div>
            <div className="cc-token-row">
              <input
                type="password"
                className="cc-input cc-input-token"
                value={token}
                onChange={(e) => { setToken(e.target.value); setTokenSaved(false); }}
                placeholder="CONTROL_TOKEN"
              />
              {!tokenSaved ? (
                <button type="button" className="cc-btn cc-btn-primary" style={{ flex: 0 }} onClick={handleTokenSave} disabled={!token}>
                  保存
                </button>
              ) : (
                <button type="button" className="cc-btn cc-btn-danger" onClick={handleTokenClear}>
                  削除
                </button>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="cc-section" onKeyDown={handleKeyDown}>
            <div className="cc-section-title">更新内容</div>
            {fields.map((f) => (
              <div key={f.key} className="cc-field">
                <label className="cc-label">{f.label}</label>
                <input
                  type="text"
                  className="cc-input"
                  value={values[f.key] ?? ''}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  placeholder={f.placeholder ?? f.label}
                />
              </div>
            ))}
            <div className="cc-actions">
              <button
                type="button"
                className="cc-btn cc-btn-primary"
                onClick={handleSend}
                disabled={sending || !tokenSaved}
              >
                {sending ? '送信中...' : '更新'}
              </button>
              <button
                type="button"
                className="cc-btn cc-btn-secondary"
                onClick={handleClear}
                disabled={sending || !tokenSaved}
              >
                クリア
              </button>
            </div>
            {result && (
              <div className={`cc-result ${result.ok ? 'cc-result-ok' : 'cc-result-err'}`}>
                {result.message}
              </div>
            )}
            <div className="cc-hint">Ctrl+Enter / Cmd+Enter で送信</div>
          </div>

          {/* Live State */}
          <div className="cc-section cc-live">
            <div className="cc-live-title">
              <div className="cc-live-dot" />
              現在の状態
            </div>
            {fields.map((f) => (
              <div key={f.key} className="cc-live-item">
                <span className="cc-live-key">{f.label}</span>
                <span className={live[f.key] ? 'cc-live-val' : 'cc-live-empty'}>
                  {live[f.key] || '(未設定)'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
