import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService: ConfigService = app.get(ConfigService)
  const corsDomains = configService.get('NEST_CORS_DOMAINS')?.trim()

  app.enableCors({
    origin: corsDomains ? corsDomains.split(',').filter(Boolean) : '*',
  })

  const port = configService.get('NEST_SERVER_PORT') || 3000
  await app.listen(port)

  console.log(`Server is running on port ${port}`)
}

bootstrap()
