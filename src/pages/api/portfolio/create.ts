import type { APIRoute } from 'astro';
import { createPortfolio } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, description, baseCurrency } = body;

    if (!name) {
      return new Response(
        JSON.stringify({ error: 'Nombre de portafolio requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const portfolio = await createPortfolio(name, description, baseCurrency || 'EUR');

    return new Response(JSON.stringify(portfolio), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return new Response(
      JSON.stringify({ error: 'Error al crear el portafolio' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
