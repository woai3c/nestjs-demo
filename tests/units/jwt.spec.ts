import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from '@/modules/auth/local.strategy';
import { JwtStrategy } from '@/modules/auth/jwt.strategy';
import { AuthService } from '@/modules/auth/auth.service';
import { UserAccountDto } from '@/modules/users/users.dto';
import {
  TEST_USER_ID,
  TEST_USER_NAME,
  TEST_USER_PASSWORD,
} from '@/modules/auth/constants';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let authService: AuthService;

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
    }).compile();

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('should validate user', async () => {
    const result = await localStrategy.validate(
      TEST_USER_NAME,
      TEST_USER_PASSWORD,
    );
    expect(result).toEqual({ userId: TEST_USER_ID, username: TEST_USER_NAME });
    expect(authService.validateUser).toHaveBeenLastCalledWith(
      TEST_USER_NAME,
      TEST_USER_PASSWORD,
    );
  });
});

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

  beforeEach(() => {
    jwtStrategy = new JwtStrategy();
  });

  it('should validate token payload', async () => {
    const payload: UserAccountDto = {
      userId: TEST_USER_ID,
      username: TEST_USER_PASSWORD,
    };

    expect(await jwtStrategy.validate(payload)).toEqual(payload);
  });
});
