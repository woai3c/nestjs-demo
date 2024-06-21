import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { I18nService } from 'nestjs-i18n'
import { CustomI18nService } from '@/services/custom-i18n'

describe('AppController', () => {
  let appController: AppController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: CustomI18nService,
          useValue: {
            t: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'common.hello':
                  return 'Hello World!'
                default:
                  return key
              }
            }),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockImplementation((key: string) => key), // mock method t
          },
        },
      ],
    }).compile()

    appController = app.get<AppController>(AppController)
  })

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!')
    })
  })
})
