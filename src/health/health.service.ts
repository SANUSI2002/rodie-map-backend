import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RecordedError {
  timestamp: string;
  method?: string;
  path?: string;
  status: number;
  message: string;
}

@Injectable()
export class HealthService {
  private errors: RecordedError[] = [];
  private readonly maxErrors = 30;
  private readonly startedAt = Date.now();

  constructor(private prisma: PrismaService) {}

  recordError(err: RecordedError) {
    this.errors.unshift(err);
    if (this.errors.length > this.maxErrors) this.errors.length = this.maxErrors;
  }

  getRecentErrors() {
    return this.errors;
  }

  async check() {
    const start = Date.now();
    let dbOk = true;
    let dbError: string | undefined;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      dbOk = false;
      dbError = (err as Error).message;
    }
    const dbLatencyMs = Date.now() - start;

    return {
      status: dbOk ? 'ok' : 'degraded',
      database: { connected: dbOk, latencyMs: dbLatencyMs, error: dbError },
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
      timestamp: new Date().toISOString(),
      recentErrors: this.errors,
    };
  }
}
