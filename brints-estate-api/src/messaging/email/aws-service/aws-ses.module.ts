import { Global, Module } from '@nestjs/common';
import { AwsSesService } from './providers/aws-ses.service';
import { AwsSesProvider } from './providers/aws-ses.provider';
import { SendVerificationTokenEmailProvider } from './providers/send-verification-token-email.provider';
import { AppConfigService } from 'src/config/config.service';
import { TimeHelper } from 'src/utils/time-helper.lib';

@Global()
@Module({
  providers: [
    AwsSesService,
    AwsSesProvider,
    SendVerificationTokenEmailProvider,
    AppConfigService,
    TimeHelper,
  ],
})
export class AwsSeSModule {}
