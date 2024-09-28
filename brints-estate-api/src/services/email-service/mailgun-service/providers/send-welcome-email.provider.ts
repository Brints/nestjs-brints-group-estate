import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SendWelcomeEmailProvider {
  constructor(private readonly mailerService: MailerService) {}

  public async sendWelcomeEmail(user: User): Promise<void> {
    const subject = 'Welcome to Brints Group Estate Service';
    const fullname = `${user.first_name} ${user.last_name}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: 'Onboarding Team <support@brintsgroup.live>',
      subject,
      template: './welcome-email',
      context: {
        fullname,
        email: user.email,
        login_url: `http://localhost:3001/api/users/login`,
      },
    });
  }
}
