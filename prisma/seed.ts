import { PrismaClient, User } from '@prisma/client';
import pino from 'pino';

const prisma = new PrismaClient();

function getLogger() {
  if (process.env.NODE_ENV !== 'production') {
    return pino({
      name: 'prisma-seed',
      level: 'debug',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: false,
          errorLikeObjectKeys: ['err', 'error'],
        },
      },
    });
  }
  return pino({ name: 'prisma-seed', level: 'info' });
}

const logger = getLogger();

interface SeedUser {
  id: string; // Clerk User ID
  email: string;
  firstName: string;
  lastName: string;
}

function getSeedUsers(): SeedUser[] {
  return [
    {
      id: 'clerk-seed-user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    },
    // Add more users here as needed
    // Note: These users should correspond to actual Clerk users
  ];
}

async function createUserIfNotExists(user: SeedUser): Promise<User | null> {
  const existing = await prisma.user.findUnique({ where: { email: user.email } });
  if (existing) {
    logger.info({ email: user.email }, 'User already exists');
    return null;
  }
  const created = await prisma.user.create({
    data: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: false,
    },
  });
  logger.info({ email: user.email }, 'Seeded user');
  return created;
}

async function seedUsers(users: SeedUser[]): Promise<void> {
  for (const user of users) {
    try {
      await createUserIfNotExists(user);
    } catch (err: unknown) {
      logger.error(
        { err: err instanceof Error ? err.message : String(err), email: user.email },
        'Failed to seed user',
      );
    }
  }
}

async function main() {
  const users = getSeedUsers();
  await seedUsers(users);
}

main()
  .catch((e: unknown) => {
    logger.error({ err: e instanceof Error ? e.message : String(e) }, 'Seeding failed');
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
