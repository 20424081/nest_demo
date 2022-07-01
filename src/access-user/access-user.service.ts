import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateAccessUserDto } from './dto/create-access-user.dto';
import { UpdateAccessUserDto } from './dto/update-access-user.dto';
import { AccessUser } from './entities/access-user.entity';

@Injectable()
export class AccessUserService {
  constructor(
    @InjectModel(AccessUser)
    private accessUserModel: typeof AccessUser,
  ) {}

  // Creae Access User If exists return Access User Exists
  async createOrExist(
    createAccessUserDto: CreateAccessUserDto,
  ): Promise<AccessUser> {
    const accessUser = await this.findOneByDeviceToken(
      createAccessUserDto.deviceToken,
    );
    if (accessUser) {
      return accessUser;
    }
    return await this.accessUserModel.create(createAccessUserDto as AccessUser);
  }

  // Find One Access User By ID Access User
  async findOne(id: number): Promise<AccessUser> {
    return this.accessUserModel.findOne({
      where: { id },
    });
  }

  // Find One Access User By Device Token
  async findOneByDeviceToken(device_token: string): Promise<AccessUser> {
    return this.accessUserModel.findOne({
      where: { deviceToken: device_token },
    });
  }

  // Update Access User By ID Access User
  async update(
    id: number,
    updateAcccessUserDto: UpdateAccessUserDto,
  ): Promise<AccessUser> {
    const accessUser = await this.findOne(id);
    if (accessUser) {
      return await accessUser.update(updateAcccessUserDto);
    }
    return null;
  }

  //  Remove Access User By ID Access User
  async remove(id: string): Promise<void> {
    const user = await this.findOne(+id);
    if (user) await user.destroy();
  }

  // Remove Access Users With User ID
  async removeWithUserId(userId: number): Promise<void> {
    await this.accessUserModel.destroy({
      where: {
        userId: userId,
      },
    });
  }
}
