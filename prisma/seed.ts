import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
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
  email: string;
  password: string;
  name: string;
}

function getSeedUsers(): SeedUser[] {
  return [
    {
      email: 'test@example.com',
      password: 'test123',
      name: 'test',
    },
    // Add more users here as needed
  ];
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function createUserIfNotExists(user: SeedUser): Promise<User | null> {
  const existing = await prisma.user.findUnique({ where: { email: user.email } });
  if (existing) {
    logger.info({ email: user.email }, 'User already exists');
    return null;
  }
  const hashedPassword = await hashPassword(user.password);
  const created = await prisma.user.create({
    data: {
      email: user.email,
      password: hashedPassword,
      name: user.name,
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
