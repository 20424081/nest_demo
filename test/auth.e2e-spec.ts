import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { UserModule } from '../src/user/user.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../src/user/entities/user.entity';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AccessUserModule } from '../src/access-user/access-user.module';
import { AccessUser } from '../src/access-user/entities/access-user.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import configuration from '../src/config/configuration';
import { RedisCacheModule } from '../src/redis-cache/redis-cache.module';
import { APP_GUARD } from '@nestjs/core';
import { MailModule } from '../src/mail/mail.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RoleModule } from '../src/role/role.module';
import { CaslModule } from '../src/casl/casl.module';
import { Role } from '../src/role/entities/role.entity';
import { AppModule } from '../src/app.module';
describe('Auth (e2e)', () => {
  let app: INestApplication;

  // beforeEach(async () => {
  //   const moduleFixture: TestingModule = await Test.createTestingModule({
  //     imports: [AuthModule],
  //   }).compile();

  //   app = moduleFixture.createNestApplication();
  //   await app.init();
  // });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ConfigModule.forRoot({
          load: [configuration],
        }),
        SequelizeModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            dialect: configService.get('database.test.dialect'),
            host: configService.get('database.test.host'),
            port: +configService.get('database.test.port'),
            username: configService.get('database.test.username'),
            password: configService.get('database.test.password'),
            database: configService.get('database.test.database'),
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
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', 'public'),
        }),
        UserModule,
        AuthModule,
        AccessUserModule,
        RedisCacheModule,
        MailModule,
        RoleModule,
        CaslModule,
      ],
      controllers: [AppController],
      providers: [
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
        AppService,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await User.destroy({ where: {}, force: true });
    await Promise.all([app.close()]);
  });

  afterEach(async () => {
    await User.destroy({ where: {}, force: true });
  });

  describe('/auth/register (POST)', () => {
    let user: string;
    it('register success', async () => {
      const dto = {
        email: 'test1@gmail.com',
        name: 'Trong le',
        password: 'Trongle@98',
        address: '',
      };
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(201);
      user = response.body;
      expect(user).toEqual({
        isActive: true,
        id: expect.any(Number),
        address: dto.address,
        email: dto.email,
        name: dto.name,
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    // it('Invalid email', async () => {
    //   const response = await request(app.getHttpServer())
    //     .post('/auth/register')
    //     .send({
    //       email: 'test1',
    //       name: 'Trong le',
    //       password: 'Trongle@98',
    //       address: '',
    //     })
    //     .expect(400);
    // });

    // it('Length email < 10', () => {
    //   return request(app.getHttpServer())
    //     .post('/auth/register')
    //     .send({
    //       email: 'te@g.com',
    //       name: 'Trong le',
    //       password: 'Trongle@98',
    //       address: '',
    //     })
    //     .expect(400);
    // });

    // it('Length email > 100', () => {
    //   const text = new Array(100).fill('x');
    //   return request(app.getHttpServer())
    //     .post('/auth/register')
    //     .send({
    //       email: `${text.join('')}@gmail.com`,
    //       name: 'Trong le',
    //       password: 'Trongle@98',
    //       address: '',
    //     })
    //     .expect(400);
    // });

    // it('Length name < 5', () => {
    //   return request(app.getHttpServer())
    //     .post('/auth/register')
    //     .send({
    //       email: `test1@gmail.com`,
    //       name: 'Tron',
    //       password: 'Trongle@98',
    //       address: '',
    //     })
    //     .expect(400);
    // });

    // it('Length name > 200', () => {
    //   return request(app.getHttpServer())
    //     .post('/auth/register')
    //     .send({
    //       email: `test1@gmail.com`,
    //       name: 'Tron',
    //       password: 'Trongle@98',
    //       address: '',
    //     })
    //     .expect(400);
    // });

    // it('Password not match regex', () => {
    //   return request(app.getHttpServer())
    //     .post('/auth/register')
    //     .send({
    //       email: `test1@gmail.com`,
    //       name: 'Trong le',
    //       password: 'Trongleeeee',
    //       address: '',
    //     })
    //     .expect(400);
    // });

    // it('Length Password < 8', () => {
    //   return request(app.getHttpServer())
    //     .post('/auth/register')
    //     .send({
    //       email: `test1@gmail.com`,
    //       name: 'Trong le',
    //       password: 'Tro@98',
    //       address: '',
    //     })
    //     .expect(400);
    // });

    // it('Length Password > 255', () => {
    //   const text = new Array(255).fill('x');
    //   return request(app.getHttpServer())
    //     .post('/auth/register')
    //     .send({
    //       email: `test1@gmail.com`,
    //       name: 'Trong le',
    //       password: `${text.join('')}@98`,
    //       address: '',
    //     })
    //     .expect(400);
    // });

    // it('Length Address > 100', () => {
    //   const text = new Array(120).fill('x');

    //   return request(app.getHttpServer())
    //     .post('/auth/register')
    //     .send({
    //       email: `test1@gmail.com`,
    //       name: 'Trong le',
    //       password: `Trongle@98`,
    //       address: `${text.join('')}`,
    //     })
    //     .expect(400);
    // });
  });

  /**
  describe('/auth/login (POST)', () => {
    let jwtToken: string;
    it('Login success', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'test@gmail.com',
          password: 'Testtest@98',
          device_token: 'testtest',
        })
        .expect(200);

      jwtToken = response.body.access_token;
      expect(jwtToken).toMatch(
        /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
      );
    });

    it('Invalid input null', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send()
        .expect(400);
    });

    it('Invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'test',
          password: 'Testtest@98',
          device_token: 'testtest',
        })
        .expect(400);
    });

    it('Incorrect password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'test@gmail.com',
          password: 'Testtest',
          device_token: 'testtest',
        })
        .expect(400);
    });
  });
  */

  /**
  describe('/auth/refresh-token (POST)', () => {
    // it('Refresh token success', () => {
    //   return request(app.getHttpServer())
    //     .post('/auth/refresh-token')
    //     .expect(200);
    // });

    it('Refresh token expired', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh-token')
        .expect(401);
    });

    it('Invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh-token')
        .expect(401);
    });
  });

  describe('/auth/change-password (POST)', () => {
    // it('Change password success', () => {
    //   return request(app.getHttpServer())
    //     .post('/auth/change-password')
    //     .expect(200);
    // });

    it('Input none', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .expect(400);
    });

    it('Length old password < 8', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .expect(400);
    });

    it('Length old password > 255', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .expect(400);
    });

    it('Length new password < 8', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .expect(400);
    });

    it('Length new password > 255', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .expect(400);
    });

    it('Old password not match regex', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .expect(400);
    });

    it('New password not match regex', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .expect(400);
    });

    it('Confirm password not equal new password', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .expect(400);
    });
  });

  describe('/auth/forgot-password (POST)', () => {
    it('Forgot password success', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .expect(200);
    });

    it('Input none', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .expect(400);
    });

    it('Invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .expect(400);
    });

    it('Length email < 10', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .expect(400);
    });

    it('Length email > 100', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .expect(400);
    });
  });

  describe('/auth/check-code (POST)', () => {
    // it('Check code success', () => {
    //   return request(app.getHttpServer())
    //     .post('/auth/forgot-password')
    //     .expect(200);
    // });

    it('Input none', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .expect(400);
    });

    it('Invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .expect(400);
    });

    it('Length email < 10', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .expect(400);
    });

    it('Length email > 100', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .expect(400);
    });

    it('Length code < 6', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .expect(400);
    });

    it('Length code > 6', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .expect(400);
    });

    it('Incorrect code ', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .expect(400);
    });
  });

  describe('/auth/change-password-forgot (POST)', () => {
    // it('Change password forgot success', () => {
    //   return request(app.getHttpServer())
    //     .post('/auth/change-password-forgot')
    //     .expect(200);
    // });

    it('Invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password-forgot')
        .expect(400);
    });

    it('Length email < 10', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password-forgot')
        .expect(400);
    });

    it('Length email > 100', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password-forgot')
        .expect(400);
    });

    it('Incorrect code', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password-forgot')
        .expect(400);
    });

    it('Code null', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password-forgot')
        .expect(400);
    });

    it('Length code < 20', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password-forgot')
        .expect(400);
    });

    it('Length email > 255', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password-forgot')
        .expect(400);
    });
  });
   */
});
