import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { RtGuard } from 'src/common/guards/rt.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/common/decorators/get-current-user.decorator';
import {
  ApiRegister,
  ApiLogin,
  ApiRefreshSession,
  ApiLogout,
} from './decorators/api-auth.decorators';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiRegister()
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiLogin()
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @UseGuards(RtGuard)
  @Post('refresh')
  @ApiRefreshSession()
  async refresh(
    @CurrentUserId() userId: string,
    @Body('refreshToken') rt: string
  ) {
    return await this.authService.refreshTokens(userId, rt);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiLogout()
  async logout(@CurrentUserId() userId: string) {
    await this.authService.logout(userId);
    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    console.log('Initiating recovery via REST API:', email);

    try {
      const response = await fetch(
        `${process.env.SUPABASE_URL}/auth/v1/recover`,
        {
          method: 'POST',
          headers: {
            apikey: process.env.SUPABASE_ANON_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            redirect_to: `${process.env.FRONTEND_URL}/update-password`,
          }),
        },
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new HttpException(
          result.message || 'Error sending email',
          response.status,
        );
      }

      return { message: 'Recovery email sent' };
    } catch (error: any) {
      console.error('Critical error in the recovery service:', error);
      throw new HttpException(
        'Unable to connect to the authentication service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}