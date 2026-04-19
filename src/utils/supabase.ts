import { createClient } from '@supabase/supabase-js';
import site from '../config/site';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const TABLES = {
  reference_data: `${site.dbPrefix}reference_data`,
  companies: `${site.dbPrefix}companies`,
  demand_companies: `${site.dbPrefix}demand_companies`,
  activities: `${site.dbPrefix}activities`,
  project_settings: `${site.dbPrefix}project_settings`,
  company_months: `${site.dbPrefix}company_months`,
  company_unit_prices: `${site.dbPrefix}company_unit_prices`,
  activity_snapshots: `${site.dbPrefix}activity_snapshots`,
} as const;
