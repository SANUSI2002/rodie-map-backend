import { Injectable, NotFoundException } from '@nestjs/common';
import { Visibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {}

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

  async create(dto: CreateProductDto, actorName = 'Someone') {
    const product = await this.prisma.product.create({ data: dto });
    await this.activityService.log({
      actorName,
      action: 'created',
      entityType: 'Product',
      entityName: product.name,
    });
    return product;
  }

  async update(id: string, dto: UpdateProductDto, actorName = 'Someone') {
    const before = await this.ensureExists(id);
    const product = await this.prisma.product.update({ where: { id }, data: dto });
    const changedFields: string[] = [];
    if (dto.color && dto.color !== before.color) changedFields.push(`color to ${dto.color}`);
    if (dto.name && dto.name !== before.name) changedFields.push(`name to "${dto.name}"`);
    if (dto.description && dto.description !== before.description) changedFields.push('description');
    await this.activityService.log({
      actorName,
      action: 'updated',
      entityType: 'Product',
      entityName: product.name,
      detail: changedFields.length ? `changed ${changedFields.join(', ')}` : undefined,
    });
    return product;
  }

  async toggleVisibility(id: string, actorName = 'Someone') {
    const product = await this.ensureExists(id);
    const updated = await this.prisma.product.update({
      where: { id },
      data: { visibility: product.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC' },
    });
    await this.activityService.log({
      actorName,
      action: updated.visibility === 'PUBLIC' ? 'made public' : 'made internal',
      entityType: 'Product',
      entityName: updated.name,
    });
    return updated;
  }

  async remove(id: string, actorName = 'Someone') {
    const product = await this.ensureExists(id);
    await this.prisma.product.delete({ where: { id } });
    await this.activityService.log({
      actorName,
      action: 'deleted',
      entityType: 'Product',
      entityName: product.name,
    });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
