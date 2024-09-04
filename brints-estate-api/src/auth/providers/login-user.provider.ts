import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';

import { User } from 'src/users/entities/user.entity';
import { HashingProvider } from './hashing.provider';
import { LoginUserDto } from '../dto/login.dto';
import { CustomException } from 'src/exceptions/custom.exception';
import jwtConfig from '../config/jwt.config';
import { JwtPayload } from 'src/types/jwt.interface';

@Injectable()
export class LoginUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,

    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  public async loginUser(
    loginUserDto: LoginUserDto,
  ): Promise<{ access_token: string }> {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
    });

    if (!user) {
      throw new CustomException(HttpStatus.NOT_FOUND, 'User not found');
    }

    const passwordMatch = await this.hashingProvider.comparePassword(
      loginUserDto.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'Invalid login credentials',
      );
    }

    // if (!user.isVerified) {
    //   throw new CustomException(
    //     HttpStatus.BAD_REQUEST,
    //     'User account not verified',
    //   );
    // }

    const payload: JwtPayload = {
      sub: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      verified: user.isVerified,
    };

    const access_token = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfiguration.secret,
      expiresIn: this.jwtConfiguration.expiresIn,
      audience: this.jwtConfiguration.audience,
      issuer: this.jwtConfiguration.issuer,
    });

    return { access_token };
  }
}
