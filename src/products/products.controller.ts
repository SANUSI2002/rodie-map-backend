import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireEditor } from '../auth/decorators/roles.decorator';

@Controller('products')
@UseGuards(RolesGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll(false);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id, false);
  }

  @RequireEditor()
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @RequireEditor()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @RequireEditor()
  @Patch(':id/toggle-visibility')
  toggleVisibility(@Param('id') id: string) {
    return this.productsService.toggleVisibility(id);
  }

  @RequireEditor()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
