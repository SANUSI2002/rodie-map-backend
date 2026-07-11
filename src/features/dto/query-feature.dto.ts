import { IsOptional, IsString } from 'class-validator';

export class QueryFeatureDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  moduleId?: string;

  @IsOptional()
  @IsString()
  status?: string; // comma-separated list of FeatureStatus

  @IsOptional()
  @IsString()
  priority?: string; // comma-separated list of 1-5

  @IsOptional()
  @IsString()
  visibility?: string; // comma-separated: PUBLIC,PRIVATE

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  publicOnly?: string; // 'true' to force only PUBLIC visibility features (public roadmap)
}
