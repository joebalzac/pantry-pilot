import { NextResponse } from 'next/server';

/** Faults the lab endpoints can inject. Never ship these controls on a real API. */
export type LabScenario =
  | 'ok'
  | 'slow'
  | 'empty'
  | 'unauthorized'
  | 'forbidden'
  | 'rate-limited'
  | 'server'
  | 'timeout'
  | 'malformed';

const BASE_LATENCY_MS = 250;
const SLOW_LATENCY_MS = 2000;
const HANG_MS = 12000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function requestId() {
  return `req_${crypto.randomUUID().slice(0, 8)}`;
}

export function jsonOk(body: unknown) {
  return NextResponse.json(body, {
    headers: {'Cache-Control': 'no-store', 'x-request-id': requestId()},
  });
}

export function jsonError(status: number, code: string, message: string, headers: Record<string, string> = {}) {
  const id = requestId();
  return NextResponse.json(
    {error: {code, message, requestId: id}},
    {status, headers: {'Cache-Control': 'no-store', 'x-request-id': id, ...headers}},
  );
}

/** Applies latency and any injected fault. A null result means carry on with the real handler. */
export async function applyScenario(scenario: string | null): Promise<NextResponse | null> {
  await sleep(scenario === 'slow' ? SLOW_LATENCY_MS : scenario === 'timeout' ? HANG_MS : BASE_LATENCY_MS);

  switch (scenario) {
    case 'unauthorized':
      return jsonError(401, 'session_expired', 'Session expired');
    case 'forbidden':
      return jsonError(403, 'not_a_member', 'Not a member of this household');
    case 'rate-limited':
      return jsonError(429, 'rate_limited', 'Too many requests', {'Retry-After': '5'});
    case 'server':
      return jsonError(500, 'internal', 'Internal server error');
    default:
      return null;
  }
}
