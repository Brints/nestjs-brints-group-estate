import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { CustomException } from '../../exceptions/custom.exception';
import { UserRole } from '../../enums/user-role.enum';
import { IActiveUser } from '../../auth/interfaces/active-user.interface';

@Injectable()
export class GetUserProfileProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRespository: Repository<User>,
  ) {}

  public async getUserProfile(
    loggedInUser: IActiveUser,
    userId: string,
  ): Promise<User> {
    const user = await this.userRespository.findOne({
      where: { id: userId },
    });

    if (!user)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User does not exist');

    if (
      userId !== loggedInUser.sub &&
      loggedInUser.role !== UserRole.SUPER_ADMIN
    )
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        "You're not authorized to view this profile.",
      );

    return user;
  }
}
