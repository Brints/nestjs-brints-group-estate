import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { GoogleUser } from '../interface/google-user.interface';
import { CustomException } from 'src/exceptions/custom.exception';

@Injectable()
export class CreateGoogleUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async createGoogleUser(googleUser: GoogleUser): Promise<User> {
    const userExists = await this.userRepository.findOne({
      where: { email: googleUser.email },
    });

    if (userExists)
      throw new CustomException(HttpStatus.CONFLICT, 'User already exists.');

    const user = this.userRepository.create(googleUser);
    await this.userRepository.save(user);

    return user;
  }
}
