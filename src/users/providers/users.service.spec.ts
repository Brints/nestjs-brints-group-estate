import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { VerifyEmailProvider } from './verify-email.provider';
import { VerifyPhoneNumberProvider } from './verify-phone-number.provider';
import { ResendOtpProvider } from './resend-otp.provider';
import { GenerateNewEmailVerificationProvider } from './generate-new-email-verification.provider';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { GetUserProfileProvider } from './get-user-profile.provider';
import { ResetPasswordProvider } from './reset-password.provider';
import { ChangePasswordProvider } from './change-password.provider';
import { ForgotPasswordProvider } from './forgot-password.provider';
import { UpdateUserProvider } from './update-user.provider';
import { FindOneByGoogleIdProvider } from './find-one-by-google-id.provider';
import { CreateGoogleUserProvider } from './create-google-user.provider';
import { DeleteUserProfileProvider } from './delete-user-profile.provider';

describe('UsersService', () => {
  let service: UsersService;

  const mockVerifyEmailProvider: Partial<VerifyEmailProvider> = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    verifyUserEmail: (_verifyEmailDto: VerifyEmailDto) => Promise.resolve(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: VerifyEmailProvider, useValue: mockVerifyEmailProvider },
        { provide: VerifyPhoneNumberProvider, useValue: {} },
        { provide: ResendOtpProvider, useValue: {} },
        { provide: GenerateNewEmailVerificationProvider, useValue: {} },
        { provide: GetUserProfileProvider, useValue: {} },
        { provide: ResetPasswordProvider, useValue: {} },
        { provide: ChangePasswordProvider, useValue: {} },
        { provide: ForgotPasswordProvider, useValue: {} },
        { provide: UpdateUserProvider, useValue: {} },
        { provide: DeleteUserProfileProvider, useValue: {} },
        { provide: FindOneByGoogleIdProvider, useValue: {} },
        { provide: CreateGoogleUserProvider, useValue: {} },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should define users service', () => {
    expect(service).toBeDefined();
  });

  describe('verifyUserEmail', () => {
    it('should be defined', () => {
      expect(service.verifyUserEmail).toBeDefined();
    });

    it('should call verifyUserEmail on VerifyEmailProvider', async () => {
      const verifyEmailDto: VerifyEmailDto = {
        email: 'test.email@test.com',
        email_verification_token: 'sample-token',
      };
      const verifyUserEmailSpy = jest.spyOn(
        mockVerifyEmailProvider,
        'verifyUserEmail',
      );
      await service.verifyUserEmail(verifyEmailDto);
      expect(verifyUserEmailSpy).toHaveBeenCalledWith(verifyEmailDto);
    });
  });
});
