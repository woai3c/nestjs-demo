import { Request } from 'express'
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './local-auth.guard'
import { Public } from './decorators/public.decorator'
import { Controller, Post, UseGuards, Body, Req, Put, Get, Delete, HttpCode } from '@nestjs/common'
import { RefreshTokenDto, RevisePasswordDto, UserAccountDto, UsersDto } from '../users/users.dto'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger'

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: UsersDto })
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  login(@Req() req: Request) {
    return this.authService.login(req.user)
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register user' })
  @ApiBody({ type: UsersDto })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  register(@Body() usersDto: UsersDto) {
    return this.authService.register(usersDto)
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  profile(@Req() req: Request) {
    return this.authService.profile(req.user)
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Access token refreshed successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken)
  }

  @Put('revise-password')
  @ApiOperation({ summary: 'Revise user password' })
  @ApiBody({ type: RevisePasswordDto })
  @ApiResponse({ status: 200, description: 'Password revised successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async revisePassword(@Body() revisePasswordDto: RevisePasswordDto, @Req() req: Request) {
    await this.authService.revisePassword(revisePasswordDto, req.user as UserAccountDto)
  }

  @Delete('delete-user')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteUser(@Req() req: Request) {
    return this.authService.deleteUser(req.user)
  }
}
