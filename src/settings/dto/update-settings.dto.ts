import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  brandColor?: string;

  @IsOptional()
  @IsBoolean()
  showModules?: boolean;

  @IsOptional()
  @IsBoolean()
  showLevel1?: boolean;

  @IsOptional()
  @IsBoolean()
  showLevel2?: boolean;

  @IsOptional()
  @IsBoolean()
  showLevel3?: boolean;

  @IsOptional()
  @IsBoolean()
  showExactDates?: boolean;
}
