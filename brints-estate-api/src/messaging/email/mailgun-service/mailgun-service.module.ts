import { join } from 'node:path';
import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

import { MailgunService } from './providers/mailgun.service';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { TimeHelper } from 'src/utils/time-helper.lib';
import { SendWelcomeEmailProvider } from './providers/send-welcome-email.provider';
import { SendVerificationTokenEmailProvider } from './providers/send-verification-token-email.provider';
import { SendOtpProvider } from './providers/send-otp.provider';
import { SendPasswordResetTokenProvider } from './providers/send-password-reset-token.provider';
import { SendResetPasswordConfirmationProvider } from './providers/send-reset-password-confirmation.provider';
import { SendPasswordChangedEmailProvider } from './providers/send-password-changed-email.provider';

// const templateDir =
//   process.env.NODE_ENV === 'production'
//     ? join(__dirname, '/../../../messaging/email/mailgun-service/templates')
//     : join(__dirname, '/messaging/email/mailgun-service/templates');

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAILGUN_HOSTNAME'),
          secure: true,
          port: configService.get('MAILGUN_PORT'),
          auth: {
            user: configService.get('MAILGUN_USERNAME'),
            pass: configService.get('MAILGUN_PASSWORD'),
          },
        },
        defaults: {
          from: `Brints Group <no-reply@brintsgroup.live>`,
        },
        template: {
          dir: join(__dirname, '/messaging/email/mailgun-service/templates'),
          adapter: new EjsAdapter({
            inlineCssEnabled: true,
          }),
          options: {
            strict: false,
          },
        },
      }),
    }),
  ],
  providers: [
    MailgunService,
    TimeHelper,
    SendWelcomeEmailProvider,
    SendVerificationTokenEmailProvider,
    SendOtpProvider,
    SendPasswordResetTokenProvider,
    SendResetPasswordConfirmationProvider,
    SendPasswordChangedEmailProvider,
  ],
  exports: [MailgunService],
})
export class MailgunServiceModule {}
