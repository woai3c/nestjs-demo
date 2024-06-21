import { Injectable } from '@nestjs/common'
import { I18nService, I18nContext } from 'nestjs-i18n'

@Injectable()
export class CustomI18nService {
  constructor(private readonly i18nService: I18nService) {}

  t(key: string, options?: any): Promise<string> {
    const lang = I18nContext.current().lang
    return this.i18nService.t(key, { ...options, lang })
  }
}
