import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('dashboard')
@UseGuards(RolesGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  getStats(
    @Query('product') product?: string,
    @Query('period') period?: 'month' | 'quarter' | 'year',
  ) {
    return this.dashboardService.getStats(product, period);
  }
}
