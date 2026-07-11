import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  findAll(productId?: string) {
    return this.prisma.module.findMany({
      where: productId ? { productId } : undefined,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const mod = await this.prisma.module.findUnique({ where: { id } });
    if (!mod) throw new NotFoundException('Module not found');
    return mod;
  }

  create(dto: CreateModuleDto) {
    return this.prisma.module.create({ data: dto });
  }

  async update(id: string, dto: UpdateModuleDto) {
    await this.findOne(id);
    return this.prisma.module.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.module.delete({ where: { id } });
    return { success: true };
  }
}
