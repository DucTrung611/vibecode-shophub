import {
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateVariantDto {
  @IsString()
  sku!: string;

  @IsObject()
  attributes!: Record<string, string>;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @IsInt()
  @Min(0)
  stockQuantity!: number;
}
