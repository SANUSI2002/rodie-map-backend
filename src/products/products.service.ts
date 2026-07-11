import { Injectable, NotFoundException } from '@nestjs/common';
import { Visibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private withProgress(product: any) {
    const feats = product.features || [];
    const avg = feats.length
      ? Math.round(feats.reduce((s: number, f: any) => s + f.progress, 0) / feats.length)
      : 0;
    const { features, ...rest } = product;
    return { ...rest, featureCount: feats.length, avgProgress: avg };
  }

  async findAll(publicOnly = false) {
    const products = await this.prisma.product.findMany({
      where: publicOnly ? { visibility: Visibility.PUBLIC } : undefined,
      include: { features: { select: { progress: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return products.map((p) => this.withProgress(p));
  }

  async findOne(id: string, publicOnly = false) {
    const product = await this.prisma.product.findFirst({
      where: { id, ...(publicOnly ? { visibility: Visibility.PUBLIC } : {}) },
      include: { features: { select: { progress: true } }, modules: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return this.withProgress(product);
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.ensureExists(id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async toggleVisibility(id: string) {
    const product = await this.ensureExists(id);
    return this.prisma.product.update({
      where: { id },
      data: { visibility: product.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC' },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
