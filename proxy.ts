import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfigured, supabaseUrl } from "@/lib/supabase/env";
import { authCookieOptions, rememberCookie, remembered } from "@/lib/supabase/remember";

export async function proxy(request: NextRequest) {
  if (!supabaseConfigured()) return NextResponse.next();

  let response = NextResponse.next({ request });
  const remember = remembered(request.cookies.get(rememberCookie)?.value);
  const supabase = createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, authCookieOptions(name, options, remember));
          });
        },
      },
    },
  );

  await supabase.auth.getUser();

  const status = await supabase.from("site_status").select("maintenance").eq("id", "site").maybeSingle();
  const closed = Boolean(status.data?.maintenance);
  if (closed && !siteOpenPath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    url.search = "";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });
    return redirect;
  }

  return response;
}

function siteOpenPath(pathname: string) {
  return (
    pathname === "/maintenance" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin")
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
