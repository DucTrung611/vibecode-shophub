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

export interface ApiErrorBody {
  code: string;
  message: string;
  details: unknown;
}

export interface ApiError {
  success: false;
  error: ApiErrorBody;
}
