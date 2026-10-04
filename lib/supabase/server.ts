import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfigured, supabaseUrl } from "@/lib/supabase/env";
import { authCookieOptions, rememberCookie, remembered } from "@/lib/supabase/remember";

export async function createClient() {
  if (!supabaseConfigured()) return null;

  const cookieStore = await cookies();
  const remember = remembered(cookieStore.get(rememberCookie)?.value);
  return createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, authCookieOptions(name, options, remember));
            });
          } catch {
            // A Server Component cannot write cookies. The proxy refreshes the session.
          }
        },
      },
    },
  );
}
