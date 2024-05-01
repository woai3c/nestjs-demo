/* eslint-disable @typescript-eslint/no-unused-vars */
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Users } from '../users/users.schema';
import * as bcrypt from 'bcrypt';
import {
  RevisePasswordDto,
  UserAccountDto,
  UsersDto,
  passwordErrorMessage,
  passwordRegex,
} from '../users/users.dto';

import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Partial<Users>> {
    const entity = await this.usersService.findOne({ username });
    if (!entity) {
      throw new NotFoundException('User not found');
    }

    if (entity.lockUntil && entity.lockUntil > Date.now()) {
      const diffInSeconds = Math.round((entity.lockUntil - Date.now()) / 1000);
      let message = `The account is locked. Please try again in ${diffInSeconds} seconds.`;
      if (diffInSeconds > 60) {
        const diffInMinutes = Math.round(diffInSeconds / 60);
        message = `The account is locked. Please try again in ${diffInMinutes} minutes.`;
      }

      throw new UnauthorizedException(message);
    }

    const passwordMatch = bcrypt.compareSync(password, entity.password);
    if (!passwordMatch) {
      // $inc update to increase failedLoginAttempts
      const update = {
        $inc: { failedLoginAttempts: 1 },
      };

      // lock account when the third try is failed
      if (entity.failedLoginAttempts + 1 >= 3) {
        // $set update to lock the account for 5 minutes
        update['$set'] = { lockUntil: Date.now() + 5 * 60 * 1000 };
      }

      await this.usersService.update(entity._id, update);
      throw new UnauthorizedException('Invalid password');
    }

    // if validation is sucessful, then reset failedLoginAttempts and lockUntil
    if (
      entity.failedLoginAttempts > 0 ||
      (entity.lockUntil && entity.lockUntil > Date.now())
    ) {
      await this.usersService.update(entity._id, {
        $set: { failedLoginAttempts: 0, lockUntil: null },
      });
    }

    return { userId: entity._id, username } as UserAccountDto;
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const entity = await this.usersService.findOne({
        username: payload.username,
      });

      if (entity) {
        const newPayload = { username: entity.username, userId: entity._id };
        return {
          access_token: this.jwtService.sign(newPayload),
          refresh_token: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
          expires_in: 7200,
        };
      }
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async revisePassword(
    { oldPassword, newPassword }: RevisePasswordDto,
    user: UserAccountDto,
  ) {
    if (oldPassword === newPassword) {
      throw new HttpException(
        'The new password is the same as the old password',
        HttpStatus.BAD_REQUEST,
      );
    }

    const entity = await this.usersService.findById(user.userId);
    if (!entity) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (!bcrypt.compareSync(oldPassword, entity.password)) {
      throw new HttpException('Wrong password', HttpStatus.BAD_REQUEST);
    }

    return this.usersService.update(entity._id, {
      password: bcrypt.hashSync(newPassword, 10),
    });
  }

  login(userAccountDto: UserAccountDto) {
    return {
      access_token: this.jwtService.sign(userAccountDto),
      refresh_token: this.jwtService.sign(userAccountDto, { expiresIn: '7d' }),
      expires_in: 7200,
    };
  }

  async profile(userAccountDto: UserAccountDto) {
    const entity = await this.usersService.findById(userAccountDto.userId);
    if (!entity) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const { password, ...result } = entity.toObject();
    return result;
  }

  async register(usersDto: Partial<UsersDto>) {
    if (!usersDto.username || !usersDto.password) {
      throw new HttpException(
        'Username and password are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    let entity = await this.usersService.findOne({
      username: usersDto.username,
    });

    if (!passwordRegex.test(usersDto.password)) {
      throw new HttpException(passwordErrorMessage, HttpStatus.BAD_REQUEST);
    }

    if (entity) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = bcrypt.hashSync(usersDto.password, 10);
    entity = await this.usersService.create({
      ...usersDto,
      password: hashedPassword,
    });

    return this.login({ userId: entity._id, username: entity.username });
  }

  deleteUser(userAccountDto: UserAccountDto) {
    return this.usersService.delete(userAccountDto.userId);
  }
}
