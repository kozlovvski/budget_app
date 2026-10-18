import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks([], { useProcessExit: true });
  // shortcut: nothing holds the event loop open yet; remove once BullMQ workers do.
  setInterval(() => {}, 2 ** 30);
  new Logger('Worker').log('Worker started');
}
await bootstrap();
