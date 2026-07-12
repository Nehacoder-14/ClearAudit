import { saveContract, saveAlert, resetDatabase } from './db.js';
import { getEmbedding } from './embeddings.js';

const DEMO_CONTRACTS = [
  {
    title: "Vanguard Logistics Master Agreement",
    type: "Vendor Agreement",
    status: "active",
    parties: ["ClearAudit Corp", "Vanguard Logistics Services"],
    effectiveDate: "2025-08-01",
    expirationDate: "2026-07-31",
    autoRenewal: true,
    noticePeriodDays: 30,
    paymentTerms: "Net 30",
    paymentAmount: 85000,
    paymentFrequency: "Annually",
    obligations: [
      "Deliver all goods within 48 hours of order confirmation.",
      "Submit monthly cargo tracking reports.",
      "Maintain a minimum of $2M liability insurance."
    ],
    content: "MASTER LOGISTICS SERVICES AGREEMENT\nThis Agreement is entered into on August 1, 2025, by and between ClearAudit Corp ('Client') and Vanguard Logistics Services ('Provider').\n1. Services: Provider shall deliver domestic freight transportation services.\n2. Payment: Fees shall be invoiced monthly and are due Net 30. Total contract value is $85,000.\n3. Term & Renewal: This agreement is valid for one year. It shall automatically renew for successive one-year terms unless either party gives written notice of non-renewal at least 30 days prior to the expiration date.\n4. Liability: Provider must maintain cargo insurance up to $2,000,000.",
    keyClauses: {
      payment: "Fees shall be invoiced monthly and are due Net 30. Total contract value is $85,000.",
      renewal: "It shall automatically renew for successive one-year terms unless either party gives written notice of non-renewal at least 30 days prior to the expiration date.",
      termination: "Either party may terminate for material breach with 15 days written notice."
    }
  },
  {
    title: "Apex Media Advertising Contract",
    type: "Client Service Contract",
    status: "active",
    parties: ["Apex Media Group LLC", "ClearAudit Corp"],
    effectiveDate: "2026-01-01",
    expirationDate: "2026-12-31",
    autoRenewal: false,
    noticePeriodDays: 0,
    paymentTerms: "Net 15",
    paymentAmount: 48000,
    paymentFrequency: "Monthly",
    obligations: [
      "Configure and manage digital ad campaigns across search and social channels.",
      "Provide custom marketing performance dashboards by the 5th of each month.",
      "Spend a minimum ad budget of $10,000 per month."
    ],
    content: "DIGITAL MARKETING SERVICES AGREEMENT\nEffective Date: January 1, 2026.\nBetween Apex Media Group LLC ('Agency') and ClearAudit Corp ('Client').\nServices: Agency will conduct search engine marketing and digital display advertising campaigns.\nFees: Agency fee of $4,000 per month ($48,000 total term). Payments are Net 15 from invoice date.\nTerm: Ends on December 31, 2026. No auto-renewal is active. Parties must execute a new SOW to extend.",
    keyClauses: {
      payment: "Agency fee of $4,000 per month ($48,000 total term). Payments are Net 15 from invoice date.",
      renewal: "Ends on December 31, 2026. No auto-renewal is active. Parties must execute a new SOW to extend.",
      termination: "Standard 30-day notice for convenience is required by either party."
    }
  },
  {
    title: "Salesforce Enterprise License Subscription",
    type: "SaaS Subscription",
    status: "active",
    parties: ["ClearAudit Corp", "Salesforce.com Inc"],
    effectiveDate: "2025-09-15",
    expirationDate: "2026-09-14",
    autoRenewal: true,
    noticePeriodDays: 60,
    paymentTerms: "Net 30",
    paymentAmount: 124000,
    paymentFrequency: "Annually",
    obligations: [
      "Provide 99.9% platform availability.",
      "Limit API requests to 50,000 per user per day.",
      "Grant access to 150 Enterprise tier user licenses."
    ],
    content: "ENTERPRISE SAAS SUBSCRIPTION AGREEMENT\nThis license agreement is between Salesforce.com Inc ('Salesforce') and ClearAudit Corp ('Subscriber').\nCommencement: September 15, 2025. Expiration: September 14, 2026.\nSubscription Fees: $124,000 due within 30 days of the effective date.\nRenewal: This contract will auto-renew for an additional 12-month period. Subscriber must submit a written cancellation request at least 60 days before the renewal date to prevent auto-renewal.",
    keyClauses: {
      payment: "Subscription Fees: $124,000 due within 30 days of the effective date (Net 30).",
      renewal: "This contract will auto-renew for an additional 12-month period. Subscriber must submit a written cancellation request at least 60 days before the renewal date.",
      termination: "Non-payment after 15 days of warning results in suspension of user access."
    }
  },
  {
    title: "Downtown Office Space Lease Agreement",
    type: "Lease/Facilities",
    status: "active",
    parties: ["Metropolitan Properties LLC", "ClearAudit Corp"],
    effectiveDate: "2022-08-01",
    expirationDate: "2027-07-31",
    autoRenewal: false,
    noticePeriodDays: 90,
    paymentTerms: "Due on 1st",
    paymentAmount: 180000,
    paymentFrequency: "Monthly",
    obligations: [
      "Pay rent of $15,000 on or before the 1st of each calendar month.",
      "Maintain office spaces in a clean, sanitary condition.",
      "Obtain written landlord approval for physical remodeling or modifications."
    ],
    content: "COMMERCIAL REAL ESTATE LEASE AGREEMENT\nLandlord: Metropolitan Properties LLC. Tenant: ClearAudit Corp.\nPremises: Suite 400, 100 Main Street.\nTerm: 5 Years starting August 1, 2022, expiring July 31, 2027.\nRent: $15,000 per month, due on the first day of each month. Late fees apply after the 5th.\nNotice: Tenant must notify landlord in writing of intent to vacate or renegotiate lease at least 90 days before expiration (due by May 2, 2027).",
    keyClauses: {
      payment: "Rent: $15,000 per month, due on the first day of each month. Late fees apply after the 5th.",
      renewal: "Notice: Tenant must notify landlord in writing of intent to vacate or renegotiate lease at least 90 days before expiration.",
      termination: "Default on rent for consecutive 2 months permits landlord to evict."
    }
  },
  {
    title: "Avita Web Design Consulting SOW",
    type: "Freelance/Consulting",
    status: "active",
    parties: ["Avita Creative Agency", "ClearAudit Corp"],
    effectiveDate: "2026-05-10",
    expirationDate: "2026-07-15", // Expiring this week!
    autoRenewal: false,
    noticePeriodDays: 7,
    paymentTerms: "Milestone-based",
    paymentAmount: 15000,
    paymentFrequency: "Milestone-based",
    obligations: [
      "Complete visual mockup assets for ClearAudit product.",
      "Develop responsive frontend CSS styling themes.",
      "Perform quality assurance across iOS and Android browsers."
    ],
    content: "STATEMENT OF WORK - DIGITAL DESIGN CONSULTING\nThis SOW is executed between Avita Creative Agency ('Designer') and ClearAudit Corp ('Client').\nStart Date: May 10, 2026. End Date: July 15, 2026.\nScope: Frontend UI redesign and custom responsive graphics.\nPayment: $5,000 on contract signing (paid), $5,000 on mockup approval (paid), and $5,000 on final code delivery (due July 15, 2026).\nExtension: Notice to extend must be given 7 days prior to the expiration date.",
    keyClauses: {
      payment: "$5,000 on contract signing, $5,000 on mockup approval, and $5,000 on final code delivery (due July 15, 2026).",
      renewal: "Notice to extend must be given 7 days prior to the expiration date.",
      termination: "Either party may terminate immediately for convenience, with hours billed up to date."
    }
  },
  {
    title: "John Doe Senior Architect Contract",
    type: "Freelance/Consulting",
    status: "active",
    parties: ["ClearAudit Corp", "John Doe (Consultant)"],
    effectiveDate: "2026-01-10",
    expirationDate: "2026-07-12", // Expiring in two days!
    autoRenewal: false,
    noticePeriodDays: 14,
    paymentTerms: "Net 15",
    paymentAmount: 36000,
    paymentFrequency: "Monthly",
    obligations: [
      "Oversee software architecture and cloud database deployment.",
      "Conduct weekly architecture sync sessions.",
      "Review pull requests and enforce code testing guidelines."
    ],
    content: "INDEPENDENT CONTRACTOR CONSULTING AGREEMENT\nBetween ClearAudit Corp ('Company') and John Doe ('Contractor').\nEffective Date: January 10, 2026. Term: Concludes on July 12, 2026.\nCompensation: Billing rate of $6,000 per month. Invoices submitted monthly, Net 15 terms.\nTermination: Contractor must provide 14 days notice before termination of services.",
    keyClauses: {
      payment: "Billing rate of $6,000 per month. Invoices submitted monthly, Net 15 terms.",
      renewal: "Term: Concludes on July 12, 2026. Extension must be drafted and approved.",
      termination: "Contractor must provide 14 days notice before termination of services."
    }
  },
  {
    title: "Global Systems IT Support Service Contract",
    type: "Client Service Contract",
    status: "needs_review", // Flagged for review
    parties: ["Global Systems IT Corp", "ClearAudit Corp"],
    effectiveDate: "2025-07-01",
    expirationDate: "2026-06-30", // Overdue/Expired!
    autoRenewal: true,
    noticePeriodDays: 30,
    paymentTerms: "Net 90", // Long payment window
    paymentAmount: 60000,
    paymentFrequency: "Monthly",
    obligations: [
      "Provide 24/7 IT helpdesk troubleshooting.",
      "Manage firewall security and weekly server backups.",
      "Maintain 98% resolution success for tier-1 IT tickets."
    ],
    content: "MANAGED IT SERVICES CONTRACT\nThis agreement is between Global Systems IT Corp and ClearAudit Corp.\nEffective Date: July 1, 2025. Expiration: June 30, 2026.\nWarning: The contract references auto-renewal, but notes a contradiction: 'This contract auto-renews unless notice is given 30 days prior. However, if renewal fees increase, renewal must be manually signed.' This creates an ambiguous situation that needs manual review.\nFees: $5,000 per month. Custom Net 90 payment window specified.",
    keyClauses: {
      payment: "$5,000 per month. Custom Net 90 payment window specified.",
      renewal: "This contract auto-renews unless notice is given 30 days prior. However, if renewal fees increase, renewal must be manually signed.",
      termination: "Requires 60 days notice for convenience."
    }
  },
  {
    title: "Zoom Rooms Enterprise Subscription SOW",
    type: "SaaS Subscription",
    status: "active",
    parties: ["ClearAudit Corp", "Zoom Video Communications Inc"],
    effectiveDate: "2025-11-01",
    expirationDate: "2026-10-31",
    autoRenewal: true,
    noticePeriodDays: 30,
    paymentTerms: "Net 30",
    paymentAmount: 18000,
    paymentFrequency: "Annually",
    obligations: [
      "Grant licenses for 12 corporate conference Zoom rooms.",
      "Provide premium priority call support.",
      "Deliver custom hardware diagnostics software."
    ],
    content: "ZOOM ROOMS SERVICE SOW\nZoom Video Communications Inc ('Zoom') agrees to provide services to ClearAudit Corp.\nActive Term: November 1, 2025 to October 31, 2026.\nPayment: Single upfront invoice of $18,000 due Net 30.\nRenewal: Auto-renews on October 31, 2026. Subscriber must cancel 30 days prior (notice due September 30, 2026).",
    keyClauses: {
      payment: "Single upfront invoice of $18,000 due Net 30.",
      renewal: "Auto-renews on October 31, 2026. Subscriber must cancel 30 days prior.",
      termination: "Standard SaaS termination policies apply."
    }
  },
  {
    title: "AWS Cloud Infrastructure Billing Addendum",
    type: "SaaS Subscription",
    status: "needs_review", // Needs review: dynamic pricing
    parties: ["Amazon Web Services EMEA SARL", "ClearAudit Corp"],
    effectiveDate: "2026-03-01",
    expirationDate: "2027-02-28",
    autoRenewal: true,
    noticePeriodDays: 30,
    paymentTerms: "Net 30",
    paymentAmount: 150000, // Estimated value
    paymentFrequency: "Monthly",
    obligations: [
      "Deliver standard cloud hosting services (EC2, S3, RDS).",
      "Offer 99.99% availability SLA.",
      "Calculate usage-based fees dynamically according to monthly utility compute times."
    ],
    content: "AWS SERVICES CORPORATE ADDENDUM\nThis document governs corporate hosting rates for ClearAudit Corp.\nEffective Date: March 1, 2026.\nFees: Variable utility rates. If estimated monthly invoice exceed $12,500, a special volume discount of 15% is triggered. However, the discount percentage is subject to revision if AWS updates their global pricing matrix. This requires monthly audit review.\nTerm: Expires Feb 28, 2027. Auto-renews unless written notice is given 30 days prior.",
    keyClauses: {
      payment: "Variable utility rates. If estimated monthly invoice exceed $12,500, a special volume discount of 15% is triggered.",
      renewal: "Expires Feb 28, 2027. Auto-renews unless written notice is given 30 days prior.",
      termination: "Requires 30 days written notice."
    }
  },
  {
    title: "ACME Janitorial Office Cleaning Agreement",
    type: "Vendor Agreement",
    status: "expired", // Expired
    parties: ["ACME Janitorial Cleaners", "ClearAudit Corp"],
    effectiveDate: "2024-06-01",
    expirationDate: "2025-05-31",
    autoRenewal: false,
    noticePeriodDays: 15,
    paymentTerms: "Net 30",
    paymentAmount: 12000,
    paymentFrequency: "Monthly",
    obligations: [
      "Perform office sweep, trash extraction, and vacuuming 3 times per week.",
      "Conduct professional carpet cleaning twice per calendar year.",
      "Refill bathroom toiletries and office kitchen soaps."
    ],
    content: "OFFICE JANITORIAL SERVICES AGREEMENT\nBetween ACME Janitorial Cleaners and ClearAudit Corp.\nTerm: June 1, 2024 to May 31, 2025.\nNo auto-renewal. Rates are $1,000 per month ($12,000 annual total). Payments due within 30 days of monthly invoice.",
    keyClauses: {
      payment: "Rates are $1,000 per month ($12,000 annual total). Payments due within 30 days of monthly invoice.",
      renewal: "No auto-renewal. Term expires May 31, 2025.",
      termination: "15 days notice for convenience."
    }
  },
  {
    title: "Securitas Office Security System Addendum",
    type: "Vendor Agreement",
    status: "active",
    parties: ["Securitas Security Solutions", "ClearAudit Corp"],
    effectiveDate: "2025-10-15",
    expirationDate: "2026-10-14",
    autoRenewal: true,
    noticePeriodDays: 45,
    paymentTerms: "Net 30",
    paymentAmount: 22000,
    paymentFrequency: "Monthly",
    obligations: [
      "Operate commercial office alarm systems and door badges.",
      "Respond to physical security breaches within 15 minutes.",
      "Maintain security cameras in working condition with 30-day storage backups."
    ],
    content: "ALARM AND SECURITY SYSTEM ADDENDUM\nThis security agreement is between Securitas Security Solutions and ClearAudit Corp.\nEffective Date: October 15, 2025. Expiration: October 14, 2026.\nFees: $1,833 per month ($22,000 annually). Invoiced monthly, due Net 30.\nRenewal: Auto-renews unless cancellation is received 45 days prior (due August 30, 2026).",
    keyClauses: {
      payment: "Fees: $1,833 per month ($22,000 annually). Invoiced monthly, due Net 30.",
      renewal: "Auto-renews unless cancellation is received 45 days prior.",
      termination: "Requires 30 days notice for breach."
    }
  },
  {
    title: "Stellar Cloud Hosting Service Agreement",
    type: "Client Service Contract",
    status: "active",
    parties: ["ClearAudit Corp", "Stellar Tech Solutions LLC"],
    effectiveDate: "2026-04-01",
    expirationDate: "2027-03-31",
    autoRenewal: false,
    noticePeriodDays: 30,
    paymentTerms: "Net 30",
    paymentAmount: 96000,
    paymentFrequency: "Monthly",
    obligations: [
      "Host database applications on dedicated cloud architectures.",
      "Provide premium cybersecurity shielding against DDoS attacks.",
      "Deliver quarterly audit report data of hardware uptime and resource loads."
    ],
    content: "CLOUD INFRASTRUCTURE HOSTING AGREEMENT\nClient: Stellar Tech Solutions LLC. Host: ClearAudit Corp.\nEffective: April 1, 2026. Ends: March 31, 2027.\nPayment: $8,000 monthly, payable Net 30. Total contract value $96,000.\nRenewal: Standard manual review. Non-renewal must be notified 30 days prior.",
    keyClauses: {
      payment: "Payment: $8,000 monthly, payable Net 30. Total contract value $96,000.",
      renewal: "Non-renewal must be notified 30 days prior. Requires manual sign to extend.",
      termination: "30 days notice for breach."
    }
  },
  {
    title: "Downtown Co-Working Executive Office Rental",
    type: "Lease/Facilities",
    status: "expired", // Expired
    parties: ["WeWork Spaces Inc", "ClearAudit Corp"],
    effectiveDate: "2024-05-01",
    expirationDate: "2025-04-30",
    autoRenewal: false,
    noticePeriodDays: 30,
    paymentTerms: "Due on 1st",
    paymentAmount: 72000,
    paymentFrequency: "Monthly",
    obligations: [
      "Rent premium desks for 8 employees.",
      "Obey co-working guidelines and guest entry limitations.",
      "Pay rent of $6,000 monthly."
    ],
    content: "CO-WORKING DESK RENTAL AGREEMENT\nBetween WeWork Spaces Inc and ClearAudit Corp.\nTerm: May 1, 2024 to April 30, 2025. No automatic renewal.\nPayment: Monthly rental charge of $6,000, due on the first calendar day.",
    keyClauses: {
      payment: "Monthly rental charge of $6,000, due on the first calendar day.",
      renewal: "No automatic renewal.",
      termination: "15 days notice for violation of guidelines."
    }
  },
  {
    title: "Stripe Payment Gateway Integration SOW",
    type: "SaaS Subscription",
    status: "active",
    parties: ["ClearAudit Corp", "Stripe Inc"],
    effectiveDate: "2026-02-15",
    expirationDate: "2027-02-14",
    autoRenewal: true,
    noticePeriodDays: 30,
    paymentTerms: "Transaction fee",
    paymentAmount: 30000, // Estimated value
    paymentFrequency: "Monthly",
    obligations: [
      "Process customer payments securely through online gateway.",
      "Store payment tokens in a PCI-compliant card vault.",
      "Deposit collected balances into merchant bank account within 2 business days."
    ],
    content: "STRIPE PAYMENTS SERVICE AGREEMENT\nBetween Stripe Inc ('Stripe') and ClearAudit Corp ('Merchant').\nStart Date: Feb 15, 2026. End Date: Feb 14, 2027.\nFees: 2.9% plus $0.30 per successful card transaction. Expected annual fees: $30,000.\nRenewal: Auto-renews unless written request is received 30 days prior.",
    keyClauses: {
      payment: "Fees: 2.9% plus $0.30 per successful card transaction. Expected annual fees: $30,000.",
      renewal: "Auto-renews unless written request is received 30 days prior.",
      termination: "Stripe may terminate immediately if chargeback rates exceed 1.0%."
    }
  },
  {
    title: "Innovate Creative Agency Video Retainer",
    type: "Client Service Contract",
    status: "active",
    parties: ["Innovate Creative LLC", "ClearAudit Corp"],
    effectiveDate: "2026-03-01",
    expirationDate: "2026-08-31",
    autoRenewal: false,
    noticePeriodDays: 14,
    paymentTerms: "Net 15",
    paymentAmount: 24000,
    paymentFrequency: "Monthly",
    obligations: [
      "Produce 3 promotional advertising video clips per month.",
      "Manage social media video distributions.",
      "Deliver RAW footage source files to Client."
    ],
    content: "VIDEO PRODUCTION SERVICES AGREEMENT\nBetween Innovate Creative LLC ('Producer') and ClearAudit Corp ('Client').\nTerm: March 1, 2026 to August 31, 2026.\nPayment: Retainer fee of $4,000 per month. Net 15 payment terms.\nTermination: Client must provide 14 days notice before ending the monthly retainer.",
    keyClauses: {
      payment: "Retainer fee of $4,000 per month. Net 15 payment terms.",
      renewal: "Manual extension only, expires August 31, 2026.",
      termination: "Client must provide 14 days notice before ending the monthly retainer."
    }
  },
  {
    title: "BetaTech QA Testing Service Agreement",
    type: "Vendor Agreement",
    status: "needs_review", // Flagged for review: ambiguous termination
    parties: ["BetaTech Quality Labs", "ClearAudit Corp"],
    effectiveDate: "2025-11-15",
    expirationDate: "2026-11-14",
    autoRenewal: true,
    noticePeriodDays: 30,
    paymentTerms: "Net 30",
    paymentAmount: 55000,
    paymentFrequency: "Monthly",
    obligations: [
      "Execute functional testing on ClearAudit web interface.",
      "Report UI bug details in Github issue trackers.",
      "Complete exploratory testing across major browsers."
    ],
    content: "QA SOFTWARE TESTING MASTER CONTRACT\nBetween BetaTech Quality Labs and ClearAudit Corp.\nEffective Date: November 15, 2025. Expiration: November 14, 2026.\nWarning: Section 8 (Termination) states: 'Agreement terminates on November 14, 2026, but will automatically extend for 6 months unless written notice is given.' However, Section 9 states: 'This is a non-renewable consulting pilot.' This conflict requires review.\nFees: $55,000 flat, payable in $5,000 monthly chunks. Payments are Net 30.",
    keyClauses: {
      payment: "Fees: $55,000 flat, payable in $5,000 monthly chunks. Payments are Net 30.",
      renewal: "Agreement terminates on November 14, 2026, but will automatically extend for 6 months unless written notice is given.",
      termination: "Conflict between section 8 and section 9 regarding renewals."
    }
  }
];

