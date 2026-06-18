import { Module } from '@nestjs/common';
import { HoldingsModule } from '../holdings/holdings.module';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [PortfoliosModule, HoldingsModule, TransactionsModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
