import { NextResponse } from 'next/server';
import { getJobStatus } from '@/lib/queue';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Missing jobId parameter' }, { status: 400 });
    }

    const job = await getJobStatus(jobId);

    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        progress: job.progress,
        statusText: job.statusText || job.status,
        error: job.error
      }
    });

  } catch (e) {
    console.error("Job Status API failed:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
