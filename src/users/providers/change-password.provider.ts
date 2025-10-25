import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { HashingProvider } from '../../auth/providers/hashing.provider';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { IActiveUser } from '../../auth/interfaces/active-user.interface';
import { CustomException } from '../../exceptions/custom.exception';
import { MailgunService } from 'src/messaging/email/mailgun-service/providers/mailgun.service';

@Injectable()
export class ChangePasswordProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,

    private readonly mailgunService: MailgunService,
  ) {}

  public async changePassword(
    activeUser: IActiveUser,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: activeUser.sub },
    });

    if (!user)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User does not exist');

    if (activeUser.sub !== user.id)
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        "You're not authorized to perform this action",
      );

    const oldPassword = await this.hashingProvider.comparePassword(
      changePasswordDto.old_password,
      user.password as string,
    );
    if (!oldPassword)
      throw new CustomException(HttpStatus.FORBIDDEN, 'Incorrect old password');

    if (changePasswordDto.new_password !== changePasswordDto.confirm_password)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'Passwords do not match.',
      );

    const isOldPassword = await this.hashingProvider.comparePassword(
      changePasswordDto.new_password,
      user.password as string,
    );

    if (isOldPassword)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'New password cannot be the same as the old password',
      );

    const hashedPassword = await this.hashingProvider.hashPassword(
      changePasswordDto.new_password,
    );

    user.password = hashedPassword;
    await this.userRepository.save(user);

    await this.mailgunService.sendPasswordChanged(user);
  }
}
