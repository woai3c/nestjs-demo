import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Users } from './users.schema'
import { UsersDto } from './users.dto'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'

@Injectable()
export class UsersService {
  constructor(@InjectModel(Users.name) private userModel: Model<Users>) {}

  create(usersDto: Partial<UsersDto>): Promise<Users> {
    if (!usersDto.password || !usersDto.username) {
      throw new BadRequestException('Missing required password or username')
    }

    return this.userModel.create(usersDto)
  }

  findAll(): Promise<Users[]> {
    return this.userModel.find().exec()
  }

  async findById(id: string): Promise<Users> {
    const user = await this.userModel.findById(id).exec()
    if (!user) {
      throw new NotFoundException(`User not found for ID: ${id}`)
    }

    return user
  }

  findOne(query: Partial<UsersDto>): Promise<Users> {
    return this.userModel.findOne(query).exec()
  }

  update(id: string, usersDto: Partial<UsersDto>): Promise<Users> {
    return this.userModel.findByIdAndUpdate(id, usersDto, { new: true }).exec()
  }

  delete(id: string): Promise<Users> {
    return this.userModel.findByIdAndDelete(id).exec()
  }
}
