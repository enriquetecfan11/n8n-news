import type { APIRoute } from 'astro';
import { supabase, getCurrentSession, createPortfolioForUser } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await getCurrentSession(request.headers.get('cookie')?.match(/sb-access-token=([^;]+)/)?.[1]);
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { name, description, baseCurrency } = body;

    if (!name) {
      return new Response(
        JSON.stringify({ error: 'Nombre de portafolio requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const portfolio = await createPortfolioForUser(
      session.user.id,
      name,
      description,
      baseCurrency || 'EUR'
    );

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
