import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ControlSchedulesDto, GetProductSlotsDto } from './dto/get-product-slot.dto';
import { InventoryScheduleServices } from './inventory.schedule.service';

@Controller('experience')
export class InventoryController {
  constructor(
    private inventoryServices: InventoryService,
    private inventoryScheduleService: InventoryScheduleServices,
  ) {}
  //Api created for fetching the details of the next two months
  @Get('/sync-db')
  async synToDb() {
    return this.inventoryServices.addInventoryOfTwoMonths();
  }

  //fetching slot details api
  @Get('/:id/slots')
  async getProductSlotsByDate(
    @Query() query: GetProductSlotsDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const { date } = query;
    return this.inventoryServices.getProductSlotDetails(id, date);
  }

  //finding available dates using product id
  @Get('/:id/dates')
  async getAvailableSlots(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryServices.getAllAvailableDatesOfProduct(id);
  }

  //apis for handling the scheduled tasks
  @Post('/schedule/pause')
  pauseInventorySync(@Body() body: ControlSchedulesDto) {
    console.log(body,"body is this")
    if (!body?.jobName) {
      throw new BadRequestException('jobName is required');
    }
    this.inventoryScheduleService.pauseSync(body?.jobName);
    return { message: `Inventory sync paused for ${body?.jobName}` };
  }

  @Post('/schedule/resume')
  resumeInventorySync(@Body() body: ControlSchedulesDto) {
    if (!body.jobName) {
      throw new BadRequestException('jobName is required');
    }
    this.inventoryScheduleService.resumeSync(body.jobName);
    return { message: `Inventory sync resumed for ${body.jobName}` };
  }

  @Get('/schedule/status/:jobName')
  getJobStatus(@Param('jobName') jobName: string) {
    const isRunning = this.inventoryScheduleService.isJobRunning(jobName);
    return { [jobName]: isRunning ? 'running' : 'paused' };
  }
}
