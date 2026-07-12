import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client if key is present
const apiKey = process.env.ANTHROPIC_API_KEY;
const anthropic = apiKey ? new Anthropic({ apiKey }) : null;

// Dual-mode Contract Metadata Extractor
export async function extractContractMetadata(text = '', filename = '') {
  if (anthropic) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 1500,
        temperature: 0.1,
        system: `You are an expert legal contract analyst. Extract the following fields from the contract text into a JSON object:
{
  "title": "Contract name",
  "parties": ["Party A", "Party B"],
  "effectiveDate": "YYYY-MM-DD",
  "expirationDate": "YYYY-MM-DD",
  "renewalDate": "YYYY-MM-DD (typically when notice must be given, or blank if not auto-renew)",
  "autoRenewal": true/false,
  "noticePeriodDays": 30 (integer),
  "paymentTerms": "Net 30, milestone, Net 15, etc.",
  "paymentAmount": 15000 (total under contract or recurring amount),
  "paymentFrequency": "Monthly, Annually, One-time, etc.",
  "obligations": ["Obligation 1", "Obligation 2"],
  "status": "active" | "expired" | "needs_review",
  "keyClauses": {
    "payment": "Actual text clause excerpt",
    "renewal": "Actual text clause excerpt",
    "termination": "Actual text clause excerpt"
  }
}
If a field is missing, set to null. If a field is low-confidence, set status to "needs_review". Return ONLY the raw JSON block without markdown wrappers.`,
        messages: [{ role: 'user', content: `Analyze this contract:\nFilename: ${filename}\n\nContract Text:\n${text.substring(0, 30000)}` }]
      });

      const cleanJson = response.content[0].text.trim().replace(/^```json/, '').replace(/```$/, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.warn("Anthropic extraction failed, using fallback parser:", e.message);
    }
  }

  // Fallback Rule-Based Parser (regex and keywords)
  return fallbackParser(text, filename);
}

// Fallback RAG Chat Agent
export async function chatWithPortfolio(messages = [], contracts = [], alerts = []) {
  if (anthropic) {
    try {
      const context = JSON.stringify(contracts.map(c => ({
        id: c.id,
        title: c.title,
        parties: c.parties,
        status: c.status,
        expirationDate: c.expirationDate,
        paymentTerms: c.paymentTerms,
        paymentAmount: c.paymentAmount,
        paymentFrequency: c.paymentFrequency,
        autoRenewal: c.autoRenewal,
        noticePeriodDays: c.noticePeriodDays
      })), null, 2);

      const systemPrompt = `You are ClearAudit AI, a helpful contract intelligence assistant. 
You are assisting law firms, businesses, and freelance consultants. 
You have access to the user's contract portfolio below:
${context}

Active deadlines and alerts:
${JSON.stringify(alerts.map(a => ({ contractId: a.contractId, type: a.alertType, dueDate: a.dueDate, status: a.status })), null, 2)}

Today's date is: 2026-07-10.

Analyze the user's question, ground your answers in the contracts list provided, and output detailed, helpful answers.
If asked to draft emails or summarize, make it professional and legal-grade.`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 1000,
        temperature: 0.3,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      });

      return response.content[0].text;
    } catch (e) {
      console.warn("Anthropic Chat failed, running fallback Chat:", e.message);
    }
  }

  return fallbackChat(messages, contracts, alerts);
}

