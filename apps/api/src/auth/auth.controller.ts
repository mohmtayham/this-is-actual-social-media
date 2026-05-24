import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
// import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { Response } from 'express';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {
        console.log('AuthService injected:', !!authService, authService);
  }
@Public()
@Post('signup')
async registerUser(@Body() createUserDto: CreateUserDto) {
  console.log('--- [Controller Reached] ---');
  console.log('Body received:', JSON.stringify(createUserDto, null, 2));
  
  try {
    const result = await this.authService.registerUser(createUserDto);
    console.log('✅ Registration Successful in DB');
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Service Layer Error:', message);
    throw error;
  }
}
 @Public()
  @Post('signin')
async login(@Body() body: { email: string; password: string }) {
  console.log('Login method called', { authService: !!this.authService });
  const user = await this.authService.validateLocalUser(body.email, body.password);
  return this.authService.login(user.id, user.name, user.role);
}


  @Public()
  @Post('refresh')
  async refreshToken(@Body() body: { refresh: string }) {
    if (!body.refresh) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const payload = await this.authService.verifyRefreshToken(body.refresh);
    const user = await this.authService.getUserOrThrow(payload.sub);
    return this.authService.refreshToken(user.id, user.name, user.role);
  }

  // @Public()
  // @UseGuards(GoogleAuthGuard)
  // @Get('google/login')
  // googleLogin() {}

  // @Public()
  // @UseGuards(GoogleAuthGuard)
  // @Get('google/callback')
  // async googleCallback(@Request() req, @Res() res: Response) {
  //   // console.log('Google User', req.user);
  //   const resopnse = await this.authService.login(
  //     req.user.id,
  //     req.user.name,
  //     req.user.role,
  //   );
  //   res.redirect(
  //     `http://localhost:3000/api/auth/google/callback?userId=${resopnse.id}&name=${resopnse.name}&accessToken=${resopnse.accessToken}&refreshToken=${resopnse.refreshToken}&role=${resopnse.role}`,
  //   );
  // }

 @Public()
 @Post('signout')
async signOut(@Req() req) {
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    throw new UnauthorizedException('Access token is required');
  }

  const payload = await this.authService.verifyAccessToken(token);
  console.log("--- [Backend: SignOut Received] ---");
  console.log("🔍 Revoking session for User ID:", payload.sub);

  return await this.authService.revokeToken(payload.sub);
}
// async signOut(@Req() req) {
//   const token = req.headers.authorization;
//   console.log("--- [Backend: SignOut Received] ---");
//   console.log("🔍 Token received for revocation:", token ? "Exists" : "Missing");

//   try {
//     // منطق إبطال التوكن في قاعدة البيانات
//     const result = await this.authService.revokeToken(token);
    
//     console.log("✅ Token successfully revoked in DB:", result);
//     return { message: "Signed out" };
//   } catch (err) {
//     console.error("❌ Failed to revoke token:", err);
//     throw err;
//   }
}
