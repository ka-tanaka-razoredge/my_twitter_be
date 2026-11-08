import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your_jwt_secret', // JWT発行時の秘密鍵と同じもの
    });
  }

  async validate(payload: any) {
    // ペイロードに基づいてユーザーを特定・検証
    return { userId: payload.sub, username: payload.username };
  }
}
