import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ActivityService } from './activity.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('activity')
@UseGuards(RolesGuard)
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Roles(Role.SUPER_ADMIN)
  @Get()
  findRecent(@Query('limit') limit?: string) {
    return this.activityService.findRecent(limit ? parseInt(limit, 10) : 50);
  }
}
