import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UsersController } from './users.controller'
import { Users, UsersSchema } from './users.schema'
import { UsersService } from './users.service'
import { CustomI18nService } from '@/services/custom-i18n'

@Module({
  imports: [MongooseModule.forFeature([{ name: Users.name, schema: UsersSchema }])],
  controllers: [UsersController],
  providers: [UsersService, CustomI18nService],
  exports: [UsersService],
})
export class UsersModule {}
