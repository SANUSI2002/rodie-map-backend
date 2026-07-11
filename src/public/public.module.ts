import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { ProductsModule } from '../products/products.module';
import { FeaturesModule } from '../features/features.module';
import { ModulesModule } from '../modules/modules.module';

@Module({
  imports: [ProductsModule, FeaturesModule, ModulesModule],
  controllers: [PublicController],
})
export class PublicModule {}
