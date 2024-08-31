import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

export class CustomConflictException extends HttpException {
  constructor(status_code: HttpStatus, message: string) {
    super(message, status_code);
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    //const request = ctx.getRequest<Request>();

    response.send({
      success: exception.getStatus() < 400 ? true : false,
      status_code: exception.getStatus(),
      message: exception.getResponse(),
    });
  }
}
