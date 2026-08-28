import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('verify-email')
    private readonly emailQueue: Queue,
  ) {}

  async addTestJob() {
    return this.emailQueue.add('verify-email-test', {
      email: 'teste@example.com',
      userId: '123',
    });
  }
}
