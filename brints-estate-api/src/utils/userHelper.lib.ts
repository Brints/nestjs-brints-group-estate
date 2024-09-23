import { HttpStatus } from '@nestjs/common';

import { UserGender } from '../enums/gender.enum';
import { CustomException } from '../exceptions/custom.exception';

export class UserHelper {
  constructor() {}

  public capitalizeFirstLetter(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  public validateCountryCode(countryCode: string): boolean {
    return countryCode.startsWith('+');
  }

  public formatPhoneNumber(countryCode: string, phoneNumber: string): string {
    if (phoneNumber.startsWith('0')) {
      phoneNumber = phoneNumber.slice(1);
    }
    return `+${countryCode}${phoneNumber}`;
  }

  public comparePasswords(password: string, confirm_password: string): void {
    if (password !== confirm_password) {
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'Passwords do not match. Try again.',
      );
    }
  }

  public convertGenderToLowerCase(gender: string): void {
    const tranformed_gender = gender.toLowerCase();
    if (
      tranformed_gender !== UserGender.FEMALE &&
      tranformed_gender !== UserGender.MALE
    )
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        `${tranformed_gender} is not a valid gender`,
      );
  }
}
