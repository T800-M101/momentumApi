import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { RtGuard } from 'src/common/guards/rt.guard';
import {
  CurrentUser,
  CurrentUserId,
} from 'src/common/decorators/get-current-user.decorator';
import { ApiRefresh } from './decorators/api-refresh.decorator';
import { LoginDto } from './dtos/login.dto';
import { ApiRegister } from './decorators/api-register.decorator';
import { ApiLogin } from './decorators/api-login.decorator';

@ApiTags('Autenticación')
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
  login(@Body() dto: LoginDto): any {
    return this.authService.login(dto);
  }

  @UseGuards(RtGuard) // Custom Guard used for 'jwt-refresh'
  @Post('refresh')
  @ApiRefresh()
  @ApiBearerAuth() // Show the padlock onSwagger
  refresh(
    @CurrentUserId() userId: string,
    @CurrentUser('refreshToken') rt: string,
  ) {
    return this.authService.refreshTokens(userId, rt);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() dto: { userId: string }) {
    return this.authService.logout(dto.userId);
  }
}
