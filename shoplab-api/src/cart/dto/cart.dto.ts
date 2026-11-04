import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class AddCartItemDto {
  @Type(() => Number)
  @IsInt()
  productId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number = 1;
}

export class UpdateCartItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;
}
