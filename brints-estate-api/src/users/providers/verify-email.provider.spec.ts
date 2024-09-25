import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

import { MailgunService } from 'src/services/email-service/mailgun-service/providers/mailgun.service';
import { VerifyEmailProvider } from './verify-email.provider';
import { UserAuth } from '../entities/userAuth.entity';
import { CustomException } from 'src/exceptions/custom.exception';
import { HttpStatus } from '@nestjs/common';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { VerificationStatus } from 'src/enums/status.enum';

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

describe('VerifyEmailProvider', () => {
  let provider: VerifyEmailProvider;
  let userRepository: MockRepository<User>;
  let userAuthRepository: MockRepository<UserAuth>;
  let mailgunService: MailgunService;

  const verifyEmailDto: VerifyEmailDto = {
    email: 'test@example.com',
    email_verification_token: 'valid-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyEmailProvider,
        { provide: DataSource, useValue: {} },
        { provide: getRepositoryToken(User), useValue: createMockRepository() },
        {
          provide: getRepositoryToken(UserAuth),
          useValue: createMockRepository(),
        },
        {
          provide: MailgunService,
          useValue: {
            sendWelcomeEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    provider = module.get<VerifyEmailProvider>(VerifyEmailProvider);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
    userAuthRepository = module.get<MockRepository<UserAuth>>(
      getRepositoryToken(UserAuth),
    );
    mailgunService = module.get<MailgunService>(MailgunService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should define verify email provider', () => {
    expect(provider).toBeDefined();
  });

  describe('verifyUserEmail in VerifyEmailProvider', () => {
    it('should throw a NotFoundException if user does not exist.', async () => {
      userRepository.findOne?.mockResolvedValue(null);

      await expect(provider.verifyUserEmail(verifyEmailDto)).rejects.toThrow(
        new CustomException(HttpStatus.NOT_FOUND, 'User does not exist.'),
      );
    });

    it('should throw a NotFoundException if userAuth does not exist', async () => {
      const mockUser = {
        email: 'test@example.com',
        user_auth: { id: '54616282-b896-4982-84ce-50b94772a351' },
      };
      userRepository.findOne?.mockResolvedValue(mockUser);
      userAuthRepository.findOne?.mockResolvedValue(null);

      await expect(provider.verifyUserEmail(verifyEmailDto)).rejects.toThrow(
        new CustomException(HttpStatus.NOT_FOUND, 'User Auth does not exist.'),
      );

      expect(userAuthRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.user_auth.id },
      });
    });

    it('should throw a BadRequestException if user is already verified', async () => {
      const mockUser = {
        email: 'test@example.com',
        isVerified: true,
        user_auth: {
          id: '54616282-b896-4982-84ce-50b94772a351',
          isEmailVerified: true,
        },
      };
      const mockUserAuth = { isEmailVerified: true };

      userRepository.findOne?.mockResolvedValue(mockUser);
      userAuthRepository.findOne?.mockResolvedValue(mockUserAuth);

      await expect(provider.verifyUserEmail(verifyEmailDto)).rejects.toThrow(
        new CustomException(
          HttpStatus.BAD_REQUEST,
          'User is already verified.',
        ),
      );
    });

    it('should throw a ForbiddenException if the token is invalid', async () => {
      const mockUser = {
        email: 'test@example.com',
        user_auth: {
          id: '54616282-b896-4982-84ce-50b94772a351',
        },
      };
      const mockUserAuth = {
        id: '54616282-b896-4982-84ce-50b94772a351',
        emailVerificationToken: 'valid-token',
      };

      userRepository.findOne?.mockResolvedValue(mockUser);
      userAuthRepository.findOne?.mockResolvedValue(mockUserAuth);

      await expect(
        provider.verifyUserEmail({
          email: 'test@example.com',
          email_verification_token: 'invalid-token',
        }),
      ).rejects.toThrow(
        new CustomException(
          HttpStatus.FORBIDDEN,
          'Invalid email verification token',
        ),
      );
    });

    it('should throw a BadRequestException if the verification token is expired', async () => {
      const mockUser = {
        email: 'test@example.com',
        isVerified: false,
        user_auth: {
          id: '54616282-b896-4982-84ce-50b94772a351',
          isEmailVerified: false,
          emailVerificationToken: 'valid-token',
          emailVerificationTokenExpiresIn: new Date(Date.now() - 100000),
          email_status: 'expired',
        },
      };

      const mockUserAuth = {
        id: '54616282-b896-4982-84ce-50b94772a351',
        isEmailVerified: false,
        emailVerificationToken: 'valid-token',
        emailVerificationTokenExpiresIn: new Date(Date.now() - 100000),
        email_status: 'expired',
      };

      userRepository.findOne?.mockResolvedValue(mockUser);
      userAuthRepository.findOne?.mockResolvedValue(mockUserAuth);

      await expect(provider.verifyUserEmail(verifyEmailDto)).rejects.toThrow(
        new CustomException(
          HttpStatus.BAD_REQUEST,
          'Email verification token has expired. Please, generate a new one.',
        ),
      );
    });

    it('should set userAuth.status to VERIFIED if both email and phone number are verified', async () => {
      const mockUser = {
        email: 'test@example.com',
        isVerified: false,
        user_auth: {
          id: '54616282-b896-4982-84ce-50b94772a351',
          isEmailVerified: true,
          emailVerificationToken: 'valid-token',
          emailVerificationTokenExpiresIn: new Date(Date.now() + 1000),
          email_status: VerificationStatus.PENDING,
          isPhoneNumberVerified: true,
        },
      };

      userRepository.findOne?.mockResolvedValue(mockUser);
      userAuthRepository.findOne?.mockResolvedValue(mockUser.user_auth);

      await provider.verifyUserEmail(verifyEmailDto);

      expect(userAuthRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: VerificationStatus.VERIFIED,
        }),
      );

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isVerified: true,
        }),
      );

      expect(mailgunService.sendWelcomeEmail).toHaveBeenCalledWith(mockUser);
    });

    it('should not set user.isVerified to true when userAuth.status is not VERIFIED', async () => {
      const mockUser = {
        email: 'test@example.com',
        isVerified: false,
        user_auth: {
          id: '54616282-b896-4982-84ce-50b94772a351',
          isEmailVerified: false,
          emailVerificationToken: 'valid-token',
          emailVerificationTokenExpiresIn: new Date(Date.now() + 1000),
          email_status: VerificationStatus.PENDING,
          status: VerificationStatus.PENDING,
        },
      };

      userRepository.findOne?.mockResolvedValue(mockUser);
      userAuthRepository.findOne?.mockResolvedValue(mockUser.user_auth);

      await provider.verifyUserEmail(verifyEmailDto);

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isVerified: false,
        }),
      );

      expect(mailgunService.sendWelcomeEmail).not.toHaveBeenCalled();
    });

    // it('should verify email successfully and send welcome email', async () => {
    //   const mockUserAuth = {
    //     id: '54616282-b896-4982-84ce-50b94772a351',
    //     isEmailVerified: false,
    //     emailVerificationToken: 'valid-token',
    //     emailVerificationTokenExpiresIn: new Date(Date.now() + 100000),
    //   };

    //   const mockUser = {
    //     isVerified: false,
    //     user_auth: mockUserAuth,
    //   };

    //   const mockVerifiedUser = {
    //     ...mockUser,
    //     isVerified: true,
    //     user_auth: {
    //       id: '54616282-b896-4982-84ce-50b94772a351',
    //       isEmailVerified: true,
    //       emailVerificationToken: null,
    //       emailVerificationTokenExpiresIn: null,
    //       email_status: VerificationStatus.VERIFIED,
    //     },
    //   };

    //   userRepository.findOne?.mockResolvedValue(mockUser);
    //   userAuthRepository.findOne?.mockResolvedValue(mockUserAuth);

    //   userAuthRepository.save?.mockResolvedValue(mockVerifiedUser.user_auth);
    //   userRepository.save?.mockResolvedValue(mockVerifiedUser);

    //   await provider.verifyUserEmail(verifyEmailDto);

    //   expect(userAuthRepository.save).toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       isEmailVerified: true,
    //       emailVerificationToken: null,
    //       emailVerificationTokenExpiresIn: null,
    //       email_status: VerificationStatus.VERIFIED,
    //     }),
    //   );

    //   expect(userRepository.save).toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       isVerified: true,
    //     }),
    //   );

    //   expect(mailgunService.sendWelcomeEmail).toHaveBeenCalledWith(
    //     mockVerifiedUser,
    //   );
    // });
  });
});
