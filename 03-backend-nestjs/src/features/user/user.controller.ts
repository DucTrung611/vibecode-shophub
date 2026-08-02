import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../shared/types/auth.types';
import { CreateAddressDto } from './dto/create-address.dto';
import { ListUsersQueryDto } from './dto/list-users.query.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UserService } from './user.service';

@Controller({ version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('users/me')
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getProfile(user.id);
  }

  @Patch('users/me')
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(user.id, dto);
  }

  @Get('users/me/addresses')
  listAddresses(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.listAddresses(user.id);
  }

  @Post('users/me/addresses')
  @HttpCode(HttpStatus.CREATED)
  createAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAddressDto,
  ) {
    return this.userService.createAddress(user.id, dto);
  }

  @Patch('users/me/addresses/:id')
  updateAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.userService.updateAddress(user.id, id, dto);
  }

  @Delete('users/me/addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.userService.deleteAddress(user.id, id);
  }

  @Roles('admin')
  @Get('admin/users')
  listUsers(@Query() query: ListUsersQueryDto) {
    return this.userService.listUsers(query);
  }

  @Roles('admin')
  @Patch('admin/users/:id/status')
  updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.userService.updateUserStatus(id, dto);
  }

  @Roles('admin')
  @Get('admin/reports/users')
  getWeeklySignupReport() {
    return this.userService.getWeeklySignups();
  }

  // Kept last so it doesn't shadow the more specific /users/me and /users/me/* routes above.
  @Get('users/:id')
  getPublicProfile(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getPublicProfile(id);
  }
}
