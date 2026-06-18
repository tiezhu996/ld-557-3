import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PortfolioType, RiskLevel } from '../../../constants/enums';

export class CreatePortfolioDto {
  @ApiProperty({ example: '长期价值组合' })
  @IsString()
  name: string;

  @ApiProperty({ example: '以低换手股票和指数基金为主', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: PortfolioType })
  @IsEnum(PortfolioType)
  type: PortfolioType;

  @ApiProperty({ enum: RiskLevel })
  @IsEnum(RiskLevel)
  riskLevel: RiskLevel;
}

