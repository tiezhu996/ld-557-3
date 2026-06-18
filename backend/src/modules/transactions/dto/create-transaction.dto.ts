import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { TransactionType } from '../../../constants/enums';

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 190.5 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 1.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fee?: number;

  @ApiProperty({ example: '2026-06-16T09:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  executedAt?: string;
}

