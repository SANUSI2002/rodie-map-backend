import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModulesService {
  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {}

  findAll(productId?: string) {
    return this.prisma.module.findMany({
      where: productId ? { productId } : undefined,
      orderBy: { createdAt: 'asc' },
    });
  }

  findPublic(productId?: string) {
    return this.prisma.module.findMany({
      where: {
        product: { visibility: 'PUBLIC' },
        ...(productId && productId !== 'all' ? { productId } : {}),
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const mod = await this.prisma.module.findUnique({ where: { id } });
    if (!mod) throw new NotFoundException('Module not found');
    return mod;
  }

  async create(dto: CreateModuleDto, actorName = 'Someone') {
    const mod = await this.prisma.module.create({ data: dto });
    await this.activityService.log({ actorName, action: 'created', entityType: 'Module', entityName: mod.name });
    return mod;
  }

  async update(id: string, dto: UpdateModuleDto, actorName = 'Someone') {
    await this.findOne(id);
    const mod = await this.prisma.module.update({ where: { id }, data: dto });
    await this.activityService.log({
      actorName,
      action: 'updated',
      entityType: 'Module',
      entityName: mod.name,
      detail: dto.active === false ? 'made inactive' : dto.active === true ? 'made active' : undefined,
    });
    return mod;
  }

  async remove(id: string, actorName = 'Someone') {
    const mod = await this.findOne(id);
    await this.prisma.module.delete({ where: { id } });
    await this.activityService.log({ actorName, action: 'deleted', entityType: 'Module', entityName: mod.name });
    return { success: true };
  }
}
