import { IsIn, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsIn(['draft', 'active', 'inactive'])
  status?: 'draft' | 'active' | 'inactive';
}
