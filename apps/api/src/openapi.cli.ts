import { writeFile } from 'node:fs/promises';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Command, CommandRunner } from 'nest-commander';
import { AppModule, configureApp } from './app.module.js';

@Command({ name: 'openapi', description: 'Write the OpenAPI document to openapi.json' })
export class OpenApiCommand extends CommandRunner {
  async run(): Promise<void> {
    const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
    configureApp(app);
    const config = new DocumentBuilder().setTitle('Budget API').build();
    const document = SwaggerModule.createDocument(app, config);
    await writeFile('openapi.json', `${JSON.stringify(document, null, 2)}\n`);
    await app.close();
  }
}
