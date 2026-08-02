import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateShopStatusDto {
  @IsIn(['approved', 'rejected', 'suspended'])
  status!: 'approved' | 'rejected' | 'suspended';

  // Presence is enforced in ShopService (SHOP_003) only when status === 'rejected',
  // so it stays optional here at the DTO level.
  @IsOptional()
  @IsString()
  @MinLength(3)
  rejectionReason?: string;
}
