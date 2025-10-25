import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

/**
 * FindOneByGoogleIdProvider Class is a provider class with a method to find a user by google id.
 */
@Injectable()
export class FindOneByGoogleIdProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  /**
   * findOneByGoogleId method finds a user by google id.
   * @param googleId
   * @returns {Promise<User>}
   */
  public async findOneByGoogleId(googleId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { google_id: googleId },
    });
  }
}
