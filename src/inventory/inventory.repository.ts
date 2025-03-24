// src/inventory/inventory.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { SlotResponse } from './inventory.type';

@Injectable()
export class InventoryRepository {
  constructor(private prismaService: PrismaService) {}

  async upsertProduct(productId: number) {
    return this.prismaService.product.upsert({
      where: { id: productId },
      update: {},
      create: { id: productId },
    });
  }

  async upsertSlot(productId: string, slot: any) {
    const standardizedDate = new Date(slot.startDate);
    standardizedDate.setUTCHours(4, 0, 0, 0);
    return this.prismaService.slot.upsert({
      where: { providerSlotId: slot.providerSlotId },
      update: {
        remaining: slot.remaining,
        paxAvailabilities: {
          deleteMany: {},
          create: slot.paxAvailability.map((pax: any) => ({
            type: pax.type,
            name: pax.name,
            description: pax.description,
            price: pax.price,
            min: pax.min,
            max: pax.max,
            remaining: pax.remaining,
          })),
        },
      },
      create: {
        productId: parseInt(productId),
        startDate: standardizedDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        providerSlotId: slot.providerSlotId,
        remaining: slot.remaining,
        paxAvailabilities: {
          create: slot.paxAvailability.map((pax: any) => ({
            type: pax.type,
            name: pax.name,
            description: pax.description,
            price: pax.price,
            min: pax.min,
            max: pax.max,
            remaining: pax.remaining,
          })),
        },
      },
    });
  }

  async getSlotDetailsByProductAndDate(productId: number, date: string) {
    const queryDate = new Date(date);
    queryDate.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    return this.prismaService.slot.findMany({
      where: {
        productId,
        startDate: {
          gte: queryDate,
          lte: endOfDay,
        },
      },
      include: {
        paxAvailabilities: true,
      },
    });
  }

  async getProductDateDetailsForTwoMonths(
    productId: number,
    startDate: string,
    endDate: string,
  ) {
    const queryDate = new Date(startDate);
    queryDate.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(endDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const results = await this.prismaService.slot.findMany({
      where: {
        productId,
        startDate: {
          gte: queryDate,
          lte: endOfDay,
        },
      },
      include: {
        paxAvailabilities: {
          select: {
            id: true,
            price: true,
          },
        },
      },
    });

    const dates = results.flatMap((slot) =>
      slot.paxAvailabilities.map((pax) => ({
        date: slot.startDate,
        price: pax.price,
      })),
    );
    return dates
  }
}
