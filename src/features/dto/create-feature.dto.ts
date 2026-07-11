import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { FeatureStatus, Visibility } from '@prisma/client';

export class CreateFeatureDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  moduleId?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(FeatureStatus)
  status?: FeatureStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  priority?: number;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  relaunchDate?: string;

  @IsOptional()
  @IsString()
  owner?: string;

  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;
}
