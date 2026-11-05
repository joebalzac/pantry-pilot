import type { NextRequest } from 'next/server';
import { thread } from '../../../../lib/lab/fixtures';
import { applyScenario, jsonError, jsonOk } from '../../../../lib/lab/scenarios';

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

// LAB ONLY: returns messages newest-page-first, each page in chronological order.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const fault = await applyScenario(params.get('scenario'));
  if (fault) return fault;

  const requested = Number(params.get('limit') ?? DEFAULT_LIMIT);
  if (!Number.isInteger(requested) || requested < 1) {
    return jsonError(400, 'invalid_limit', 'limit must be a positive integer');
  }
  const limit = Math.min(requested, MAX_LIMIT);

  const before = params.get('before');
  let end = thread.length;
  if (before) {
    end = thread.findIndex((message) => message.id === before);
    if (end === -1) return jsonError(400, 'invalid_cursor', 'Unknown cursor');
  }

  const start = Math.max(0, end - limit);
  const messages = thread.slice(start, end);
  return jsonOk({messages, prevCursor: start > 0 ? messages[0].id : null, total: thread.length});
}
