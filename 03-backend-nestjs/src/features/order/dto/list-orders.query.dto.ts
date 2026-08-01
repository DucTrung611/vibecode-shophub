import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsPositive } from 'class-validator';

export class ListOrdersQueryDto {
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

  @IsOptional()
  @IsIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
}
