import { AppModule } from '@/app.module';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { PrismaService } from '@/prisma/prisma.service';
import { User } from '@prisma/client';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;
  let prisma: PrismaService;
  let accessToken: string;
  let testUser: User;

  // Use a unique email for user creation in this test suite
  const uniqueEmailUser = `user-${Date.now()}@example.com`;
  const userDetails = {
    email: uniqueEmailUser,
    password: 'password123',
    name: 'E2E Test User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Create a user and log in to get an access token
    // This makes the test suite self-contained for user operations
    const signupResponse = await request(httpServer)
      .post('/auth/signup')
      .send(userDetails);

    if (signupResponse.status !== 201) {
      console.error('Failed to sign up user for Users E2E tests:', signupResponse.body);
      throw new Error('Test setup failed: Could not sign up user.');
    }
    testUser = signupResponse.body.data.user as User;

    const loginResponse = await request(httpServer)
      .post('/auth/login')
      .send({ email: userDetails.email, password: userDetails.password });

    if (loginResponse.status !== 201 || !loginResponse.body.data.accessToken) {
      console.error('Failed to log in user for Users E2E tests:', loginResponse.body);
      throw new Error('Test setup failed: Could not log in user.');
    }
    accessToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    // Clean up the created user
    if (testUser) {
      try {
        await prisma.user.delete({ where: { email: userDetails.email } });
      } catch (error) {
        // In case the user was not created or already deleted, log and ignore
        console.warn(`Could not delete test user ${userDetails.email}:`, error.message);
      }
    }
    await app.close();
  });

  describe('GET /users/me', () => {
    it('should get the current authenticated user profile', async () => {
      const response = await request(httpServer)
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.user.id).toBe(testUser.id);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user.password).toBeUndefined();
    });

    it('should return 401 if no token is provided', async () => {
      await request(httpServer)
        .get('/users/me')
        .expect(401);
    });
  });

  describe('GET /users/:id', () => {
    let otherUser: User;

    beforeAll(async () => {
      // Create another user for testing specific ID lookups
      try {
        otherUser = await prisma.user.create({
          data: {
            email: `other-${Date.now()}@example.com`,
            name: 'Other User',
            password: 'hashedpassword', // Not used for login, just for DB record
          },
        });
      } catch (error) {
        console.error('Failed to create otherUser for Users E2E tests:', error);
        throw new Error('Test setup failed: Could not create otherUser.');
      }
    });

    afterAll(async () => {
      if (otherUser) {
        try {
          await prisma.user.delete({ where: { id: otherUser.id } });
        } catch (error) {
           console.warn(`Could not delete otherUser ${otherUser.email}:`, error.message);
        }
      }
    });

    it('should get another user by their ID', async () => {
      const response = await request(httpServer)
        .get(`/users/${otherUser.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.user.id).toBe(otherUser.id);
      expect(response.body.user.email).toBe(otherUser.email);
      expect(response.body.user.name).toBe(otherUser.name);
      expect(response.body.user.password).toBeUndefined();
    });

    it('should return 404 if user ID does not exist', async () => {
      const nonExistentUserId = 'clnonexistent1234567890'; // A structurally valid but non-existent ID
      await request(httpServer)
        .get(`/users/${nonExistentUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
    
    it('should return 401 if no token is provided when fetching by ID', async () => {
      await request(httpServer)
        .get(`/users/${otherUser.id}`)
        .expect(401);
    });

    // Optional: Test for invalid ID format if your IDs have a specific structure (e.g., UUID)
    // For Prisma default IDs (cuid), any string might be technically "valid" but not found.
    // If using UUIDs, you might add a test like this:
    // it('should return 400 if user ID format is invalid', async () => {
    //   await request(httpServer)
    //     .get('/users/invalid-uuid-format')
    //     .set('Authorization', `Bearer ${accessToken}`)
    //     .expect(400); // Or whatever your validation pipe/guard returns
    // });
  });
});
