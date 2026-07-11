import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { QueryFeatureDto } from '../features/dto/query-feature.dto';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('reports')
@UseGuards(RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('features.csv')
  async exportFeatures(@Query() query: QueryFeatureDto, @Res() res: Response) {
    const csv = await this.reportsService.exportFeaturesCsv(query);
    res.header('Content-Type', 'text/csv');
    res.attachment('roadimap-features.csv');
    res.send(csv);
  }
}
