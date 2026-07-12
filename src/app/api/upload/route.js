import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { addJob } from '@/lib/queue';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const filename = file.name;
    const fileType = path.extname(filename).toLowerCase();

    if (fileType !== '.pdf' && fileType !== '.docx') {
      return NextResponse.json({ success: false, error: 'Unsupported file type. Only PDF and DOCX are allowed.' }, { status: 400 });
    }

    // Read buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileId = `file-${Date.now()}`;
    const cleanFilename = `${fileId}${fileType}`;
    const filePath = path.join(uploadsDir, cleanFilename);
    fs.writeFileSync(filePath, buffer);

    const contractId = `c-${Date.now()}`;
    const fileUrl = `/uploads/${cleanFilename}`;

    // Add processing job
    const job = await addJob('process-contract', {
      contractId,
      filename,
      fileUrl,
      uploadedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      contractId,
      filename,
      fileUrl
    });

  } catch (e) {
    console.error("Upload API failed:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
