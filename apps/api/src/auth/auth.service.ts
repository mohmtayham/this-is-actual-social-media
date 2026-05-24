import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';

import { UserService } from '../user/user.service'; // ← relative path
import { hash, verify } from 'argon2';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Role } from '@prisma/client';


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,

  ) {}

    // ADD THIS LINE:
  
  private getAccessSecretOrThrow(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new UnauthorizedException('JWT_SECRET is not defined');
    }
    return secret;
  }

  private getRefreshSecretOrThrow(): string {
    const secret = process.env.REFRESH_JWT_SECRET ?? process.env.REFRESH_SECRET;
    if (!secret) {
      throw new UnauthorizedException('REFRESH_JWT_SECRET or REFRESH_SECRET is not defined');
    }
    return secret;
  }
async registerUser(createUserDto: CreateUserDto) {
  // 1. التحقق من وجود المستخدم
  const user = await this.userService.findByEmail(createUserDto.email);
  if (user) throw new ConflictException('User already exists!');

  // UserService handles hashing so the same logic is reused for every creator.
  return this.userService.create(createUserDto);
}
  async validateLocalUser(email: string, password: string) {
    try {
      console.log(`--- [AuthService] validateLocalUser called for email: ${email} ---`);
      const user = await this.userService.findByEmail(email);
      if (!user) {
        console.error('User not found in DB');
        throw new UnauthorizedException('User not found!');
      }
      const isPasswordMatched = await verify(user.password, password);
      if (!isPasswordMatched) {
        console.error('Password mismatch');
        throw new UnauthorizedException('Invalid Credentials!');
      }
      console.log(`User validated successfully: ID ${user.id}`);
      return { id: user.id, name: user.name, role: user.role };
    } catch (error: any) {
      console.error(`--- [AuthService] validateLocalUser error: ${error.message} ---`, error.stack);
      throw error;
    }
  }

  async login(userId: number, name: string, role: Role) {
    try {
      console.log(`--- [AuthService] login called for userId: ${userId} ---`);
      const { accessToken, refreshToken } = await this.generateTokens(userId, role);
      const hashedRT = await hash(refreshToken);
      await this.userService.updateHashedRefreshToken(userId, hashedRT);
      console.log(`[AuthService] successfully generated tokens and updated hash for ${userId}`);
      return {
        id: userId,
        name: name,
        role,
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      console.error(`--- [AuthService] login error: ${error.message} ---`, error.stack);
      throw error;
    }
  }

async generateTokens(userId: number, role: Role) {
  const payload = { sub: userId, role: role }; // ✅ role is now included!
  // Note: You might need to update your `AuthJwtPayload` interface to include `role: string` so TypeScript doesn't complain.

  const accessSecret = this.getAccessSecretOrThrow();
  const refreshSecret = this.getRefreshSecretOrThrow();

  const [accessToken, refreshToken] = await Promise.all([
    this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '1d') as JwtSignOptions['expiresIn'],
    }),
    this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: (process.env.REFRESH_JWT_EXPIRES_IN ?? '7d') as JwtSignOptions['expiresIn'],
    }),
  ]);

  return { accessToken, refreshToken };
}

  async validateJwtUser(userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found!');
    const currentUser = { id: user.id, role: user.role };
    return currentUser;
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found!');

    const refreshTokenMatched = await verify(
      user.hashedRefreshToken as any ,
      refreshToken,
    );

    if (!refreshTokenMatched)
      throw new UnauthorizedException('Invalid Refresh Token!');
    const currentUser = { id: user.id };
    return currentUser;
  }

  async refreshToken(userId: number, name: string, role: Role) {
    const { accessToken, refreshToken } = await this.generateTokens(userId, role);
    const hashedRT = await hash(refreshToken);
    await this.userService.updateHashedRefreshToken(userId, hashedRT);
    return {
      id: userId,
      name: name,
      accessToken,
      refreshToken,
    };
  }

  async verifyAccessToken(token: string): Promise<{ sub: number; role: Role }> {
    const secret = this.getAccessSecretOrThrow();
    return this.jwtService.verifyAsync(token, { secret }) as Promise<{ sub: number; role: Role }>;
  }

  async verifyRefreshToken(token: string): Promise<{ sub: number; role: Role }> {
    const secret = this.getRefreshSecretOrThrow();
    return this.jwtService.verifyAsync(token, { secret }) as Promise<{ sub: number; role: Role }>;
  }

  async getUserOrThrow(userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found!');
    return user;
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.userService.findByEmail(googleUser.email);
    if (user) return user;
    return await this.userService.create(googleUser);
  }

  async signOut(userId: number) {
    return await this.userService.updateHashedRefreshToken(userId, null);
  }
  // أضف هذه الدالة داخل كلاس AuthService
async revokeToken(userId: number) {
  // نقوم بتصفير الـ hashedRefreshToken في قاعدة البيانات
  return await this.userService.updateHashedRefreshToken(userId, null);
}
}
