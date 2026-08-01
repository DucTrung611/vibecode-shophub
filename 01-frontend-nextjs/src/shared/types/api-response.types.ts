export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: PaginatedMeta | null;
}

/**
 * What `apiClient`'s response interceptor actually resolves every call to
 * (see shared/services/api-client.ts) — the envelope's `data`/`meta`, with
 * `success`/`error` already handled (thrown as ApiError on failure).
 */
export interface ApiResult<T> {
  data: T;
  meta: PaginatedMeta | null;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}

export class ApiError extends Error {
  code: string;
  details: unknown;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.code = body.code;
    this.details = body.details;
  }
}
