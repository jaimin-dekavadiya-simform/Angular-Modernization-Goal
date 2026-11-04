import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'int' })
  productId!: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product?: Product;

  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'varchar' })
  authorName!: string;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'text' })
  comment!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
