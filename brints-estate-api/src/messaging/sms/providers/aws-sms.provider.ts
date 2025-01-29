import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class AwsSmsProvider {
  constructor(private readonly appConfigService: AppConfigService) {}

  public async sendSms(phoneNumber: string, message: string): Promise<void> {
    const snsClient = new SNSClient({
      region: this.appConfigService.getConfig().aws.aws_region,
      credentials: {
        accessKeyId: this.appConfigService.getConfig().aws.aws_access_key_id,
        secretAccessKey:
          this.appConfigService.getConfig().aws.aws_secret_access_key,
      },
    });

    try {
      const params = {
        PhoneNumber: phoneNumber,
        Message: message,
      };

      await snsClient.send(new PublishCommand(params));
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
  }
}
