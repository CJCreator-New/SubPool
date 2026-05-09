import { testSupabase as supabase } from './test-supabase-client';
import { encryptData } from '../lib/crypto';

/**
 * SubPool: Data Seeder Utility (Deterministic Edition)
 * Uses fixed IDs for test data to ensure reliable E2E references.
 */

const TEST_OWNER_ID = '00000000-0000-0000-0000-999999999999';
const TEST_GUEST_ID = '00000000-0000-0000-0000-111111111111';
const TEST_POOL_ID_1 = '00000000-0000-0000-0000-000000000001';
const TEST_POOL_ID_2 = '00000000-0000-0000-0000-000000000002';

export async function seedProfiles() {
    console.log('--- Seeding Test Profiles ---');
    const profiles = [
        {
            id: TEST_OWNER_ID,
            username: 'e2e_host',
            display_name: 'E2E Host Node',
            avatar_color: '#C8F135',
            is_verified: true,
            plan: 'host_plus'
        },
        {
            id: TEST_GUEST_ID,
            username: 'e2e_guest',
            display_name: 'E2E Guest Joiner',
            avatar_color: '#4DFF91',
            is_verified: false,
            plan: 'free'
        }
    ];

    const { error } = await supabase
        .from('profiles')
        .upsert(profiles, { onConflict: 'id' });

    if (error) console.error('Profile Seed Error:', error);
}

export async function seedTestPools(ownerId: string) {
    console.log('--- Seeding Deterministic Pools ---');
    
    const testPools = [
      {
        id: TEST_POOL_ID_1,
        platform: 'netflix',
        owner_id: ownerId,
        category: 'OTT',
        status: 'open',
        plan_name: 'Premium 4K',
        price_per_slot: 450,
        total_cost: 1800,
        total_slots: 4,
        filled_slots: 1,
        auto_approve: false,
        description: 'E2E Test Pool'
      },
      {
        id: TEST_POOL_ID_2,
        platform: 'spotify',
        owner_id: ownerId,
        category: 'OTT',
        status: 'open',
        plan_name: 'Family Plan',
        price_per_slot: 199,
        total_cost: 1194,
        total_slots: 6,
        filled_slots: 2,
        auto_approve: true,
        description: 'E2E Test Pool'
      }
    ];

    const { data, error } = await supabase
      .from('pools')
      .upsert(testPools, { onConflict: 'id' })
      .select();

    if (error) console.error('Pool Seed Error:', error);
    return data;
}

export async function seedJoinRequests(poolId: string, requesterIds: string[]) {
    console.log(`--- Seeding Join Requests for Pool: ${poolId} ---`);
    
    const requests = requesterIds.map((id, index) => ({
        id: `00000000-0000-0000-${index.toString().padStart(4, '0')}-000000000000`,
        pool_id: poolId,
        requester_id: id,
        status: 'pending',
        message: 'Hello, I would like to join the e2e test pool!'
    }));

    const { data, error } = await supabase
        .from('join_requests')
        .upsert(requests, { onConflict: 'id' })
        .select();

    if (error) console.error('Join Request Seed Error:', error);
    return data;
}

export async function seedCredentials(poolId: string) {
    const payload = JSON.stringify({
        username: 'test-user@example.com',
        password: 'e2e-password-123'
    });

    const { encrypted, nonce } = await encryptData(payload);

    const { error } = await supabase
        .from('credentials')
        .upsert({
            pool_id: poolId,
            encrypted_data: encrypted,
            nonce: nonce
        }, { onConflict: 'pool_id' });

    if (error) console.error('Credential Seed Error:', error);
}

export async function runGlobalSeed(userId: string) {
    await seedProfiles();
    const pools = await seedTestPools(TEST_OWNER_ID);
    if (pools && pools.length > 0) {
        await seedCredentials(pools[0].id);
        await seedJoinRequests(pools[0].id, [TEST_GUEST_ID]);
        console.log('Seeding completed successfully.');
    }
}
