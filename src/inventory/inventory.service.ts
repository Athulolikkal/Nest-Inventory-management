import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiClientService } from '../api-client/api-client.service';
import * as moment from 'moment';
import { InventoryRepository } from './inventory.repository';
import pLimit from 'p-limit';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class InventoryService {
  constructor(
    private apiClientService: ApiClientService,
    private inventoryRepository: InventoryRepository,
  ) {}

  async getProductSlotDetails(
    productId: number,
    date: string = moment().format('YYYY-MM-DD'),
  ) {
    try {
      if (!productId) {
        throw new BadRequestException('Product ID is required');
      }
      const slotDetails =
        await this.inventoryRepository.getSlotDetailsByProductAndDate(
          productId,
          date,
        );
      if (!Array.isArray(slotDetails) || slotDetails.length === 0) {
        throw new BadRequestException(
          'No slots available for this product and date',
        );
      }
      return slotDetails;
    } catch (err) {
      console.log(err, 'ERROR');
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
  //Finding available dates of a product for 2 months
  async getAllAvailableDatesOfProduct(productId: number) {
    try {
      const currentDate: string = moment().format('YYYY-MM-DD');
      const endDate: string = moment().add(2, 'months').format('YYYY-MM-DD');
      const availableDates =
        await this.inventoryRepository.getProductDateDetailsForTwoMonths(
          productId,
          currentDate,
          endDate,
        );
      if (!Array.isArray(availableDates) || availableDates.length === 0) {
        throw new BadRequestException(
          'No slots are available for this product from the current date up to two months ahead.',
        );
      }
      return { dates: availableDates };
    } catch (err) {
      console.log(err, 'Error is this');
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
  //finding the details from api
  async fetchSlotsFromApiClient(
    productId: string,
    date: string = moment().format('YYYY-MM-DD'),
  ) {
    try {
      const slotResponse: any = await this.apiClientService
        .apiRequest()
        .get(`/inventory/${productId}?date=${date}`);

      if (!slotResponse || slotResponse?.status !== 200) {
        throw new HttpException(
          'Failed to fetch slots from external API',
          HttpStatus.BAD_GATEWAY,
        );
      }
      return slotResponse?.data || [];
    } catch (err) {
      console.error(
        `Error fetching slots for product ${productId} on ${date}:`,
        err,
      );
      throw new HttpException(
        err?.response?.data?.message || 'Error fetching slots from API',
        err?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //Adding slot and slots pax details
  async syncSlotToDb(productId: string, slot: any) {
    try {
      return await this.inventoryRepository.upsertSlot(productId, slot);
    } catch (error) {
      console.error(`Failed to sync slot ${slot.providerSlotId}:`, error);
      throw new HttpException(
        `Error syncing slot: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addInventoryOfTwoMonths() {
    const productIds = [14, 15];
    const currentDate = moment().startOf('day');
    const endDate = moment().add(2, 'months').endOf('day');
    //Limit concurrency to 5,ensuring the limit is never exceeded.
    const limit = pLimit(5);
    await Promise.all(
      productIds.map((productId) =>
        this.inventoryRepository.upsertProduct(productId),
      ),
    );

    const dates: string[] = [];
    for (
      let date = currentDate.clone();
      date.isSameOrBefore(endDate);
      date.add(1, 'day')
    ) {
      dates.push(date.format('YYYY-MM-DD'));
    }

    const syncPromises = productIds.flatMap((productId) =>
      dates.map((date) =>
        limit(() =>
          this.fetchSlotsFromApiClient(productId.toString(), date)
            .then((slots) =>
              Promise.all(
                slots.map((slot) =>
                  this.syncSlotToDb(productId.toString(), slot),
                ),
              ),
            )
            .catch((err) => {
              console.error(
                `Error syncing product ${productId} for date ${date}:`,
                err,
              );
              return [];
            }),
        ),
      ),
    );

    await Promise.all(syncPromises);
  }
}
