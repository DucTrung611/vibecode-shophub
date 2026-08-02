import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class ListUsersQueryDto {
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
  @IsIn(['buyer', 'seller', 'admin'])
  role?: 'buyer' | 'seller' | 'admin';

  @IsOptional()
  @IsString()
  search?: string;
}
