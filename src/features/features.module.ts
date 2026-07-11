import { Module } from '@nestjs/common';
import { FeaturesService } from './features.service';
import { FeaturesController } from './features.controller';

@Module({
  providers: [FeaturesService],
  controllers: [FeaturesController],
  exports: [FeaturesService],
})
export class FeaturesModule {}
