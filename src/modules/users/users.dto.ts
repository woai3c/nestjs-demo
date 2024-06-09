import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator'

export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/
export const passwordErrorMessage =
  'Password must be 8-20 characters, include at least one uppercase letter, one lowercase letter, one number, and can only contain letters and numbers.'

export class UsersBaseDto {
  @IsString()
  @IsOptional()
  address?: string

  @IsString()
  @IsOptional()
  avatar?: string

  @IsString()
  @IsOptional()
  city?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  gender?: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  phone?: string

  @IsOptional()
  $inc?: {
    failedLoginAttempts: number
  }

  @IsOptional()
  $set?: {
    failedLoginAttempts: number
    lockUntil: null | number
  }
}

export class UsersDto extends UsersBaseDto {
  @IsString()
  @IsNotEmpty()
  username: string

  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  @Matches(passwordRegex, {
    message: passwordErrorMessage,
  })
  password: string
}

export class UpdateUsersDto extends UsersBaseDto {
  @IsString()
  @IsOptional()
  @Length(8, 20)
  @Matches(passwordRegex, {
    message: passwordErrorMessage,
  })
  password?: string
}

export class UserAccountDto {
  @IsString()
  @IsNotEmpty()
  username: string

  @IsString()
  @IsNotEmpty()
  userId: string
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string
}

export class RevisePasswordDto {
  @IsNotEmpty()
  @IsString()
  oldPassword: string

  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  @Matches(passwordRegex, {
    message: passwordErrorMessage,
  })
  newPassword: string
}
