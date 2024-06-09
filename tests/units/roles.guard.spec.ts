import { Reflector } from '@nestjs/core'
import { ExecutionContext } from '@nestjs/common'
import { RolesGuard } from '@/modules/auth/roles.guard'
import { Role } from '@/modules/users/users.dto'

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard
  let reflector: Reflector

  beforeEach(() => {
    reflector = new Reflector()
    rolesGuard = new RolesGuard(reflector)
  })

  it('should return true if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined)

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({ user: { role: Role.User } }),
    } as unknown as ExecutionContext

    expect(rolesGuard.canActivate(context)).toBe(true)
  })

  it('should return true if user has the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin])

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({ user: { role: Role.Admin } }),
    } as unknown as ExecutionContext

    expect(rolesGuard.canActivate(context)).toBe(true)
  })

  it('should return false if user does not have the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin])

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({ user: { role: Role.User } }),
    } as unknown as ExecutionContext

    expect(rolesGuard.canActivate(context)).toBe(false)
  })
})
