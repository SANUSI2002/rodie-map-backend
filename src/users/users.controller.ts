import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Self-service password change - must be declared before ':id' routes so
  // 'me' is never mistaken for a user id.
  @Patch('me/password')
  changeOwnPassword(@CurrentUser() user: { id: string }, @Body() dto: ChangePasswordDto) {
    return this.usersService.changeOwnPassword(user.id, dto.currentPassword, dto.newPassword);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Roles(Role.SUPER_ADMIN)
  @Post()
  invite(@Body() dto: CreateUserDto, @CurrentUser() user: { name: string }) {
    return this.usersService.invite(dto, user?.name);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: { name: string }) {
    return this.usersService.update(id, dto, user?.name);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @CurrentUser() user: { name: string }) {
    return this.usersService.deactivate(id, user?.name);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id/reset-password')
  resetPassword(@Param('id') id: string, @CurrentUser() user: { name: string }) {
    return this.usersService.resetPassword(id, user?.name);
  }

  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { name: string }) {
    return this.usersService.remove(id, user?.name);
  }
}
