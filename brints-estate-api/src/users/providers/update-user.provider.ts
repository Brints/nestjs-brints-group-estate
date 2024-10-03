import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CustomException } from 'src/exceptions/custom.exception';
import { UploadToAwsProvider } from 'src/uploads/providers/upload-to-aws.provider';
import { IActiveUser } from 'src/auth/interfaces/active-user.interface';
import { UserHelper } from 'src/utils/userHelper.lib';

@Injectable()
export class UpdateUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly uploadToAwsProvider: UploadToAwsProvider,

    private readonly userHelper: UserHelper,
  ) {}

  public async update(
    updateUserDto: UpdateUserDto,
    activeUser: IActiveUser,
    file: Express.Multer.File,
  ): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: updateUserDto.id });

    if (!user)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User not found');

    if (user.id !== activeUser.sub)
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        'You are not allowed to perform this action',
      );

    if (file) {
      const fileUrl = await this.uploadToAwsProvider.fileUpload(file);
      user.image_url = fileUrl;
      //await this.uploadToAwsProvider.deleteFile(user.image_url);
      await this.userRepository.update(user.id, { image_url: fileUrl });
    }

    let fullPhoneNumber;
    if (updateUserDto.phone_number) {
      fullPhoneNumber = this.userHelper.formatPhoneNumber(
        updateUserDto.country_code,
        updateUserDto.phone_number,
      );
      const phoneNumberExists = await this.userRepository.findOneBy({
        phone_number: updateUserDto.phone_number,
      });
      if (phoneNumberExists)
        throw new CustomException(
          HttpStatus.CONFLICT,
          'Phone number already in use.',
        );
    }

    user.first_name = updateUserDto.first_name ?? user.first_name;
    user.last_name = updateUserDto.last_name ?? user.last_name;
    user.phone_number = fullPhoneNumber ?? user.phone_number;
    user.gender = updateUserDto.gender ?? user.gender;
    user.marketing = updateUserDto.marketing ?? user.marketing;

    await this.userRepository.update(user.id, user);

    return user;
  }
}
