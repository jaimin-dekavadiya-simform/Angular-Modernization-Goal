import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../common/auth-user';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UsersService } from '../users/users.service';
import { CreateReviewDto } from './dto/review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(
    private readonly reviews: ReviewsService,
    private readonly users: UsersService,
  ) {}

  @Public()
  @Get()
  list(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviews.list(productId);
  }

  @ApiBearerAuth()
  @Post()
  async create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateReviewDto,
    @CurrentUser() auth: AuthUser,
  ) {
    const user = await this.users.findById(auth.id);
    return this.reviews.create(
      { id: auth.id, name: user?.name ?? auth.email },
      productId,
      dto,
    );
  }
}
