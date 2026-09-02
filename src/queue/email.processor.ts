import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailService } from './email.service';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
@Processor('verify-email')
export class EmailProcessor extends WorkerHost {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job) {
    //Job é o de verificar email apos criar conta? entao faça isso
    switch (job.name) {
      case 'verify-email':
        await this.emailService.sendVerificationEmail(
          job.data.email,
          job.data.token,
        );

        break;
      //Job é o de reenviar email após X minutos de conta? então faça isso
      case 'resend-verify-email':
        const user = await this.userModel.findById(job.data.userId);

        if (!user) {
          return;
        }

        if (user.emailVerified === false) {
          await this.emailService.sendVerificationEmail(
            job.data.email,
            job.data.token,
          );
        }

        break;

      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }
}
