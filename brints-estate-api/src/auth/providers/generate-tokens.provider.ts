import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { IActiveUser } from '../interfaces/active-user.interface';

@Injectable()
export class GenerateTokensProvider {
  constructor(
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  public async signToken<T>(userId: string, expiresIn: number, payload?: T) {
    const data = {
      sub: userId,
      ...payload,
    };

    return await this.jwtService.signAsync(data, {
      secret: this.jwtConfiguration.secret,
      expiresIn,
      audience: this.jwtConfiguration.audience,
      issuer: this.jwtConfiguration.issuer,
    });
  }

  public async generateTokens(user: User) {
    const [access_token, refresh_token] = await Promise.all([
      this.signToken<Partial<IActiveUser>>(
        user.id,
        this.jwtConfiguration.expiresIn,
        {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone_number: user.phone_number,
          role: user.role,
          verified: user.isVerified,
        },
      ),

      this.signToken<Partial<IActiveUser>>(
        user.id,
        this.jwtConfiguration.refresh_token_expires,
      ),
    ]);

    return { access_token, refresh_token };
  }
}
