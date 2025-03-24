import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { ApiClientService } from 'src/api-client/api-client.service';
import { PrismaService } from 'prisma/prisma.service';
import { InventoryRepository } from './inventory.repository';
import { InventoryScheduleServices } from './inventory.schedule.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    ApiClientService,
    PrismaService,
    InventoryRepository,
    InventoryScheduleServices,
  ],
})
export class InventoryModule {}
