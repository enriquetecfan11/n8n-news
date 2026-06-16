import type { APIRoute } from 'astro';
import { createTransaction } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { portfolioId, assetId, type, quantity, unitPrice, date, fee, notes } = body;

    if (!portfolioId || !assetId || !type || !quantity || !unitPrice || !date) {
      return new Response(
        JSON.stringify({ error: 'Campos requeridos: portfolioId, assetId, type, quantity, unitPrice, date' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const transaction = await createTransaction(
      portfolioId,
      assetId,
      type,
      parseFloat(quantity),
      parseFloat(unitPrice),
      date,
      fee ? parseFloat(fee) : undefined,
      notes
    );

    return new Response(JSON.stringify(transaction), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return new Response(
      JSON.stringify({ error: 'Error al crear la transacción' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
