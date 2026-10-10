import {createApi} from './api';
import type {Env} from './types';
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (!path.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (!env.DB || !env.BUCKET || !env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
      return Response.json({error: 'A loja está em configuração. Tente novamente mais tarde.'}, {status:503,headers:{'Cache-Control':'no-store'}});
    }
    const api = createApi(env);
    let result: Response;
    if (request.method === 'GET') result = await api.GET(request);
    else if (request.method === 'POST') result = await api.POST(request);
    else result = new Response('Método não permitido', {status:405,headers:{Allow:'GET, POST'}});
    result.headers.set('X-Frame-Options', 'DENY');
    result.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return result;
  }
};
