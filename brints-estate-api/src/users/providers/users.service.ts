import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor() {}

  public async getAllUsers() {
    return 'Hello World';
  }
}
