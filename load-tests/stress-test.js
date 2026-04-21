import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const errors    = new Counter('custom_errors');
const errorRate = new Rate('error_rate');
const duration  = new Trend('req_duration');

// Skenario bertahap: Smoke → Load → Stress → Spike
export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: 10,
      duration: '1m',
      startTime: '0s',
      tags: { scenario: 'smoke' },
    },
    load: {
      executor: 'ramping-vus',
      startTime: '1m30s',
      stages: [
        { duration: '2m', target: 500 },
        { duration: '5m', target: 500 },
        { duration: '1m', target: 0 },
      ],
      tags: { scenario: 'load' },
    },
    stress: {
      executor: 'ramping-vus',
      startTime: '10m',
      stages: [
        { duration: '2m',  target: 1000 },
        { duration: '5m',  target: 1000 },
        { duration: '1m',  target: 0 },
      ],
      tags: { scenario: 'stress' },
    },
    spike: {
      executor: 'ramping-vus',
      startTime: '19m',
      stages: [
        { duration: '30s', target: 1000 },
        { duration: '1m',  target: 1000 },
        { duration: '30s', target: 0 },
      ],
      tags: { scenario: 'spike' },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<3000'],
    http_req_failed:   ['rate<0.01'],
    error_rate:        ['rate<0.01'],
  },
};

const BASE_URL = __ENV.LB_URL || 'http://4.194.67.9';

export default function () {
  // Test homepage (frontend)
  const res1 = http.get(`${BASE_URL}/`);
  const ok1 = check(res1, {
    'homepage status 200': (r) => r.status === 200,
    'homepage < 2s':       (r) => r.timings.duration < 2000,
  });
  if (!ok1) { errors.add(1); errorRate.add(1); }
  duration.add(res1.timings.duration);
  sleep(Math.random() * 2 + 0.5);

  // Test API health (backend)
  const res2 = http.get(`${BASE_URL}/api/health`);
  const ok2 = check(res2, {
    'api/health status 200': (r) => r.status === 200,
    'api/health < 2s':       (r) => r.timings.duration < 2000,
  });
  if (!ok2) { errors.add(1); errorRate.add(1); }
  sleep(Math.random() * 1 + 0.5);
}
