import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { AccessUser } from '../../access-user/entities/access-user.entity';
import { Role } from '../../role/entities/role.entity';

@Table
export class User extends Model<User> {
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
    unique: true,
    validate: {
      isEmail: true,
      len: [5, 100],
    },
  })
  email: string;

  @Column({
    type: DataType.STRING(200),
    validate: {
      len: [5, 200],
    },
  })
  name: string;

  @Column({
    type: DataType.STRING(255),
    validate: {
      len: [1, 255],
    },
  })
  password: string;

  @Column({
    type: DataType.STRING(255),
    validate: {
      len: [0, 255],
    },
  })
  address: string;

  @Column({
    type: DataType.STRING(100),
    validate: {
      len: [0, 255],
    },
  })
  facebookId: string;

  @Column({
    type: DataType.TEXT,
    validate: {
      len: [0, 500],
    },
  })
  facebookAccessToken: string;

  @Column({
    type: DataType.TEXT,
    validate: {
      len: [0, 500],
    },
  })
  facebookRefreshToken: string;

  @Column({
    type: DataType.STRING(255),
    validate: {
      len: [0, 255],
    },
  })
  avatarURL: string;

  @Column({ defaultValue: true })
  isActive: boolean;

  @ForeignKey(() => Role)
  @Column({ type: DataType.BIGINT })
  roleId: number;

  @BelongsTo(() => Role, 'roleId')
  role: Role;

  @CreatedAt public createdAt: Date;

  @UpdatedAt public updatedAt: Date;

  @DeletedAt public deletedAt: Date;

  @HasMany(() => AccessUser)
  accessUser: AccessUser[];

  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.facebookAccessToken;
    delete values.facebookRefreshToken;
    return values;
  }
}
