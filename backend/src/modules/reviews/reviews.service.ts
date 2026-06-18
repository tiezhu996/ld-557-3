import { Injectable, NotFoundException } from '@nestjs/common';
import { CurrentUser } from '../../types/request';
import { PortfoliosService } from '../portfolios/portfolios.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

interface ReviewRecord {
  id: number;
  portfolioId: number;
  period: string;
  summary: string;
  decisions: Array<Record<string, unknown>>;
  lessons: string;
  createdAt: string;
}

@Injectable()
export class ReviewsService {
  private readonly reviews: ReviewRecord[] = [];
  private nextId = 1;

  constructor(private readonly portfoliosService: PortfoliosService) {}

  list(portfolioId: number, user: CurrentUser) {
    this.portfoliosService.findOwned(portfolioId, user);
    return this.reviews.filter((item) => item.portfolioId === portfolioId);
  }

  create(portfolioId: number, dto: CreateReviewDto, user: CurrentUser) {
    this.portfoliosService.findOwned(portfolioId, user);
    const review: ReviewRecord = {
      id: this.nextId++,
      portfolioId,
      period: dto.period,
      summary: dto.summary,
      decisions: dto.decisions ?? [],
      lessons: dto.lessons ?? '',
      createdAt: new Date().toISOString(),
    };
    this.reviews.push(review);
    return review;
  }

  update(id: number, dto: UpdateReviewDto, user: CurrentUser) {
    const review = this.findOwned(id, user);
    Object.assign(review, dto);
    return review;
  }

  delete(id: number, user: CurrentUser) {
    const review = this.findOwned(id, user);
    this.reviews.splice(this.reviews.indexOf(review), 1);
    return { deleted: true, id };
  }

  private findOwned(id: number, user: CurrentUser) {
    const review = this.reviews.find((item) => item.id === id);
    if (!review) throw new NotFoundException('review not found');
    this.portfoliosService.findOwned(review.portfolioId, user);
    return review;
  }
}
