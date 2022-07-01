import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';

@Table
export class Role extends Model<Role> {
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    autoIncrement: true,
    unique: true,
    primaryKey: true,
  })
  public id: number;

  @Column({
    type: DataType.STRING(100),
    validate: {
      len: [3, 100],
    },
  })
  roleName: string;

  @Column({
    type: DataType.TEXT,
  })
  permission: string;

  @HasMany(() => User)
  users: User[];
}
