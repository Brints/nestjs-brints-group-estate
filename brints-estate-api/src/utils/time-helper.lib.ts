export class TimeHelper {
  constructor() {}

  public setExpiryDate(timeOfDay: string, hours: number): Date {
    const date = new Date();
    if (timeOfDay === 'hours' || timeOfDay === 'hour') {
      date.setHours(date.getHours() + hours);
    } else if (timeOfDay === 'minutes' || timeOfDay === 'minute') {
      date.setMinutes(date.getMinutes() + hours);
    }
    return date;
  }

  public getTimeLeft1(expiryDate: Date | null): string | null {
    if (!expiryDate) return null;

    const currentDate = new Date();
    const timeLeft = expiryDate.getTime() - currentDate.getTime();
    const hours = Math.ceil(timeLeft / 1000 / 60 / 60);
    console.log('hours', hours);
    const minutes = Math.ceil(timeLeft / 1000 / 60) - hours * 60;
    console.log('minutes', minutes);
    const seconds = Math.ceil(timeLeft / 1000) - minutes * 60;
    console.log('seconds', seconds);

    if (hours) return hours === 1 ? `${hours} hour` : `${hours} hours`;
    if (minutes)
      return minutes > 1 ? `${minutes} minutes` : `${minutes} minute`;
    return seconds > 1 ? `${seconds} seconds` : `${seconds} second`;
  }

  public getTimeLeft(expiryDate: Date | null, format: string): string | null {
    if (!expiryDate) return null;

    const currentDate = new Date();
    const expiration = new Date(expiryDate);
    let output = '';

    const timeLeft = expiration.getTime() - currentDate.getTime();

    if (format === 'minutes' || format === 'minute') {
      output =
        timeLeft < 2 ? '1 minute' : Math.ceil(timeLeft / 60000) + ' minutes';
    } else if (format === 'hours' || format === 'hour') {
      output =
        timeLeft < 2 ? '1 hour' : Math.ceil(timeLeft / 3600000) + ' hours';
    } else if (format === 'days') {
      output =
        timeLeft < 2 ? '1 day' : Math.ceil(timeLeft / 86400000) + ' days';
    } else if (format === 'months') {
      output =
        timeLeft < 2 ? '1 month' : Math.ceil(timeLeft / 2628000000) + ' months';
    } else if (format === 'years') {
      output =
        timeLeft < 2 ? '1 year' : Math.ceil(timeLeft / 31540000000) + ' years';
    } else {
      output = 'Invalid format';
    }

    return output;
  }
}
