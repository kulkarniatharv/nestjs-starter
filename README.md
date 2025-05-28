# NestJS Starter Project

A production-ready NestJS starter repository for quickly bootstrapping new projects. Clone this repo to kickstart your next backend project with best practices, batteries included, and a clean architecture.

---

## Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) (TypeScript)
- **Database ORM:** [Prisma](https://www.prisma.io/) (default: PostgreSQL)
- **Authentication:** [Clerk](https://clerk.com/) (External authentication service)
- **Validation:** [Zod](https://zod.dev/) (with a custom validation pipe)
- **Testing:** Vitest
- **Package Manager:** pnpm
- **Logger:** Pino

---

## Features

- Modular structure (auth, users, common, prisma)
- Clerk authentication with secure user handling
- Prisma ORM with a default User model (stores Clerk user IDs)
- Zod-based request validation (see `src/common/pipes/zod-validation.pipe.ts`)
- DTOs and interfaces organized by feature
- Path aliases for clean imports (`@/`)
- Pre-configured scripts for development, testing, and production

---

## Rate Limiting (Throttling)

This project uses [@nestjs/throttler](https://docs.nestjs.com/security/rate-limiting) to globally rate-limit requests per IP address. This helps protect your API from abuse and accidental overload.

### How it works
- **Global limit:** By default, each IP address can make up to **60 requests per minute** across all endpoints.
- **Custom per-endpoint limits:** You can override the global limit for specific routes/controllers using the `@Throttle()` decorator.
- **Guards:** The throttling is enforced globally using NestJS's `APP_GUARD` token, so you don't need to add guards manually to each controller.

### Configuration via Environment Variables
You can configure the global rate limit and time window using environment variables:

```env
THROTTLE_TTL=60000         # Time window in milliseconds (default: 60000 = 60 seconds)
THROTTLE_LIMIT=60          # Max requests per IP per window (default: 60)
```

If these variables are not set, the defaults above are used.

### How to change the limits
1. Edit your `.env` file and set `THROTTLE_TTL` and `THROTTLE_LIMIT` as needed.
2. Restart your server for changes to take effect.

### FAQ
- **Q: Is the limit per endpoint or global?**
  - A: The default is global per IP across all endpoints. Use `@Throttle()` on a route/controller for custom per-endpoint limits.
- **Q: What if the env var is missing or invalid?**
  - A: The default value (`60000` for TTL, `60` for limit) is used. If the value is not a valid number, the app may throw or use `NaN`—ensure your env vars are correct.

### Multiple Global Guards
You can add multiple global guards (e.g., for throttling, authentication, roles) by adding multiple providers with `provide: APP_GUARD` in your module. All such guards will be applied in the order they appear in the `providers` array.

---

## Scripts

- `pnpm run start:dev` – Start the app in development mode (with hot reload)
- `pnpm run build` – Build the app for production
- `pnpm run start:prod` – Start the built app in production mode
- `pnpm run lint` – Lint and auto-fix code
- `pnpm run format` – Format code with Prettier
- `pnpm run test` – Run all tests
- `pnpm run test:watch` – Run tests in watch mode
- `pnpm run test:cov` – Run tests with coverage
- `pnpm run test:ui` – Run tests with UI

### Prisma scripts
- `pnpm run prisma:generate` – Generate Prisma client
- `pnpm run prisma:migrate:dev` – Run dev database migrations
- `pnpm run prisma:migrate:deploy` – Deploy migrations in production
- `pnpm run prisma:db:push` – Push schema changes to the database (no migration)
- `pnpm run prisma:format` – Format your Prisma schema
- `pnpm run prisma:studio` – Open Prisma Studio (GUI for DB)
- `pnpm run prisma:seed` – Run the seed script to create test users

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/kulkarniatharv/nestjs-starter.git my-new-project
cd my-new-project
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Copy the example environment file and update values as needed:

```bash
cp .env.example .env
```

- Set your `DATABASE_URL` for PostgreSQL
- Set `CLERK_SECRET_KEY` for Clerk authentication

### 4. Set up the database

```bash
pnpm run prisma:migrate:dev --name init
pnpm run prisma:seed # creates test users (should match your Clerk users)
```

### 5. Run the project

```bash
# Development
pnpm run start:dev

# Production
pnpm run build
pnpm run start:prod
```

### 6. Run tests

```bash
pnpm run test
```

---

## Authentication with Clerk

This project uses Clerk for authentication. Clerk handles user registration, login, password management, and security externally.

### Setup
1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Set your `CLERK_SECRET_KEY` in the `.env` file
3. Users are automatically protected by the global `ClerkAuthGuard`
4. Use `@Public()` decorator for endpoints that don't require authentication
5. Use `@CurrentUser()` decorator to access the authenticated user in controllers

### User Storage
- Clerk handles authentication and user management
- Your database stores minimal user info (id, email, name) with Clerk user IDs
- The `id` field in your User model should match the Clerk user ID

---

## Conventions & Best Practices

- **Use pnpm** for all package management.
- **Validation:** Use Zod schemas and the custom validation pipe for DTO validation.
- **DTOs & Interfaces:** Store them in `dto` and `interfaces` folders close to their usage (e.g., `src/users/dto`).
- **Path Aliases:** Use `@/` for imports (configured in `tsconfig.json`).
- **Authentication:** Use `@Public()` for public endpoints, `@CurrentUser()` to access authenticated users.

---

## Project Structure

```
src/
  auth/         # Authentication (Clerk, Passport, decorators, guards)
  users/        # User module (controllers, services, DTOs)
  common/       # Shared utilities (pipes, etc.)
  prisma/       # Prisma service and module
  main.ts       # Entry point
```

---

## License

MIT
