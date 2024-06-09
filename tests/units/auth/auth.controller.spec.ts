import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from '@/modules/auth/auth.controller'
import { AuthService } from '@/modules/auth/auth.service'

import { RefreshTokenDto, RevisePasswordDto, UsersDto } from '@/modules/users/users.dto'

import {
  TEST_NEW_REFRESH_TOKEN,
  TEST_NEW_TOKEN,
  TEST_REFRESH_TOKEN,
  TEST_TOKEN,
  TEST_USER_ID,
  TEST_USER_NAME,
  TEST_USER_PASSWORD,
} from '@tests/constants'
import { TOKEN_DURATION } from '@/modules/auth/constants'

describe('AuthController', () => {
  let controller: AuthController
  let authService: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue({
              access_token: TEST_TOKEN,
              refresh_token: TEST_REFRESH_TOKEN,
              expires_in: TOKEN_DURATION,
            }),
            login: jest.fn().mockResolvedValue({
              access_token: TEST_TOKEN,
              refresh_token: TEST_REFRESH_TOKEN,
              expires_in: TOKEN_DURATION,
            }),
            profile: jest.fn().mockResolvedValue({ username: TEST_USER_NAME }),
            refreshToken: jest.fn().mockResolvedValue({
              access_token: TEST_NEW_TOKEN,
              refresh_token: TEST_NEW_REFRESH_TOKEN,
              expires_in: TOKEN_DURATION,
            }),
            revisePassword: jest.fn().mockResolvedValue(true),
            deleteUser: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get<AuthService>(AuthService)
  })

  it('should call register', async () => {
    const usersDto: UsersDto = {
      username: TEST_USER_NAME,
      password: TEST_USER_PASSWORD,
    }

    ;(authService.register as jest.Mock).mockResolvedValue({
      access_token: TEST_TOKEN,
      refresh_token: TEST_REFRESH_TOKEN,
      expires_in: TOKEN_DURATION,
    })

    const result = await controller.register(usersDto as UsersDto)

    expect(authService.register).toHaveBeenCalledWith(usersDto)
    expect(result.access_token).toBe(TEST_TOKEN)
  })

  it('should call login', async () => {
    const loginDto = {
      username: TEST_USER_NAME,
      password: TEST_USER_PASSWORD,
    }

    ;(authService.login as jest.Mock).mockResolvedValue({
      access_token: TEST_TOKEN,
      refresh_token: TEST_REFRESH_TOKEN,
      expires_in: TOKEN_DURATION,
    })

    const result = await controller.login(loginDto as any)

    expect(result.access_token).toBe(TEST_TOKEN)
  })

  it('should call profile', async () => {
    const req = { user: { userId: TEST_USER_ID, username: TEST_USER_NAME } }

    ;(authService.profile as jest.Mock).mockResolvedValue({
      username: TEST_USER_NAME,
    })

    const result = await controller.profile(req as any)

    expect(authService.profile).toHaveBeenCalledWith(req.user)
    expect(result.username).toBe(TEST_USER_NAME)
  })

  it('should call refreshToken', async () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: TEST_REFRESH_TOKEN,
    }

    ;(authService.refreshToken as jest.Mock).mockResolvedValue({
      access_token: TEST_NEW_TOKEN,
      refresh_token: TEST_NEW_REFRESH_TOKEN,
      expires_in: TOKEN_DURATION,
    })

    const result = await controller.refreshToken(refreshTokenDto)

    expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto.refreshToken)
    expect(result.access_token).toBe(TEST_NEW_TOKEN)
  })

  it('should call revisePassword', async () => {
    const revisePasswordDto: RevisePasswordDto = {
      oldPassword: 'oldPassword',
      newPassword: 'newPassword',
    }

    const req = { user: { userId: TEST_USER_ID, username: TEST_USER_NAME } }

    ;(authService.revisePassword as jest.Mock).mockResolvedValue(undefined)

    const result = await controller.revisePassword(revisePasswordDto, req as any)

    expect(authService.revisePassword).toHaveBeenCalledWith(revisePasswordDto, req.user)

    expect(result).toBeUndefined()
  })

  it('should call deleteUser', async () => {
    const req = { user: { userId: TEST_USER_ID, username: TEST_USER_NAME } }

    ;(authService.deleteUser as jest.Mock).mockResolvedValue(true)

    const result = await controller.deleteUser(req as any)

    expect(authService.deleteUser).toHaveBeenCalledWith(req.user)
    expect(result).toBe(true)
  })
})
