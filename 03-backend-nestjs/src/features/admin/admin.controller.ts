import { Controller, Get } from '@nestjs/common';
import { Roles } from '../../shared/decorators/roles.decorator';
import { AdminService } from './admin.service';

@Controller({ version: '1' })
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles('admin')
  @Get('admin/dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Roles('admin')
  @Get('admin/reports/revenue')
  getRevenueReport() {
    return this.adminService.getRevenueReport();
  }
}
