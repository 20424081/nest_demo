import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';

@Table
export class AccessUser extends Model<AccessUser> {
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    autoIncrement: true,
    unique: true,
    primaryKey: true,
  })
  public id: number;

  @Column({
    type: DataType.STRING(255),
    validate: {
      len: [1, 255],
    },
  })
  refreshToken: string;

  @Column({
    type: DataType.STRING(22),
    validate: {
      len: [1, 22],
    },
  })
  iPAddress: string;

  @Column({
    type: DataType.STRING(255),
    validate: {
      len: [1, 255],
    },
  })
  deviceToken: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT })
  userId: number;

  @BelongsTo(() => User, 'userId')
  user: User;
}
