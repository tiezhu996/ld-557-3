import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUserDecorator } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../types/request';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateHoldingDto } from './dto/create-holding.dto';
import { HoldingsService } from './holdings.service';

@ApiTags('holdings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class HoldingsController {
  constructor(private readonly holdingsService: HoldingsService) {}

  @Get('portfolios/:portfolioId/holdings')
  list(@Param('portfolioId', ParseIntPipe) portfolioId: number, @CurrentUserDecorator() user: CurrentUser) {
    return this.holdingsService.listByPortfolio(portfolioId, user);
  }

  @Post('portfolios/:portfolioId/holdings')
  create(@Param('portfolioId', ParseIntPipe) portfolioId: number, @Body() dto: CreateHoldingDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.holdingsService.create(portfolioId, dto, user);
  }

  @Get('holdings/:id')
  detail(@Param('id', ParseIntPipe) id: number, @CurrentUserDecorator() user: CurrentUser) {
    return this.holdingsService.findOwned(id, user);
  }

  @Delete('holdings/:id')
  delete(@Param('id', ParseIntPipe) id: number, @CurrentUserDecorator() user: CurrentUser) {
    return this.holdingsService.delete(id, user);
  }
}

