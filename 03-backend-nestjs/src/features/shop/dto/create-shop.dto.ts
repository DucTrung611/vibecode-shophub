import { IsString, MinLength } from 'class-validator';

export class CreateShopDto {
  @IsString()
  @MinLength(2)
  name!: string;
}
