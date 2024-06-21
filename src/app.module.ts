import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { UsersModule } from './modules/users/users.module'
import { AuthModule } from './modules/auth/auth.module'
import { LoggerMiddleware } from '@/middlewares/logger'
import { LoggerService } from '@/services/logger'
import { RolesGuard } from './modules/auth/roles.guard'
import { RedisModule } from '@nestjs-modules/ioredis'
import { I18nModule, QueryResolver, AcceptLanguageResolver } from 'nestjs-i18n'
import { join } from 'path'
import { CustomI18nService } from '@/services/custom-i18n'

const envs = {
  production: '.env.production',
  development: '.env.development',
  test: '.env.test',
}

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [new QueryResolver(['lang']), new AcceptLanguageResolver()],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envs[process.env.NODE_ENV || 'development'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('NEST_MONGODB_URL'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'single',
        url: `redis://${configService.get<string>('NEST_REDIS_URL')}:${configService.get<string>('NEST_REDIS_PORT')}`,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, LoggerService, RolesGuard, CustomI18nService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
