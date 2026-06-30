import { useEffect, useMemo, useRef, useState } from 'react';

const BASE_DELAY = 1000;
const MAX_DELAY = 30000;

export function useChannel(channel: string): Record<string, string> {
  const [state, setState] = useState<Record<string, string>>({});
  const attemptRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let closed = false;

    function connect() {
      if (closed) return;

      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${location.host}/api/ws/${channel}`);

      ws.onopen = () => {
        attemptRef.current = 0;
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as Record<string, string>;
          setState((prev) => ({ ...prev, ...data }));
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (closed) return;
        const delay = Math.min(
          BASE_DELAY * 2 ** attemptRef.current,
          MAX_DELAY,
        ) + Math.random() * 1000;
        attemptRef.current++;
        timerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws?.close();
      };
    }

    connect();

    return () => {
      closed = true;
      clearTimeout(timerRef.current);
      ws?.close();
    };
  }, [channel]);

  return useMemo(() => state, [state]);
}
