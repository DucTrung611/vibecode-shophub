import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../shared/types/auth.types';
import { ListNotificationsQueryDto } from './dto/list-notifications.query.dto';
import { NotificationService } from './notification.service';

@Controller({ path: 'notifications', version: '1' })
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListNotificationsQueryDto,
  ) {
    return this.notificationService.list(user.id, query.page, query.limit);
  }

  @Patch(':id/read')
  markRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationService.markRead(user.id, id);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  markAllRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationService.markAllRead(user.id);
  }
}
