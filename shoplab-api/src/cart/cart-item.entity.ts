import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Product } from '../products/product.entity';

@Entity('cart_items')
@Unique(['userId', 'productId'])
export class CartItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'int' })
  productId!: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE', eager: true })
  product!: Product;

  @Column({ type: 'int' })
  quantity!: number;
}
