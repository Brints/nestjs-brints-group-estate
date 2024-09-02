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
    return `${countryCode}${phoneNumber}`;
  }
}
