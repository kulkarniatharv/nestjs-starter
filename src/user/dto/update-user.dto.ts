import { z } from 'zod';

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  imageUrl: z.string().url().optional(),
  lastSignInAt: z.string().datetime().optional(),
  emailVerified: z.boolean().optional(),
  phoneNumber: z.string().optional(),
  externalId: z.string().optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
