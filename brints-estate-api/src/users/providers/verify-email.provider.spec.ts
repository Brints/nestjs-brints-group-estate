import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

import { MailgunService } from 'src/services/email-service/mailgun-service/providers/mailgun.service';
import { VerifyEmailProvider } from './verify-email.provider';
import { UserAuth } from '../entities/userAuth.entity';
import { CustomException } from 'src/exceptions/custom.exception';

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

  const mockUser = {
    id: '98e749e6-b05f-45e9-9dd7-9142356b9a23',
    image_url: 'https://test.com',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john-doe@test.com',
    password: 'password',
    phone_number: '08012345678',
    is_verified: false,
    account_status: 'active',
    role: 'user',
    isTwoFAEnabled: false,
    backup_codes: [],
    google_id: null,
    last_login: new Date(),
    terms_accepted: true,
    privacy_policy_accepted: true,
    marketing_accepted: true,
    login_attempts_id: '98e749e6-b05f-45e9-9dd7-9142356b9a23',
    created_at: new Date(),
    updated_at: new Date(),
    user_auth: {
      id: '54616282-b896-4982-84ce-50b94772a351',
      isEmailVerified: false,
      emailVerificationToken: 'valid-token',
      passwordResetToken: null,
      isPhoneNumberVerified: false,
      status: 'pending',
      otpExpiresIn: new Date().setMinutes(new Date().getMinutes() + 20),
      emailVerificationTokenExpiresIn: new Date().setHours(
        new Date().getHours() + 1,
      ),
      passwordResetTokenExpiresIn: null,
      otp_status: 'pending',
      email_status: 'pending',
      otp: '123456',
    },
  };

  const mockUserAuth = {
    id: '54616282-b896-4982-84ce-50b94772a351',
    isEmailVerified: false,
    emailVerificationToken: 'token',
    passwordResetToken: null,
    isPhoneNumberVerified: false,
    status: 'pending',
    otpExpiresIn: new Date(),
    emailVerificationTokenExpiresIn: new Date(),
    passwordResetTokenExpiresIn: new Date(),
    otp_status: 'pending',
    email_status: 'pending',
    otp: '123456',
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should define verify email provider', () => {
    expect(provider).toBeDefined();
  });

  describe('verifyUserEmail in VerifyEmailProvider', () => {
    describe('user does not exist in the database', () => {
      it('should throw a NotFoundException if user does not exist.', async () => {
        userRepository.findOne?.mockResolvedValue(undefined);

        await expect(
          provider.verifyUserEmail({
            email: 'non-existent-email@test.com',
            email_verification_token: 'token',
          }),
        ).rejects.toThrow(CustomException);

        expect(userRepository.findOne).toHaveBeenCalledWith({
          where: { email: 'non-existent-email@test.com' },
          relations: { user_auth: true },
        });
      });
    });

    describe('user auth does not exist in the database', () => {
      it('should throw a NotFoundException if userAuth does not exist', async () => {
        userRepository.findOne?.mockResolvedValue(mockUser);
        userAuthRepository.findOne?.mockResolvedValue(undefined);

        await expect(
          provider.verifyUserEmail({
            email: mockUser.email,
            email_verification_token: 'valid-token',
          }),
        ).rejects.toThrow(CustomException);

        expect(userAuthRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockUser.user_auth.id },
        });
      });
    });

    describe('user exist in the database', () => {
      it('should throw a BadRequestException if user is already verified', async () => {
        userRepository.findOne?.mockResolvedValue({
          ...mockUser,
          isVerified: true,
        });

        await expect(
          provider.verifyUserEmail({
            email: mockUser.email,
            email_verification_token: 'valid-token',
          }),
        ).rejects.toThrow(CustomException);
      });
    });

    describe('user auth exist in the database', () => {
      it('should throw a ForbiddenException if the token is invalid', async () => {
        const invalidTokenUserAuth = {
          ...mockUserAuth,
          emailVerificationToken: 'invalid-token',
        };

        userRepository.findOne?.mockResolvedValue(mockUser);
        userAuthRepository.findOne?.mockResolvedValue(invalidTokenUserAuth);

        await expect(
          provider.verifyUserEmail({
            email: mockUser.email,
            email_verification_token: 'wrong-token',
          }),
        ).rejects.toThrow(CustomException);
      });

      it('should throw a BadRequestException if the verification token is expired', async () => {
        const expiredTokenUserAuth = {
          ...mockUserAuth,
          emailVerificationTokenExpiresIn: new Date(Date.now() - 10000),
        };
        userRepository.findOne?.mockResolvedValue(mockUser);
        userAuthRepository.findOne?.mockResolvedValue(expiredTokenUserAuth);

        await expect(
          provider.verifyUserEmail({
            email: mockUser.email,
            email_verification_token: 'valid-token',
          }),
        ).rejects.toThrow(CustomException);
      });
    });
  });
});
