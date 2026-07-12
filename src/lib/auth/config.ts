import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'clearaudit-users.json');

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
  } catch { /* ignore */ }
  return [];
}

function findUserByEmail(email: string) {
  const users = loadUsers();
  return users.find((u: any) => u.email === email.toLowerCase().trim()) || null;
}

function findUserById(id: string) {
  const users = loadUsers();
  return users.find((u: any) => u.id === id) || null;
}

// When database is available, use Prisma adapter
const hasDb = !!process.env.DATABASE_URL;

let adapterConfig: any = undefined;
if (hasDb) {
  try {
    const { PrismaAdapter } = require('@auth/prisma-adapter');
    const { prisma } = require('@/lib/db/prisma');
    adapterConfig = PrismaAdapter(prisma);
  } catch {
    console.warn('Prisma adapter unavailable, using JSON-only auth');
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...(adapterConfig ? { adapter: adapterConfig } : {}),
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/verify-email',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).toLowerCase().trim();

        // Try Prisma first
        if (hasDb) {
          try {
            const { prisma } = await import('@/lib/db/prisma');
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user?.passwordHash) return null;

            const valid = await bcrypt.compare(String(credentials.password), user.passwordHash);
            if (!valid) return null;

            if (!user.emailVerified) throw new Error('EMAIL_NOT_VERIFIED');

            return { id: user.id, email: user.email, name: user.name, image: user.image };
          } catch (e: any) {
            if (e.message === 'EMAIL_NOT_VERIFIED') throw e;
            console.warn('Prisma auth failed, falling back to JSON:', e.message);
          }
        }

        // JSON fallback
        const user = findUserByEmail(email);
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!valid) return null;

        // In JSON mode, skip email verification for easier dev experience
        return { id: user.id, email: user.email, name: user.name, image: null };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;

        // Try to get tier/role from DB
        if (hasDb) {
          try {
            const { prisma } = await import('@/lib/db/prisma');
            const dbUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { tier: true, role: true },
            });
            token.tier = dbUser?.tier ?? 'FREE';
            token.role = dbUser?.role ?? 'USER';
          } catch {
            token.tier = 'FREE';
            token.role = 'USER';
          }
        } else {
          const jsonUser = findUserById(user.id ?? '');
          token.tier = jsonUser?.tier ?? 'FREE';
          token.role = jsonUser?.role ?? 'USER';
        }
      }

      if (trigger === 'update' && session) {
        token.name = session.name;
        token.tier = session.tier;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.tier = (token.tier as string) ?? 'FREE';
        session.user.role = (token.role as string) ?? 'USER';
      }
      return session;
    },
  },
  events: hasDb ? {
    async createUser({ user }) {
      try {
        const { prisma } = await import('@/lib/db/prisma');
        await prisma.subscription.create({
          data: { userId: user.id!, tier: 'FREE', status: 'ACTIVE' },
        });
      } catch { /* ignore in JSON mode */ }
    },
  } : undefined,
});
