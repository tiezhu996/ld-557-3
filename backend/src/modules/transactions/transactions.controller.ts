import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUserDecorator } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../types/request';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('holdings/:holdingId/transactions')
  byHolding(@Param('holdingId', ParseIntPipe) holdingId: number, @CurrentUserDecorator() user: CurrentUser) {
    return this.transactionsService.listByHolding(holdingId, user);
  }

  @Post('holdings/:holdingId/transactions')
  create(@Param('holdingId', ParseIntPipe) holdingId: number, @Body() dto: CreateTransactionDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.transactionsService.create(holdingId, dto, user);
  }

  @Get('portfolios/:portfolioId/transactions')
  byPortfolio(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.transactionsService.listByPortfolio(portfolioId, user, Number(page), Number(pageSize));
  }
}

