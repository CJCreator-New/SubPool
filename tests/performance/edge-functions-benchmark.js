import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * SubPool: Edge Function Performance Benchmark
 * Targets the 'manage-membership' function for join request processing.
 */

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // ramp up to 20 users
    { duration: '1m', target: 20 },  // stay at 20 users
    { duration: '30s', target: 0 },  // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // less than 1% failure rate
  },
};

const BASE_URL = __ENV.SUPABASE_URL || 'https://your-project.supabase.co';
const ANON_KEY = __ENV.SUPABASE_ANON_KEY || 'your-anon-key';

export default function () {
  const url = `${BASE_URL}/functions/v1/manage-membership`;
  const payload = JSON.stringify({
    joinRequestId: 'test-request-id',
    action: 'approve',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 200 or 400 (if invalid ID)': (r) => r.status === 200 || r.status === 400,
    'transaction content-type is json': (r) => r.headers['Content-Type'].includes('application/json'),
  });

  sleep(1);
}
