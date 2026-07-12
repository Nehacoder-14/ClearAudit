import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

const DB_FILE = path.join(process.cwd(), 'clearaudit-db.json');

// Initialize Pool if PGDATABASE or DATABASE_URL is set
let pgPool = null;
if (process.env.DATABASE_URL || process.env.PGPASSWORD) {
  try {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/clearaudit',
      connectionTimeoutMillis: 2000
    });
  } catch (e) {
    console.warn("PostgreSQL Pool initialization failed, falling back to JSON DB:", e.message);
    pgPool = null;
  }
}

// In-Memory fallback store
let localStore = {
  contracts: [],
  alerts: [],
  chats: {} // sessionId -> array of messages
};

// Load JSON DB if it exists
function loadLocalDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const data = JSON.parse(raw);
      localStore = {
        contracts: data.contracts || [],
        alerts: data.alerts || [],
        chats: data.chats || {}
      };
    } else {
      saveLocalDb();
    }
  } catch (e) {
    console.error("Failed to load local JSON DB, resetting:", e.message);
    saveLocalDb();
  }
}

// Save JSON DB to file
function saveLocalDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(localStore, null, 2), 'utf8');
  } catch (e) {
    console.error("Failed to write JSON DB file:", e.message);
  }
}

// Load it immediately on start
loadLocalDb();

export async function isPostgres() {
  if (!pgPool) return false;
  try {
    const client = await pgPool.connect();
    client.release();
    return true;
  } catch (e) {
    return false;
  }
}

export async function getContracts() {
  if (await isPostgres()) {
    const res = await pgPool.query('SELECT * FROM contracts ORDER BY uploaded_at DESC');
    return res.rows.map(mapPgContract);
  }
  loadLocalDb();
  return [...localStore.contracts].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
}

export async function getContractById(id) {
  const strId = String(id);
  if (await isPostgres()) {
    const res = await pgPool.query('SELECT * FROM contracts WHERE id = $1', [strId]);
    return res.rows[0] ? mapPgContract(res.rows[0]) : null;
  }
  loadLocalDb();
  return localStore.contracts.find(c => String(c.id) === strId) || null;
}

