import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, Visibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { QueryFeatureDto } from './dto/query-feature.dto';

@Injectable()
export class FeaturesService {
  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {}

  private buildWhere(query: QueryFeatureDto): Prisma.FeatureWhereInput {
    const where: Prisma.FeatureWhereInput = {};

    if (query.productId) where.productId = query.productId;
    if (query.moduleId) where.moduleId = query.moduleId;

    if (query.publicOnly === 'true') {
      where.visibility = Visibility.PUBLIC;
      where.product = { visibility: Visibility.PUBLIC };
    } else if (query.visibility) {
      const values = query.visibility.split(',').filter(Boolean);
      if (values.length) where.visibility = { in: values as Visibility[] };
    }

    if (query.status) {
      const values = query.status.split(',').filter(Boolean);
      if (values.length) where.status = { in: values as any };
    }

    if (query.priority) {
      const values = query.priority.split(',').map(Number).filter((n) => !isNaN(n));
      if (values.length) where.priority = { in: values };
    }

    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }

    return where;
  }

  // Flat list, with product/module names attached - equivalent to getAllFeatures()
  async findAll(query: QueryFeatureDto) {
    const features = await this.prisma.feature.findMany({
      where: this.buildWhere(query),
      include: { product: { select: { name: true, color: true } }, module: { select: { name: true } } },
      orderBy: { startDate: 'asc' },
    });
    return features.map((f) => ({
      ...f,
      productName: f.product?.name,
      productColor: f.product?.color,
      moduleName: f.module?.name,
    }));
  }

  // Nested tree grouped by product -> module -> feature -> children.
  // Mirrors getBoardGroups()/buildTree()/flattenTree() in the prototype.
  async findTree(query: QueryFeatureDto) {
    const flat = await this.findAll(query);
    const byId = new Map(flat.map((f) => [f.id, { ...f, children: [] as any[] }]));
    const roots: any[] = [];

    for (const f of byId.values()) {
      if (f.parentId && byId.has(f.parentId)) {
        byId.get(f.parentId)!.children.push(f);
      } else if (!f.parentId) {
        roots.push(f);
      }
    }

    // Group roots by product, then by module.
    const grouped: Record<string, any> = {};
    for (const f of roots) {
      grouped[f.productId] = grouped[f.productId] || { productId: f.productId, productName: f.productName, modules: {} };
      const modKey = f.moduleId || 'none';
      grouped[f.productId].modules[modKey] = grouped[f.productId].modules[modKey] || {
        moduleId: f.moduleId,
        moduleName: f.moduleName || 'No module',
        features: [],
      };
      grouped[f.productId].modules[modKey].features.push(f);
    }

    return Object.values(grouped).map((g: any) => ({
      ...g,
      modules: Object.values(g.modules),
    }));
  }

  async findOne(id: string) {
    const feature = await this.prisma.feature.findUnique({
      where: { id },
      include: { children: true, product: true, module: true },
    });
    if (!feature) throw new NotFoundException('Feature not found');
    return feature;
  }

  private async assertParentNotCancelled(parentId?: string | null) {
    if (!parentId) return;
    const parent = await this.prisma.feature.findUnique({ where: { id: parentId } });
    if (parent && parent.status === 'CANCELLED') {
      throw new BadRequestException('Cannot add a sub-feature under a cancelled feature');
    }
  }

  async create(dto: CreateFeatureDto, actorName = 'Someone') {
    await this.assertParentNotCancelled(dto.parentId);
    const feature = await this.prisma.feature.create({
      data: {
        ...dto,
        status: dto.status || 'NO_STATUS',
        progress: dto.progress ?? 0,
        priority: dto.priority ?? 3,
        owner: dto.owner || 'Unassigned',
        visibility: dto.visibility || 'PRIVATE',
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        relaunchDate: dto.relaunchDate ? new Date(dto.relaunchDate) : undefined,
        releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : undefined,
      },
    });
    await this.activityService.log({ actorName, action: 'created', entityType: 'Feature', entityName: feature.title });
    return feature;
  }

  async update(id: string, dto: UpdateFeatureDto, actorName = 'Someone') {
    const before = await this.findOne(id);
    if (dto.parentId) await this.assertParentNotCancelled(dto.parentId);
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    if (dto.relaunchDate) data.relaunchDate = new Date(dto.relaunchDate);
    if (dto.releaseDate) data.releaseDate = new Date(dto.releaseDate);
    // Auto-fill progress to 100 when marked RELEASED, matching prototype's onFeatureStatusChange().
    if (dto.status === 'RELEASED' && dto.progress === undefined) data.progress = 100;
    const feature = await this.prisma.feature.update({ where: { id }, data });
    const detail = dto.status && dto.status !== before.status ? `status changed to ${dto.status}` : undefined;
    await this.activityService.log({ actorName, action: 'updated', entityType: 'Feature', entityName: feature.title, detail });
    return feature;
  }

  async remove(id: string, actorName = 'Someone') {
    const feature = await this.findOne(id);
    // Children cascade-delete via the Prisma relation.
    await this.prisma.feature.delete({ where: { id } });
    await this.activityService.log({ actorName, action: 'deleted', entityType: 'Feature', entityName: feature.title });
    return { success: true };
  }
}