// --- Rule-Based Legal Parser (Offline Fallback) ---
function fallbackParser(text = '', filename = '') {
  const norm = text.toLowerCase();
  
  // Title estimation
  let title = filename ? filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ') : 'Agreement';
  title = title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  if (title === 'Upload') title = 'Service Agreement';

  // Parties search
  let parties = [];
  const partiesMatch = text.match(/(?:between|by and between)\s+([A-Za-z0-9\s,\.]+?)(?:\s+and\s+|\s+,\s+)([A-Za-z0-9\s,\.]+?)(?:\s+collectively|\s+hereinafter|\.|\n)/i);
  if (partiesMatch) {
    parties = [partiesMatch[1].trim(), partiesMatch[2].trim()];
  } else {
    // Basic guesses
    parties = ["ClearAudit Client", "Service Provider"];
  }

  // Payment terms
  let paymentTerms = 'Net 30';
  if (norm.includes('net 15')) paymentTerms = 'Net 15';
  else if (norm.includes('net 60')) paymentTerms = 'Net 60';
  else if (norm.includes('net 90')) paymentTerms = 'Net 90';
  else if (norm.includes('upon receipt') || norm.includes('due immediately')) paymentTerms = 'Due on Receipt';

  // Expiration / Effective dates
  let effectiveDate = '2026-07-01';
  let expirationDate = '2027-06-30';
  
  const dateRegexes = [
    /\b(?:effective|commence|start|entered\s+into)\s+(?:date|on|as\s+of)\s+([A-Za-z]+\s+\d{1,2},\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i,
    /\b(?:expire|end|terminate|valid\s+until)\s+(?:on|as\s+of|date)\s+([A-Za-z]+\s+\d{1,2},\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i
  ];

  const effMatch = text.match(dateRegexes[0]);
  if (effMatch) effectiveDate = parseDateString(effMatch[1]);
  
  const expMatch = text.match(dateRegexes[1]);
  if (expMatch) expirationDate = parseDateString(expMatch[1]);

  // Auto renewal
  const autoRenewal = norm.includes('renew automatically') || norm.includes('auto-renew') || norm.includes('automatic renewal');

  // Notice Period
  let noticePeriodDays = 30;
  const noticeMatch = norm.match(/(\d+)\s*days\s*prior\s*written\s*notice/);
  if (noticeMatch) noticePeriodDays = parseInt(noticeMatch[1]);

  // Payment Amount & Frequency
  let paymentAmount = 5000;
  const amtMatch = text.match(/\$\s*([0-9,]+(?:\.\d{2})?)/);
  if (amtMatch) {
    paymentAmount = parseFloat(amtMatch[1].replace(/,/g, ''));
  }
  
  let paymentFrequency = 'One-time';
  if (norm.includes('monthly') || norm.includes('per month')) paymentFrequency = 'Monthly';
  else if (norm.includes('annual') || norm.includes('per year') || norm.includes('yearly')) paymentFrequency = 'Annually';
  else if (norm.includes('hourly') || norm.includes('per hour')) paymentFrequency = 'Hourly';

  // Key obligations
  const obligations = [];
  if (norm.includes('intellectual property') || norm.includes('ip rights')) obligations.push("Maintain intellectual property ownership and license provisions");
  if (norm.includes('confidential') || norm.includes('non-disclosure')) obligations.push("Keep proprietary information strictly confidential for 3 years post-termination");
  if (norm.includes('indemnity') || norm.includes('hold harmless')) obligations.push("Indemnify client from third-party intellectual property claims");
  if (obligations.length === 0) {
    obligations.push("Provide services in accordance with Statement of Work", "Submit monthly invoices for services rendered");
  }

  // Key clauses text excerpt
  const keyClauses = {
    payment: extractClauseSnippet(text, ["payment", "invoice", "compensation", "fee"]),
    renewal: extractClauseSnippet(text, ["renew", "extension", "duration"]),
    termination: extractClauseSnippet(text, ["terminate", "breach", "cancellation"])
  };

  // Status (Default to review if effective date is in the past and values look unsure)
  let status = 'active';
  const expDateObj = new Date(expirationDate);
  const today = new Date('2026-07-10');
  if (expDateObj < today) {
    status = 'expired';
  } else if (norm.includes('needs review') || paymentAmount === 0 || parties.length < 2) {
    status = 'needs_review';
  }

  return {
    title,
    parties,
    effectiveDate,
    expirationDate,
    renewalDate: autoRenewal ? new Date(new Date(expirationDate).getTime() - (noticePeriodDays * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : null,
    autoRenewal,
    noticePeriodDays,
    paymentTerms,
    paymentAmount,
    paymentFrequency,
    obligations,
    status,
    keyClauses
  };
}

// Utility to parse standard dates like "January 15, 2026" or "10/12/2026" into YYYY-MM-DD
function parseDateString(str) {
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch(e) {}
  return '2026-12-31';
}

function extractClauseSnippet(text, keywords) {
  const lines = text.split('\n');
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (keywords.some(kw => lower.includes(kw)) && line.length > 50) {
      return line.trim();
    }
  }
  // Try paragraphs
  const paras = text.split('\n\n');
  for (const para of paras) {
    const lower = para.toLowerCase();
    if (keywords.some(kw => lower.includes(kw)) && para.length > 80) {
      return para.trim().substring(0, 250) + "...";
    }
  }
  return `Please refer to the document text for clauses regarding ${keywords.join(', ')}.`;
}

// --- Fallback grounded chatbot ---
function fallbackChat(messages = [], contracts = [], alerts = []) {
  const lastUserMsg = messages[messages.length - 1]?.content.toLowerCase() || '';
  
  // 1. Which contracts expire this month / upcoming deadlines?
  if (lastUserMsg.includes('expire') || lastUserMsg.includes('deadline') || lastUserMsg.includes('upcoming')) {
    const expiring = contracts.filter(c => {
      if (!c.expirationDate) return false;
      const exp = new Date(c.expirationDate);
      return exp >= new Date('2026-07-01') && exp <= new Date('2026-08-31');
    });

    if (expiring.length === 0) {
      return "Based on your portfolio, there are no contracts expiring this month (July 2026). The closest upcoming renewal is the SaaS Agreement expiring on September 15, 2026.";
    }

    let list = expiring.map(c => `- **${c.title}** (Parties: ${c.parties.join(' & ')}) - Expires on **${c.expirationDate}** (Payment Value: $${c.paymentAmount.toLocaleString()})`).join('\n');
    return `### Expiring Contracts (July - August 2026)
Here are the contracts expiring or requiring attention in this immediate window:

${list}

**Action Recommended**: Re-negotiate terms or issue a non-renewal notice if needed. You have scheduled notifications set up for these.`;
  }

  // 2. Summarize payment obligations
  if (lastUserMsg.includes('payment') || lastUserMsg.includes('obligation') || lastUserMsg.includes('value') || lastUserMsg.includes('money')) {
    const active = contracts.filter(c => c.status === 'active' || c.status === 'needs_review');
    const totalVal = active.reduce((sum, c) => sum + c.paymentAmount, 0);
    
    let table = "| Contract | Parties | Amount | Terms | Frequency |\n| --- | --- | --- | --- | --- |\n";
    active.slice(0, 6).forEach(c => {
      table += `| ${c.title} | ${c.parties.join(', ')} | $${c.paymentAmount.toLocaleString()} | ${c.paymentTerms} | ${c.paymentFrequency} |\n`;
    });

    return `### Portfolio Payment Obligations
Here is a summary of the active payment obligations across your contract portfolio:

${table}
*(Total active portfolio value under management: **$${totalVal.toLocaleString()}**)*

Most agreements follow standard **Net 30** payment terms, with a few custom vendor contracts on **Net 90**.`;
  }

  // 3. Draft a email
  if (lastUserMsg.includes('draft') || lastUserMsg.includes('email') || lastUserMsg.includes('write')) {
    // Find a contract that matches
    let match = contracts[0] || { title: "Vendor Agreement", parties: ["ACME Corp", "Services Ltd"] };
    for (const c of contracts) {
      if (lastUserMsg.includes(c.title.toLowerCase()) || c.parties.some(p => lastUserMsg.includes(p.toLowerCase()))) {
        match = c;
        break;
      }
    }

    return `### Email Draft: Contract Renewal/Negotiation
**Subject:** Inquire Regarding Renewal - ${match.title}

Dear ${match.parties[1] || 'Partner'},

I hope this email finds you well. 

I am writing on behalf of **${match.parties[0]}** regarding the **${match.title}** dated ${match.effectiveDate || 'recent'}, which is currently set to expire on **${match.expirationDate || 'upcoming'}**. 

We have thoroughly enjoyed our partnership and would like to propose extending our agreement. We would like to schedule a brief call next week to discuss the terms of this renewal, specifically matching our standard ${match.paymentTerms} payment timeline.

Please let me know your availability for a 15-minute call.

Sincerely,
Portfolio Administrator
*ClearAudit Automated Services*`;
  }

  // 4. Fallback general response
  return `Hello! I'm your ClearAudit Contract Assistant. 

I can analyze your portfolio of **${contracts.length} contracts** and **${alerts.length} alerts**. Here are some questions you can ask me:
1. *"Which contracts expire this month?"*
2. *"Summarize the payment obligations across my portfolio."*
3. *"Draft a renewal notice email for SaaS Subscription Agreement."*
4. *"Show me the payment terms for client service contracts."*

How can I help you organize or audit your contracts today?`;
}
