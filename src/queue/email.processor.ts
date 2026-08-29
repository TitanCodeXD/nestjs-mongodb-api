import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailService } from './email.service';

@Processor('verify-email')
export class EmailProcessor extends WorkerHost {
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job) {
    console.log('Job recebido:', job.data);

    await this.emailService.sendVerificationEmail(
      job.data.email,
      job.data.token,
    );

    console.log('Email enviado com sucesso!');
  }
}
