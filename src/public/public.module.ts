import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { ProductsModule } from '../products/products.module';
import { FeaturesModule } from '../features/features.module';
import { ModulesModule } from '../modules/modules.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [ProductsModule, FeaturesModule, ModulesModule, SettingsModule],
  controllers: [PublicController],
})
export class PublicModule {}
