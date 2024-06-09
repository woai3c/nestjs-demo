import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { jwtConstants } from './constants'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'
import { UserAccountDto } from '../users/users.dto'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectRedis() private readonly redis: Redis) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    })
  }

  async validate(payload: UserAccountDto) {
    const session = await this.redis.get(payload.userId)

    if (!session) {
      throw new UnauthorizedException()
    }

    const { userId, role } = JSON.parse(session)
    return { userId, username: payload.username, role }
  }
}
