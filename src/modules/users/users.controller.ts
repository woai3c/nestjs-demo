import { UsersService } from './users.service';
import { Controller } from '@nestjs/common';

// TODO: Implement role-based access control.
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // create(@Body() usersDto: UsersDto): Promise<Users> {
  //   return this.usersService.create(usersDto);
  // }

  // @Get()
  // findAll(): Promise<Users[]> {
  //   return this.usersService.findAll();
  // }

  // @Get(':id')
  // findById(@Param('id') id: string): Promise<Users> {
  //   return this.usersService.findById(id);
  // }

  // @Put(':id')
  // update(@Param('id') id: string, @Body() usersDto: UsersDto): Promise<Users> {
  //   return this.usersService.update(id, usersDto);
  // }

  // @Delete(':id')
  // delete(@Param('id') id: string): Promise<Users> {
  //   return this.usersService.delete(id);
  // }
}
