import type { NextRequest } from 'next/server';
import { inventory } from '../../../../lib/lab/fixtures';
import { applyScenario, jsonError, jsonOk } from '../../../../lib/lab/scenarios';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// LAB ONLY: fixture data with injectable faults, backing the /production page.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const scenario = params.get('scenario');

  const fault = await applyScenario(scenario);
  if (fault) return fault;

  if (scenario === 'malformed') {
    // Parses as JSON but breaks the contract: wrong types and an unknown category.
    return jsonOk({items: [{id: 42, name: null, category: 'beverages', quantity: 'lots'}], nextCursor: null, total: 'many'});
  }
  if (scenario === 'empty') return jsonOk({items: [], nextCursor: null, total: 0});

  const requested = Number(params.get('limit') ?? DEFAULT_LIMIT);
  if (!Number.isInteger(requested) || requested < 1) {
    return jsonError(400, 'invalid_limit', 'limit must be a positive integer');
  }
  // The server, not the client, decides the most it will ever send in one response.
  const limit = Math.min(requested, MAX_LIMIT);

  const query = params.get('q')?.trim().toLowerCase() ?? '';
  const matches = query ? inventory.filter((item) => item.name.toLowerCase().includes(query)) : inventory;

  // Seek from the last-seen id, so rows added mid-browse can't shift pages and cause duplicates.
  const cursor = params.get('cursor');
  let start = 0;
  if (cursor) {
    const index = matches.findIndex((item) => item.id === cursor);
    if (index === -1) return jsonError(400, 'invalid_cursor', 'Unknown cursor');
    start = index + 1;
  }

  const items = matches.slice(start, start + limit);
  const hasMore = start + limit < matches.length;
  return jsonOk({items, nextCursor: hasMore ? items[items.length - 1].id : null, total: matches.length});
}
