import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { CaslModule } from '../casl/casl.module';
import { RetrieveUserByIdMiddleware } from './middlewares/retrieve-user-by-id.middleware';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [
    CaslModule,
    ConfigModule,
    SequelizeModule.forFeature([User]),
    FileModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [SequelizeModule, UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RetrieveUserByIdMiddleware)
      .forRoutes(
        { path: 'user/:id', method: RequestMethod.PATCH },
        { path: 'user/:id', method: RequestMethod.DELETE },
      );
  }
}
