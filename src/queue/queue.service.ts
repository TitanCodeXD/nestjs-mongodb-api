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
  async addTestJob() {
    return this.emailQueue.add('verify-email-test', {
      email: 'wesleysantos32892653@gmail.com',
      userId: '123',
    });
  }
}
