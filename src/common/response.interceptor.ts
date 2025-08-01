// common/interceptors/response.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const message =
          typeof data?.message === 'string'
            ? data.message
            : 'Request successful';

        if (typeof data === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { message: _, data: innerData, ...rest } = data;
          const payload = innerData ?? rest;
          return {
            success: true,
            message,
            data: payload,
          };
        }

        return {
          success: true,
          message,
          data,
        };
      }),
    );
  }
}
