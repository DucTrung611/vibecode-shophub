import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class ListProductsQueryDto {
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
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  shopId?: number;

  @IsOptional()
  @IsIn(['draft', 'active', 'inactive'])
  status?: 'draft' | 'active' | 'inactive';

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsIn(['createdAt', 'soldCount', 'ratingAvg'])
  sortBy: 'createdAt' | 'soldCount' | 'ratingAvg' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';
}
