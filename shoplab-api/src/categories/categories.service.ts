import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { slugify } from '../common/slugify';
import { Category } from './category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  findAll() {
    return this.categories.find({ order: { name: 'ASC' } });
  }

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.name);
    if (await this.categories.findOne({ where: { slug } })) {
      throw new ConflictException('Category already exists');
    }
    return this.categories.save(
      this.categories.create({ name: dto.name, slug }),
    );
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.categories.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    if (dto.name) {
      category.name = dto.name;
      category.slug = slugify(dto.name);
    }
    return this.categories.save(category);
  }

  async remove(id: number) {
    const result = await this.categories.delete(id);
    if (!result.affected) throw new NotFoundException('Category not found');
  }
}
