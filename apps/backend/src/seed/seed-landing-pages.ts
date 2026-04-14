import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });
  try {
    const seed = app.get(SeedService);
    await seed.seedLandingPagesOnly();
  } finally {
    try {
      await app.close();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes('Bot is not running!')) {
        throw err;
      }
    }
    // In some environments, non-critical providers can keep the event loop alive.
    // This script is intended to be a one-shot seed command.
    setImmediate(() => process.exit(0));
  }
}

main().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

