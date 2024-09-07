import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DataResponseInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        api_version: this.configService.get('API_VERSION'),
        message: data.message,
        status_code: data.status_code,
        data: data.payload || data.data || data.result,
      })),
    );
  }
}
