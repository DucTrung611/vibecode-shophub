import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  ward?: string;

  @IsOptional()
  @IsString()
  detailAddress?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
