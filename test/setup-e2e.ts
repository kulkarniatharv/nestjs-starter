import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function setup() {
  // Load environment variables from .env.test into process.env, overriding any existing ones
  dotenv.config({ path: path.resolve(__dirname, '../.env.test'), override: true });

  if (!process.env.DATABASE_URL) {
    console.error(
      'ERROR: DATABASE_URL is not set from .env.test. Please ensure the file exists and the variable is defined correctly.',
    );
    throw new Error('DATABASE_URL is not set. Please check your .env.test file.');
  }

  const databaseUrl = process.env.DATABASE_URL;
  console.log(`INFO: DATABASE_URL loaded for Prisma commands: ${databaseUrl}`);
  if (!databaseUrl.includes(':5434/')) {
    console.warn(
      'WARNING: DATABASE_URL does not seem to use port 5434. Ensure .env.test is configured for the host port mapped in docker-compose.test.yml.',
    );
  }

  const currentEnv = { ...process.env };

  console.log('Starting Docker containers for e2e tests...');
  execSync('docker-compose -f docker-compose.test.yml up -d', { stdio: 'inherit' });
  console.log('Docker containers started.');

  console.log('Waiting for database to be ready (25s)...');
  await new Promise((resolve) => setTimeout(resolve, 25000)); // Increased wait time

  console.log('Resetting test database and applying migrations...');
  try {
    execSync(`DATABASE_URL="${databaseUrl}" pnpm exec prisma migrate reset --force`, {
      stdio: 'inherit',
      env: currentEnv,
    });
    console.log('Database reset and migrations applied.');
  } catch (error) {
    console.error(
      'Failed to reset database. Check connection details (port 5434 for host), DB server logs, and .env.test content.',
      error,
    );
    throw error;
  }

  console.log('Generating Prisma client...');
  try {
    execSync(`DATABASE_URL="${databaseUrl}" pnpm exec prisma generate`, {
      stdio: 'inherit',
      env: currentEnv,
    });
    console.log('Prisma client generated.');
  } catch (error) {
    console.error('Failed to generate Prisma client.', error);
    throw error;
  }
}

function teardown() {
  console.log('Stopping Docker containers and removing volumes...');
  execSync('docker-compose -f docker-compose.test.yml down -v', { stdio: 'inherit' });
  console.log('Docker containers stopped and volumes removed.');
}

export default async () => {
  await setup(); // Call the original setup function
  return async () => {
    await teardown(); // Return the original teardown function to be called by Vitest
  };
};
