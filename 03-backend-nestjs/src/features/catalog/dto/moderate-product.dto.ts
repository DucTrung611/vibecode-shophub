import { IsIn, IsOptional, IsString } from 'class-validator';

export class ModerateProductDto {
  @IsIn(['approve', 'request_changes', 'remove'])
  action!: 'approve' | 'request_changes' | 'remove';

  @IsOptional()
  @IsString()
  note?: string;
}
