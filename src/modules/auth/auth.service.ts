/* eslint-disable @typescript-eslint/no-unused-vars */
import { UsersService } from '../users/users.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { RevisePasswordDto, Role, UserAccountDto, UsersDto } from '../users/users.dto'
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { TOKEN_DURATION } from './constants'
import { TEST_SUPER_ADMIN } from '@tests/constants'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async validateUser(username: string, password: string): Promise<UserAccountDto> {
    const entity = await this.usersService.findOne({ username })
    if (!entity) {
      throw new UnauthorizedException('User not found')
    }

    if (entity.lockUntil && entity.lockUntil > Date.now()) {
      const diffInSeconds = Math.round((entity.lockUntil - Date.now()) / 1000)
      let message = `The account is locked. Please try again in ${diffInSeconds} seconds.`
      if (diffInSeconds > 60) {
        const diffInMinutes = Math.round(diffInSeconds / 60)
        message = `The account is locked. Please try again in ${diffInMinutes} minutes.`
      }

      throw new UnauthorizedException(message)
    }

    const passwordMatch = bcrypt.compareSync(password, entity.password)
    if (!passwordMatch) {
      // $inc update to increase failedLoginAttempts
      const update: AnyObject = {
        $inc: { failedLoginAttempts: 1 },
      }

      // lock account when the third try is failed
      if (entity.failedLoginAttempts + 1 >= 3) {
        // $set update to lock the account for 5 minutes
        update.$set = { lockUntil: Date.now() + 5 * 60 * 1000 }
      }

      await this.usersService.update(entity._id, update)
      throw new UnauthorizedException('Invalid password')
    }

    // if validation is successful, then reset failedLoginAttempts and lockUntil
    if (entity.failedLoginAttempts > 0 || (entity.lockUntil && entity.lockUntil > Date.now())) {
      await this.usersService.update(entity._id, {
        $set: { failedLoginAttempts: 0, lockUntil: null },
      })
    }

    return { userId: entity._id, username, role: entity.role } as UserAccountDto
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken)
      const entity = await this.usersService.findOne({
        username: payload.username,
      })

      if (!entity) {
        throw new UnauthorizedException('User not found')
      }

      if (entity) {
        const newPayload = { username: entity.username, userId: entity._id }
        this.redis.set(entity._id, JSON.stringify({ userId: entity._id, role: entity.role }))

        return {
          access_token: this.jwtService.sign(newPayload),
          refresh_token: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
          expires_in: TOKEN_DURATION,
        }
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async revisePassword({ oldPassword, newPassword }: RevisePasswordDto, user: UserAccountDto) {
    if (oldPassword === newPassword) {
      throw new UnauthorizedException("The new password can't the same as the old password")
    }

    const entity = await this.usersService.findById(user.userId)
    if (!entity) {
      throw new UnauthorizedException('User not found')
    }

    if (!bcrypt.compareSync(oldPassword, entity.password)) {
      throw new UnauthorizedException('Wrong password')
    }

    return this.usersService.update(entity._id, {
      password: bcrypt.hashSync(newPassword, 10),
    })
  }

  login(userAccountDto: UserAccountDto) {
    const { role, ...rest } = userAccountDto
    const payload = rest

    this.redis.set(userAccountDto.userId, JSON.stringify({ userId: userAccountDto.userId, role }))

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      expires_in: TOKEN_DURATION,
    }
  }

  async profile(userAccountDto: UserAccountDto) {
    const entity = await this.usersService.findById(userAccountDto.userId)
    if (!entity) {
      throw new UnauthorizedException('User not found')
    }

    const { password, ...result } = entity.toObject()
    return result
  }

  async register(usersDto: Partial<UsersDto>) {
    let entity = await this.usersService.findOne({
      username: usersDto.username,
    })

    if (entity) {
      throw new BadRequestException('User already exists')
    }

    const hashedPassword = bcrypt.hashSync(usersDto.password, 10)

    // for testing purposes
    if (usersDto.username === TEST_SUPER_ADMIN && process.env.NODE_ENV === 'test') {
      ;(usersDto as AnyObject).role = Role.SuperAdmin
    }

    entity = await this.usersService.create({
      ...usersDto,
      password: hashedPassword,
    })

    return this.login({ userId: entity._id, username: entity.username, role: entity.role })
  }

  async deleteUser(userAccountDto: UserAccountDto) {
    const entity = await this.usersService.findById(userAccountDto.userId)
    if (!entity) {
      throw new UnauthorizedException('User not found')
    }

    return this.usersService.delete(userAccountDto.userId)
  }
}
