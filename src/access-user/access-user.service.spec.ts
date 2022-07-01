import {
  getModelToken,
  SequelizeModule,
  SequelizeModuleOptions,
} from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import dbTestConnect from '../utils/db-test-connect';
import { AccessUserService } from './access-user.service';
import { AccessUser } from './entities/access-user.entity';

describe('AccessUserService', () => {
  let service: AccessUserService;
  let module: TestingModule;
  const mockAccessUser = {
    findOne: jest.fn(),
    findAndCountAll: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  };
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot(dbTestConnect as SequelizeModuleOptions),
      ],
      providers: [
        AccessUserService,
        {
          provide: getModelToken(AccessUser),
          useValue: mockAccessUser,
        },
      ],
    }).compile();

    service = module.get<AccessUserService>(AccessUserService);
  });
  afterEach(async () => {
    // Free DB connection for next test
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    describe('User Matched', () => {
      let accessUser: AccessUser;
      beforeEach(async () => {
        accessUser = new AccessUser();
        jest
          .spyOn(mockAccessUser, 'findOne')
          .mockReturnValue(Promise.resolve(accessUser));
      });
      it('should return access user', async () => {
        expect(await service.findOne(1)).toEqual(accessUser);
      });
    });
    describe('access user not matched', () => {
      beforeEach(() => {
        jest.spyOn(mockAccessUser, 'findOne').mockReturnValue(undefined);
      });
      it('should return undefined', async () => {
        expect(await service.findOne(1)).toBe(undefined);
      });
    });
  });

  describe('findOneByDeviceToken', () => {
    describe('User Matched', () => {
      let accessUser: AccessUser;
      beforeEach(async () => {
        accessUser = new AccessUser();
        jest
          .spyOn(mockAccessUser, 'findOne')
          .mockReturnValue(Promise.resolve(accessUser));
      });
      it('should return access user', async () => {
        expect(await service.findOneByDeviceToken('test')).toEqual(accessUser);
      });
    });
    describe('User not matched', () => {
      beforeEach(() => {
        jest.spyOn(mockAccessUser, 'findOne').mockReturnValue(undefined);
      });
      it('should return undefined', async () => {
        expect(await service.findOneByDeviceToken('test')).toBe(undefined);
      });
    });
  });

  describe('createOrExist', () => {
    describe('access user exists', () => {
      let accessUser: AccessUser;
      beforeEach(async () => {
        accessUser = new AccessUser();
        jest
          .spyOn(service, 'findOneByDeviceToken')
          .mockReturnValue(Promise.resolve(accessUser));
      });
      it('should return access user exists', async () => {
        const dto = {
          refreshToken: 'test',
          iPAddress: '172.0.0.1',
          userId: 1,
          deviceToken: 'test',
        };
        expect(await service.createOrExist(dto)).toEqual(accessUser);
        expect(service.findOneByDeviceToken).toHaveBeenCalledTimes(1);
        expect(service.findOneByDeviceToken).toHaveBeenCalledWith(
          dto.deviceToken,
        );
      });
    });
    describe('access user not exists', () => {
      let accessUser: AccessUser;
      beforeEach(() => {
        accessUser = new AccessUser();
        jest.spyOn(service, 'findOneByDeviceToken').mockReturnValue(undefined);
        jest.spyOn(mockAccessUser, 'create').mockImplementation((dto) => {
          return { ...accessUser, ...dto };
        });
      });
      it('should return user create', async () => {
        const dto = {
          refreshToken: 'test',
          iPAddress: '172.0.0.1',
          userId: 1,
          deviceToken: 'test',
        };
        expect(await service.createOrExist(dto)).toEqual({
          ...accessUser,
          ...dto,
        });
        expect(service.findOneByDeviceToken).toHaveBeenCalledTimes(1);
        expect(service.findOneByDeviceToken).toHaveBeenCalledWith(
          dto.deviceToken,
        );
        expect(mockAccessUser.create).toHaveBeenCalledTimes(1);
        expect(mockAccessUser.create).toHaveBeenCalledWith(dto);
      });
    });
  });

  describe('update', () => {
    describe('access user exists', () => {
      let accessUser: AccessUser;
      beforeEach(async () => {
        accessUser = new AccessUser();
        accessUser.id = 2;
        accessUser.refreshToken = 'test';
        accessUser.iPAddress = '172.0.0.1';
        accessUser.userId = 1;
        accessUser.deviceToken = 'test';
        accessUser.update = jest.fn((dto) => {
          return {
            ...accessUser,
            ...dto,
          } as unknown as Promise<AccessUser>;
        });
        jest
          .spyOn(service, 'findOne')
          .mockReturnValue(Promise.resolve(accessUser));
      });
      it('should return access user', async () => {
        const dto = {
          refreshToken: 'test1',
          iPAddress: '172.0.0.1',
          userId: 1,
          deviceToken: 'test',
        };
        const id = 2;
        expect(await service.update(id, dto)).toEqual({
          ...accessUser,
          ...dto,
        });
        expect(accessUser.update).toHaveBeenCalledTimes(1);
        expect(accessUser.update).toHaveBeenCalledWith(dto);
        expect(service.findOne).toHaveBeenCalledTimes(1);
        expect(service.findOne).toHaveBeenCalledWith(id);
      });
    });

    describe('access user not exists', () => {
      beforeEach(async () => {
        jest.spyOn(service, 'findOne').mockReturnValue(null);
      });
      it('should return null', async () => {
        const dto = {
          refreshToken: 'test1',
          iPAddress: '172.0.0.1',
          userId: 1,
          deviceToken: 'test',
        };
        const id = 2;
        expect(await service.update(id, dto)).toEqual(null);
        expect(service.findOne).toHaveBeenCalledTimes(1);
        expect(service.findOne).toHaveBeenCalledWith(id);
      });
    });
  });

  describe('remove', () => {
    describe('access user exists', () => {
      let accessUser: AccessUser;
      beforeEach(async () => {
        accessUser = new AccessUser();
        accessUser.id = 2;
        accessUser.refreshToken = 'test';
        accessUser.iPAddress = '172.0.0.1';
        accessUser.userId = 1;
        accessUser.deviceToken = 'test';
        accessUser.destroy = jest.fn();
        jest
          .spyOn(service, 'findOne')
          .mockReturnValue(Promise.resolve(accessUser));
      });
      it('should destroy', async () => {
        const id = '2';
        expect(await service.remove(id));
        expect(accessUser.destroy).toHaveBeenCalledTimes(1);
        expect(accessUser.destroy).toHaveBeenCalledWith();
        expect(service.findOne).toHaveBeenCalledTimes(1);
        expect(service.findOne).toHaveBeenCalledWith(+id);
      });
    });

    describe('access user not exists', () => {
      beforeEach(async () => {
        jest.spyOn(service, 'findOne').mockReturnValue(null);
      });
      it('should not destroy', async () => {
        const id = '2';
        expect(await service.remove(id));
        expect(service.findOne).toHaveBeenCalledTimes(1);
        expect(service.findOne).toHaveBeenCalledWith(+id);
      });
    });
  });

  describe('removeWithUserId', () => {
    describe('access user exists', () => {
      beforeEach(async () => {
        jest.spyOn(mockAccessUser, 'destroy').mockImplementation(() => {
          return 1 as unknown as Promise<number>;
        });
      });
      it('should destroy', async () => {
        const userId = 2;
        await service.removeWithUserId(userId);
        expect(mockAccessUser.destroy).toHaveBeenCalledTimes(1);
        expect(mockAccessUser.destroy).toHaveReturnedWith(1);
        expect(mockAccessUser.destroy).toHaveBeenCalledWith({
          where: { userId: userId },
        });
      });
    });

    describe('access user not exists', () => {
      beforeEach(async () => {
        jest.spyOn(mockAccessUser, 'destroy').mockImplementation(() => {
          return 0 as unknown as Promise<number>;
        });
      });
      it('should not destroy', async () => {
        const userId = 3;
        await service.removeWithUserId(userId);
        expect(mockAccessUser.destroy).toHaveBeenCalledTimes(2);
        expect(mockAccessUser.destroy).toHaveReturnedWith(0);
        expect(mockAccessUser.destroy).toHaveBeenCalledWith({
          where: { userId: userId },
        });
      });
    });
  });
});
