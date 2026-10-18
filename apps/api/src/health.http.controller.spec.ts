import { Test } from '@nestjs/testing';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.http.controller.js';

// HealthController takes HealthCheckService by type, with no @Inject token,
// so this fails if Vitest's transform drops decorator metadata.
describe('HealthController', () => {
  it('gets HealthCheckService injected by type', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
    }).compile();

    await expect(moduleRef.get(HealthController).check()).resolves.toMatchObject({ status: 'ok' });
  });
});
