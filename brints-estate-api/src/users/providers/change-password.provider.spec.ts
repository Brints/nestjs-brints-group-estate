import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChangePasswordProvider } from './change-password.provider';
import { DataSource, Repository } from 'typeorm';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { User } from '../entities/user.entity';
import { IActiveUser } from 'src/auth/interfaces/active-user.interface';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { CustomException } from 'src/exceptions/custom.exception';
import { HttpStatus } from '@nestjs/common';
import { UserRole } from 'src/enums/user-role.enum';
import { MailgunService } from 'src/services/email-service/mailgun-service/providers/mailgun.service';
import { SendPasswordChangedEmailProvider } from 'src/services/email-service/mailgun-service/providers/send-password-changed-email.provider';

describe('ChangePasswordProvider', () => {
  let provider: ChangePasswordProvider;
  let userRepository: Repository<User>;
  //   let hashingProvider: HashingProvider;
  //let mailgunService: MailgunService;
  let sendPasswordChangedEmail: SendPasswordChangedEmailProvider;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockMailgunService = {
    sendPasswordChangedEmail: jest.fn(),
    SendPasswordChangedEmailProvider: jest.fn(),
  };

  const mockChangedPasswordEmailProvider = {
    sendPasswordChanged: jest.fn(),
  };

  const mockHashingProvider = {
    comparePassword: jest.fn(),
    hashPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordProvider,
        { provide: DataSource, useValue: {} },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: HashingProvider, useValue: mockHashingProvider },
        { provide: MailgunService, useValue: mockMailgunService },
        {
          provide: SendPasswordChangedEmailProvider,
          useValue: mockChangedPasswordEmailProvider,
        },
      ],
    }).compile();

    provider = module.get<ChangePasswordProvider>(ChangePasswordProvider);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    // hashingProvider = module.get<HashingProvider>(HashingProvider);
    //mailgunService = module.get<MailgunService>(MailgunService);
    sendPasswordChangedEmail = module.get<SendPasswordChangedEmailProvider>(
      SendPasswordChangedEmailProvider,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should define change password provider', () => {
    expect(provider).toBeDefined();
  });

  describe('changePassword', () => {
    const activeUser: IActiveUser = {
      sub: '54616282-b896-4982-84ce-50b94772a351',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john-doe@test.com',
      phone_number: '08027872415',
      role: UserRole.USER,
      verified: true,
    };
    const changePasswordDto: ChangePasswordDto = {
      old_password: 'Test123$',
      new_password: 'newPass123$',
      confirm_password: 'newPass123$',
    };

    it('should throw if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        provider.changePassword(activeUser, changePasswordDto),
      ).rejects.toThrow(
        new CustomException(HttpStatus.NOT_FOUND, 'User does not exist'),
      );
    });

    it('should throw if active user is not authorized', async () => {
      const mockUser = {
        id: '54616282-b896-4982-84ce-50b94752a351',
        password: 'hashedOldPassword',
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        provider.changePassword(activeUser, changePasswordDto),
      ).rejects.toThrow(
        new CustomException(
          HttpStatus.FORBIDDEN,
          "You're not authorized to perform this action",
        ),
      );
    });

    it('should throw if old password is incorrect', async () => {
      const mockUser = {
        id: '54616282-b896-4982-84ce-50b94772a351',
        password: 'hashedOldPassword',
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockHashingProvider.comparePassword.mockResolvedValue(false);

      await expect(
        provider.changePassword(activeUser, changePasswordDto),
      ).rejects.toThrow(
        new CustomException(HttpStatus.FORBIDDEN, 'Incorrect old password'),
      );
    });

    it('should throw if new_password is not the same as confirm_password', async () => {
      const mockUser = {
        id: '54616282-b896-4982-84ce-50b94772a351',
        password: 'hashedOldPassword',
      };

      const changePasswordMismatchDto: ChangePasswordDto = {
        old_password: 'Test123$',
        new_password: 'newPass123$',
        confirm_password: 'differentPass123$',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockHashingProvider.comparePassword.mockResolvedValue(true);

      expect(changePasswordMismatchDto.new_password).not.toEqual(
        changePasswordMismatchDto.confirm_password,
      );

      await expect(
        provider.changePassword(activeUser, changePasswordMismatchDto),
      ).rejects.toThrow(
        new CustomException(HttpStatus.BAD_REQUEST, 'Passwords do not match.'),
      );
    });

    it('should throw if new password is the same as old password', async () => {
      const mockUser = {
        id: '54616282-b896-4982-84ce-50b94772a351',
        password: 'hashedOldPassword',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockHashingProvider.comparePassword
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      await expect(
        provider.changePassword(activeUser, changePasswordDto),
      ).rejects.toThrow(
        new CustomException(
          HttpStatus.BAD_REQUEST,
          'New password cannot be the same as the old password',
        ),
      );
    });

    it('should change user password and send success email', async () => {
      const mockUser = {
        id: '54616282-b896-4982-84ce-50b94772a351',
        password: 'hashedOldPassword',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockHashingProvider.comparePassword
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      mockHashingProvider.hashPassword.mockResolvedValue('hashedNewPassword');

      await provider.changePassword(activeUser, changePasswordDto);

      expect(mockHashingProvider.hashPassword).toHaveBeenCalledWith(
        changePasswordDto.new_password,
      );

      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        password: 'hashedNewPassword',
      });

      expect(sendPasswordChangedEmail.sendPasswordChanged).toHaveBeenCalledWith(
        {
          ...mockUser,
          password: 'hashedNewPassword',
        },
      );
    });
  });
});
