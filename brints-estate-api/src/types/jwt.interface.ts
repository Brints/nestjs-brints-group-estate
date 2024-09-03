export interface JwtPayload {
  sub: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  verified: boolean;
  iat?: number;
  exp?: number;
}
