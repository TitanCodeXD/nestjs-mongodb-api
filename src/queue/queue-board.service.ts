import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

@Injectable()
export class QueueBoardService {
  private readonly serverAdapter: ExpressAdapter;

  constructor(
    @InjectQueue('verify-email')
    private readonly emailQueue: Queue,
  ) {
    this.serverAdapter = new ExpressAdapter();

    this.serverAdapter.setBasePath('/admin/queues');

    createBullBoard({
      queues: [new BullMQAdapter(this.emailQueue)],
      serverAdapter: this.serverAdapter,
    });
  }

  getRouter() {
    return this.serverAdapter.getRouter();
  }
}
