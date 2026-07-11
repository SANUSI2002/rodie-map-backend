import { Injectable } from '@nestjs/common';
import { Parser } from 'json2csv';
import { PrismaService } from '../prisma/prisma.service';
import { QueryFeatureDto } from '../features/dto/query-feature.dto';
import { FeaturesService } from '../features/features.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private featuresService: FeaturesService,
  ) {}

  async exportFeaturesCsv(query: QueryFeatureDto): Promise<string> {
    const features = await this.featuresService.findAll(query);

    const rows = features.map((f) => ({
      Product: f.productName,
      Module: f.moduleName || '',
      Feature: f.title,
      Status: f.status,
      Priority: f.priority,
      Progress: `${f.progress}%`,
      Owner: f.owner,
      StartDate: f.startDate ? new Date(f.startDate).toISOString().slice(0, 10) : '',
      EndDate: f.endDate ? new Date(f.endDate).toISOString().slice(0, 10) : '',
      Visibility: f.visibility,
    }));

    const parser = new Parser({
      fields: ['Product', 'Module', 'Feature', 'Status', 'Priority', 'Progress', 'Owner', 'StartDate', 'EndDate', 'Visibility'],
    });
    return parser.parse(rows);
  }
}
