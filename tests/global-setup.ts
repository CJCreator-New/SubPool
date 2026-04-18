import { FullConfig } from '@playwright/test';
import { runGlobalSeed } from '../src/test/data-seeder';

/**
 * Playwright Global Setup
 * Runs once before all tests execution.
 * Ideal for seeding a persistent test database.
 */
async function globalSetup(config: FullConfig) {
  console.log('--- GLOBAL SETUP: SEEDING E2E DATA ---');
  
  const testUserId = process.env.TEST_USER_ID || '00000000-0000-0000-0000-999999999999';
  
  try {
    await runGlobalSeed(testUserId);
    console.log('--- GLOBAL SETUP COMPLETE ---');
  } catch (err) {
    console.error('--- GLOBAL SETUP FAILED ---', err);
  }
}

export default globalSetup;
