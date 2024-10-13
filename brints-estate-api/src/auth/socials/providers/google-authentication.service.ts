import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import jwtConfig from 'src/auth/config/jwt.config';
import { GoogleTokenDto } from '../dto/google-token.dto';
import { UsersService } from 'src/users/providers/users.service';
import { CustomException } from 'src/exceptions/custom.exception';
import { GenerateTokensProvider } from 'src/auth/providers/generate-tokens.provider';
import { IGooglePayload } from 'src/auth/interfaces/google-token-payload.interface';
import { IAccessTokens } from 'src/auth/interfaces/auth-service.interface';

/**
 * GoogleAuthenticationService Class handles the business logic of the google authentication module.
 * @class GoogleAuthenticationService
 * @exports GoogleAuthenticationService
 */
@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
  private oAuthClient: OAuth2Client;

  /**
   * Constructor GoogleAuthenticationService
   */
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  /**
   * onModuleInit method initializes the google authentication module.
   */
  onModuleInit(): void {
    this.oAuthClient = new OAuth2Client({
      clientId: this.jwtConfiguration.google_client_id,
      clientSecret: this.jwtConfiguration.google_client_secret,
    });
  }

  /**
   * getOAuthClient method returns the google oAuth client.
   * @returns {OAuth2Client}
   */
  public async authenticate(
    googleTokenDto: GoogleTokenDto,
  ): Promise<IAccessTokens> {
    const loginTicket = await this.oAuthClient.verifyIdToken({
      idToken: googleTokenDto.token,
    });

    if (!loginTicket)
      throw new CustomException(
        HttpStatus.UNAUTHORIZED,
        'Google login denied.',
      );

    const {
      email,
      sub: google_id,
      given_name: first_name,
      family_name: last_name,
    } = loginTicket.getPayload() as IGooglePayload;

    const user = await this.usersService.findOneByGoogleId(google_id);

    if (user) {
      return this.generateTokensProvider.generateTokens(user);
    }

    const newUser = await this.usersService.createGoogleUser({
      email,
      first_name,
      last_name,
      google_id,
    });

    return this.generateTokensProvider.generateTokens(newUser);
  }
}
