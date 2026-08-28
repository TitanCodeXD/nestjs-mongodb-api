import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('verify-email')
export class EmailProcessor extends WorkerHost {
  async process(job: Job) {
    console.log('Job recebido:', job.data);

    return {
      message: 'Job processed successfully',
    };
  }
}
