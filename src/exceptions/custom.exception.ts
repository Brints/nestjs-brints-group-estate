import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(status_code: HttpStatus, message: string) {
    super(message, status_code);
  }
}
