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

@Table
export class Category extends Model<Category> {
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    unique: true,
    primaryKey: true,
  })
  public id: number;

  @Column({
    type: DataType.STRING(100),
    validate: {
      len: [5, 100],
    },
  })
  category_name: string;

  @ForeignKey(() => Category)
  @Column({ type: DataType.BIGINT })
  parentId: number;

  @Column({
    type: DataType.INTEGER,
  })
  level: number;

  @BelongsTo(() => Category, 'parentId')
  parent: Category;

  @HasMany(() => Category)
  childCategories: Category[];

  @CreatedAt public createdAt: Date;

  @UpdatedAt public updatedAt: Date;

  @DeletedAt public deletedAt: Date;
}
