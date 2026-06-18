import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MarketService } from './market.service';

@ApiTags('market')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('quote/:symbol')
  quote(@Param('symbol') symbol: string) {
    return this.marketService.quote(symbol);
  }

  @Get('search')
  search(@Query('q') q = '') {
    return this.marketService.search(q);
  }

  @Get('history/:symbol')
  history(@Param('symbol') symbol: string, @Query('period') period = '1m') {
    return this.marketService.history(symbol, period);
  }

  @Get('trending')
  trending() {
    return this.marketService.trending();
  }
}

