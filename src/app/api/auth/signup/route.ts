import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const USERS_FILE = path.join(process.cwd(), 'clearaudit-users.json');
const TOKENS_FILE = path.join(process.cwd(), 'clearaudit-tokens.json');

function loadUsers(): any[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
  } catch { /* ignore */ }
  return [];
}

function saveUsers(users: any[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function loadTokens() {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
    }
  } catch { /* ignore */ }
  return [];
}

function saveTokens(tokens: any[]) {
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf8');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input. Name must be 2+ chars, password 8+ chars.' },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Try Prisma first (when PostgreSQL is available)
    const hasDb = !!process.env.DATABASE_URL;
    
    if (hasDb) {
      try {
        const { prisma } = await import('@/lib/db/prisma');
        
        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
          return NextResponse.json(
            { success: false, error: 'An account with this email already exists' },
            { status: 409 }
          );
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
          data: {
            name,
            email: normalizedEmail,
            passwordHash,
            subscription: { create: { tier: 'FREE', status: 'ACTIVE' } },
          },
        });

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await prisma.verificationToken.create({
          data: { identifier: normalizedEmail, token, expires },
        });

        return NextResponse.json({
          success: true,
          message: 'Account created. Please check your email to verify your account.',
        });
      } catch (prismaError) {
        console.warn('Prisma signup failed, falling back to JSON:', prismaError);
        // Fall through to JSON fallback
      }
    }

    // JSON fallback (no database required)
    const users = loadUsers();
    const existing = users.find((u: any) => u.email === normalizedEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = `u-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    users.push({
      id: userId,
      name,
      email: normalizedEmail,
      passwordHash,
      emailVerified: null,
      tier: 'FREE',
      role: 'USER',
      createdAt: new Date().toISOString(),
    });
    saveUsers(users);

    // Create verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const tokens = loadTokens();
    tokens.push({ identifier: normalizedEmail, token, expires });
    saveTokens(tokens);

    console.log(`[Signup] User created: ${normalizedEmail} (JSON mode)`);

    return NextResponse.json({
      success: true,
      message: 'Account created. You can now sign in.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Signup failed';
    console.error('[Signup] Error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
