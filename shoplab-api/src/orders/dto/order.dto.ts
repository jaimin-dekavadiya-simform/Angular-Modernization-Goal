import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { OrderStatus } from '../../common/enums';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ShippingAddressDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  fullName!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  line1!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  line2?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  city!: string;

  @IsString()
  @Matches(/^[A-Za-z0-9 -]{3,10}$/, { message: 'postalCode is invalid' })
  postalCode!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  country!: string;
}

/** Fake payment: a card number ending in 0002 is declined (HTTP 402). */
export class PaymentDto {
  @Matches(/^\d{16}$/, { message: 'cardNumber must be 16 digits' })
  cardNumber!: string;

  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'expiry must be MM/YY' })
  expiry!: string;

  @Matches(/^\d{3,4}$/, { message: 'cvc must be 3 or 4 digits' })
  cvc!: string;
}

export class CheckoutDto {
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress!: ShippingAddressDto;

  @ValidateNested()
  @Type(() => PaymentDto)
  payment!: PaymentDto;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}

export class AdminOrderQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
