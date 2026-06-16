-- Portfolio Management Schema
-- Created for N8N News Investment Portfolio Module

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  base_currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ticker TEXT,
  type TEXT NOT NULL CHECK (type IN ('stock', 'etf', 'crypto', 'cash')),
  currency TEXT NOT NULL,
  exchange TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'dividend', 'fee')),
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  fee NUMERIC DEFAULT 0,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (no auth required)
CREATE POLICY "portfolios_all" ON portfolios
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "assets_all" ON assets
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "transactions_all" ON transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_portfolio_id ON transactions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_transactions_asset_id ON transactions(asset_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);

-- Create some sample data for testing (optional)
-- Uncomment to populate with examples
/*
INSERT INTO portfolios (name, description, base_currency) VALUES
  ('Mi Portafolio Principal', 'Inversiones a largo plazo', 'EUR'),
  ('Trading Corto Plazo', 'Operaciones intradía', 'USD');

INSERT INTO assets (name, ticker, type, currency, exchange) VALUES
  ('Apple', 'AAPL', 'stock', 'USD', 'NASDAQ'),
  ('Microsoft', 'MSFT', 'stock', 'USD', 'NASDAQ'),
  ('Bitcoin', 'BTC', 'crypto', 'EUR', NULL),
  ('Ethereum', 'ETH', 'crypto', 'EUR', NULL),
  ('Efectivo', 'EUR', 'cash', 'EUR', NULL);
*/
