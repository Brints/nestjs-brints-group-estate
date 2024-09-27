import { Module } from '@nestjs/common';
import { AwsSesService } from './providers/aws-ses.service';
import { AwsSesProvider } from './providers/aws-ses.provider';
import { SendVerificationTokenEmailProvider } from './providers/send-verification-token-email.provider';

@Module({
  providers: [
    AwsSesService,
    AwsSesProvider,
    SendVerificationTokenEmailProvider,
  ],
})
export class AwsSeSModule {}
