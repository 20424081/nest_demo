import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AccessUserService } from './access-user.service';
import { AccessUser } from './entities/access-user.entity';

@Module({
  imports: [SequelizeModule.forFeature([AccessUser])],
  providers: [AccessUserService],
  exports: [SequelizeModule, AccessUserService],
})
export class AccessUserModule {}
