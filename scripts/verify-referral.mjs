import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyReferral() {
  console.log('🧪 Starting Referral System Verification...');

  // 1. Create a dummy referrer
  const refId = '00000000-0000-0000-0000-000000000001';
  const newUserId = '00000000-0000-0000-0000-000000000002';
  const refCode = 'VERIFY_TEST';

  console.log('➡️ Cleaning up old test data...');
  await supabase.from('referrals').delete().eq('referral_code', refCode);
  await supabase.from('profiles').delete().in('id', [refId, newUserId]);

  console.log('➡️ Creating dummy profiles...');
  const { error: pErr } = await supabase.from('profiles').insert([
    { id: refId, username: 'test_referrer', referral_code: refCode },
    { id: newUserId, username: 'test_referred' }
  ]);

  if (pErr) throw pErr;

  console.log('➡️ Calling process_referral RPC...');
  const { data: res, error: rpcErr } = await supabase.rpc('process_referral', {
    p_referral_code: refCode,
    p_new_user_id: newUserId
  });

  if (rpcErr) {
    console.error('❌ RPC Error:', rpcErr);
    return;
  }

  console.log('✅ RPC Result:', res);

  // 2. Verify results
  console.log('➡️ Verifying data persistence...');
  
  const { data: referral } = await supabase
    .from('referrals')
    .select('*')
    .eq('referred_id', newUserId)
    .single();

  if (referral && referral.referrer_id === refId) {
    console.log('✅ Referral record found and correctly attributed.');
  } else {
    console.error('❌ Referral record mismatch or not found.');
  }

  const { data: newProfile } = await supabase
    .from('profiles')
    .select('referred_by')
    .eq('id', newUserId)
    .single();

  if (newProfile?.referred_by === refId) {
    console.log('✅ New user profile updated with referred_by link.');
  } else {
    console.error('❌ Profile missing attribution link.');
  }

  const { data: notif } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', refId)
    .eq('type', 'referral')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (notif) {
    console.log('✅ Referrer notification sent successfully.');
  } else {
    console.error('❌ Notification target missing.');
  }

  console.log('\n✨ Verification Complete!');
}

verifyReferral().catch(console.error);
