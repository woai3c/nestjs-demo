import { AssignRoleDto, Role, UsersDto } from './users.dto'
import { Users } from './users.schema'
import { UsersService } from './users.service'
import { Body, Controller, Get, Post, Put, Delete, Param, UseGuards, ValidationPipe, UsePipes } from '@nestjs/common'
import { Roles } from '../auth/decorators/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.SuperAdmin)
  @UsePipes(new ValidationPipe({ skipMissingProperties: true }))
  create(@Body() usersDto: UsersDto): Promise<Users> {
    return this.usersService.create(usersDto)
  }

  @Get()
  @Roles(Role.Admin, Role.SuperAdmin)
  findAll(): Promise<Users[]> {
    return this.usersService.findAll()
  }

  @Get(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  findById(@Param('id') id: string): Promise<Users> {
    return this.usersService.findById(id)
  }

  @Put('/assign-role')
  @Roles(Role.SuperAdmin)
  async assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.usersService.assignRole(assignRoleDto)
  }

  @Put(':id')
  @Roles(Role.SuperAdmin)
  update(@Param('id') id: string, @Body() usersDto: UsersDto): Promise<Users> {
    return this.usersService.update(id, usersDto)
  }

  @Delete(':id')
  @Roles(Role.SuperAdmin)
  delete(@Param('id') id: string): Promise<Users> {
    return this.usersService.delete(id)
  }
}
