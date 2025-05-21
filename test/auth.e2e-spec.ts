import { AppModule } from '@/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { LoginSchema, SignUpSchema } from '@/auth/dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;

  // Generate a unique email for each test run to avoid conflicts
  const uniqueEmail = `test-${Date.now()}@example.com`;
  const testUser = {
    email: uniqueEmail,
    password: 'password123',
    name: 'Test User',
  };
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Use the same validation pipes as in main.ts if any global pipes are set there
    // For this example, assuming ZodValidationPipe is applied at controller/method level or globally if needed
    // app.useGlobalPipes(new ZodValidationPipe(LoginSchema)); // Example if it were global for login
    // app.useGlobalPipes(new ZodValidationPipe(SignUpSchema)); // Example if it were global for signup
    // If pipes are applied via @Body(new ZodValidationPipe(...)) in controller, no need for app.useGlobalPipes here for those.
    // However, NestJS's built-in ValidationPipe can be useful for class-validator DTOs if those are used elsewhere.
    // For this project, ZodValidationPipe is used per-route.

    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/signup', () => {
    it('should successfully sign up a new user', async () => {
      const response = await request(httpServer)
        .post('/auth/signup')
        .send(testUser)
        .expect(201);

      expect(response.body.data.message).toBe('Signup successful');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.name).toBe(testUser.name);
      expect(response.body.data.user.id).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined(); // Ensure password is not returned
    });

    it('should fail to sign up with an existing email', async () => {
      const response = await request(httpServer)
        .post('/auth/signup')
        .send(testUser) // Send the same user details again
        .expect(409); // Conflict

      expect(response.body.message).toBe('Email already exists');
    });

    it('should fail with invalid signup data (e.g., missing email)', async () => {
      const { email, ...invalidUser } = testUser; // remove email
      const response = await request(httpServer)
        .post('/auth/signup')
        .send(invalidUser)
        .expect(400); // Bad Request due to ZodValidationPipe

      expect(response.body.message).toBeDefined(); // Error message from Zod pipe
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.email).toEqual(['Email is required']);
    });
  });

  describe('POST /auth/login', () => {
    it('should successfully log in an existing user', async () => {
      const response = await request(httpServer)
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(201);

      expect(response.body.data.message).toBe('Login successful');
      expect(response.body.data.accessToken).toBeDefined();
      accessToken = response.body.data.accessToken; // Save for later tests
    });

    it('should fail to log in with a non-existent email', async () => {
      const response = await request(httpServer)
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: testUser.password })
        .expect(401); // Unauthorized

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail to log in with an incorrect password', async () => {
      const response = await request(httpServer)
        .post('/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401); // Unauthorized

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail with invalid login data (e.g., invalid email format)', async () => {
      const response = await request(httpServer)
        .post('/auth/login')
        .send({ email: 'not-an-email', password: 'password' })
        .expect(400); // Bad Request

      expect(response.body.message).toBeDefined();
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.email).toEqual(['Invalid email format']);
    });
  });

  // Placeholder for a test that requires authentication
  describe('GET /users/me (requires auth)', () => {
    it('should fail to get user profile if not authenticated', async () => {
      await request(httpServer)
        .get('/users/me')
        .expect(401); // Unauthorized
    });

    it('should get user profile if authenticated', async () => {
      // Ensure login was successful and token was stored
      if (!accessToken) {
        throw new Error('Access token not available. Login test might have failed.');
      }

      const response = await request(httpServer)
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user.id).toBeDefined();
    });
  });
});
