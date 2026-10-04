import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const supabase = code ? await createClient() : null;

  if (!code || !supabase) {
    return NextResponse.redirect(new URL("/reset-password?error=invalid", url.origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/reset-password?error=invalid", url.origin));
  }

  return NextResponse.redirect(new URL("/reset-password", url.origin));
}
