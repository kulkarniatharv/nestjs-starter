# NestJS Starter Project

A production-ready NestJS starter repository for quickly bootstrapping new projects. Clone this repo to kickstart your next backend project with best practices, batteries included, and a clean architecture.

---

## Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) (TypeScript)
- **Database ORM:** [Prisma](https://www.prisma.io/) (default: PostgreSQL)
- **Authentication:** JWT (with Passport.js)
- **Validation:** [Zod](https://zod.dev/) (with a custom validation pipe)
- **Password Hashing:** bcrypt
- **Testing:** Jest
- **Package Manager:** pnpm

---

## Features

- Modular structure (auth, users, common, prisma)
- JWT authentication with secure user handling
- Prisma ORM with a default User model
- Zod-based request validation (see `src/common/pipes/zod-validation.pipe.ts`)
- DTOs and interfaces organized by feature
- Path aliases for clean imports (`@/`)
- Pre-configured scripts for development, testing, and production

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url> my-new-project
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
- Set `JWT_SECRET` and `JWT_EXPIRATION_TIME`

### 4. Set up the database

```bash
pnpm exec prisma migrate dev --name init
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

## Conventions & Best Practices

- **Use pnpm** for all package management.
- **Validation:** Use Zod schemas and the custom validation pipe for DTO validation.
- **DTOs & Interfaces:** Store them in `dto` and `interfaces` folders close to their usage (e.g., `src/users/dto`).
- **Path Aliases:** Use `@/` for imports (configured in `tsconfig.json`).
- **Sensitive Data:** Never expose sensitive fields (like passwords) in responses or decorators.

---

## Project Structure

```
src/
  auth/         # Authentication (JWT, Passport, decorators, guards)
  users/        # User module (controllers, services, DTOs)
  common/       # Shared utilities (pipes, etc.)
  prisma/       # Prisma service and module
  main.ts       # Entry point
```

---

## License

MIT
