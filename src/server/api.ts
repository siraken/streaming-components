import { Hono } from 'hono';
import type { Channel } from './channel';

type Env = {
  Bindings: {
    CHANNEL: DurableObjectNamespace<Channel>;
    CONTROL_TOKEN: string;
  };
};

export const apiApp = new Hono<Env>();

apiApp.get('/api/ws/:channel', async (c) => {
  if (c.req.header('Upgrade') !== 'websocket') {
    return c.text('Expected WebSocket', 426);
  }

  const id = c.env.CHANNEL.idFromName(c.req.param('channel'));
  const stub = c.env.CHANNEL.get(id);

  return stub.fetch(new Request('http://do/websocket', {
    headers: c.req.raw.headers,
  }));
});

apiApp.post('/api/control/:channel', async (c) => {
  const auth = c.req.header('Authorization');
  if (auth !== `Bearer ${c.env.CONTROL_TOKEN}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.text();
  const id = c.env.CHANNEL.idFromName(c.req.param('channel'));
  const stub = c.env.CHANNEL.get(id);

  return stub.fetch(new Request('http://do/broadcast', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
  }));
});

apiApp.get('/api/health', (c) => c.json({ ok: true }));
