import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../shared/types/auth.types';
import { SellerDashboardService } from './seller-dashboard.service';

@Controller({ version: '1' })
export class SellerDashboardController {
  constructor(
    private readonly sellerDashboardService: SellerDashboardService,
  ) {}

  @Roles('seller')
  @Get('shops/me/dashboard')
  getDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.sellerDashboardService.getDashboard(user.id);
  }
}
