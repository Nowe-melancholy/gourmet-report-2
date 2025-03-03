import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { cookies } from 'next/headers';
import { hc } from 'hono/client';
import { HonoType } from '@repo/backend';

// セッションの型を拡張
declare module 'next-auth' {
  interface Session {
    user: {
      email?: string | null;
      isAdmin?: boolean;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        // バックエンドのJWT認証を呼び出す
        if (user.email) {
          const client = hc<HonoType>(process.env.NEXT_PUBLIC_API_URL!);
          const response = await client.signIn.$post({
            json: { email: user.email },
          });

          if (!response.ok) {
            return false;
          }

          const data = await response.json();
          
          // JWTトークンをCookieに保存（サーバーサイドでのみ使用）
          const cookieStore = await cookies();
          cookieStore.set('auth-token', data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1週間
            path: '/',
            sameSite: 'lax',
          });
          
          return true;
        }
        return false;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },
    async session({ session }) {
      // Google認証に成功した場合は管理者とみなす
      // バックエンドの/signInエンドポイントで既に認証済み
      if (session.user) {
        session.user.isAdmin = true;
      }
      return session;
    },
  },
  events: {
    async signOut() {
      // ログアウト時にCookieの認証情報を削除
      const cookieStore = await cookies();
      cookieStore.delete('auth-token');
    },
  },
}); 