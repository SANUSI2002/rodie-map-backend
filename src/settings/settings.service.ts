import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const GLOBAL_ID = 'global';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    const existing = await this.prisma.appSettings.findUnique({ where: { id: GLOBAL_ID } });
    if (existing) return existing;
    return this.prisma.appSettings.create({ data: { id: GLOBAL_ID } });
  }

  async update(dto: UpdateSettingsDto) {
    return this.prisma.appSettings.upsert({
      where: { id: GLOBAL_ID },
      create: { id: GLOBAL_ID, ...dto },
      update: dto,
    });
  }
}
