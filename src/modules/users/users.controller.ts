import { AssignRoleDto, Role, UpdateUsersDto, UsersDto } from './users.dto'
import { Users } from './users.schema'
import { UsersService } from './users.service'
import { Body, Controller, Get, Post, Put, Delete, Param, UseGuards } from '@nestjs/common'
import { Roles } from '../auth/decorators/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger'

@ApiTags('users')
@Controller('users')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.SuperAdmin)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: UsersDto })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() usersDto: UsersDto): Promise<Users> {
    return this.usersService.create(usersDto)
  }

  @Get()
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(): Promise<Users[]> {
    return this.usersService.findAll()
  }

  @Get(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', required: true, description: 'The ID of the user' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findById(@Param('id') id: string): Promise<Users> {
    return this.usersService.findById(id)
  }

  @Put('assign-role')
  @Roles(Role.SuperAdmin)
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({ status: 200, description: 'Role assigned successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.usersService.assignRole(assignRoleDto)
  }

  @Put(':id')
  @Roles(Role.SuperAdmin)
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', required: true, description: 'The ID of the user' })
  @ApiBody({ type: UpdateUsersDto })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  update(@Param('id') id: string, @Body() usersDto: UpdateUsersDto): Promise<Users> {
    return this.usersService.update(id, usersDto)
  }

  @Delete(':id')
  @Roles(Role.SuperAdmin)
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', required: true, description: 'The ID of the user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  delete(@Param('id') id: string): Promise<Users> {
    return this.usersService.delete(id)
  }
}
