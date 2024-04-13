import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users } from './users.schema';
import { UsersDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(Users.name) private userModel: Model<Users>) {}

  create(usersDto: UsersDto): Promise<Users> {
    return this.userModel.create(usersDto);
  }

  findAll(): Promise<Users[]> {
    return this.userModel.find().exec();
  }

  findById(id: string): Promise<Users> {
    return this.userModel.findById(id).exec();
  }

  findOne(query: Partial<UsersDto>): Promise<Users> {
    return this.userModel.findOne(query).exec();
  }

  update(id: string, usersDto: Partial<UsersDto>): Promise<Users> {
    return this.userModel.findByIdAndUpdate(id, usersDto, { new: true }).exec();
  }

  delete(id: string): Promise<Users> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
