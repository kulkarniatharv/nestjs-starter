import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import { Request } from 'express';

export type SanitizedUser = Omit<PrismaUser, 'password'>;
type SanitizedUserField = keyof SanitizedUser;

interface RequestWithUser extends Request {
  user: PrismaUser;
}

function sanitizeUser(user: PrismaUser | null | undefined): SanitizedUser | null {
  if (!user) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export const CurrentUser = createParamDecorator(
  (field: SanitizedUserField | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const sanitizedUser = sanitizeUser(user);

    if (field && sanitizedUser) {
      return sanitizedUser[field];
    }

    return sanitizedUser;
  },
);
