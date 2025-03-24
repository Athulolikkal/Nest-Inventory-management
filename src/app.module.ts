import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventoryModule } from './inventory/inventory.module';
import { ApiClientService } from './api-client/api-client.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [AppService, ApiClientService, PrismaService],
})
export class AppModule {}
