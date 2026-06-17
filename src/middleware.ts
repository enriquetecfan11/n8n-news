import type { APIContext, MiddlewareHandler } from 'astro';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './lib/database.types';

const PUBLIC_PATHS = new Set(['/', '/login', '/mercados', '/register']);

function getTokenFromCookies(context: APIContext) {
  return (
    context.cookies.get('sb-access-token')?.value ||
    context.cookies.get('supabase-access-token')?.value ||
    null
  );
}

async function getUserFromRequest(context: APIContext) {
  const token = getTokenFromCookies(context);
  if (!token) return null;

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const pathname = new URL(context.request.url).pathname.replace(/\/+$/, '') || '/';
  const user = await getUserFromRequest(context);

  if (pathname === '/login' && user) {
    return context.redirect('/app');
  }

  if (pathname.startsWith('/app')) {
    if (!user) {
      return context.redirect('/login');
    }
    context.locals.user = user;
  }

  if (!PUBLIC_PATHS.has(pathname) && pathname !== '/app' && pathname.startsWith('/app') === false) {
    return next();
  }

  return next();
};
