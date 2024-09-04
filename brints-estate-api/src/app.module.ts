import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { environmentValidationSchema } from './config/environment.validation';
import { AccessTokenGuard } from './auth/guards/access-token/access-token.guard';
import jwtConfig from './auth/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationGuard } from './auth/guards/authentication/authentication.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !process.env.NODE_ENV
        ? '.env'
        : `.env.${process.env.NODE_ENV}`,
      validationSchema: environmentValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: process.env.NODE_ENV === 'development',
        synchronize: process.env.NODE_ENV === 'development',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // entities: [User, UserAuth],
      }),
    }),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    AuthModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
  ],
})
export class AppModule {}
