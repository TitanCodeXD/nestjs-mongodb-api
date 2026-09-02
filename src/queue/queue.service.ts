import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

//verify-email --> Jobs
@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('verify-email')
    //Producer (vulgo fila de jobs)
    private readonly emailQueue: Queue,
  ) {}

  //Jobs de verify-email
  async addVerificationEmailJob(email: string, userId: string, token: string) {
    return this.emailQueue.add(
      'verify-email',
      {
        email,
        userId,
        token,
      },
      {
        removeOnComplete: true, // ao ser executado, remove esse jobda fila para nao acumular jobs
      },
    );
  }

  async addResendVerificationEmailJob(
    email: string,
    userId: string,
    token: string,
  ) {
    return this.emailQueue.add(
      'resend-verify-email',
      {
        email,
        userId,
        token,
      },
      {
        delay: 2 * 60 * 1000, // Inicialmente 2 minutos de delay para fins de teste
        removeOnComplete: true,
      },
    );
  }
}
