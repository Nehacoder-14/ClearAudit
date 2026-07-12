import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const checks: Record<string, string> = {
    api: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'degraded';
  }

  const status = checks.database === 'ok' ? 200 : 503;

  return NextResponse.json(
    {
      status: status === 200 ? 'healthy' : 'degraded',
      checks,
    },
    { status }
  );
}
