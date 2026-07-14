import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { FeaturesService } from './features.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { QueryFeatureDto } from './dto/query-feature.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireEditor } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('features')
@UseGuards(RolesGuard)
export class FeaturesController {
  constructor(private featuresService: FeaturesService) {}

  @Get()
  findAll(@Query() query: QueryFeatureDto) {
    return this.featuresService.findAll(query);
  }

  @Get('tree')
  findTree(@Query() query: QueryFeatureDto) {
    return this.featuresService.findTree(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.featuresService.findOne(id);
  }

  @RequireEditor()
  @Post()
  create(@Body() dto: CreateFeatureDto, @CurrentUser() user: { name: string }) {
    return this.featuresService.create(dto, user?.name);
  }

  @RequireEditor()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFeatureDto, @CurrentUser() user: { name: string }) {
    return this.featuresService.update(id, dto, user?.name);
  }

  @RequireEditor()
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { name: string }) {
    return this.featuresService.remove(id, user?.name);
  }
}
