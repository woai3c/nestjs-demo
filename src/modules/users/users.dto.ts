import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator'

export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/
export const passwordErrorMessage =
  'Password must be 8-20 characters, include at least one uppercase letter, one lowercase letter, one number, and can only contain letters and numbers.'

export class UsersBaseDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatar?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  city?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  gender?: string

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiProperty({ required: false })
  @IsOptional()
  $inc?: {
    failedLoginAttempts: number
  }

  @ApiProperty({ required: false })
  @IsOptional()
  $set?: {
    failedLoginAttempts: number
    lockUntil: null | number
  }
}

export class UsersDto extends UsersBaseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty({ minLength: 8, maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  @Matches(passwordRegex, {
    message: passwordErrorMessage,
  })
  password: string
}

export class UpdateUsersDto extends UsersBaseDto {
  @ApiProperty({ required: false, minLength: 8, maxLength: 20 })
  @IsString()
  @IsOptional()
  @Length(8, 20)
  @Matches(passwordRegex, {
    message: passwordErrorMessage,
  })
  password?: string
}

export enum Role {
  User = 'User',
  Admin = 'Admin',
  SuperAdmin = 'SuperAdmin',
}

export class UserAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string

  @ApiProperty({ enum: Role, required: false })
  @IsEnum(Role)
  @IsOptional()
  role?: Role
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  refreshToken: string
}

export class RevisePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  oldPassword: string

  @ApiProperty({ minLength: 8, maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  @Matches(passwordRegex, {
    message: passwordErrorMessage,
  })
  newPassword: string
}

export class AssignRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly userId: string

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  @IsNotEmpty()
  readonly role: Role
}
