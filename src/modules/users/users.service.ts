import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Users } from './users.schema'
import { AssignRoleDto, Role, UpdateUsersDto, UsersDto } from './users.dto'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'
import { CustomI18nService } from '@/services/custom-i18n'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private userModel: Model<Users>,
    @InjectRedis() private readonly redis: Redis,
    private readonly customI18nService: CustomI18nService,
  ) {}

  async create(usersDto: UsersDto): Promise<Users> {
    if (!usersDto.password || !usersDto.username) {
      throw new BadRequestException(this.customI18nService.t('users.missingRequiredPasswordOrUsername'))
    }

    return this.userModel.create(usersDto)
  }

  findAll(): Promise<Users[]> {
    return this.userModel.find().exec()
  }

  async findById(id: string): Promise<Users> {
    const user = await this.userModel.findById(id).exec()
    if (!user) {
      throw new NotFoundException(this.customI18nService.t('users.notFoundId', { args: { id } }))
    }

    return user
  }

  findOne(query: Partial<UsersDto>): Promise<Users> {
    return this.userModel.findOne(query).exec()
  }

  async update(id: string, usersDto: UpdateUsersDto): Promise<Users> {
    const user = await this.userModel.findByIdAndUpdate(id, usersDto, { new: true }).exec()
    if (!user) {
      throw new NotFoundException(this.customI18nService.t('users.notFoundId', { args: { id } }))
    }

    // update role in session
    await this.updateRedisSession(user._id, user.role)

    return user
  }

  async delete(id: string): Promise<Users> {
    const user = await this.userModel.findByIdAndDelete(id).exec()
    if (!user) {
      throw new NotFoundException(this.customI18nService.t('users.notFoundId', { args: { id } }))
    }

    // delete session
    await this.redis.del(id)

    return user
  }

  async assignRole(assignRoleDto: AssignRoleDto): Promise<Users> {
    const { userId, role } = assignRoleDto

    const user = await this.userModel.findById(userId).exec()
    if (!user) {
      throw new NotFoundException(this.customI18nService.t('users.notFound'))
    }

    user.role = role
    await user.save()

    // update role in session
    await this.updateRedisSession(user._id, user.role)

    return user
  }

  private async updateRedisSession(userId: string, role: Role) {
    const session = await this.redis.get(userId)
    if (session) {
      const sessionData = JSON.parse(session)
      sessionData.role = role
      await this.redis.set(userId, JSON.stringify(sessionData))
    }
  }
}
