import { createClient } from "jsr:@supabase/supabase-js@2";

const requireEnv = (name: string) => {
  const value = (Deno.env.get(name) || "").trim();
  if (!value) {
    throw new Error(`${name} is not set.`);
  }
  return value;
};

const requireAnyEnv = (...names: string[]) => {
  for (const name of names) {
    const value = (Deno.env.get(name) || "").trim();
    if (value) return value;
  }

  throw new Error(`${names.join(" or ")} is not set.`);
};

export const getServiceRoleClient = () =>
  createClient(
    requireAnyEnv("SUPABASE_URL", "VITE_SUPABASE_URL"),
    requireAnyEnv("SUPABASE_SERVICE_ROLE_KEY", "VITE_SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

export const getSupabaseEnv = (name: string, fallback = "") =>
  (Deno.env.get(name) || fallback).trim();
