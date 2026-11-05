import { SchemaError } from './schema';

export type ApiErrorKind =
  | 'unauthorized'
  | 'forbidden'
  | 'bad-request'
  | 'rate-limited'
  | 'server'
  | 'timeout'
  | 'network'
  | 'schema';

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    readonly details: {status?: number; requestId?: string; retryAfter?: number; ms?: number} = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type ApiResult<T> = {
  data: T;
  status: number;
  bytes: number;
  ms: number;
};

function kindForStatus(status: number): ApiErrorKind {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 429) return 'rate-limited';
  if (status >= 400 && status < 500) return 'bad-request';
  return 'server';
}

/**
 * GET JSON and validate it before it reaches the UI. Every failure leaves here as an
 * ApiError, except a caller-initiated abort, which callers ignore with isAbortError.
 */
export async function apiGet<T>(
  url: string,
  parse: (raw: unknown) => T,
  {signal, timeoutMs = 5000}: {signal?: AbortSignal; timeoutMs?: number} = {},
): Promise<ApiResult<T>> {
  const startedAt = performance.now();
  const elapsed = () => Math.round(performance.now() - startedAt);
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort, {once: true});

  try {
    const response = await fetch(url, {signal: controller.signal, headers: {Accept: 'application/json'}});
    const text = await response.text();
    const requestId = response.headers.get('x-request-id') ?? undefined;
    const ms = elapsed();

    if (!response.ok) {
      const retryAfter = Number(response.headers.get('retry-after')) || undefined;
      throw new ApiError(kindForStatus(response.status), `Request failed with HTTP ${response.status}`, {
        status: response.status,
        requestId,
        retryAfter,
        ms,
      });
    }

    try {
      return {
        data: parse(JSON.parse(text)),
        status: response.status,
        bytes: new Blob([text]).size,
        ms,
      };
    } catch (cause) {
      const reason = cause instanceof SchemaError ? cause.message : 'Response was not valid JSON';
      throw new ApiError('schema', reason, {status: response.status, requestId, ms});
    }
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;
    if (timedOut) throw new ApiError('timeout', `No response after ${timeoutMs} ms`, {ms: elapsed()});
    if (signal?.aborted) throw cause;
    throw new ApiError('network', 'The request never reached the server', {ms: elapsed()});
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function toApiError(error: unknown): ApiError {
  return error instanceof ApiError ? error : new ApiError('network', 'Unexpected request failure');
}

export type ErrorRecovery = 'retry' | 'sign-in' | 'wait' | 'none';

/** What the person is told, and what they can do about it, for each failure class. */
export function describeError(error: ApiError): {title: string; message: string; recovery: ErrorRecovery} {
  switch (error.kind) {
    case 'unauthorized':
      return {
        title: 'Your session expired',
        message: 'Sign in again to pick up where you left off. Your pantry is safe.',
        recovery: 'sign-in',
      };
    case 'forbidden':
      return {
        title: "You don't have access to this household",
        message: 'Trying again won’t help. Ask a household owner to add you.',
        recovery: 'none',
      };
    case 'bad-request':
      return {
        title: 'That request didn’t work',
        message: 'This link or page position may be out of date. Start again from the first page.',
        recovery: 'retry',
      };
    case 'rate-limited':
      return {
        title: 'Too many requests',
        message: 'We’ve paused briefly so the service can catch up. You can try again shortly.',
        recovery: 'wait',
      };
    case 'timeout':
      return {
        title: 'This is taking too long',
        message: 'The server didn’t respond in time. Your connection may be slow.',
        recovery: 'retry',
      };
    case 'network':
      return {
        title: 'You appear to be offline',
        message: 'We couldn’t reach PantryPilot. Check your connection and try again.',
        recovery: 'retry',
      };
    case 'schema':
      return {
        title: 'We received data we can’t read',
        message: 'We stopped before showing you anything wrong. This one’s on us.',
        recovery: 'retry',
      };
    case 'server':
      return {
        title: 'Something went wrong on our end',
        message: 'Your data wasn’t changed. Try again in a moment.',
        recovery: 'retry',
      };
  }
}
