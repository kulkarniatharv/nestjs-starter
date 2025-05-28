export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt: Date | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  externalId: string | null;
}
