import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../shared/infra/orm/base.entity';
import { Role } from '../enums/role';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', default: Role.User })
  role: Role;
}
