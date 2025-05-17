import { LoginDto, SignUpDto } from '@/auth/dto';
import { UsersService } from '@/users/users.service';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignUpDto): Promise<{ message: string; user: Omit<User, 'password'> }> {
    const { email, password, name } = dto;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user: User = await this.usersService.createUser({
        email,
        hashedPassword,
        name,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...userWithoutPassword } = user;
      return { message: 'Signup successful', user: userWithoutPassword };
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException('Could not sign up user.');
    }
  }

  async login(dto: LoginDto): Promise<{ message: string; accessToken: string }> {
    const { email, password } = dto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userId: user.id, email: user.email };
    const accessToken = this.generateToken(payload);

    return { message: 'Login successful', accessToken };
  }

  generateToken(payload: { userId: string; email: string }): string {
    return this.jwtService.sign(payload);
  }
}
