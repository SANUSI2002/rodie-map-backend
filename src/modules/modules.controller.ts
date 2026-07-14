import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireEditor } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

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
  create(@Body() dto: CreateModuleDto, @CurrentUser() user: { name: string }) {
    return this.modulesService.create(dto, user?.name);
  }

  @RequireEditor()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateModuleDto, @CurrentUser() user: { name: string }) {
    return this.modulesService.update(id, dto, user?.name);
  }

  @RequireEditor()
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { name: string }) {
    return this.modulesService.remove(id, user?.name);
  }
}
