import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateVoucherDto {
  @IsString()
  code!: string;

  @IsIn(['percentage', 'fixed_amount'])
  type!: 'percentage' | 'fixed_amount';

  @IsNumber()
  @Min(0)
  value!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;
}
