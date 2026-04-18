import { testSupabase as supabase } from '../src/test/test-supabase-client';

/**
 * SubPool: Database Stress Test
 * Measures Full-Text Search latency across a large dataset.
 */

const STRESS_BATCH_SIZE = 500;
const TOTAL_POOLS = 1000;

async function runStressTest() {
    console.log(`--- Starting DB Stress Test: ${TOTAL_POOLS} Pools ---`);
    
    // 1. Cleanup old stress data
    await supabase.from('pools').delete().eq('description', 'STRESS_TEST_DATA');

    // 2. Bulk Insert
    console.log('Inserting batch 1...');
    const startTime = Date.now();
    
    const platforms = ['netflix', 'spotify', 'figma', 'notion', 'adobe', 'chatgpt', 'cursor'];
    const mockPools = Array.from({ length: TOTAL_POOLS }).map((_, i) => ({
        platform: platforms[i % platforms.length],
        owner_id: '00000000-0000-0000-0000-999999999999',
        category: i % 2 === 0 ? 'entertainment' : 'work',
        plan_name: `Stress Plan ${i}`,
        price_per_slot: 100 + (i % 500),
        total_cost: 1000,
        total_slots: 4,
        filled_slots: 1,
        description: 'STRESS_TEST_DATA'
    }));

    for (let i = 0; i < mockPools.length; i += STRESS_BATCH_SIZE) {
        const batch = mockPools.slice(i, i + STRESS_BATCH_SIZE);
        const { error } = await supabase.from('pools').insert(batch);
        if (error) {
            console.error('Batch Insertion Error:', error);
            return;
        }
    }

    const insertDuration = Date.now() - startTime;
    console.log(`Inserted ${TOTAL_POOLS} pools in ${insertDuration}ms`);

    // 3. Measure Search Latency
    console.log('Testing FTS (Full-Text Search) latency...');
    const searchStartTime = Date.now();
    
    const { data: searchResults, error: searchError } = await supabase
        .from('pools')
        .select('*')
        .textSearch('search_vector', 'netflix')
        .limit(20);

    const searchDuration = Date.now() - searchStartTime;

    if (searchError) {
        console.error('Search Error:', searchError);
    } else {
        console.log(`Search for "netflix" returned ${searchResults?.length} results in ${searchDuration}ms`);
        console.log(`Target Latency: < 200ms | Performance: ${searchDuration < 200 ? 'PASSED ✅' : 'FAILED ❌'}`);
    }

    // 4. Cleanup
    console.log('Cleaning up stress data...');
    await supabase.from('pools').delete().eq('description', 'STRESS_TEST_DATA');
}

runStressTest().catch(console.error);
