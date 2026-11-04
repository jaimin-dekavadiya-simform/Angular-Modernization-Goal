import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { AppConfig } from '../config/configuration';
import { sleep } from './sleep';

/**
 * Practice toggles, active only when CHAOS_ENABLED=true:
 *   ?delay=2000      wait 2s before handling (max 10s)
 *   ?fail=500        always respond with that status
 *   ?failRate=0.3    fail ~30% of requests with a 503 (for retry practice)
 */
@Injectable()
export class ChaosInterceptor implements NestInterceptor {
  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    if (
      this.config.get('chaosEnabled', { infer: true }) &&
      context.getType() === 'http'
    ) {
      const query =
        context.switchToHttp().getRequest<{ query?: Record<string, string> }>()
          .query ?? {};

      const delay = Number(query.delay);
      if (delay > 0) await sleep(Math.min(delay, 10_000));

      const fail = Number(query.fail);
      if (fail >= 400 && fail < 600) {
        throw new HttpException(`Simulated ${fail} error`, fail);
      }

      const failRate = Number(query.failRate);
      if (failRate > 0 && Math.random() < failRate) {
        throw new HttpException('Simulated random failure', 503);
      }
    }
    return next.handle();
  }
}
