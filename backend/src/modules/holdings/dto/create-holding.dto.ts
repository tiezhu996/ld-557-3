import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateHoldingDto {
  @ApiProperty({ example: 'AAPL' })
  @IsString()
  symbol: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0.000001)
  quantity: number;

  @ApiProperty({ example: 185.3 })
  @IsNumber()
  @Min(0)
  avgCost: number;
}

