import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireEditor } from '../auth/decorators/roles.decorator';

@Controller('modules')
@UseGuards(RolesGuard)
export class ModulesController {
  constructor(private modulesService: ModulesService) {}

  @Get()
  findAll(@Query('productId') productId?: string) {
    return this.modulesService.findAll(productId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @RequireEditor()
  @Post()
  create(@Body() dto: CreateModuleDto) {
    return this.modulesService.create(dto);
  }

  @RequireEditor()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateModuleDto) {
    return this.modulesService.update(id, dto);
  }

  @RequireEditor()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.modulesService.remove(id);
  }
}
