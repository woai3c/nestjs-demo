import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@/modules/users/users.service';
import { Users } from '@/modules/users/users.schema';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  TEST_NEW_USER_PASSWORD,
  TEST_USER_ID,
  TEST_USER_NAME,
  TEST_USER_PASSWORD,
} from '@tests/constants';

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<Users>;

  const mockUser = {
    _id: TEST_USER_ID,
    username: TEST_USER_NAME,
    password: TEST_USER_PASSWORD,
  };

  const mockUsersModel = {
    create: jest.fn().mockResolvedValue(mockUser),
    find: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue([mockUser]) }),
    findById: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) }),
    findOne: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) }),
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockUser),
    findByIdAndDelete: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(Users.name),
          useValue: mockUsersModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<Users>>(getModelToken(Users.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      expect(await service.create(mockUser)).toEqual(mockUser);
      expect(model.create).toHaveBeenCalledWith(mockUser);
    });

    // TO FIX: why this test is not working?
    // it('should throw BadRequestException if missing required fields', async () => {
    //   const missingFields = { username: 'username' };
    //   await expect(service.create(missingFields)).rejects.toThrow(
    //     'Missing required password or username',
    //   );
    // });
  });

  describe('findById', () => {
    it('should return a single user', async () => {
      expect(await service.findById(mockUser._id)).toEqual(mockUser);
      expect(model.findById).toHaveBeenCalledWith(mockUser._id);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersModel.findById = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.findById(mockUser._id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      expect(await service.findAll()).toEqual([mockUser]);
      expect(model.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const query = { username: TEST_USER_NAME };
      expect(await service.findOne(query)).toEqual(mockUser);
      expect(model.findOne).toHaveBeenCalledWith(query);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = { password: TEST_NEW_USER_PASSWORD };
      mockUsersModel.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockUser, ...updateDto }),
      });

      expect(await service.update(mockUser._id, updateDto)).toEqual({
        ...mockUser,
        ...updateDto,
      });

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser._id,
        updateDto,
        { new: true },
      );
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      expect(await service.delete(mockUser._id)).toEqual(mockUser);
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockUser._id);
    });
  });
});
