export const supabaseUrl = "https://ovjmmpcqtsxlpdkcyute.supabase.co";

export function supabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export const databaseMessage =
  "The account database is not connected yet. Add the Supabase anon key, then run supabase/schema.sql in that project.";
