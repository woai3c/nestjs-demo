import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from './auth.service'
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      passReqToCallback: false,
    })
  }

  async validate(username: string, password: string) {
    if (!username || !password) {
      throw new BadRequestException('Username and password are required')
    }

    const user = await this.authService.validateUser(username, password)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return user
  }
}
