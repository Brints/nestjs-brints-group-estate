import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { IActiveUser } from 'src/auth/interfaces/active-user.interface';
import { CustomException } from 'src/exceptions/custom.exception';
import { UserRole } from 'src/enums/user-role.enum';
import { UserAuth } from '../entities/userAuth.entity';

@Injectable()
export class DeleteUserProfileProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserAuth)
    private readonly userAuthRepository: Repository<UserAuth>,
  ) {}

  public async deleteUser(
    activeUser: IActiveUser,
    userId: string,
  ): Promise<null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { user_auth: true },
    });

    if (!user)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User does not exist.');

    const userAuth = await this.userAuthRepository.findOne({
      where: { id: user.user_auth.id },
    });

    if (!userAuth)
      throw new CustomException(
        HttpStatus.NOT_FOUND,
        'Server error. The resource does not exist.',
      );

    if (
      activeUser.role !== UserRole.SUPER_ADMIN &&
      user.id !== activeUser.sub
    ) {
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        'You do not have the authority to delete this account.',
      );
    }

    await this.userAuthRepository.remove(userAuth);
    await this.userRepository.remove(user);

    return null;
  }
}
