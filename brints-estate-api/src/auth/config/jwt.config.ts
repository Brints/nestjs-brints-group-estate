import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  return {
    secret: process.env.JWT_SECRET,
    expiresIn: parseInt(process.env.JWT_ACCESS_TOKEN_TTL ?? '3600', 10),
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER,
    refresh_token_expires: Number(process.env.JWT_REFRESH_TOKEN_TTL ?? '86400'),
  };
});
