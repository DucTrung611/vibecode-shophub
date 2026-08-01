import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn(['confirmed', 'shipped', 'delivered', 'cancelled'])
  status!: 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  carrier?: string;
}
