import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RtStrategy } from './strategies/refresh-token.strategy';
import { UserRepository } from './auth.repository';


@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RtStrategy, UserRepository],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
