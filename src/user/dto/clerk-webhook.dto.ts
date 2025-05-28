import { z } from 'zod';

const ClerkEmailAddressSchema = z.object({
  id: z.string(),
  email_address: z.string().email(),
  verification: z.object({
    status: z.string(),
  }),
});

const ClerkPhoneNumberSchema = z.object({
  id: z.string(),
  phone_number: z.string(),
  verification: z.object({
    status: z.string(),
  }),
});

const ClerkUserDataSchema = z.object({
  id: z.string(),
  object: z.literal('user'),
  external_id: z.string().nullable(),
  primary_email_address_id: z.string().nullable(),
  primary_phone_number_id: z.string().nullable(),
  username: z.string().nullable(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  image_url: z.string().nullable(),
  email_addresses: z.array(ClerkEmailAddressSchema),
  phone_numbers: z.array(ClerkPhoneNumberSchema),
  created_at: z.number(),
  updated_at: z.number(),
  last_sign_in_at: z.number().nullable(),
});

export const ClerkWebhookEventSchema = z.object({
  object: z.literal('event'),
  type: z.string(),
  data: ClerkUserDataSchema,
  timestamp: z.number(),
  instance_id: z.string(),
});

export type ClerkWebhookEventDto = z.infer<typeof ClerkWebhookEventSchema>;
export type ClerkUserData = z.infer<typeof ClerkUserDataSchema>;
