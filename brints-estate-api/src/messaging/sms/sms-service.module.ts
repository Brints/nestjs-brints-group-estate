import { Module } from '@nestjs/common';
import { AwsSmsService } from './providers/aws-sms.service';
import { AwsSmsProvider } from './providers/aws-sms.provider';
import { TimeHelper } from 'src/utils/time-helper.lib';
import { AppConfigService } from 'src/config/config.service';

@Module({
  providers: [AwsSmsService, AwsSmsProvider, TimeHelper, AppConfigService],
})
export class SmsServiceModule {}
