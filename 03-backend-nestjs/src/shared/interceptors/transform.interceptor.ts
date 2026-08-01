import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ApiSuccess, PaginatedMeta } from '../types/api-response.types';

interface PaginatedShape<T> {
  items: T;
  meta: PaginatedMeta;
}

function isPaginatedShape<T>(value: unknown): value is PaginatedShape<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'items' in value &&
    'meta' in value
  );
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccess<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccess<T>> {
    return next.handle().pipe(
      map((result) => {
        if (isPaginatedShape<T>(result)) {
          return { success: true, data: result.items, meta: result.meta };
        }
        return { success: true, data: result, meta: null };
      }),
    );
  }
}
