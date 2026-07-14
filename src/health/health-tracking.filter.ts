import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { HealthService } from './health.service';

@Catch()
export class HealthTrackingFilter implements ExceptionFilter {
  constructor(private healthService: HealthService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const body = exception instanceof HttpException
      ? exception.getResponse()
      : { statusCode: 500, message: 'Internal server error' };

    const message =
      typeof body === 'string' ? body : (body as any)?.message || JSON.stringify(body);

    // Only record real problems (5xx) so the health tab isn't flooded with routine
    // validation errors (bad login attempts, missing fields, etc.).
    if (status >= 500) {
      this.healthService.recordError({
        timestamp: new Date().toISOString(),
        method: request?.method,
        path: request?.url,
        status,
        message: Array.isArray(message) ? message.join(', ') : String(message),
      });
    }

    response.status(status).json(typeof body === 'object' ? body : { statusCode: status, message: body });
  }
}
