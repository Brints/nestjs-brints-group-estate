import * as crypto from 'crypto';

// export function generateVerificationToken() {
//   return crypto.randomBytes(40).toString('hex');
// }

// export function generateOTP(length: number) {
//   return Math.floor(100000 + Math.random() * 900000)
//     .toString()
//     .slice(0, length);
// }

export class GenerateTokenHelper {
  constructor() {}

  public generateVerificationToken() {
    return crypto.randomBytes(40).toString('hex');
  }

  public generateOTP(length: number) {
    return Math.floor(100000 + Math.random() * 900000)
      .toString()
      .slice(0, length);
  }
}
