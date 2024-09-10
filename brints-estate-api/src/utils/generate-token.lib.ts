import * as crypto from 'crypto';

export class GenerateTokenHelper {
  constructor() {}

  public generateVerificationToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  public generateOTP(length: number): string {
    return Math.floor(100000 + Math.random() * 900000)
      .toString()
      .slice(0, length);
  }
}
