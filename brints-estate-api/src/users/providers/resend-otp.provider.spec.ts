import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserAuth } from '../entities/userAuth.entity';
import { CustomException } from 'src/exceptions/custom.exception';
import { GenerateNewOTPDto } from '../dto/generate-new-otp.dto';
import { AwsSmsService } from 'src/messaging/sms/providers/aws-sms.service';
import { GenerateTokenHelper } from 'src/utils/generate-token.lib';
import { TimeHelper } from 'src/utils/time-helper.lib';
import { ResendOtpProvider } from './resend-otp.provider';
import { MailgunService } from 'src/messaging/email/mailgun-service/providers/mailgun.service';
import { UserHelper } from 'src/utils/userHelper.lib';

describe('ResendOtpProvider', function () {
  let provider: ResendOtpProvider;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockUserAuthRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockGenerateTokenHelper = {
    generateOTP: jest.fn(),
  };

  const mockTimeHelper = {
    setExpiryDate: jest.fn(),
  };

  const mockAwsSmsService = {
    sendOTPSms: jest.fn(),
  };

  const mockMailgunService = {
    sendOTP: jest.fn(),
  };

  const mockUserHelper = {
    formatPhoneNumber: jest.fn(),
  };

  beforeEach(async function () {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResendOtpProvider,
        { provide: DataSource, useValue: {} },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: getRepositoryToken(UserAuth),
          useValue: mockUserAuthRepository,
        },
        { provide: GenerateTokenHelper, useValue: mockGenerateTokenHelper },
        { provide: AwsSmsService, useValue: mockAwsSmsService },
        { provide: TimeHelper, useValue: mockTimeHelper },
        { provide: UserHelper, useValue: mockUserHelper },
        { provide: MailgunService, useValue: mockMailgunService },
      ],
    }).compile();

    provider = module.get<ResendOtpProvider>(ResendOtpProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should define resend otp provider', async () => {
    expect(provider).toBeDefined();
  });

  describe('resendOTP', function () {
    const mockUser = {
      id: '1',
      email: 'example@test.com',
      user_auth: { id: '1' },
    };

    it('should throw if user does not exist', async () => {
      const generateNewOTPDto: GenerateNewOTPDto = {
        country_code: '234',
        phone_number: '08021234567',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(provider.resendOTP(generateNewOTPDto)).rejects.toThrow(
        new CustomException(HttpStatus.NOT_FOUND, 'User does not exist'),
      );
    });

    it('should throw if user auth does not exist', async () => {
      const generateNewOTPDto: GenerateNewOTPDto = {
        country_code: '234',
        phone_number: '08021234567',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserAuthRepository.findOne.mockResolvedValue(null);

      await expect(provider.resendOTP(generateNewOTPDto)).rejects.toThrow(
        new CustomException(
          HttpStatus.NOT_FOUND,
          'Server error. Please try again.',
        ),
      );
    });

    it('should generate OTP and set expiry date', async () => {
      const generateNewOTPDto: GenerateNewOTPDto = {
        country_code: '234',
        phone_number: '08021234567',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserAuthRepository.findOne.mockResolvedValue(mockUser.user_auth);
      mockGenerateTokenHelper.generateOTP.mockReturnValue('123456');
      mockTimeHelper.setExpiryDate.mockReturnValue(new Date());

      await provider.resendOTP(generateNewOTPDto);

      expect(mockGenerateTokenHelper.generateOTP).toHaveBeenCalledWith(6);
      expect(mockTimeHelper.setExpiryDate).toHaveBeenCalledWith('minutes', 20);
    });

    it('should save user auth', async () => {
      const generateNewOTPDto: GenerateNewOTPDto = {
        country_code: '234',
        phone_number: '08021234567',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserAuthRepository.findOne.mockResolvedValue(mockUser.user_auth);
      mockGenerateTokenHelper.generateOTP.mockReturnValue('123456');
      mockTimeHelper.setExpiryDate.mockReturnValue(new Date());

      await provider.resendOTP(generateNewOTPDto);

      expect(mockUserAuthRepository.save).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should send OTP SMS', async () => {
      const generateNewOTPDto: GenerateNewOTPDto = {
        country_code: '234',
        phone_number: '08021234567',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserAuthRepository.findOne.mockResolvedValue(mockUser.user_auth);
      mockGenerateTokenHelper.generateOTP.mockReturnValue('123456');
      mockTimeHelper.setExpiryDate.mockReturnValue(new Date());

      await provider.resendOTP(generateNewOTPDto);

      expect(mockAwsSmsService.sendOTPSms).toHaveBeenCalled();
      expect(mockMailgunService.sendOTP).toHaveBeenCalled();
    });
  });
});
