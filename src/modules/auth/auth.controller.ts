import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { RtGuard } from 'src/common/guards/rt.guard';
import {
  CurrentUser,
  CurrentUserId,
} from 'src/common/decorators/get-current-user.decorator';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Response } from 'express';

// 🚀 Import our freshly engineered decorators
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
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const result = await this.authService.login(dto);

    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      secure: false, // Turn on true in staging/production over SSL
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      access_token: result.access_token,
      user: result.user,
    };
  }

  @UseGuards(RtGuard)
  @Post('refresh')
  @ApiRefreshSession()
  async refresh(
    @CurrentUserId() userId: string,
    @CurrentUser('refreshToken') rt: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const tokens = await this.authService.refreshTokens(userId, rt);

    res.cookie('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      access_token: tokens.access_token,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiLogout()
  async logout(@CurrentUserId() userId: string) {
    return this.authService.logout(userId);
  }
}