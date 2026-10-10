import type { ApiErrorCode } from './types';

const API_BASE = '/api/v1';
const REQUEST_TIMEOUT_MS = 10_000;

const SERVER_CODES: readonly string[] = [
  'invalid_request',
  'not_found',
  'upstream_busy',
  'upstream_error',
  'timeout',
  'too_many_requests',
  'internal',
];

/** ApiError represents a structured custom error thrown during API requests. */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

type Params = Record<string, string | number | undefined>;

/** apiGet performs a typed HTTP GET request to the API */
export async function apiGet<T>(
  path: string,
  params: Params = {},
  signal?: AbortSignal,
): Promise<T> {
  const url = new URL(API_BASE + path, window.location.origin);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }

  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let res: Response;
  try {
    res = await fetch(url, {
      signal: combined,
      headers: { Accept: 'application/json' },
    });
  } catch {
    if (signal?.aborted) throw new ApiError('aborted', 'Request aborted');
    if (timeout.aborted) throw new ApiError('timeout', 'Request timed out');
    throw new ApiError('network', 'Network error');
  }

  if (!res.ok) throw await readError(res);

  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError('unknown', 'Invalid response', res.status);
  }
}

/**
 * readError extracts error details from a failed HTTP response
 * and parses it into an ApiError instance.
 */
async function readError(res: Response): Promise<ApiError> {
  let code: ApiErrorCode =
    res.status === 429 ? 'too_many_requests' : res.status >= 500 ? 'upstream_error' : 'unknown';
  let message = res.statusText;

  try {
    const body = (await res.json()) as {
      error?: { code?: string; message?: string };
    };
    const serverCode = body.error?.code;
    if (serverCode && SERVER_CODES.includes(serverCode)) code = serverCode as ApiErrorCode;
    if (body.error?.message) message = body.error.message;
  } catch {}

  return new ApiError(code, message, res.status);
}
