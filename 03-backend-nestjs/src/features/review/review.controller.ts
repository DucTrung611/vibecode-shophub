import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../shared/types/auth.types';
import { CreateReviewDto } from './dto/create-review.dto';
import { ListReviewsQueryDto } from './dto/list-reviews.query.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { ReviewService } from './review.service';

@Controller({ version: '1' })
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('reviews')
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateReviewDto) {
    return this.reviewService.create(user.id, dto);
  }

  @Public()
  @Get('products/:id/reviews')
  listForProduct(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ListReviewsQueryDto,
  ) {
    return this.reviewService.listForProduct(id, query.page, query.limit);
  }

  @Roles('seller')
  @Post('reviews/:id/reply')
  reply(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReplyReviewDto,
  ) {
    return this.reviewService.reply(user.id, id, dto.reply);
  }
}
