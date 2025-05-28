import { z } from 'zod';

export const CreateUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  imageUrl: z.string().url().optional(),
  lastSignInAt: z.string().datetime().optional(),
  emailVerified: z.boolean().default(false),
  phoneNumber: z.string().optional(),
  externalId: z.string().optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
