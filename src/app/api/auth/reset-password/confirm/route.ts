import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';

const schema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const { token, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { email: normalizedEmail, token },
    });

    if (!resetToken) {
      return NextResponse.json({ success: false, error: 'Invalid or expired reset link' }, { status: 400 });
    }

    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return NextResponse.json({ success: false, error: 'Reset link has expired' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { passwordHash },
    });

    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

    await prisma.auditLog.create({
      data: {
        action: 'PASSWORD_RESET',
        entity: 'user',
        metadata: { email: normalizedEmail },
      },
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Password reset failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
