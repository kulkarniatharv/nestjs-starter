import { ClerkClient, createClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

export const ClerkClientProvider = {
  provide: 'ClerkClient',
  useFactory: (cfg: ConfigService): ClerkClient =>
    createClerkClient({
      publishableKey: cfg.get('CLERK_PUBLISHABLE_KEY'),
      secretKey: cfg.get('CLERK_SECRET_KEY'),
    }),
  inject: [ConfigService],
};
