import { Test } from '@nestjs/testing';
import { AuthService } from '@/modules/auth/auth.service';
import { UsersService } from '@/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  TEST_EMAIL,
  TEST_NEW_TOKEN,
  TEST_NEW_USER_PASSWORD,
  TEST_REFRESH_TOKEN,
  TEST_TOKEN,
  TEST_USER_ID,
  TEST_USER_NAME,
  TEST_USER_PASSWORD,
} from '@tests/constants';
import { TOKEN_DURATION } from '@/modules/auth/constants';

describe('AuthService', () => {
  let authService: AuthService; // Use the actual AuthService type
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      findOne: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should throw a BadRequestException if username or password are not provided', async () => {
      await expect(authService.validateUser('', '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an UnauthorizedException if user is not found', async () => {
      await expect(
        authService.validateUser(TEST_USER_NAME, TEST_USER_PASSWORD),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw an UnauthorizedException if the account is locked', async () => {
      const lockedUser = {
        _id: TEST_USER_ID,
        username: TEST_USER_NAME,
        password: TEST_USER_PASSWORD,
        lockUntil: Date.now() + 1000 * 60 * 5, // The account is locked for 5 minutes
      };

      usersService.findOne.mockResolvedValueOnce(lockedUser);

      await expect(
        authService.validateUser(TEST_USER_NAME, TEST_USER_PASSWORD),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw an UnauthorizedException if the password does not match', async () => {
      bcrypt.compareSync = jest.fn().mockReturnValueOnce(false); // Mock bcrypt.compareSync return false
      const userWithPassword = {
        _id: TEST_USER_ID,
        username: TEST_USER_NAME,
        password: bcrypt.hashSync(TEST_USER_PASSWORD, 10),
        failedLoginAttempts: 1,
      };

      usersService.findOne.mockResolvedValueOnce(userWithPassword); // Mock findOne return userWithPassword

      await expect(
        authService.validateUser(TEST_USER_NAME, 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return a partial user object if username and password are correct', async () => {
      bcrypt.compareSync = jest.fn().mockReturnValueOnce(true); // Mock bcrypt.compareSync return true
      const validUser = {
        _id: TEST_USER_ID,
        username: TEST_USER_NAME,
        password: bcrypt.hashSync(TEST_USER_PASSWORD, 10),
        failedLoginAttempts: 0,
        lockUntil: null,
      };

      usersService.findOne.mockResolvedValueOnce(validUser);

      const result = await authService.validateUser(
        TEST_USER_NAME,
        TEST_USER_PASSWORD,
      );

      expect(result.userId).toEqual(validUser._id);
      expect(result.username).toEqual(TEST_USER_NAME);
    });
  });

  describe('refreshToken', () => {
    it('should exchange the old token with a new one', async () => {
      const oldToken = TEST_TOKEN;
      const newToken = TEST_NEW_TOKEN;
      const newTokenData = {
        access_token: TEST_NEW_TOKEN,
        refresh_token: TEST_NEW_TOKEN,
        expires_in: TOKEN_DURATION,
      };
      const userId = TEST_USER_ID;
      const user = {
        _id: TEST_USER_ID,
        username: TEST_USER_NAME,
      };

      const payload = { username: TEST_USER_NAME, userId };
      const newPayload = { username: user.username, userId: user._id };

      // mock JwtService methods related to refreshing
      jwtService.verify.mockReturnValue(payload);
      jwtService.sign.mockReturnValue(newToken);
      usersService.findOne.mockResolvedValueOnce(user);

      // call the refreshToken method
      const result = await authService.refreshToken(oldToken);

      expect(jwtService.verify).toHaveBeenCalledWith(oldToken);
      expect(jwtService.sign).toHaveBeenCalledWith(newPayload);
      expect(result).toEqual(newTokenData);
    });

    it('should throw BadRequestException if refreshToken is empty', async () => {
      await expect(authService.refreshToken('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw UnauthorizedException if refreshToken is error', async () => {
      await expect(
        authService.refreshToken('sfdfdsdfsdfdfsdsfssfsf'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const oldToken = TEST_TOKEN;
      const userId = TEST_USER_ID;
      const payload = { username: TEST_USER_NAME, userId };

      // mock JwtService methods related to refreshing
      jwtService.verify.mockReturnValue(payload);
      usersService.findOne.mockResolvedValueOnce(null);

      await expect(authService.refreshToken(oldToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('revisePassword', () => {
    it('should throw UnauthorizedException if new password is the same as old password', async () => {
      const revisePasswordDto = {
        oldPassword: TEST_USER_PASSWORD,
        newPassword: TEST_USER_PASSWORD,
      };
      const user = { userId: TEST_USER_ID, username: TEST_USER_NAME };

      await expect(
        authService.revisePassword(revisePasswordDto, user),
      ).rejects.toThrow("The new password can't the same as the old password");
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const revisePasswordDto = {
        oldPassword: TEST_USER_PASSWORD,
        newPassword: TEST_NEW_USER_PASSWORD,
      };
      const user = { userId: TEST_USER_ID, username: TEST_USER_NAME };

      usersService.findById.mockResolvedValueOnce(null);

      await expect(
        authService.revisePassword(revisePasswordDto, user),
      ).rejects.toThrow('User not found');
    });

    it('should successfully update the password if the old password is correct', async () => {
      const revisePasswordDto = {
        oldPassword: TEST_USER_PASSWORD,
        newPassword: TEST_NEW_USER_PASSWORD,
      };
      const user = { userId: TEST_USER_ID, username: TEST_USER_NAME };
      const entity = {
        _id: TEST_USER_ID,
        password: bcrypt.hashSync(TEST_USER_PASSWORD, 10),
      };

      usersService.findById.mockResolvedValueOnce(entity);
      usersService.update.mockResolvedValueOnce(true);
      bcrypt.compareSync = jest.fn().mockReturnValueOnce(true);

      const result = await authService.revisePassword(revisePasswordDto, user);

      expect(result).toEqual(true); // or check for whatever the 'update' method returns
      expect(usersService.update).toHaveBeenCalledWith(user.userId, {
        password: expect.any(String),
      });
    });

    // Test case for wrong old password scenario
    it('should throw UnauthorizedException if the old password is incorrect', async () => {
      const revisePasswordDto = {
        oldPassword: TEST_USER_PASSWORD,
        newPassword: TEST_NEW_USER_PASSWORD,
      };
      const user = { userId: TEST_USER_ID, username: TEST_USER_NAME };
      const entity = {
        _id: TEST_USER_ID,
        password: bcrypt.hashSync(TEST_USER_PASSWORD, 10),
      };

      usersService.findById.mockResolvedValueOnce(entity);
      bcrypt.compareSync = jest.fn().mockReturnValueOnce(false);

      await expect(
        authService.revisePassword(revisePasswordDto, user),
      ).rejects.toThrow('Wrong password');
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens for provided user', () => {
      const userAccountDto = { userId: TEST_USER_ID, username: TEST_USER_NAME };
      const access_token = TEST_TOKEN;
      const refresh_token = TEST_REFRESH_TOKEN;

      jwtService.sign.mockImplementation((payload, options) =>
        options && options.expiresIn === '7d' ? refresh_token : access_token,
      );

      const result = authService.login(userAccountDto);

      expect(result.access_token).toEqual(access_token);
      expect(result.refresh_token).toEqual(refresh_token);
      expect(result.expires_in).toEqual(TOKEN_DURATION);
    });
  });

  describe('profile', () => {
    it('should throw an UnauthorizedException if user is not found', async () => {
      const userAccountDto = { userId: TEST_USER_ID, username: TEST_USER_NAME };

      usersService.findById.mockResolvedValueOnce(null);

      await expect(authService.profile(userAccountDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return user profile details excluding password', async () => {
      const userAccountDto = { userId: TEST_USER_ID, username: TEST_USER_NAME };
      const userEntity = {
        _id: TEST_USER_ID,
        username: TEST_USER_NAME,
        password: TEST_USER_PASSWORD,
        email: TEST_EMAIL,
        toObject: function () {
          return { _id: this._id, username: this.username, email: this.email };
        },
      };

      usersService.findById.mockResolvedValueOnce(userEntity);

      const profile = await authService.profile(userAccountDto);

      expect(profile).toEqual({
        _id: TEST_USER_ID,
        username: TEST_USER_NAME,
        email: TEST_EMAIL,
      });
    });
  });

  describe('register', () => {
    it('should throw BadRequestException if username or password is not provided', async () => {
      const usersDto = { username: '', password: '' };

      await expect(authService.register(usersDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if password pattern is incorrect', async () => {
      const usersDto = { username: TEST_USER_NAME, password: 'short' };

      await expect(authService.register(usersDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if user already exists', async () => {
      const usersDto = {
        username: TEST_USER_NAME,
        password: TEST_USER_PASSWORD,
      };

      usersService.findOne.mockResolvedValueOnce({});

      await expect(authService.register(usersDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should successfully register a new user if they do not exist', async () => {
      const usersDto = {
        username: TEST_USER_NAME,
        password: TEST_USER_PASSWORD, // make sure this password matches the regex pattern
      };

      usersService.findOne.mockResolvedValueOnce(null); // to simulate user does not exist
      const createdUser = {
        _id: TEST_USER_ID,
        username: TEST_USER_NAME,
        password: bcrypt.hashSync(usersDto.password, 10),
      };
      usersService.create.mockResolvedValueOnce(createdUser);
      jwtService.sign.mockReturnValueOnce(TEST_TOKEN);
      jwtService.sign.mockReturnValueOnce(TEST_REFRESH_TOKEN);

      const result = await authService.register(usersDto);

      expect(usersService.findOne).toHaveBeenCalledWith({
        username: TEST_USER_NAME,
      });
      expect(usersService.create).toHaveBeenCalledWith({
        ...usersDto,
        password: expect.any(String),
      });

      expect(result).toHaveProperty('access_token', TEST_TOKEN);
      expect(result).toHaveProperty('refresh_token', TEST_REFRESH_TOKEN);
      expect(result).toHaveProperty('expires_in', TOKEN_DURATION);
    });
  });

  describe('deleteUser', () => {
    it('should call usersService.delete with userId of the user', async () => {
      const userAccountDto = { userId: TEST_USER_ID, username: TEST_USER_NAME };

      await authService.deleteUser(userAccountDto);

      expect(usersService.delete).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it('should throw an error if deletion fails', async () => {
      const userAccountDto = { userId: TEST_USER_ID, username: TEST_USER_NAME };
      const deletionError = new Error('Deletion failed');

      usersService.delete.mockRejectedValueOnce(deletionError);

      await expect(authService.deleteUser(userAccountDto)).rejects.toThrow(
        deletionError,
      );
    });
  });
});
