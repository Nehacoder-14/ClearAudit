-- PostgreSQL Schema for ClearAudit (pgvector-enabled)

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing tables for reset scripts
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;

-- Contracts table
CREATE TABLE contracts (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    parties VARCHAR(255)[] NOT NULL,
    effective_date DATE,
    expiration_date DATE,
    renewal_date DATE,
    auto_renewal BOOLEAN DEFAULT FALSE,
    notice_period_days INT DEFAULT 30,
    payment_terms VARCHAR(100) DEFAULT 'Net 30',
    payment_amount NUMERIC(15, 2) DEFAULT 0.00,
    payment_frequency VARCHAR(50) DEFAULT 'One-time',
    obligations JSONB DEFAULT '[]'::jsonb,
    key_clauses JSONB DEFAULT '{}'::jsonb,
    embedding vector(384), -- 384 dimensions matching MiniLM
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alerts table
CREATE TABLE alerts (
    id VARCHAR(50) PRIMARY KEY,
    contract_id VARCHAR(50) NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'upcoming',
    sent_at TIMESTAMP WITH TIME ZONE,
    message TEXT NOT NULL,
    days_before INT DEFAULT 30
);

-- Indices for optimized searching
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_expiration ON contracts(expiration_date);
CREATE INDEX idx_alerts_due_date ON alerts(due_date);
CREATE INDEX idx_alerts_status ON alerts(status);
