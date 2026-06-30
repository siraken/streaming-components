import { DurableObject } from 'cloudflare:workers';

export class Channel extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/broadcast') {
      const body = await request.text();
      await this.ctx.storage.put('state', body);
      for (const ws of this.ctx.getWebSockets()) {
        ws.send(body);
      }
      const count = this.ctx.getWebSockets().length;
      return Response.json({ ok: true, clients: count });
    }

    if (url.pathname === '/websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server);

      const lastState = await this.ctx.storage.get<string>('state');
      if (lastState) {
        server.send(lastState);
      }

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response('Not found', { status: 404 });
  }

  webSocketMessage(_ws: WebSocket, _message: string | ArrayBuffer) {}

  webSocketClose() {}

  webSocketError(_ws: WebSocket, error: unknown) {
    console.error('WebSocket error:', error);
  }
}
