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

  public getTimeLeft(expiryDate: Date | null): string | null {
    if (!expiryDate) return null;

    const currentDate = new Date();
    const timeLeft = expiryDate.getTime() - currentDate.getTime();
    const hours = Math.floor(timeLeft / 1000 / 60 / 60);
    const minutes = Math.floor(timeLeft / 1000 / 60) - hours * 60;
    const seconds = Math.floor(timeLeft / 1000) - minutes * 60;

    if (hours) return `${hours} hours`;
    if (minutes) return `${minutes} minutes`;
    return `${seconds} seconds`;
  }
}
