import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './passport/jwt.strategy';
import { AccessUserModule } from '../access-user/access-user.module';
import { JwtRefreshStrategy } from './passport/jwt-refresh.strategy';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { MailModule } from '../mail/mail.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FacebookStrategy } from './passport/facebook.strategy';
import { constants } from '../constants';

@Module({
  imports: [
    ConfigModule,
    RedisCacheModule,
    AccessUserModule,
    UserModule,
    PassportModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('secret'),
        signOptions: { expiresIn: constants.access_token_expire },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    FacebookStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
