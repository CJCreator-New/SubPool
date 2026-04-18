import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

/**
 * Node-compatible Supabase Client for Testing
 * Loads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from .env
 */

function getEnvVars() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return { 
      url: process.env.VITE_SUPABASE_URL, 
      key: process.env.VITE_SUPABASE_ANON_KEY 
    };
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const vars: Record<string, string> = {};
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([^#=]+)\s*=\s*([^#]+)\s*$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"]|['"]$/g, '');
      vars[key] = value;
    }
  });

  return {
    url: vars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    key: vars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || vars.VITE_SUPABASE_ANON_KEY
  };
}

const { url, key } = getEnvVars();

if (!url || !key) {
  console.warn('WARNING: Supabase credentials not found in .env or process.env');
}

export const testSupabase = createClient(url || '', key || '');
