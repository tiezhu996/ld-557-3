import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateReviewDraftDto {
  @ApiProperty({ example: '2026-Q2', description: '复盘周期，支持格式：2026-Q1、2026-01、2026、2026-01-01~2026-03-31' })
  @IsString()
  @IsNotEmpty()
  period: string;
}
