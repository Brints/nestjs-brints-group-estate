import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  getConfig() {
    return {
      database: {
        dbHost: this.configService.get<string>('DB_HOST') as string,
        dbPort: this.configService.get<number>('DB_PORT') as number,
        dbUser: this.configService.get<string>('DB_USER') as string,
        dbPassword: this.configService.get<string>('DB_PASSWORD') as string,
        dbName: this.configService.get<string>('DB_NAME') as string,
      },
      app: {
        port: this.configService.get<number>('APP_PORT') as number,
        api_version: this.configService.get<string>('API_VERSION') as string,
      },
      jwt: {
        secret: this.configService.get<string>('JWT_SECRET') as string,
        expiresIn: this.configService.get<number>(
          'JWT_ACCESS_TOKEN_TTL',
        ) as number,
        audience: this.configService.get<string>(
          'JWT_TOKEN_AUDIENCE',
        ) as string,
        issuer: this.configService.get<string>('JWT_TOKEN_ISSUER') as string,
      },
      aws: {
        aws_bucket_name: this.configService.get<string>(
          'AWS_PUBLIC_BUCKET_NAME',
        ) as string,
        aws_region: this.configService.get<string>('AWS_REGION') as string,
        aws_access_key_id: this.configService.get<string>(
          'AWS_ACCESS_KEY_ID',
        ) as string,
        aws_secret_access_key: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ) as string,
        aws_cloudfront_url: this.configService.get<string>(
          'AWS_CLOUDFRONT_URL',
        ) as string,
      },
      mailgun: {
        mailgun_hostname: this.configService.get<string>(
          'MAILGUN_HOSTNAME',
        ) as string,
        mailgun_port: this.configService.get<number>('MAILGUN_PORT') as number,
        mailgun_username: this.configService.get<string>(
          'MAILGUN_USERNAME',
        ) as string,
        mailgun_domain: this.configService.get<string>(
          'MAILGUN_DOMAIN',
        ) as string,
        mailgun_api_key: this.configService.get<string>(
          'MAILGUN_API_KEY',
        ) as string,
        mailgun_password: this.configService.get<string>(
          'MAILGUN_PASSWORD',
        ) as string,
      },
      ses: {
        aws_email: this.configService.get<string>('AWS_SENDER_EMAIL') as string,
      },
    };
  }
}
