import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  recipientName!: string;

  @IsString()
  phone!: string;

  @IsString()
  province!: string;

  @IsString()
  district!: string;

  @IsString()
  ward!: string;

  @IsString()
  detailAddress!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
