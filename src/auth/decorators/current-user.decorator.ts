import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client'; // Updated import path
import { Request } from 'express'; // Added import for Express Request

// Define a type for the user object that will be attached to the request
// This can be more specific if you strip properties (e.g., password) in JwtStrategy
export type AuthenticatedUser = PrismaUser; // Or a subset of PrismaUser

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
