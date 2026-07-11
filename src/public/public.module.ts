import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { ProductsModule } from '../products/products.module';
import { FeaturesModule } from '../features/features.module';

@Module({
  imports: [ProductsModule, FeaturesModule],
  controllers: [PublicController],
})
export class PublicModule {}
