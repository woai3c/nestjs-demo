import { Injectable } from '@nestjs/common'
import { CustomI18nService } from './services/custom-i18n'

@Injectable()
export class AppService {
  constructor(private readonly customI18nService: CustomI18nService) {}

  getHello() {
    return this.customI18nService.t('common.hello')
  }
}
