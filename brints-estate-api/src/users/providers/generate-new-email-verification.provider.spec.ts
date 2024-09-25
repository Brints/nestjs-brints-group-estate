import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { GenerateNewEmailVerificationProvider } from './generate-new-email-verification.provider';
import { User } from '../entities/user.entity';
import { UserAuth } from '../entities/userAuth.entity';
import { MailgunService } from 'src/services/email-service/mailgun-service/providers/mailgun.service';
import { GenerateTokenHelper } from 'src/utils/generate-token.lib';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GenerateNewEmailTokenDto } from '../dto/new-email-token.dto';
import { CustomException } from 'src/exceptions/custom.exception';
import { HttpStatus } from '@nestjs/common';

describe('GenerateNewEmailVerificationProvider', () => {
  let provider: GenerateNewEmailVerificationProvider;
  let userRepository: Repository<User>;
  let userAuthRepository: Repository<UserAuth>;
  let generateTokenHelper: GenerateTokenHelper;
  let mailgunService: MailgunService;

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockGenerateToken = {
    generateVerificationToken: jest.fn(),
  };

  const mockMailgunService = {
    sendVerificationTokenEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateNewEmailVerificationProvider,
        { provide: DataSource, useValue: {} },
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: getRepositoryToken(UserAuth), useValue: mockRepository },
        { provide: GenerateTokenHelper, useValue: mockGenerateToken },
        { provide: MailgunService, useValue: mockMailgunService },
      ],
    }).compile();

    provider = module.get<GenerateNewEmailVerificationProvider>(
      GenerateNewEmailVerificationProvider,
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userAuthRepository = module.get<Repository<UserAuth>>(
      getRepositoryToken(UserAuth),
    );
    generateTokenHelper = module.get<GenerateTokenHelper>(GenerateTokenHelper);
    mailgunService = module.get<MailgunService>(MailgunService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should define generate new email verification provider', function () {
    expect(provider).toBeDefined();
  });

  describe('generateNewEmailVerificationToken', function () {
    const generateNewEmailTokenDto: GenerateNewEmailTokenDto = {
      email: 'test@example.com',
    };

    it('should throw if user does not exist', async function () {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        provider.newEmailVerificationToken(generateNewEmailTokenDto),
      ).rejects.toThrow(
        new CustomException(HttpStatus.NOT_FOUND, 'User does not exist'),
      );
    });

    it('should throw if user auth does not exist', async () => {
      const user = {
        email: 'test@example.com',
        user_auth: { id: '54616282-b896-4982-84ce-50b94772a351' },
      };

      mockRepository.findOne
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(null);

      await expect(
        provider.newEmailVerificationToken(generateNewEmailTokenDto),
      ).rejects.toThrow(
        new CustomException(HttpStatus.NOT_FOUND, 'User Auth does not exist'),
      );
    });

    it('should throw if user or email is already verified', async function () {
      const user = {
        email: 'test@example.com',
        isVerified: true,
        user_auth: {
          id: '54616282-b896-4982-84ce-50b94772a351',
          isEmailVerified: true,
        },
      };
      const userAuth = { isEmailVerified: true };

      mockRepository.findOne
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(userAuth);

      expect(user.isVerified).toBe(true);
      expect(userAuth.isEmailVerified).toBe(true);

      await expect(
        provider.newEmailVerificationToken(generateNewEmailTokenDto),
      ).rejects.toThrow(
        new CustomException(
          HttpStatus.BAD_REQUEST,
          'Email is already verified',
        ),
      );
    });

    it('should throw if active token already exists', async function () {
      const mockUser = {
        email: 'test@example.com',
        user_auth: {
          id: '54616282-b896-4982-84ce-50b94772a351',
        },
      };
      const mockUserAuth = {
        id: '54616282-b896-4982-84ce-50b94772a351',
        emailVerificationTokenExpiresIn: new Date(Date.now() + 3600 * 1000),
      };

      mockRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUserAuth);

      await expect(
        provider.newEmailVerificationToken(generateNewEmailTokenDto),
      ).rejects.toThrow(
        new CustomException(
          HttpStatus.FORBIDDEN,
          'You have an active verification token',
        ),
      );
    });

    it('should generate a new verification token and send an email', async function () {
      const mockUser = {
        email: 'test@example.com',
        isVerified: false,
        user_auth: { id: '54616282-b896-4982-84ce-50b94772a351' },
      };
      const mockUserAuth = {
        isEmailVerified: false,
        emailVerificationTokenExpiresIn: new Date(Date.now() - 3600 * 1000),
      } as UserAuth;

      mockRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUserAuth);

      mockGenerateToken.generateVerificationToken.mockReturnValue('token');

      await provider.newEmailVerificationToken(generateNewEmailTokenDto);

      expect(generateTokenHelper.generateVerificationToken).toHaveBeenCalled();
      expect(mockUserAuth.emailVerificationToken).toBe('token');
      expect(mockUserAuth.emailVerificationTokenExpiresIn).toBeInstanceOf(Date);

      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(userAuthRepository.save).toHaveBeenCalledWith(mockUserAuth);

      expect(mockRepository.save).toHaveBeenCalledTimes(2);

      expect(mailgunService.sendVerificationTokenEmail).toHaveBeenCalledWith(
        mockUser,
        mockUserAuth,
      );
    });
  });
});
