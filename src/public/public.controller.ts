import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/roles.decorator';
import { ProductsService } from '../products/products.service';
import { FeaturesService } from '../features/features.service';
import { ModulesService } from '../modules/modules.service';
import { SettingsService } from '../settings/settings.service';
import { QueryFeatureDto } from '../features/dto/query-feature.dto';

@Controller('public')
@Public()
export class PublicController {
  constructor(
    private productsService: ProductsService,
    private featuresService: FeaturesService,
    private modulesService: ModulesService,
    private settingsService: SettingsService,
  ) {}

  @Get('products')
  findProducts() {
    return this.productsService.findAll(true);
  }

  @Get('products/:id')
  findProduct(@Param('id') id: string) {
    return this.productsService.findOne(id, true);
  }

  @Get('modules')
  findModules(@Query('productId') productId?: string) {
    return this.modulesService.findPublic(productId);
  }

  @Get('settings')
  findSettings() {
    return this.settingsService.get();
  }

  @Get('roadmap')
  findRoadmap(@Query() query: QueryFeatureDto) {
    return this.featuresService.findTree({ ...query, publicOnly: 'true' });
  }

  @Get('features')
  findFeatures(@Query() query: QueryFeatureDto) {
    return this.featuresService.findAll({ ...query, publicOnly: 'true' });
  }
}
