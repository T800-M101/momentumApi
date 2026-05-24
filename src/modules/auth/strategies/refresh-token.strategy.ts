import { Injectable, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    const refreshSecret = config.get<string>('JWT_REFRESH_SECRET');

    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET must be defined in .env');
    }

    super({
      jwtFromRequest: (req: Request) => {
        let token = null;
        if (req && (req.body.refreshToken || req.headers['x-refresh-token'])) {
          token = req.body.refreshToken || req.headers['x-refresh-token'];
        }
        return token;
      },
      secretOrKey: refreshSecret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];

    if (!refreshToken) {
      throw new ForbiddenException('Refresh token missing');
    }

    return {
      ...payload,
      refreshToken,
    };
  }
}