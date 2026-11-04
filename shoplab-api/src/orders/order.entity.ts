import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderStatus } from '../common/enums';
import { OrderItem } from './order-item.entity';

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'varchar', default: OrderStatus.Paid })
  status!: OrderStatus;

  @Column({ type: 'float' })
  total!: number;

  @Column({ type: 'simple-json' })
  shippingAddress!: ShippingAddress;

  @Column({ type: 'varchar' })
  paymentLast4!: string;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items!: OrderItem[];

  @CreateDateColumn()
  createdAt!: Date;
}
