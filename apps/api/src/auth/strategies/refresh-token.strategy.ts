// استيرادات ضرورية
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import type { AuthJwtPayload } from '../types/auth-jwtPayload';

@Injectable()
// اسم الاستراتيجية 'refresh-jwt' صحيح ومهم للتمييز
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor(
    private readonly authService: AuthService,
  ) {
    const secret = process.env.REFRESH_JWT_SECRET ?? process.env.REFRESH_SECRET;

    if (!secret) {
      throw new Error('REFRESH_JWT_SECRET or REFRESH_SECRET is not defined in the environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh'),
      secretOrKey: secret,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  // دالة validate الآن تتلقى كائن Request كأول وسيط
  validate(req: Request, payload: AuthJwtPayload) {
    const userId = payload.sub;
    const refreshToken = req.body.refresh;

    // التحقق من أن الـ refreshToken موجود في الطلب
    if (!refreshToken) {
      // يمكنك رمي خطأ هنا إذا كان ضرورياً
      // throw new UnauthorizedException('Refresh token not found');
    }

    // استدعاء الخدمة للتحقق من صلاحية الـ Refresh Token
    return this.authService.validateRefreshToken(userId, refreshToken);
  }
}
