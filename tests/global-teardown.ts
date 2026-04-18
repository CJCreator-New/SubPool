import { FullConfig } from '@playwright/test';
import { testSupabase as supabase } from '../src/test/test-supabase-client';

/**
 * Playwright Global Teardown
 * Cleans up E2E test data to maintain database hygiene.
 */
async function globalTeardown(config: FullConfig) {
  console.log('--- GLOBAL TEARDOWN: CLEANING E2E DATA ---');
  
  try {
    // Delete test pools (and cascade to requests/credentials via DB foreign keys)
    const { error } = await supabase!
      .from('pools')
      .delete()
      .eq('description', 'E2E Test Pool');

    if (error) throw error;
    console.log('--- GLOBAL TEARDOWN COMPLETE ---');
  } catch (err) {
    console.error('--- GLOBAL TEARDOWN FAILED ---', err);
  }
}

export default globalTeardown;
