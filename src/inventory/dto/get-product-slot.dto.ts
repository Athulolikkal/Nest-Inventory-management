import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsEnum
} from 'class-validator';

enum JobName {
  Fetch7Days = 'fetch7Days',
  Fetch30Days = 'fetch30Days',
  FetchToday = 'fetchToday',
}
export class GetProductSlotsDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class ControlSchedulesDto {
  @IsEnum(JobName, { message: 'jobName must be one of: fetch7Days, fetch30Days, fetchToday' })
  jobName: 'fetch7Days' | 'fetch30Days' | 'fetchToday';
}
