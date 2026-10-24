import { HttpError } from '../utils/HttpError.js';

export function hostingConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const configuredOrigins = (env.FRONTEND_URL || '').split(',').map(value => value.trim()).filter(Boolean);
  if (production && !configuredOrigins.length) {
    throw new Error('Set FRONTEND_URL to your Vercel website URL before starting the production API.');
  }
  const origins = configuredOrigins.map(value => {
    let url;
    try { url = new URL(value); } catch { throw new Error('FRONTEND_URL must contain full website URLs.'); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password
        || url.pathname !== '/' || url.search || url.hash || (production && url.protocol !== 'https:')) {
      throw new Error('FRONTEND_URL must contain website origins only (HTTPS in production), without paths or credentials.');
    }
    return url.origin;
  });
  if (!production) origins.push('http://localhost:5173', 'http://127.0.0.1:5173');
  const hops = env.TRUST_PROXY_HOPS || (env.RENDER === 'true' ? '1' : '0');
  if (!/^[0-5]$/.test(hops)) throw new Error('TRUST_PROXY_HOPS must be a number from 0 to 5.');
  return { origins: [...new Set(origins)], trustProxy: Number(hops), host: env.HOST || (production ? '0.0.0.0' : '127.0.0.1') };
}

export function corsOptions(config) {
  return {
    origin(origin, callback) {
      // Health checks and command-line clients have no Origin header. JWT still protects the API.
      if (!origin || config.origins.includes(origin)) return callback(null, true);
      callback(new HttpError(403, 'This website is not allowed to access the API'));
    },
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  };
}

export const hosting = hostingConfig();
