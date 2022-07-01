import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import dbTestConnect from './utils/db-test-connect';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot(dbTestConnect as SequelizeModuleOptions),
        ThrottlerModule.forRoot({
          ttl: 60,
          limit: 10,
        }),
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it("should return { message: 'Wellcome!' }", () => {
      expect(appController.getWellcome()).toEqual({ message: 'Wellcome!' });
    });
  });
});
