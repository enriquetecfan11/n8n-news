import type { APIRoute } from 'astro';
import { supabase, getCurrentSession, createAssetForUser, getAssets } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { name, type, currency, ticker, exchange } = body;

    if (!name || !type || !currency) {
      return new Response(
        JSON.stringify({ error: 'Nombre, tipo y divisa son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar duplicados: si el ticker está especificado, verificar que no exista
    if (ticker) {
      const existingAssets = await getAssets();
      const duplicate = existingAssets.find(
        (a: any) => a.ticker?.toUpperCase() === ticker.toUpperCase()
      );
      if (duplicate) {
        return new Response(
          JSON.stringify({ error: `El activo ${ticker} ya existe` }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const asset = await createAssetForUser(
      session.user.id,
      name,
      type,
      currency,
      ticker,
      exchange
    );

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
