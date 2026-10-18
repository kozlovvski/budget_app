import { Module } from '@nestjs/common';
import { OpenApiCommand } from './openapi.cli.js';

@Module({
  providers: [OpenApiCommand],
})
export class CliModule {}
