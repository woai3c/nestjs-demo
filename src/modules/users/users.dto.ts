import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/;
export const passwordErrorMessage =
  'Password must be 8-20 characters, include at least one uppercase letter, one lowercase letter, one number, and can only contain letters and numbers.';

export class UsersDto {
  @IsString()
  address: string;

  @IsString()
  avatar: string;

  @IsString()
  city: string;

  @IsString()
  description: string;

  @IsString()
  gender: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  @Matches(passwordRegex, {
    message: passwordErrorMessage,
  })
  password: string;

  $inc: {
    failedLoginAttempts: number;
  };

  $set: {
    failedLoginAttempts: number;
    lockUntil: null | number;
  };
}

export class UserAccountDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class RevisePasswordDto {
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  @Matches(passwordRegex, {
    message: passwordErrorMessage,
  })
  newPassword: string;
}
