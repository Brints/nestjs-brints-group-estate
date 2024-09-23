import { join } from 'node:path';
import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

import { MailgunService } from './providers/mailgun.service';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { TimeHelper } from 'src/utils/time-helper.lib';

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
          dir: join(__dirname, 'templates'),
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
  providers: [MailgunService, TimeHelper],
  exports: [MailgunService],
})
export class MailgunServiceModule {}
