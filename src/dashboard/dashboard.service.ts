import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(productId?: string, period: 'month' | 'quarter' | 'year' = 'year') {
    const where: any = productId && productId !== 'all' ? { productId } : {};

    const now = new Date();
    if (period === 'month') {
      where.startDate = { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
    } else if (period === 'quarter') {
      const q = Math.floor(now.getMonth() / 3);
      where.startDate = { gte: new Date(now.getFullYear(), q * 3, 1) };
    } else {
      where.startDate = { gte: new Date(now.getFullYear(), 0, 1) };
    }

    const features = await this.prisma.feature.findMany({
      where,
      include: { product: { select: { name: true, color: true } } },
    });

    const total = features.length;
    const byStatus: Record<string, number> = {};
    const byPriority: Record<number, number> = {};
    let progressSum = 0;

    for (const f of features) {
      byStatus[f.status] = (byStatus[f.status] || 0) + 1;
      byPriority[f.priority] = (byPriority[f.priority] || 0) + 1;
      progressSum += f.progress;
    }

    const avgProgress = total ? Math.round(progressSum / total) : 0;
    const released = byStatus['RELEASED'] || 0;
    const delayed = byStatus['DELAYED'] || 0;
    const inProgress = byStatus['IN_PROGRESS'] || 0;

    const productBreakdown = await this.prisma.product.findMany({
      where: productId && productId !== 'all' ? { id: productId } : undefined,
      include: { features: { select: { progress: true, status: true } } },
    });

    const perProduct = productBreakdown.map((p) => {
      const feats = p.features;
      const avg = feats.length ? Math.round(feats.reduce((s, f) => s + f.progress, 0) / feats.length) : 0;
      return {
        id: p.id,
        name: p.name,
        color: p.color,
        featureCount: feats.length,
        avgProgress: avg,
        released: feats.filter((f) => f.status === 'RELEASED').length,
        delayed: feats.filter((f) => f.status === 'DELAYED').length,
      };
    });

    return {
      period,
      total,
      avgProgress,
      released,
      delayed,
      inProgress,
      byStatus,
      byPriority,
      products: perProduct,
    };
  }
}
