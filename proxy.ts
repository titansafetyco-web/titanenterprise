import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfigured, supabaseUrl } from "@/lib/supabase/env";
import { authCookieOptions, rememberCookie, remembered } from "@/lib/supabase/remember";

const MAINTENANCE_TTL_MS = 15_000;
const UPSTREAM_MS = 1_500;
let maintenanceCache: { at: number; closed: boolean } | null = null;

function withTimeout<T>(work: PromiseLike<T>): Promise<T | undefined> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(undefined), UPSTREAM_MS);
    Promise.resolve(work).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(undefined);
      },
    );
  });
}

function hasSession(request: NextRequest) {
  return request.cookies.getAll().some((cookie) => cookie.name.includes("-auth-token"));
}

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

  if (hasSession(request)) await withTimeout(supabase.auth.getUser());

  const now = Date.now();
  let closed = maintenanceCache && now - maintenanceCache.at < MAINTENANCE_TTL_MS ? maintenanceCache.closed : false;
  if (!maintenanceCache || now - maintenanceCache.at >= MAINTENANCE_TTL_MS) {
    const status = await withTimeout(
      supabase.from("site_status").select("maintenance").eq("id", "site").maybeSingle(),
    );
    if (status) {
      closed = Boolean(status.data?.maintenance);
      maintenanceCache = { at: now, closed };
    }
  }
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
