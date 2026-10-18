import { INestApplication, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.http.controller.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TerminusModule],
  controllers: [HealthController],
})
export class AppModule {}

// Shared by main.ts, the OpenAPI export and e2e tests so routes match everywhere.
export function configureApp(app: INestApplication) {
  app.setGlobalPrefix('api');
}
