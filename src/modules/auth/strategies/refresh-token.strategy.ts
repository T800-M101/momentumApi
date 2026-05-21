import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptionsWithRequest } from 'passport-jwt'; 
import { Request } from 'express';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    const refreshSecret = config.get<string>('JWT_REFRESH_SECRET');

    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET must be defined in .env');
    }

    const strategyOptions: StrategyOptionsWithRequest = {
      jwtFromRequest: (req: Request) => {
        let token = null;
        if (req && req.cookies) {
          token = req.cookies['refreshToken'];
        }
        return token;
      },
      secretOrKey: refreshSecret,
      passReqToCallback: true, 
    };

    super(strategyOptions);
  }

  validate(req: Request, payload: any) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new ForbiddenException('Refresh token missing in cookies');
    }

    return {
      ...payload,
      refreshToken,
    };
  }
}