import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: '2026-Q2' })
  @IsString()
  period: string;

  @ApiProperty({ example: '本季度降低单一科技股敞口，组合波动下降。' })
  @IsString()
  summary: string;

  @ApiProperty({ example: [{ action: 'rebalance', reason: '估值回归' }], required: false })
  @IsOptional()
  @IsArray()
  decisions?: Array<Record<string, unknown>>;

  @ApiProperty({ example: '卖出计划需要预设触发条件。', required: false })
  @IsOptional()
  @IsString()
  lessons?: string;
}

