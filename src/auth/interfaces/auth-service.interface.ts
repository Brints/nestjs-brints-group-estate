import { User } from 'src/users/entities/user.entity';

/**
 * @description LoginUser Interface
 * @interface ILoginUser
 */
export interface ILoginUser {
  user: User;
  tokens: { access_token: string; refresh_token: string };
}

/**
 * @description RefreshToken Interface
 * @interface IRefreshToken
 */
export interface IRefreshToken {
  refresh_token: string;
}

export interface IAccessTokens {
  access_token: string;
  refresh_token: string;
}
