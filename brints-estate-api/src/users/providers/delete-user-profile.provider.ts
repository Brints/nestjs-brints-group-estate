import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { IActiveUser } from 'src/auth/interfaces/active-user.interface';
import { CustomException } from 'src/exceptions/custom.exception';
import { UserRole } from 'src/enums/user-role.enum';

@Injectable()
export class DeleteUserProfileProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async deleteUser(
    activeUser: IActiveUser,
    userId: string,
  ): Promise<null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User does not exist.');

    if (activeUser.role !== UserRole.SUPER_ADMIN || userId !== activeUser.sub)
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        'You do not have the authority to delete this account.',
      );

    await this.userRepository.delete({ id: userId });

    return null;
  }
}
