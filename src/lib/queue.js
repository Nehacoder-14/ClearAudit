import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { saveContract, saveAlert, getContracts, getAlerts } from './db';
import { extractContractMetadata } from './ai';
import { getEmbedding } from './embeddings';

// Check if Redis is active for BullMQ
let redisClient = null;
let bullQueue = null;
let bullWorker = null;

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

if (process.env.USE_REDIS === 'true') {
  try {
    redisClient = new IORedis(REDIS_URL, { maxRetriesPerRequest: null, connectTimeout: 2000 });
    redisClient.on('error', (err) => {
      console.warn("Redis connection failed, turning off BullMQ:", err.message);
      redisClient = null;
    });

    bullQueue = new Queue('ClearAuditQueue', { connection: redisClient });
  } catch (e) {
    console.warn("Redis connection failed, using local DB queue:", e.message);
  }
}

// In-memory fallback queue storage
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Queue API
export async function addJob(jobType, data) {
  const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const job = {
    id: jobId,
    type: jobType,
    data,
    status: 'queued',
    progress: 0,
    error: null,
    createdAt: new Date().toISOString()
  };

  if (bullQueue && redisClient) {
    try {
      await bullQueue.add(jobType, data, { jobId });
      console.log(`[BullMQ] Added job ${jobType} (${jobId})`);
      return job;
    } catch (e) {
      console.warn("BullMQ push failed, falling back to database queue:", e.message);
    }
  }

  // Fallback DB queue push
  const dbFile = path.join(process.cwd(), 'clearaudit-db.json');
  try {
    const raw = fs.readFileSync(dbFile, 'utf8');
    const db = JSON.parse(raw);
    if (!db.jobs) db.jobs = [];
    db.jobs.push(job);
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf8');
    console.log(`[DB Queue] Added job ${jobType} (${jobId})`);

    // Process immediately in background thread to keep it responsive
    processJobLocal(jobId);
  } catch (e) {
    console.error("Failed to add job to DB queue:", e);
  }

  return job;
}

