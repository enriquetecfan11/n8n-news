import type { APIRoute } from 'astro';
import { createAsset } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, type, currency, ticker, exchange } = body;

    if (!name || !type || !currency) {
      return new Response(
        JSON.stringify({ error: 'Nombre, tipo y divisa son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const asset = await createAsset(name, type, currency, ticker, exchange);

    return new Response(JSON.stringify(asset), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    return new Response(
      JSON.stringify({ error: 'Error al crear el activo' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
