import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions para queries comunes
export async function getPortfolios() {
  const { data, error } = await supabase.from('portfolios').select('*');
  if (error) throw error;
  return data;
}

export async function getPortfolioById(id: string) {
  const { data, error } = await supabase.from('portfolios').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getAssets() {
  const { data, error } = await supabase.from('assets').select('*');
  if (error) throw error;
  return data;
}

export async function getTransactionsByPortfolio(portfolioId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getTransactionsByPortfolioAndAsset(portfolioId: string, assetId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .eq('asset_id', assetId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAssetsByPortfolio(portfolioId: string) {
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('asset_id')
    .eq('portfolio_id', portfolioId);

  if (error) throw error;

  const assetIds = Array.from(new Set(transactions.map((t) => t.asset_id)));
  if (assetIds.length === 0) return [];

  const { data: assets, error: assetsError } = await supabase
    .from('assets')
    .select('*')
    .in('id', assetIds);

  if (assetsError) throw assetsError;
  return assets;
}

export async function createPortfolio(name: string, description?: string, baseCurrency: string = 'EUR') {
  const { data, error } = await supabase
    .from('portfolios')
    .insert([{ name, description, base_currency: baseCurrency }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePortfolio(
  id: string,
  updates: { name?: string; description?: string; base_currency?: string }
) {
  const { data, error } = await supabase
    .from('portfolios')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePortfolio(id: string) {
  const { error } = await supabase.from('portfolios').delete().eq('id', id);
  if (error) throw error;
}

export async function createAsset(
  name: string,
  type: 'stock' | 'etf' | 'crypto' | 'cash',
  currency: string,
  ticker?: string,
  exchange?: string
) {
  const { data, error } = await supabase
    .from('assets')
    .insert([{ name, type, currency, ticker, exchange }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createAssetForUser(
  userId: string,
  name: string,
  type: 'stock' | 'etf' | 'crypto' | 'cash',
  currency: string,
  ticker?: string,
  exchange?: string
) {
  const { data, error } = await supabase
    .from('assets')
    .insert([{ user_id: userId, name, type, currency, ticker, exchange }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createTransaction(
  portfolioId: string,
  assetId: string,
  type: 'buy' | 'sell' | 'dividend' | 'fee',
  quantity: number,
  unitPrice: number,
  date: string,
  fee?: number,
  notes?: string
) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ portfolio_id: portfolioId, asset_id: assetId, type, quantity, unit_price: unitPrice, fee, date, notes }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createTransactionForUser(
  userId: string,
  portfolioId: string,
  assetId: string,
  type: 'buy' | 'sell' | 'dividend' | 'fee',
  quantity: number,
  unitPrice: number,
  date: string,
  fee?: number,
  notes?: string
) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      user_id: userId,
      portfolio_id: portfolioId,
      asset_id: assetId,
      type,
      quantity,
      unit_price: unitPrice,
      fee,
      date,
      notes
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTransaction(
  id: string,
  updates: {
    type?: 'buy' | 'sell' | 'dividend' | 'fee';
    quantity?: number;
    unit_price?: number;
    fee?: number;
    date?: string;
    notes?: string;
  }
) {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

// Auth helper functions
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// Updated helpers to include user_id
export async function getPortfoliosByUser(userId: string) {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createPortfolioForUser(
  userId: string,
  name: string,
  description?: string,
  baseCurrency: string = 'EUR'
) {
  const { data, error } = await supabase
    .from('portfolios')
    .insert([{ user_id: userId, name, description, base_currency: baseCurrency }])
    .select()
    .single();
  if (error) throw error;
  return data;
}
