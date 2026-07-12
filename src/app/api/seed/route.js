import { seedDatabase } from '@/lib/seed';
import { getContracts, getAlerts } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await seedDatabase();
    const contracts = await getContracts();
    const alerts = await getAlerts();
    return NextResponse.json({
      success: true,
      message: `Database successfully seeded with ${contracts.length} contracts and ${alerts.length} alerts.`
    });
  } catch (e) {
    console.error("Seeding API failed:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
