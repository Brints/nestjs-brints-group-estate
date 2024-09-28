import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class AwsSesProvider {
  constructor(private readonly appConfigService: AppConfigService) {}

  public async sendAwsEmail(
    to: string,
    subject: string,
    message: string,
  ): Promise<void> {
    const sesClient = new SESClient({
      region: this.appConfigService.getConfig().aws.aws_region,
      credentials: {
        accessKeyId: this.appConfigService.getConfig().ses.ses_access_key_id,
        secretAccessKey:
          this.appConfigService.getConfig().ses.ses_scret_access_key,
      },
    });

    try {
      const params = {
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Body: {
            Text: {
              Charset: 'UTF-8',
              Data: message,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: subject,
          },
        },
        Source: this.appConfigService.getConfig().ses.ses_email_source,
      };

      await sesClient.send(new SendEmailCommand(params));
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
  }
}
