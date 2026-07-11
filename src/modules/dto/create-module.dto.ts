import { IsString } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  productId: string;

  @IsString()
  name: string;
}
