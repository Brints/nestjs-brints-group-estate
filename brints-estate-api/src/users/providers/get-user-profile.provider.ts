import { HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../entities/user.entity';
// import { IActiveUser } from 'src/auth/interfaces/active-user.interface';
import { CustomException } from 'src/exceptions/custom.exception';
import { UserRole } from 'src/enums/roles.model';
import { IActiveUser } from 'src/auth/interfaces/active-user.interface';

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
      loggedInUser.role !== UserRole.SUPER_ADMIN &&
      userId !== loggedInUser.sub
    )
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        "You're not authorized to view this profile.",
      );

    return user;
  }
}
