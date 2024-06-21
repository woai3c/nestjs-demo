import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { CustomI18nService } from '@/services/custom-i18n'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly customI18nService: CustomI18nService,
  ) {
    super({
      passReqToCallback: false,
    })
  }

  async validate(username: string, password: string) {
    if (!username || !password) {
      throw new BadRequestException(this.customI18nService.t('users.passwordRequired'))
    }

    const user = await this.authService.validateUser(username, password)
    if (!user) {
      throw new UnauthorizedException(this.customI18nService.t('users.invalidCredentials'))
    }

    return user
  }
}
