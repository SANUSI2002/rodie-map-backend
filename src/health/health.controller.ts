import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { HealthService } from './health.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('health')
@UseGuards(RolesGuard)
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Roles(Role.SUPER_ADMIN)
  @Get()
  check() {
    return this.healthService.check();
  }
}
