import type { z } from 'zod';
import type { signInSchema } from '../schema/auth';

export type SignInRequest = z.infer<typeof signInSchema.json>;

export type SignInResponse = {
  token: string;
};

export type JWTPayload = {
  email: string;
  sub: string;
};
