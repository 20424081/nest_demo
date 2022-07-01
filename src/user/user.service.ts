import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { FileService } from '../file/file.service';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private fileService: FileService,
  ) {}

  // Handle Create User
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.findOneByEmail(createUserDto.email);
    if (user) {
      throw new BadRequestException(['Email already using!']);
    }
    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 12);
    }
    return await this.userModel.create(createUserDto as User);
  }

  // Handle Find All Users
  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  // Handle Find and Count Users With Filter
  async findAndCount(filterUserDto: FilterUserDto): Promise<{
    rows: User[];
    count: number;
  }> {
    let condition: WhereOptions<User> = {};
    if (filterUserDto.search !== null && filterUserDto.search !== '') {
      condition = {
        ...condition,
        [Op.or]: [
          { name: { [Op.like]: `%${filterUserDto.search}%` } },
          { email: { [Op.like]: `%${filterUserDto.search}%` } },
        ],
      };
    }
    return this.userModel.findAndCountAll({
      where: condition,
      order: [['name', 'DESC']],
      limit: +filterUserDto.limit,
      offset: +filterUserDto.offset,
    });
  }

  // Handle Find One User By ID
  async findOne(id: number): Promise<User> {
    return this.userModel.findOne({
      where: { id: id },
      include: 'role',
    });
  }

  // Handle Find One User By Email
  async findOneByEmail(email: string): Promise<User> {
    return this.userModel.findOne({
      where: { email },
      include: 'role',
    });
  }

  // Handle Find One User By Email
  async findOneByFaceBookId(facebookId: string): Promise<User> {
    return this.userModel.findOne({
      where: { facebookId },
      include: 'role',
    });
  }

  // Handle Update User By ID
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(+id);
    if (user) {
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const user_info = await this.findOneByEmail(updateUserDto.email);
        if (user_info) {
          throw new BadRequestException(['Email already using!']);
        }
      }
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
      }
      return await user.update(updateUserDto);
    }
    return null;
  }

  async updateAvatar(id: number, file: Express.Multer.File): Promise<User> {
    const user = await this.findOne(+id);
    if (user) {
      const upload = await this.fileService.uploadPublicFile(file);
      if (upload) {
        return await user.update({ avatarURL: upload.Location });
      }
      throw new BadRequestException();
    }
    return null;
  }

  // Handle Remove User by ID
  async remove(id: string): Promise<void> {
    const user = await this.findOne(+id);
    if (user) await user.destroy();
  }
}
