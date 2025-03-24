import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import pLimit from 'p-limit';
import { InventoryRepository } from './inventory.repository';

@Injectable()
export class InventoryScheduleServices {
  private readonly productIds = [14, 15];
//Limit concurrency to 5,ensuring the limit is never exceeded.
  limit = pLimit(5);
  constructor(
    private readonly inventoryRepo: InventoryRepository,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}
  // Schedule services
  private async fetchAvailabilityForRange(startDate: string, endDate: string) {
    const fetchAvailabilityPromises = this.productIds.map((productId) =>
      this.limit(() =>
        this.inventoryRepo.getProductDateDetailsForTwoMonths(
          productId,
          startDate,
          endDate,
        ),
      ),
    );
    return Promise.all(fetchAvailabilityPromises);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'fetch30Days' })
  async fetchAvailabilityEveryDayFor30Days() {
    try {
      const today = new Date();
      const thirtyDaysLater = new Date(today);
      thirtyDaysLater.setDate(today.getDate() + 30);
      const startDate = today.toISOString().split('T')[0];
      const endDate = thirtyDaysLater.toISOString().split('T')[0];
      const inventories = await this.fetchAvailabilityForRange(
        startDate,
        endDate,
      );
      console.log('30-day availability fetched:', inventories);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Cron('0 */4 * * *', { name: 'fetch7Days' })
  async fetchAvailabilityEveryFourHours() {
    try {
      const today = new Date();
      const sevenDaysLater = new Date(today);
      sevenDaysLater.setDate(today.getDate() + 7);

      const startDate = today.toISOString().split('T')[0];
      const endDate = sevenDaysLater.toISOString().split('T')[0];

      const inventories = await this.fetchAvailabilityForRange(
        startDate,
        endDate,
      );
      console.log('7-day availability fetched:', inventories);
      // Add logic to process or store inventories
    } catch (err) {
      console.error('Error fetching 7-day availability:', err);
    }
  }

  //   @Cron('*/15 * * * *', { name: 'fetchToday' })
  @Cron('*/1 * * * *', { name: 'fetchToday' })
  async fetchAvailabilityEveryFifteenMinutes() {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const inventories = await this.fetchAvailabilityForRange(
        todayStr,
        todayStr,
      );
      console.log('Today’s availability fetched:', inventories);
    } catch (err) {
      console.error('Error fetching today’s availability:', err);
    }
  }
  // For pausing the cron job
  pauseSync(jobName: string) {
    const job = this.schedulerRegistry.getCronJob(jobName);
    if (!job) {
      throw new Error(`Unknown job name: ${jobName}`);
    }
    job.stop();
    console.log(`Inventory sync stopped for job: ${jobName}`);
  }

  //For Resume a cron job
  resumeSync(jobName: string) {
    const job = this.schedulerRegistry.getCronJob(jobName);
    if (!job) {
      throw new Error(`Unknown job name: ${jobName}`);
    }
    job.start();
    console.log(`Inventory sync resumed for job: ${jobName}`);
  }

  // for checking its running or not
  isJobRunning(jobName: string): boolean {
    const job = this.schedulerRegistry.getCronJob(jobName);
    if (!job) {
      throw new Error(`Unknown job name: ${jobName}`);
    }
    return job.running; 
  }
}
