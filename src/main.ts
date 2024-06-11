import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe())

  const configService: ConfigService = app.get(ConfigService)
  const isProduction = configService.get('NODE_ENV') === 'production'

  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('The API description')
      .setVersion('1.0')
      .addBearerAuth() // add bearer token configuration
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: { persistAuthorization: true },
    })
  }

  const corsDomains = configService.get('NEST_CORS_DOMAINS')?.trim()
  app.enableCors({
    origin: corsDomains ? corsDomains.split(',').filter(Boolean) : '*',
  })

  const port = configService.get('NEST_SERVER_PORT') || 3000
  await app.listen(port)

  console.log(`Server is running on port ${port}`)
}

bootstrap()
