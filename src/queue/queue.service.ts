import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

//verify-email --> Jobs
@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('verify-email')
    private readonly emailQueue: Queue,
  ) {}

  //Jobs de verify-email
  async addVerificationEmailJob(email: string, userId: string, token: string) {
    return this.emailQueue.add('verify-email', {
      email,
      userId,
      token,
    });
  }
}
