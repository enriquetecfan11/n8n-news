import type { APIRoute } from 'astro';
import { updateTransaction } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, type, quantity, unitPrice, date, fee, notes } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID de transacción requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const transaction = await updateTransaction(id, {
      type,
      quantity: quantity ? parseFloat(quantity) : undefined,
      unit_price: unitPrice ? parseFloat(unitPrice) : undefined,
      date,
      fee: fee ? parseFloat(fee) : undefined,
      notes,
    });

    return new Response(JSON.stringify(transaction), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return new Response(
      JSON.stringify({ error: 'Error al actualizar la transacción' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
