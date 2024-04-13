/* eslint-disable @typescript-eslint/no-unused-vars */
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Users } from '../users/users.schema';
import {
  RevisePasswordDto,
  UserAccountDto,
  UsersDto,
} from '../users/users.dto';
import * as bcrypt from 'bcrypt';
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
    const user = await this.usersService.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const diffInSeconds = Math.round((user.lockUntil - Date.now()) / 1000);

      let message = `The account is locked. Please try again in ${diffInSeconds} seconds.`;

      if (diffInSeconds > 60) {
        const diffInMinutes = Math.round(diffInSeconds / 60);
        message = `The account is locked. Please try again in ${diffInMinutes} minutes.`;
      }

      throw new UnauthorizedException(message);
    }

    if (!bcrypt.compareSync(password, user.password)) {
      if (
        typeof user.failedLoginAttempts === 'undefined' ||
        user.failedLoginAttempts >= 3
      ) {
        user.failedLoginAttempts = 0;
      }

      user.failedLoginAttempts++;
      // If there were 3 failed attempts, lock the account for 5 minutes.
      if (user.failedLoginAttempts >= 3) {
        user.lockUntil = Date.now() + 5 * 60 * 1000;
      }

      await this.usersService.update(user._id, user);
      throw new UnauthorizedException('Invalid password');
    }

    return { userId: user._id, username } as UserAccountDto;
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findOne({
        username: payload.username,
      });

      if (user) {
        const newPayload = { username: user.username, userId: user._id };
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

    if (bcrypt.compareSync(oldPassword, entity.password)) {
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

  async register(usersDto: UsersDto) {
    const hashedPassword = bcrypt.hashSync(usersDto.password, 10);
    const user = await this.usersService.create({
      ...usersDto,
      password: hashedPassword,
    });

    return this.login({ userId: user._id, username: user.username });
  }
}
