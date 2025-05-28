# User Module

This module handles user management and integrates with Clerk for authentication and user lifecycle management.

## Features

- **User CRUD Operations**: Create, read, update, and delete users
- **Clerk Webhook Integration**: Automatically sync users when they are created, updated, or deleted in Clerk
- **Zod Validation**: All DTOs are validated using Zod schemas
- **Database Integration**: Uses Prisma for database operations with PostgreSQL
- **Separation of Concerns**: Controllers handle routing, services handle business logic including webhook processing

## Architecture

### Controllers
- Handle HTTP routing and request/response
- Minimal business logic - delegates to services
- Uses Zod validation pipes for request validation

### Services 
- Contains all business logic including webhook processing
- Handles Clerk webhook verification using Svix
- Manages user CRUD operations and database interactions
- Processes webhook events and transforms Clerk data to local format

## API Endpoints

### User Management
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Webhooks
- `POST /api/users/webhooks/clerk` - Clerk webhook endpoint (public)

## Environment Variables

```bash
# Clerk Configuration
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Database
DATABASE_URL="postgresql://..."
```

## Webhook Setup

1. In your Clerk Dashboard, go to Webhooks
2. Add a new webhook endpoint: `https://your-domain.com/api/users/webhooks/clerk`
3. Select these events:
   - `user.created`
   - `user.updated` 
   - `user.deleted`
4. Copy the webhook secret and set it as `CLERK_WEBHOOK_SECRET`

## Database Schema

The User model includes:
- `id` - Clerk user ID (primary key)
- `email` - User email (unique)
- `firstName` - User first name
- `lastName` - User last name
- `username` - User username (unique)
- `imageUrl` - Profile image URL
- `emailVerified` - Email verification status
- `phoneNumber` - Phone number
- `externalId` - External ID for integrations
- `lastSignInAt` - Last sign-in timestamp
- `createdAt` - Record creation timestamp
- `updatedAt` - Record update timestamp

## Webhook Data Processing

The webhook DTO is designed to include only the necessary fields for user management:

### Core Fields
- User identification: `id`, `external_id`
- Personal information: `first_name`, `last_name`, `username`, `image_url`
- Contact information: `email_addresses`, `phone_numbers`
- Timestamps: `created_at`, `updated_at`, `last_sign_in_at`

This streamlined approach focuses on the essential user data while maintaining compatibility with Clerk's webhook format.

## Usage

The module automatically handles user synchronization from Clerk webhooks. When a user is created in Clerk, it will be automatically created in your database with the relevant information.

The webhook endpoint is marked as `@Public()` to bypass authentication since it comes from Clerk's servers.

## Error Handling

- Proper HTTP status codes and error messages
- Prisma error handling for database constraints
- Webhook verification using Svix
- Request validation using Zod schemas 
- Comprehensive logging for debugging webhook events 