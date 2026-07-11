import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { FeaturesModule } from '../features/features.module';

@Module({
  imports: [FeaturesModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
