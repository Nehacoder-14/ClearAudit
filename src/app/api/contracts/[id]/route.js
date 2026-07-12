import { NextResponse } from 'next/server';
import { getContractById, saveContract, deleteContract } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const contract = await getContractById(id);

    if (!contract) {
      return NextResponse.json({ success: false, error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, contract });
  } catch (e) {
    console.error("Fetch Contract ID API failed:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = await getContractById(id);

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Contract not found' }, { status: 404 });
    }

    const updated = await saveContract({
      ...existing,
      ...body,
      id // Enforce matching ID
    });

    return NextResponse.json({ success: true, contract: updated });
  } catch (e) {
    console.error("Update Contract API failed:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const existing = await getContractById(id);

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Contract not found' }, { status: 404 });
    }

    await deleteContract(id);
    return NextResponse.json({ success: true, message: 'Contract deleted successfully' });
  } catch (e) {
    console.error("Delete Contract API failed:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
