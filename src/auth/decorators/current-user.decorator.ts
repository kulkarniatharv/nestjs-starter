import { User as ClerkUser } from '@clerk/backend';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Define an interface for Express Request object augmented with the Clerk User object.
// Passport strategies (like ClerkStrategy) typically attach the authenticated user to `req.user`.
interface RequestWithClerkUser extends Request {
  user: ClerkUser;
}

/**
 * @CurrentUser() decorator
 *
 * This decorator extracts the authenticated user object (populated by Clerk)
 * from the request object.
 *
 * Usage examples:
 * ```ts
 * // Get the entire user object
 * @Get('me')
 * getMe(@CurrentUser() user: User) {
 *   return user;
 * }
 *
 * // Get a specific field from the user object (e.g., email)
 * @Get('email')
 * getEmail(@CurrentUser('emailAddresses') email: UserEmailAddress[]) { // Or the specific type for primary email
 *   return email;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (
    data: keyof ClerkUser | undefined,
    ctx: ExecutionContext,
  ): ClerkUser | ClerkUser[keyof ClerkUser] | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithClerkUser>();
    const user = request.user;

    // If a specific data key (field name) is provided, return that field from the user object.
    // Otherwise, return the entire user object.
    return data ? user?.[data] : user;
  },
);