export async function saveContract(contract) {
  const contractToSave = {
    id: contract.id || `c-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: contract.title || 'Untitled Contract',
    type: contract.type || 'Vendor Agreement',
    status: contract.status || 'needs_review',
    content: contract.content || '',
    parties: Array.isArray(contract.parties) ? contract.parties : (contract.parties ? contract.parties.split(',').map(s=>s.trim()) : []),
    effectiveDate: contract.effectiveDate || null,
    expirationDate: contract.expirationDate || null,
    renewalDate: contract.renewalDate || null,
    autoRenewal: !!contract.autoRenewal,
    noticePeriodDays: parseInt(contract.noticePeriodDays) || 30,
    paymentTerms: contract.paymentTerms || 'Net 30',
    paymentAmount: parseFloat(contract.paymentAmount) || 0,
    paymentFrequency: contract.paymentFrequency || 'One-time',
    obligations: Array.isArray(contract.obligations) ? contract.obligations : [],
    keyClauses: contract.keyClauses || {},
    embedding: Array.isArray(contract.embedding) ? contract.embedding : [],
    uploadedAt: contract.uploadedAt || new Date().toISOString()
  };

  if (await isPostgres()) {
    const q = `
      INSERT INTO contracts (
        id, title, type, status, content, parties, effective_date, expiration_date, 
        renewal_date, auto_renewal, notice_period_days, payment_terms, payment_amount, 
        payment_frequency, obligations, key_clauses, embedding, uploaded_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, type = EXCLUDED.type, status = EXCLUDED.status, 
        content = EXCLUDED.content, parties = EXCLUDED.parties, effective_date = EXCLUDED.effective_date, 
        expiration_date = EXCLUDED.expiration_date, renewal_date = EXCLUDED.renewal_date, 
        auto_renewal = EXCLUDED.auto_renewal, notice_period_days = EXCLUDED.notice_period_days, 
        payment_terms = EXCLUDED.payment_terms, payment_amount = EXCLUDED.payment_amount, 
        payment_frequency = EXCLUDED.payment_frequency, obligations = EXCLUDED.obligations, 
        key_clauses = EXCLUDED.key_clauses, embedding = EXCLUDED.embedding
      RETURNING *
    `;
    const values = [
      contractToSave.id,
      contractToSave.title,
      contractToSave.type,
      contractToSave.status,
      contractToSave.content,
      contractToSave.parties,
      contractToSave.effectiveDate,
      contractToSave.expirationDate,
      contractToSave.renewalDate,
      contractToSave.autoRenewal,
      contractToSave.noticePeriodDays,
      contractToSave.paymentTerms,
      contractToSave.paymentAmount,
      contractToSave.paymentFrequency,
      JSON.stringify(contractToSave.obligations),
      JSON.stringify(contractToSave.keyClauses),
      contractToSave.embedding.length > 0 ? `[${contractToSave.embedding.join(',')}]` : null,
      contractToSave.uploadedAt
    ];
    const res = await pgPool.query(q, values);
    return mapPgContract(res.rows[0]);
  }

  loadLocalDb();
  const idx = localStore.contracts.findIndex(c => String(c.id) === String(contractToSave.id));
  if (idx >= 0) {
    localStore.contracts[idx] = contractToSave;
  } else {
    localStore.contracts.push(contractToSave);
  }
  saveLocalDb();
  return contractToSave;
}

export async function deleteContract(id) {
  const strId = String(id);
  if (await isPostgres()) {
    await pgPool.query('DELETE FROM contracts WHERE id = $1', [strId]);
    await pgPool.query('DELETE FROM alerts WHERE contract_id = $1', [strId]);
    return true;
  }
  loadLocalDb();
  localStore.contracts = localStore.contracts.filter(c => String(c.id) !== strId);
  localStore.alerts = localStore.alerts.filter(a => String(a.contractId) !== strId);
  saveLocalDb();
  return true;
}

export async function getAlerts() {
  if (await isPostgres()) {
    const res = await pgPool.query('SELECT * FROM alerts ORDER BY due_date ASC');
    return res.rows.map(mapPgAlert);
  }
  loadLocalDb();
  return [...localStore.alerts].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

export async function saveAlert(alert) {
  const alertToSave = {
    id: alert.id || `a-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    contractId: alert.contractId,
    alertType: alert.alertType || 'renewal',
    dueDate: alert.dueDate,
    status: alert.status || 'upcoming',
    sentAt: alert.sentAt || null,
    message: alert.message || '',
    daysBefore: parseInt(alert.daysBefore) || 30
  };

  if (await isPostgres()) {
    const q = `
      INSERT INTO alerts (id, contract_id, alert_type, due_date, status, sent_at, message, days_before)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status, sent_at = EXCLUDED.sent_at, message = EXCLUDED.message, due_date = EXCLUDED.due_date
      RETURNING *
    `;
    const values = [
      alertToSave.id,
      alertToSave.contractId,
      alertToSave.alertType,
      alertToSave.dueDate,
      alertToSave.status,
      alertToSave.sentAt,
      alertToSave.message,
      alertToSave.daysBefore
    ];
    const res = await pgPool.query(q, values);
    return mapPgAlert(res.rows[0]);
  }

  loadLocalDb();
  const idx = localStore.alerts.findIndex(a => String(a.id) === String(alertToSave.id));
  if (idx >= 0) {
    localStore.alerts[idx] = alertToSave;
  } else {
    localStore.alerts.push(alertToSave);
  }
  saveLocalDb();
  return alertToSave;
}

export async function deleteAlert(id) {
  const strId = String(id);
  if (await isPostgres()) {
    await pgPool.query('DELETE FROM alerts WHERE id = $1', [strId]);
    return true;
  }
  loadLocalDb();
  localStore.alerts = localStore.alerts.filter(a => String(a.id) !== strId);
  saveLocalDb();
  return true;
}

export async function getChatMessages(sessionId) {
  if (await isPostgres()) {
    // Basic persistent chats table can be used, but let's default to session memory
  }
  loadLocalDb();
  return localStore.chats[sessionId] || [];
}

export async function saveChatMessage(sessionId, message) {
  loadLocalDb();
  if (!localStore.chats[sessionId]) {
    localStore.chats[sessionId] = [];
  }
  localStore.chats[sessionId].push({
    ...message,
    timestamp: new Date().toISOString()
  });
  saveLocalDb();
  return localStore.chats[sessionId];
}

export async function clearChats(sessionId) {
  loadLocalDb();
  if (localStore.chats[sessionId]) {
    delete localStore.chats[sessionId];
    saveLocalDb();
  }
  return true;
}

export async function resetDatabase() {
  if (await isPostgres()) {
    await pgPool.query('TRUNCATE contracts CASCADE');
    await pgPool.query('TRUNCATE alerts CASCADE');
  }
  localStore = {
    contracts: [],
    alerts: [],
    chats: {}
  };
  saveLocalDb();
}

// Helpers to map Postgres names to JavaScript camelCase keys
function mapPgContract(row) {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    status: row.status,
    content: row.content,
    parties: row.parties,
    effectiveDate: row.effective_date ? new Date(row.effective_date).toISOString().split('T')[0] : null,
    expirationDate: row.expiration_date ? new Date(row.expiration_date).toISOString().split('T')[0] : null,
    renewalDate: row.renewal_date ? new Date(row.renewal_date).toISOString().split('T')[0] : null,
    autoRenewal: row.auto_renewal,
    noticePeriodDays: row.notice_period_days,
    paymentTerms: row.payment_terms,
    paymentAmount: row.payment_amount ? parseFloat(row.payment_amount) : 0,
    paymentFrequency: row.payment_frequency,
    obligations: typeof row.obligations === 'string' ? JSON.parse(row.obligations) : row.obligations || [],
    keyClauses: typeof row.key_clauses === 'string' ? JSON.parse(row.key_clauses) : row.key_clauses || {},
    embedding: row.embedding ? (typeof row.embedding === 'string' ? JSON.parse(row.embedding) : row.embedding) : [],
    uploadedAt: row.uploaded_at
  };
}

function mapPgAlert(row) {
  return {
    id: row.id,
    contractId: row.contract_id,
    alertType: row.alert_type,
    dueDate: row.due_date ? new Date(row.due_date).toISOString().split('T')[0] : null,
    status: row.status,
    sentAt: row.sent_at,
    message: row.message,
    daysBefore: row.days_before
  };
}
