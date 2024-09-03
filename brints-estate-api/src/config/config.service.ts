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
    };
  }
}
