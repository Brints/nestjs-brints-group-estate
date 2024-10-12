import { DataSource, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UpdateUserProvider } from './update-user.provider';
import { UploadToAwsProvider } from 'src/uploads/providers/upload-to-aws.provider';
import { User } from '../entities/user.entity';
import { UserHelper } from 'src/utils/userHelper.lib';
import { UserRole } from 'src/enums/user-role.enum';
import { IActiveUser } from 'src/auth/interfaces/active-user.interface';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserGender } from 'src/enums/gender.enum';
import { CustomException } from 'src/exceptions/custom.exception';
import { HttpStatus } from '@nestjs/common';
import { Readable } from 'stream';

describe('UpdateUser', () => {
  let provider: UpdateUserProvider;
  let userRepository: Repository<User>;
  //let uploadToAwsProvider: UploadToAwsProvider;
  //let userHelper: UserHelper;

  const mockUserRepository = {
    findOneBy: jest.fn(),
    update: jest.fn(),
  };

  const mockUploadToAws = {
    fileUpload: jest.fn(),
  };

  const mockUserHelper = {
    formatPhoneNumber: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserProvider,
        { provide: DataSource, useValue: {} },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: UploadToAwsProvider, useValue: mockUploadToAws },
        { provide: UserHelper, useValue: mockUserHelper },
      ],
    }).compile();

    provider = module.get<UpdateUserProvider>(UpdateUserProvider);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    //uploadToAwsProvider = module.get<UploadToAwsProvider>(UploadToAwsProvider);
    //userHelper = module.get<UserHelper>(UserHelper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('updateUser', () => {
    const activeUser: IActiveUser = {
      sub: '54616282-b896-4982-84ce-50b94772a351',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john-doe@test.com',
      phone_number: '08027872415',
      role: UserRole.USER,
      verified: true,
    };

    const anotherActiveUser: IActiveUser = {
      sub: '34816282-b896-4983-84ce-50b94772f351',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john-doe@test.com',
      phone_number: '08027872415',
      role: UserRole.USER,
      verified: true,
    };

    const updateUserDto: UpdateUserDto = {
      id: '54616282-b896-4982-84ce-50b94772a351',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '123456789',
      country_code: '+1',
      gender: UserGender.MALE,
      marketing: true,
    };

    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: Buffer.from(''),
      size: 1024,
      stream: new Readable(),
      destination: 'uploads/',
      filename: 'test.png',
      path: 'uploads/test.png',
    };

    const user = {
      id: '54616282-b896-4982-84ce-50b94772a351',
      image_url: 'old_image_url',
    };

    it('should throw if user does not exist', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(
        provider.update(updateUserDto, activeUser, file),
      ).rejects.toThrow(
        new CustomException(HttpStatus.NOT_FOUND, 'User not found'),
      );
    });

    it('should throw if active user is does not match the user being updated', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(user);

      await expect(
        provider.update(updateUserDto, anotherActiveUser, null),
      ).rejects.toThrow(
        new CustomException(
          HttpStatus.FORBIDDEN,
          'You are not allowed to perform this action',
        ),
      );
    });

    it('should update user image_url with uploaded file', async () => {
      const updateUserImageDto: UpdateUserDto = {
        id: '54616282-b896-4982-84ce-50b94772a351',
      };
      const mockFileUrl = 'https://test.com/image.png';
      mockUserRepository.findOneBy.mockResolvedValue(user);
      mockUploadToAws.fileUpload.mockResolvedValue(mockFileUrl);

      await provider.update(updateUserImageDto, activeUser, file);

      expect(mockUploadToAws.fileUpload).toHaveBeenCalledWith(file);
      expect(mockUserRepository.update).toHaveBeenCalledWith(user.id, {
        image_url: mockFileUrl,
      });
    });

    it('should throw if the phone number to be updated already exists', async () => {
      mockUserRepository.findOneBy.mockResolvedValue({
        phone_number: '123456789',
      });
      mockUserRepository.findOneBy.mockResolvedValue(user);
      mockUserHelper.formatPhoneNumber.mockReturnValue('123456789');

      await expect(
        provider.update(updateUserDto, activeUser, file),
      ).rejects.toThrow(
        new CustomException(
          HttpStatus.CONFLICT,
          'Phone number already in use.',
        ),
      );
    });

    // it('should update user phone_number', async () => {
    //   mockUserRepository.findOneBy.mockResolvedValueOnce(user);
    //   mockUserRepository.findOneBy.mockResolvedValueOnce(null);
    //   mockUserHelper.formatPhoneNumber.mockReturnValue('123456789');

    //   await provider.update(updateUserDto, activeUser, file);

    //   expect(mockUserHelper.formatPhoneNumber).toHaveBeenCalledWith(
    //     updateUserDto.country_code,
    //     updateUserDto.phone_number,
    //   );
    //   expect(mockUserRepository.update).toHaveBeenCalledWith(user.id, {
    //     phone_number: '123456789',
    //   });
    // });

    it('should update user details', async () => {
      mockUserRepository.findOneBy.mockResolvedValueOnce(user);
      mockUserRepository.findOneBy.mockResolvedValueOnce(null);

      await provider.update(updateUserDto, activeUser, null);

      expect(userRepository.update).toHaveBeenCalledWith(user.id, {
        id: user.id,
        image_url: user.image_url, // old image_url
        first_name: updateUserDto.first_name,
        last_name: updateUserDto.last_name,
        phone_number: updateUserDto.phone_number,
        gender: updateUserDto.gender,
        marketing: updateUserDto.marketing,
      });
    });
  });
});
