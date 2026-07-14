import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LogActivityParams {
  actorName: string;
  action: string; // 'created' | 'updated' | 'deleted' | 'logged in' | 'made public' | etc.
  entityType: string; // 'Product' | 'Feature' | 'Module' | 'User' | 'Session'
  entityName: string;
  detail?: string;
}

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(private prisma: PrismaService) {}

  // Fire-and-forget-safe: a logging failure must never break the actual action.
  async log(params: LogActivityParams) {
    try {
      await this.prisma.activity.create({ data: params });
    } catch (err) {
      this.logger.warn(`Failed to record activity: ${(err as Error).message}`);
    }
  }

  findRecent(limit = 50) {
    return this.prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 300),
    });
  }
}
