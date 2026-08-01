import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CheckoutDto {
  @IsInt()
  addressId!: number;

  @IsString()
  paymentMethod!: string;

  @IsOptional()
  @IsString()
  voucherCode?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  cartItemIds!: number[];
}
