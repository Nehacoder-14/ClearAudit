import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    const email = req.nextUrl.searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json({ success: false, error: 'Missing token or email' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const verification = await prisma.verificationToken.findFirst({
      where: { identifier: normalizedEmail, token },
    });

    if (!verification) {
      return NextResponse.json({ success: false, error: 'Invalid verification link' }, { status: 400 });
    }

    if (verification.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token: verification.token },
      });
      return NextResponse.json({ success: false, error: 'Verification link has expired' }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({
      where: { token: verification.token },
    });

    return NextResponse.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Verification failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
