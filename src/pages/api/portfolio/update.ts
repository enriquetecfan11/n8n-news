import type { APIRoute } from 'astro';
import { updatePortfolio } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, name, description, baseCurrency } = body;

    if (!id || !name) {
      return new Response(
        JSON.stringify({ error: 'ID y nombre son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const portfolio = await updatePortfolio(id, { name, description, base_currency: baseCurrency });

    return new Response(JSON.stringify(portfolio), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return new Response(
      JSON.stringify({ error: 'Error al actualizar el portafolio' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
