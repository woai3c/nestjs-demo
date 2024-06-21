import { Test, TestingModule } from '@nestjs/testing'
import { UsersController } from '@/modules/users/users.controller'
import { UsersService } from '@/modules/users/users.service'
import { Role, AssignRoleDto } from '@/modules/users/users.dto'
import { RolesGuard } from '@/modules/auth/roles.guard'
import { Reflector } from '@nestjs/core'
import { TEST_USER_ID, TEST_USER_NAME, TEST_USER_PASSWORD } from '@tests/constants'
import { CustomI18nService } from '@/services/custom-i18n'
import { I18nContext, I18nService } from 'nestjs-i18n'

describe('UsersController', () => {
  let usersController: UsersController
  let usersService: UsersService

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    assignRole: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockImplementation((key: string) => key), // mock method t
          },
        },
        RolesGuard,
        Reflector,
        CustomI18nService,
      ],
    }).compile()

    usersController = module.get<UsersController>(UsersController)
    usersService = module.get<UsersService>(UsersService)

    jest.spyOn(I18nContext, 'current').mockReturnValue({
      lang: 'en',
    } as any)
  })

  it('should be defined', () => {
    expect(usersController).toBeDefined()
  })

  describe('create', () => {
    it('should call usersService.create with correct parameters', async () => {
      const usersDto = { username: TEST_USER_NAME, password: TEST_USER_PASSWORD }
      const result = { _id: TEST_USER_ID, role: Role.User, ...usersDto }
      mockUsersService.create.mockResolvedValue(result)

      expect(await usersController.create(usersDto)).toBe(result)
      expect(usersService.create).toHaveBeenCalledWith(usersDto)
    })
  })

  describe('findAll', () => {
    it('should call usersService.findAll', async () => {
      const result = [{ _id: TEST_USER_ID, username: TEST_USER_NAME, password: TEST_USER_PASSWORD, role: Role.User }]
      mockUsersService.findAll.mockResolvedValue(result)

      expect(await usersController.findAll()).toBe(result)
      expect(usersService.findAll).toHaveBeenCalled()
    })
  })

  describe('findById', () => {
    it('should call usersService.findById with correct id', async () => {
      const result = { _id: TEST_USER_ID, username: TEST_USER_NAME, password: TEST_USER_PASSWORD, role: Role.User }
      mockUsersService.findById.mockResolvedValue(result)

      expect(await usersController.findById(TEST_USER_ID)).toBe(result)
      expect(usersService.findById).toHaveBeenCalledWith(TEST_USER_ID)
    })
  })

  describe('assignRole', () => {
    it('should call usersService.assignRole with correct parameters', async () => {
      const assignRoleDto: AssignRoleDto = { userId: TEST_USER_ID, role: Role.Admin }
      const result = { _id: TEST_USER_ID, username: TEST_USER_NAME, role: Role.Admin }
      mockUsersService.assignRole.mockResolvedValue(result)

      expect(await usersController.assignRole(assignRoleDto)).toBe(result)
      expect(usersService.assignRole).toHaveBeenCalledWith(assignRoleDto)
    })
  })

  describe('update', () => {
    it('should call usersService.update with correct parameters', async () => {
      const usersDto = { username: TEST_USER_NAME, password: TEST_USER_PASSWORD }
      const result = { _id: TEST_USER_ID, role: Role.User, ...usersDto }
      mockUsersService.update.mockResolvedValue(result)

      expect(await usersController.update(TEST_USER_ID, usersDto)).toBe(result)
      expect(usersService.update).toHaveBeenCalledWith(TEST_USER_ID, usersDto)
    })
  })

  describe('delete', () => {
    it('should call usersService.delete with correct id', async () => {
      const result = { _id: TEST_USER_ID, username: TEST_USER_NAME, password: TEST_USER_PASSWORD, role: Role.User }
      mockUsersService.delete.mockResolvedValue(result)

      expect(await usersController.delete(TEST_USER_ID)).toBe(result)
      expect(usersService.delete).toHaveBeenCalledWith(TEST_USER_ID)
    })
  })
})