export async function seedDatabase() {
  console.log("Starting database seeding...");
  await resetDatabase();

  const savedContracts = [];
  
  // 1. Seed Contracts
  for (const c of DEMO_CONTRACTS) {
    const textToEmbed = `${c.title} ${c.type} ${c.content} ${c.parties.join(' ')}`;
    const embedding = getEmbedding(textToEmbed);
    
    const saved = await saveContract({
      ...c,
      embedding
    });
    savedContracts.push(saved);
  }

  console.log(`Successfully seeded ${savedContracts.length} contracts.`);

  // 2. Seed Alerts with a mix of statuses relative to 2026-07-10
  // John Doe (id corresponds to 6th index, concludes 2026-07-12)
  const johnDoe = savedContracts.find(c => c.title.includes("John Doe"));
  if (johnDoe) {
    // 14 days before 2026-07-12 is 2026-06-28. It is past (overdue alert)
    await saveAlert({
      contractId: johnDoe.id,
      alertType: "renewal",
      dueDate: "2026-06-28",
      status: "overdue",
      message: `Critical renewal window for ${johnDoe.title} passed on 2026-06-28. Contract expires in 2 days (2026-07-12).`
    });
  }

  // Avita Web Design (concludes 2026-07-15)
  const avita = savedContracts.find(c => c.title.includes("Avita"));
  if (avita) {
    // 7 days before 2026-07-15 is 2026-07-08. Should have been sent (sent status)
    await saveAlert({
      contractId: avita.id,
      alertType: "renewal",
      dueDate: "2026-07-08",
      status: "sent",
      sentAt: new Date('2026-07-08T09:00:00Z').toISOString(),
      message: `Alert: Final milestone payment of $5,000 for ${avita.title} is due on 2026-07-15.`
    });
  }

  // Vanguard Logistics (expires 2026-07-31, notice period 30 days -> notice due 2026-07-01. It is past (sent/overdue))
  const vanguard = savedContracts.find(c => c.title.includes("Vanguard"));
  if (vanguard) {
    await saveAlert({
      contractId: vanguard.id,
      alertType: "renewal",
      dueDate: "2026-07-01",
      status: "sent",
      sentAt: new Date('2026-07-01T10:00:00Z').toISOString(),
      message: `Notice Window Alert: Vanguard Logistics auto-renews on 2026-07-31. Non-renewal notice was due by 2026-07-01.`
    });
  }

  // Global Systems IT (expired 2026-06-30, status is overdue/expired)
  const globalIT = savedContracts.find(c => c.title.includes("Global Systems IT"));
  if (globalIT) {
    await saveAlert({
      contractId: globalIT.id,
      alertType: "renewal",
      dueDate: "2026-05-31",
      status: "overdue",
      message: `URGENT: Global Systems IT contract expired on 2026-06-30. Renewal notice period was 2026-05-31. Manual review needed.`
    });
  }

  // Salesforce (expires 2026-09-14, notice period 60 days -> notice due 2026-07-16. Expiring in 6 days! Upcoming alert)
  const salesforce = savedContracts.find(c => c.title.includes("Salesforce"));
  if (salesforce) {
    await saveAlert({
      contractId: salesforce.id,
      alertType: "renewal",
      dueDate: "2026-07-16",
      status: "upcoming",
      message: `Upcoming: Salesforce subscription auto-renews on 2026-09-14. Cancellation notice must be sent by 2026-07-16 (6 days remaining).`
    });
  }

  // Zoom (expires 2026-10-31, notice period 30 days -> notice due 2026-09-30. Upcoming alert)
  const zoom = savedContracts.find(c => c.title.includes("Zoom"));
  if (zoom) {
    await saveAlert({
      contractId: zoom.id,
      alertType: "renewal",
      dueDate: "2026-09-30",
      status: "upcoming",
      message: `Upcoming: Zoom Rooms subscription expires on 2026-10-31. Renewal cancellation notice is due by 2026-09-30.`
    });
  }

  // Apex Media (expires 2026-12-31, payment due dates)
  const apex = savedContracts.find(c => c.title.includes("Apex Media"));
  if (apex) {
    await saveAlert({
      contractId: apex.id,
      alertType: "payment",
      dueDate: "2026-07-15",
      status: "upcoming",
      message: `Upcoming Payment: Monthly agency fee of $4,000 for ${apex.title} is due on 2026-07-15.`
    });
  }

  console.log("Successfully seeded alerts.");
}