// Local background processor loop
async function processJobLocal(jobId) {
  const dbFile = path.join(process.cwd(), 'clearaudit-db.json');
  let job = null;
  
  try {
    const raw = fs.readFileSync(dbFile, 'utf8');
    const db = JSON.parse(raw);
    const idx = db.jobs?.findIndex(j => j.id === jobId);
    if (idx >= 0) {
      db.jobs[idx].status = 'processing';
      db.jobs[idx].progress = 10;
      job = db.jobs[idx];
      fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf8');
    }
  } catch (e) {
    console.error("Local job status update failed:", e);
    return;
  }

  if (!job) return;

  try {
    console.log(`[Worker] Started processing job ${job.id}`);
    
    // Step 1: Text extraction
    updateJobProgress(jobId, 25, 'extracting_text');
    let extractedText = '';
    const filePath = path.join(process.cwd(), 'public', job.data.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at: ${filePath}`);
    }
    
    const fileBuffer = fs.readFileSync(filePath);
    
    if (job.data.filename.endsWith('.pdf')) {
      const parser = new PDFParse({ data: fileBuffer });
      const parsed = await parser.getText();
      extractedText = parsed.text;
      await parser.destroy();
    } else if (job.data.filename.endsWith('.docx')) {
      const parsed = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = parsed.value;
    } else {
      extractedText = fileBuffer.toString('utf8');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error("No readable text found in document.");
    }

    // Step 2: AI metadata extraction
    updateJobProgress(jobId, 50, 'ai_extraction');
    const metadata = await extractContractMetadata(extractedText, job.data.filename);

    // Step 3: Embeddings generation
    updateJobProgress(jobId, 75, 'generating_embeddings');
    const textToEmbed = `${metadata.title} ${metadata.parties.join(' ')} ${extractedText.substring(0, 5000)}`;
    const embedding = getEmbedding(textToEmbed);

    // Step 4: Save to Database
    updateJobProgress(jobId, 90, 'saving_to_db');
    const savedContract = await saveContract({
      ...metadata,
      id: job.data.contractId || `c-${Date.now()}`,
      content: extractedText,
      embedding
    });

    // Step 5: Schedule Alerts
    if (savedContract.expirationDate) {
      const noticeDays = savedContract.noticePeriodDays || 30;
      const expDate = new Date(savedContract.expirationDate);
      
      // Target alert dates
      const dates = [
        { days: noticeDays, type: 'renewal', msg: `Notice Period Alert: ${savedContract.title} auto-renews soon. Notice due in ${noticeDays} days.` },
        { days: 14, type: 'renewal', msg: `Upcoming: ${savedContract.title} expires in 14 days.` },
        { days: 7, type: 'renewal', msg: `Urgent: ${savedContract.title} expires in 7 days.` }
      ];

      for (const d of dates) {
        const alertDueDate = new Date(expDate.getTime() - (d.days * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
        
        // Schedule if it is in the future or within warning range
        const today = new Date('2026-07-10');
        let status = 'upcoming';
        let sentAt = null;
        if (new Date(alertDueDate) < today) {
          status = 'sent';
          sentAt = new Date(alertDueDate).toISOString();
        }

        await saveAlert({
          contractId: savedContract.id,
          alertType: d.type,
          dueDate: alertDueDate,
          status,
          sentAt,
          message: d.msg,
          daysBefore: d.days
        });
      }
    }

    updateJobProgress(jobId, 100, 'completed');
    console.log(`[Worker] Successfully completed job ${job.id}`);
  } catch (e) {
    console.error(`[Worker] Failed job ${jobId}:`, e.message);
    markJobFailed(jobId, e.message);
  }
}

// Update local job status
function updateJobProgress(jobId, progress, statusText) {
  const dbFile = path.join(process.cwd(), 'clearaudit-db.json');
  try {
    const raw = fs.readFileSync(dbFile, 'utf8');
    const db = JSON.parse(raw);
    const idx = db.jobs?.findIndex(j => j.id === jobId);
    if (idx >= 0) {
      db.jobs[idx].progress = progress;
      db.jobs[idx].statusText = statusText;
      if (progress === 100) {
        db.jobs[idx].status = 'completed';
      }
      fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf8');
    }
  } catch (e) {
    console.error("Local job progress update failed:", e);
  }
}

function markJobFailed(jobId, errMsg) {
  const dbFile = path.join(process.cwd(), 'clearaudit-db.json');
  try {
    const raw = fs.readFileSync(dbFile, 'utf8');
    const db = JSON.parse(raw);
    const idx = db.jobs?.findIndex(j => j.id === jobId);
    if (idx >= 0) {
      db.jobs[idx].status = 'failed';
      db.jobs[idx].error = errMsg;
      fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf8');
    }
  } catch (e) {
    console.error("Local job fail update failed:", e);
  }
}

// Check job status helper API
export async function getJobStatus(jobId) {
  const dbFile = path.join(process.cwd(), 'clearaudit-db.json');
  try {
    const raw = fs.readFileSync(dbFile, 'utf8');
    const db = JSON.parse(raw);
    return db.jobs?.find(j => j.id === jobId) || null;
  } catch (e) {
    return null;
  }
}

// BullMQ Worker setup if Redis is active
if (process.env.USE_REDIS === 'true' && redisClient) {
  try {
    bullWorker = new Worker('ClearAuditQueue', async (job) => {
      console.log(`[BullMQ Worker] Processing job ${job.id}`);
      // Mapping to same processing logic
      await processJobLocal(job.id);
    }, { connection: redisClient });

    bullWorker.on('failed', (job, err) => {
      console.error(`[BullMQ Worker] Job ${job?.id} failed:`, err);
    });
  } catch (e) {
    console.warn("Could not start BullMQ Worker:", e.message);
  }
}

// Periodically scan alerts to simulate background dispatcher
export function startAlertDispatcher() {
  console.log("Initializing alert dispatcher cron (10s interval)...");
  setInterval(async () => {
    try {
      const alerts = await getAlerts();
      const today = new Date('2026-07-10'); // Simulated present date
      
      for (const alert of alerts) {
        if (alert.status === 'upcoming' && new Date(alert.dueDate) <= today) {
          console.log(`[Dispatcher] Dispatching alert: ${alert.message}`);
          alert.status = 'sent';
          alert.sentAt = new Date().toISOString();
          await saveAlert(alert);
        }
      }
    } catch (e) {
      console.error("Alert dispatcher cycle failed:", e);
    }
  }, 10000);
}
