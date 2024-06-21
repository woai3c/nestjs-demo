import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from '@/modules/users/users.service'
import { Users } from '@/modules/users/users.schema'
import { getModelToken } from '@nestjs/mongoose'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Model } from 'mongoose'
import { TEST_NEW_USER_PASSWORD, TEST_USER_ID, TEST_USER_NAME, TEST_USER_PASSWORD } from '@tests/constants'
import { Role, UsersDto } from '@/modules/users/users.dto'
import { CustomI18nService } from '@/services/custom-i18n'
import { I18nContext, I18nService } from 'nestjs-i18n'

describe('UsersService', () => {
  let service: UsersService
  let model: Model<Users>

  const mockUser = {
    _id: TEST_USER_ID,
    username: TEST_USER_NAME,
    password: TEST_USER_PASSWORD,
  }

  const mockUsersModel = {
    create: jest.fn().mockResolvedValue(mockUser),
    find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockUser]) }),
    findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) }),
    findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) }),
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockUser),
    findByIdAndDelete: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) }),
  }

  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomI18nService,
        UsersService,
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockImplementation((key: string, options?: any) => key), // 模拟实现 t 方法
          },
        },
        {
          provide: getModelToken(Users.name),
          useValue: mockUsersModel,
        },
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: mockRedis,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    model = module.get<Model<Users>>(getModelToken(Users.name))

    jest.spyOn(I18nContext, 'current').mockReturnValue({
      lang: 'en',
    } as any)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a user', async () => {
      expect(await service.create(mockUser)).toEqual(mockUser)
      expect(model.create).toHaveBeenCalledWith(mockUser)
    })

    it('should throw BadRequestException if missing required fields', async () => {
      const missingFields = { username: 'username' } // Only username provided, missing password
      await expect(service.create(missingFields as UsersDto)).rejects.toThrow(BadRequestException)
    })
  })

  describe('findById', () => {
    it('should return a single user', async () => {
      expect(await service.findById(mockUser._id)).toEqual(mockUser)
      expect(model.findById).toHaveBeenCalledWith(mockUser._id)
    })

    it('should throw NotFoundException if user not found', async () => {
      mockUsersModel.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) })

      await expect(service.findById(mockUser._id)).rejects.toThrow(NotFoundException)
    })
  })

  describe('findAll', () => {
    it('should return all users', async () => {
      expect(await service.findAll()).toEqual([mockUser])
      expect(model.find).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('should return a single user', async () => {
      const query = { username: TEST_USER_NAME }
      expect(await service.findOne(query)).toEqual(mockUser)
      expect(model.findOne).toHaveBeenCalledWith(query)
    })
  })

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = { password: TEST_NEW_USER_PASSWORD }
      mockUsersModel.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockUser, ...updateDto }),
      })

      expect(await service.update(mockUser._id, updateDto)).toEqual({
        ...mockUser,
        ...updateDto,
      })

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(mockUser._id, updateDto, { new: true })
    })

    it('should throw NotFoundException if user not found', async () => {
      const updateDto = { password: TEST_NEW_USER_PASSWORD }
      mockUsersModel.findByIdAndUpdate = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) })

      await expect(service.update(mockUser._id, updateDto)).rejects.toThrow(NotFoundException)
    })
  })

  describe('delete', () => {
    it('should delete a user', async () => {
      mockUsersModel.findByIdAndDelete = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) })
      expect(await service.delete(mockUser._id)).toEqual(mockUser)
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockUser._id)
    })

    it('should throw NotFoundException if user not found', async () => {
      mockUsersModel.findByIdAndDelete = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) })

      await expect(service.delete(mockUser._id)).rejects.toThrow(NotFoundException)
    })
  })

  describe('assignRole', () => {
    it('should assign a role to a user', async () => {
      const assignRoleDto = { userId: mockUser._id, role: Role.Admin }
      const updatedUser = {
        ...mockUser,
        role: Role.Admin,
        save: jest.fn().mockResolvedValue({ ...mockUser, role: Role.Admin }),
      }

      mockUsersModel.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedUser) })

      expect(await service.assignRole(assignRoleDto)).toEqual(
        expect.objectContaining({
          _id: updatedUser._id,
          username: updatedUser.username,
          password: updatedUser.password,
          role: updatedUser.role,
        }),
      )

      expect(model.findById).toHaveBeenCalledWith(mockUser._id)
    })

    it('should throw NotFoundException if user not found', async () => {
      const assignRoleDto = { userId: mockUser._id, role: Role.Admin }
      mockUsersModel.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) })

      await expect(service.assignRole(assignRoleDto)).rejects.toThrow(NotFoundException)
    })
  })

  // Redis-specific tests
  describe('Redis operations', () => {
    it('should update redis session on user role assignment', async () => {
      const assignRoleDto = { userId: mockUser._id, role: Role.Admin }
      const updatedUser = {
        ...mockUser,
        role: Role.Admin,
        save: jest.fn().mockResolvedValue({ ...mockUser, role: Role.Admin }),
      }

      mockUsersModel.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedUser) })
      mockRedis.get = jest.fn().mockResolvedValue(JSON.stringify({ userId: mockUser._id, role: Role.User }))

      await service.assignRole(assignRoleDto)

      expect(mockRedis.get).toHaveBeenCalledWith(mockUser._id)
      expect(mockRedis.set).toHaveBeenCalledWith(
        mockUser._id,
        JSON.stringify({ userId: mockUser._id, role: Role.Admin }),
      )
    })

    it('should delete redis session on user deletion', async () => {
      mockUsersModel.findByIdAndDelete = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) })
      await service.delete(mockUser._id)

      expect(mockRedis.del).toHaveBeenCalledWith(mockUser._id)
    })
  })
})
