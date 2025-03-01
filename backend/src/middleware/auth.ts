import type { Context, Next } from 'hono';
import { jwt } from 'hono/jwt';
import type { JWTPayload } from '../types/auth';

export const auth = async (c: Context, next: Next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
  });

  await jwtMiddleware(c, next);

  // JWTペイロードをcontextに設定
  const payload = c.get('jwtPayload') as JWTPayload;
  c.set('user', { email: payload.email, id: payload.sub });
};
