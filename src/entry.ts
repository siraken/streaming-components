import { apiApp } from './server/api';

import astroHandler from '@astrojs/cloudflare/entrypoints/server';

export default {
  async fetch(
    request: Request,
    env: Record<string, unknown>,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return apiApp.fetch(request, env, ctx);
    }

    return astroHandler.fetch(request, env, ctx);
  },
};

export { Channel } from './server/channel';
