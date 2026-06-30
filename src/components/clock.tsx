import { useEffect, useState } from 'react';
import { pad } from '../lib/format';

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    unit: params.get('unit'),
    delay: params.get('delay'),
    accent: params.get('accent') ?? '#6366f1',
    showSeconds: params.get('seconds') !== 'false',
    format12h: params.get('12h') === 'true',
    showDate: params.get('date') === 'true',
    card: params.get('card') === 'true',
  };
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export const Clock = () => {
  const [config] = useState(parseParams);
  const [time, setTime] = useState({ h: '00', m: '00', s: '00', ampm: '', date: '' });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      let hour = now.getHours();
      let minute = now.getMinutes();
      let second = now.getSeconds();

      if (config.unit && config.delay) {
        const d = Number(config.delay);
        if (
          (config.unit === 'hour' && d > 24) ||
          (config.unit === 'min' && d > 60) ||
          (config.unit === 'sec' && d > 60)
        ) {
          setTime({ h: 'E', m: 'rr', s: '', ampm: '', date: '' });
          return;
        }

        switch (config.unit) {
          case 'hour':
            hour = (hour + d) % 24;
            break;
          case 'min': {
            const totalMin = minute + d;
            minute = totalMin % 60;
            hour = (hour + Math.floor(totalMin / 60)) % 24;
            break;
          }
          case 'sec': {
            const totalSec = second + d;
            second = totalSec % 60;
            const totalMin2 = minute + Math.floor(totalSec / 60);
            minute = totalMin2 % 60;
            hour = (hour + Math.floor(totalMin2 / 60)) % 24;
            break;
          }
        }
      }

      let ampm = '';
      if (config.format12h) {
        ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
      }

      const date = config.showDate
        ? `${WEEKDAYS[now.getDay()]} ${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`
        : '';

      setTime({ h: pad(hour), m: pad(minute), s: pad(second), ampm, date });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [config.unit, config.delay, config.format12h, config.showDate]);

  return (
    <>
      <style>{`
        .ck-root {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-jetbrains-mono), monospace;
        }

        .ck-card {
          padding: 24px 40px;
          border-radius: 16px;
        }

        .ck-card-bg {
          background: linear-gradient(135deg, rgba(15, 15, 20, 0.88), rgba(25, 25, 35, 0.84));
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .ck-time {
          display: flex;
          align-items: baseline;
          gap: 0;
          line-height: 1;
        }

        .ck-digit {
          font-size: 5rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.02em;
          text-shadow: 0 0 30px ${config.accent}30,
                       0 0 60px ${config.accent}15;
        }

        .ck-sep {
          font-size: 5rem;
          font-weight: 700;
          color: ${config.accent};
          margin: 0 2px;
          animation: ck-blink 1s steps(1) infinite;
        }

        @keyframes ck-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        .ck-seconds {
          font-size: 2rem;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.35);
          margin-left: 8px;
          align-self: flex-end;
          padding-bottom: 6px;
        }

        .ck-ampm {
          font-size: 1.2rem;
          font-weight: 500;
          color: ${config.accent};
          margin-left: 12px;
          align-self: flex-end;
          padding-bottom: 10px;
          letter-spacing: 0.08em;
        }

        .ck-date {
          font-family: var(--font-inter), sans-serif;
          font-size: 0.8rem;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.3);
          letter-spacing: 0.12em;
          margin-top: 8px;
          text-align: center;
        }
      `}</style>
      <div className="ck-root">
        <div className={`ck-card ${config.card ? 'ck-card-bg' : ''}`}>
          <div className="ck-time">
            <span className="ck-digit">{time.h}</span>
            <span className="ck-sep">:</span>
            <span className="ck-digit">{time.m}</span>
            {config.showSeconds && (
              <span className="ck-seconds">{time.s}</span>
            )}
            {time.ampm && <span className="ck-ampm">{time.ampm}</span>}
          </div>
          {time.date && <div className="ck-date">{time.date}</div>}
        </div>
      </div>
    </>
  );
};
