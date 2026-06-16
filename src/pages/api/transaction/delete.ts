import type { APIRoute } from 'astro';
import { deleteTransaction } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID de transacción requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await deleteTransaction(id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return new Response(
      JSON.stringify({ error: 'Error al eliminar la transacción' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
