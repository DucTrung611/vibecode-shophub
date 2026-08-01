import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class ListNotificationsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit: number = 20;
}
