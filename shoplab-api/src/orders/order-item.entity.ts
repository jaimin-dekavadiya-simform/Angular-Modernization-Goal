import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order?: Order;

  @Column({ type: 'int' })
  productId!: number;

  @Column({ type: 'varchar' })
  productName!: string;

  @Column({ type: 'float' })
  unitPrice!: number;

  @Column({ type: 'int' })
  quantity!: number;
}
