import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiError } from '../types/api-response.types';

interface StructuredExceptionBody {
  code?: string;
  message?: string | string[];
  details?: unknown;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { status, body } = this.resolve(exception);
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        exception instanceof Error ? exception.stack : exception,
      );
    }

    response.status(status).json(body);
  }

  private resolve(exception: unknown): { status: HttpStatus; body: ApiError } {
    if (exception instanceof HttpException) {
      const status: HttpStatus = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const structured = res as StructuredExceptionBody;
        if (structured.code) {
          return {
            status,
            body: {
              success: false,
              error: {
                code: structured.code,
                message: Array.isArray(structured.message)
                  ? structured.message.join(', ')
                  : (structured.message ?? exception.message),
                details: structured.details ?? null,
              },
            },
          };
        }

        // class-validator ValidationPipe shape: { message: string[], error: 'Bad Request', statusCode }
        if (status === HttpStatus.BAD_REQUEST) {
          return {
            status,
            body: {
              success: false,
              error: {
                code: 'VALIDATION_001',
                message: 'Validation failed',
                details: structured.message ?? null,
              },
            },
          };
        }
      }

      return {
        status,
        body: {
          success: false,
          error: {
            code: this.fallbackCode(status),
            message: exception.message,
            details: null,
          },
        },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        success: false,
        error: {
          code: 'COMMON_500',
          message: 'Internal server error',
          details: null,
        },
      },
    };
  }

  private fallbackCode(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return 'AUTH_001';
      case HttpStatus.FORBIDDEN:
        return 'AUTH_003';
      case HttpStatus.NOT_FOUND:
        return 'COMMON_404';
      case HttpStatus.CONFLICT:
        return 'COMMON_409';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'COMMON_429';
      default:
        return 'COMMON_500';
    }
  }
}
