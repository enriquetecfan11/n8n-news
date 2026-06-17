import type { APIRoute } from 'astro';
import { getCurrentSession, upsertUserProfile } from '../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const session = await getCurrentSession(cookies.get('sb-access-token')?.value);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { nombre, divisa_base, notificaciones_email } = body;

    const profile = await upsertUserProfile({
      id: session.user.id,
      nombre,
      divisa_base,
      notificaciones_email,
    });

    return new Response(JSON.stringify(profile), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return new Response(JSON.stringify({ error: 'Error al guardar el perfil' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
