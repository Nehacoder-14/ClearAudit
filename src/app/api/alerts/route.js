import { NextResponse } from 'next/server';
import { getAlerts, saveAlert, getContractById } from '@/lib/db';
import { startAlertDispatcher } from '@/lib/queue';

// Boot alert dispatcher once when the api is first called
let dispatcherInitialized = false;

export async function GET() {
  try {
    if (!dispatcherInitialized) {
      startAlertDispatcher();
      dispatcherInitialized = true;
    }

    const alerts = await getAlerts();

    // Attach contract titles to alerts for context in notification drawer
    const populated = await Promise.all(alerts.map(async (alert) => {
      const contract = await getContractById(alert.contractId);
      return {
        ...alert,
        contractTitle: contract ? contract.title : 'Deleted Contract'
      };
    }));

    return NextResponse.json({ success: true, alerts: populated });
  } catch (e) {
    console.error("Alerts GET API failed:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Missing alert ID' }, { status: 400 });
    }

    const saved = await saveAlert(body);
    return NextResponse.json({ success: true, alert: saved });
  } catch (e) {
    console.error("Alerts POST API failed:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
