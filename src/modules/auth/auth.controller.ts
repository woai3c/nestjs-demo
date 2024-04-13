import { Request } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from './decorators/public.decorator';

import {
  Controller,
  Post,
  UseGuards,
  Body,
  Req,
  Put,
  Get,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';

import {
  RefreshTokenDto,
  RevisePasswordDto,
  UserAccountDto,
  UsersDto,
} from '../users/users.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Request) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('register')
  @UsePipes(new ValidationPipe({ skipMissingProperties: true }))
  register(@Body() usersDto: UsersDto) {
    return this.authService.register(usersDto);
  }

  @Get('profile')
  profile(@Req() req: Request) {
    return this.authService.profile(req.user);
  }

  @Post('refresh')
  @UsePipes(new ValidationPipe())
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Put('revise-password')
  @UsePipes(new ValidationPipe())
  revisePassword(
    @Body() revisePasswordDto: RevisePasswordDto,
    @Req() req: Request,
  ) {
    return this.authService.revisePassword(
      revisePasswordDto,
      req.user as UserAccountDto,
    );
  }
}
