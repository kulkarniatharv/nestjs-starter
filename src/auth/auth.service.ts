import { SanitizedUser } from '@/auth/decorators/current-user.decorator';
import { LoginDto, SignUpDto } from '@/auth/dto';
import { JwtPayload } from '@/auth/jwt.strategy';
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
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectPinoLogger(AuthService.name) private readonly logger: PinoLogger,
  ) {}

  async signup(dto: SignUpDto): Promise<{ data: { message: string; user: SanitizedUser } }> {
    const { email, password, name } = dto;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user: User = await this.usersService.createUser({
        email,
        hashedPassword,
        name,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return { data: { message: 'Signup successful', user: userWithoutPassword } };
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      this.logger.error({ err }, 'Signup failed');
      throw new InternalServerErrorException('Could not sign up user.');
    }
  }

  async login(dto: LoginDto): Promise<{ data: { message: string; accessToken: string } }> {
    const { email, password } = dto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = await this.generateToken(payload);

    return { data: { message: 'Login successful', accessToken } };
  }

  async generateToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
