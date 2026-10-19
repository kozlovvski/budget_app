import { CommandFactory } from 'nest-commander';
import { CliModule } from './cli.module.js';

await CommandFactory.run(CliModule, ['error', 'warn']);
