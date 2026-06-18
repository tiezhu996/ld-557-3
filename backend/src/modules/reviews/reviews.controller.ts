import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUserDecorator } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../types/request';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('portfolios/:portfolioId/reviews')
  list(@Param('portfolioId', ParseIntPipe) portfolioId: number, @CurrentUserDecorator() user: CurrentUser) {
    return this.reviewsService.list(portfolioId, user);
  }

  @Post('portfolios/:portfolioId/reviews')
  create(@Param('portfolioId', ParseIntPipe) portfolioId: number, @Body() dto: CreateReviewDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.reviewsService.create(portfolioId, dto, user);
  }

  @Put('reviews/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReviewDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.reviewsService.update(id, dto, user);
  }

  @Delete('reviews/:id')
  delete(@Param('id', ParseIntPipe) id: number, @CurrentUserDecorator() user: CurrentUser) {
    return this.reviewsService.delete(id, user);
  }
}

