import type { APIRoute } from 'astro';
import { deletePortfolio } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID de portafolio requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await deletePortfolio(id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return new Response(
      JSON.stringify({ error: 'Error al eliminar el portafolio' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
