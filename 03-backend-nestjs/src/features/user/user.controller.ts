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
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../shared/types/auth.types';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserService } from './user.service';

@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getProfile(user.id);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(user.id, dto);
  }

  @Get('me/addresses')
  listAddresses(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.listAddresses(user.id);
  }

  @Post('me/addresses')
  @HttpCode(HttpStatus.CREATED)
  createAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAddressDto,
  ) {
    return this.userService.createAddress(user.id, dto);
  }

  @Patch('me/addresses/:id')
  updateAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.userService.updateAddress(user.id, id, dto);
  }

  @Delete('me/addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.userService.deleteAddress(user.id, id);
  }
}
