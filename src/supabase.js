// src/supabase.js
// Replace the two values below with your Supabase project URL and anon key.
// Find them at: https://supabase.com/dashboard → your project → Settings → API

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || "";
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// If env vars aren't set yet the app falls back to localStorage demo mode.
export const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      realtime: { params: { eventsPerSecond: 20 } }
    })
  : null;

export const isOnline = !!supabase;
