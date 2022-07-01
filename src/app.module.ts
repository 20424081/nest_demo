import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AccessUserModule } from './access-user/access-user.module';
import { AccessUser } from './access-user/entities/access-user.entity';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';
import configuration from './config/configuration';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { APP_GUARD } from '@nestjs/core';
import { MailModule } from './mail/mail.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RoleModule } from './role/role.module';
import { CaslModule } from './casl/casl.module';
import { Role } from './role/entities/role.entity';
import { FileService } from './file/file.service';
import { FileModule } from './file/file.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: configService.get('database.dialect'),
        host: configService.get('database.host'),
        port: +configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        autoLoadModels: true,
        synchronize: true,
        models: [User, AccessUser, Role],
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'public'),
    // }),
    UserModule,
    AuthModule,
    AccessUserModule,
    RedisCacheModule,
    MailModule,
    RoleModule,
    CaslModule,
    FileModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
    FileService,
  ],
})
export class AppModule {}
