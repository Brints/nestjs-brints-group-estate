import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IActiveUser } from 'src/auth/interfaces/active-user.interface';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { VerifyPhoneNumberDto } from '../dto/verify-phone-number.dto';
import { VerifyEmailProvider } from './verify-email.provider';
import { VerifyPhoneNumberProvider } from './verify-phone-number.provider';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly verifyEmailProvider: VerifyEmailProvider,

    private readonly verifyPhoneNumberProvider: VerifyPhoneNumberProvider,
  ) {}

  public async verifyUserEmail(verifyEmailDto: VerifyEmailDto) {
    return this.verifyEmailProvider.verifyUserEmail(verifyEmailDto);
  }

  public async verifyPhoneNumber(verifyPhoneNumberDto: VerifyPhoneNumberDto) {
    return this.verifyPhoneNumberProvider.verifyPhoneNumber(
      verifyPhoneNumberDto,
    );
  }

  public async getAllUsers(user: IActiveUser) {
    return user;
  }

  public async getAll() {
    const users = await this.userRepository.find();
    return users;
  }
}
