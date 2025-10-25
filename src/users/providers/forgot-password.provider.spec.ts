import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource /*, Repository*/ } from 'typeorm';
import { ForgotPasswordProvider } from './forgot-password.provider';
import { User } from '../entities/user.entity';
import { UserAuth } from '../entities/userAuth.entity';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { CustomException } from '../../exceptions/custom.exception';
import { HttpStatus } from '@nestjs/common';
import { MailgunService } from '../../messaging/email/mailgun-service/providers/mailgun.service';
import { GenerateTokenHelper } from '../../utils/generate-token.lib';
import { TimeHelper } from '../../utils/time-helper.lib';

describe('ForgotPasswordProvider', () => {
  let provider: ForgotPasswordProvider;
  //   let userRepository: Repository<User>;
  //   let userAuthRepository: Repository<UserAuth>;
  //   let mailgunService: MailgunService;
  //   let generateTokenHelper: GenerateTokenHelper;
  //   let timeHelper: TimeHelper;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockUserAuthRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockMailgunService = {
    sendPasswordReset: jest.fn(),
  };

  const mockGenerateTokenHelper = {
    generateToken: jest.fn(),
  };

  const mockTimeHelper = {
    setExpiryDate: jest.fn(),
    getTimeLeft: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForgotPasswordProvider,
        { provide: DataSource, useValue: {} },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: getRepositoryToken(UserAuth),
          useValue: mockUserAuthRepository,
        },
        { provide: MailgunService, useValue: mockMailgunService },
        { provide: GenerateTokenHelper, useValue: mockGenerateTokenHelper },
        { provide: TimeHelper, useValue: mockTimeHelper },
      ],
    }).compile();

    provider = module.get<ForgotPasswordProvider>(ForgotPasswordProvider);
    // userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    // userAuthRepository = module.get<Repository<UserAuth>>(
    //   getRepositoryToken(UserAuth),
    // );
    // mailgunService = module.get<MailgunService>(MailgunService);
    // generateTokenHelper = module.get<GenerateTokenHelper>(GenerateTokenHelper);
    // timeHelper = module.get<TimeHelper>(TimeHelper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should define forgot password provider', () => {
    expect(provider).toBeDefined();
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'example@test.com',
    };

    it('should throw error if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(undefined);

      await expect(provider.forgotPassword(forgotPasswordDto)).rejects.toThrow(
        new CustomException(HttpStatus.NOT_FOUND, 'User does not exist'),
      );
    });

    it('should throw error if user auth does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue({ user_auth: { id: 1 } });
      mockUserAuthRepository.findOne.mockResolvedValue(undefined);

      await expect(provider.forgotPassword(forgotPasswordDto)).rejects.toThrow(
        new CustomException(HttpStatus.NOT_FOUND, 'User Auth does not exist'),
      );
    });

    it('should throw error if user account is not verified', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        user_auth: { id: 1 },
        isVerified: false,
      });
      mockUserAuthRepository.findOne.mockResolvedValue({});

      await expect(provider.forgotPassword(forgotPasswordDto)).rejects.toThrow(
        new CustomException(
          HttpStatus.FORBIDDEN,
          'Your account is not yet verified',
        ),
      );
    });

    // it('should throw error if user email or phone number is not verified', async () => {
    //   mockUserRepository.findOne.mockResolvedValue({
    //     user_auth: { id: 1 },
    //     isVerified: true,
    //   });
    //   mockUserAuthRepository.findOne.mockResolvedValue({
    //     isEmailVerified: false,
    //     isPhoneNumberVerified: false,
    //   });

    //   await expect(provider.forgotPassword(forgotPasswordDto)).rejects.toThrow(
    //     new CustomException(
    //       HttpStatus.FORBIDDEN,
    //       'Your account is not yet verified',
    //     ),
    //   );
    // });

    // it('should throw error if user has an active token', async () => {
    //   mockUserRepository.findOne.mockResolvedValue({
    //     user_auth: { id: 1 },
    //     isVerified: true,
    //   });
    //   mockUserAuthRepository.findOne.mockResolvedValue({
    //     isEmailVerified: true,
    //     isPhoneNumberVerified: true,
    //     passwordResetTokenExpiresIn: new Date(),
    //   });

    //   await expect(provider.forgotPassword(forgotPasswordDto)).rejects.toThrow(
    //     new CustomException(
    //       HttpStatus.FORBIDDEN,
    //       `You have an active token. Try again after ${mockTimeHelper.getTimeLeft(userAuthRepository.findOne, 'hour')}`,
    //     ),
    //   );
    // });
  });
});
