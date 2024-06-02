import { Test, TestingModule } from '@nestjs/testing'
import { LocalStrategy } from '@/modules/auth/local.strategy'
import { JwtStrategy } from '@/modules/auth/jwt.strategy'
import { AuthService } from '@/modules/auth/auth.service'
import { UserAccountDto } from '@/modules/users/users.dto'
import { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtAuthGuard } from '@/modules/auth/auth.guard'
import { TEST_USER_ID, TEST_USER_NAME, TEST_USER_PASSWORD } from '@tests/constants'

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy
  let authService: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn().mockResolvedValue({
              userId: TEST_USER_ID,
              username: TEST_USER_NAME,
            }),
          },
        },
      ],
    }).compile()

    localStrategy = module.get<LocalStrategy>(LocalStrategy)
    authService = module.get<AuthService>(AuthService)
  })

  it('should validate user', async () => {
    const result = await localStrategy.validate(TEST_USER_NAME, TEST_USER_PASSWORD)

    expect(result).toEqual({ userId: TEST_USER_ID, username: TEST_USER_NAME })
    expect(authService.validateUser).toHaveBeenLastCalledWith(TEST_USER_NAME, TEST_USER_PASSWORD)
  })

  it('should throw error if username or password is missing', async () => {
    await expect(localStrategy.validate('', '')).rejects.toThrow('Username and password are required')
  })

  it('should throw error if user is not found', async () => {
    jest.spyOn(authService, 'validateUser').mockResolvedValue(null)

    await expect(localStrategy.validate(TEST_USER_NAME, TEST_USER_PASSWORD)).rejects.toThrow('Invalid credentials')
  })
})

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy

  beforeEach(() => {
    jwtStrategy = new JwtStrategy()
  })

  it('should validate token payload', async () => {
    const payload: UserAccountDto = {
      userId: TEST_USER_ID,
      username: TEST_USER_PASSWORD,
    }

    expect(await jwtStrategy.validate(payload)).toEqual(payload)
  })
})

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard
  let reflector: Reflector

  beforeEach(() => {
    reflector = new Reflector()
    guard = new JwtAuthGuard(reflector)
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })

  it('should return true if route is public', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true)

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext

    expect(guard.canActivate(context)).toBe(true)
  })
})
