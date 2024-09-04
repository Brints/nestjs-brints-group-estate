import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { CustomException } from 'src/exceptions/custom.exception';
import { IActiveUser } from '../interfaces/active-user.interface';

@Injectable()
export class RefreshTokensProvider {
  constructor(
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const { sub } = await this.jwtService.verifyAsync<Pick<IActiveUser, 'sub'>>(
      refreshTokenDto.refresh_token,
      {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      },
    );

    const user = await this.userRepository.findOneBy({ id: sub });
    // const user = await this.userRepository.findOne(sub);

    if (!user) {
      throw new CustomException(HttpStatus.NOT_FOUND, 'User not found');
    }

    return await this.generateTokensProvider.generateTokens(user);
  }
}