import {
  getModelToken,
  SequelizeModule,
  SequelizeModuleOptions,
} from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from '../file/file.service';
import { AccessUser } from '../access-user/entities/access-user.entity';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import dbTestConnect from '../utils/db-test-connect';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
describe('UserService', () => {
  let module: TestingModule;
  let userService: UserService;
  const mockUser = {
    findOne: jest.fn(),
    findAndCountAll: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  };

  const mockAccessUser = {
    findOne: jest.fn(),
    findAndCountAll: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  };

  const mockFileService = {
    uploadPublicFile: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot(dbTestConnect as SequelizeModuleOptions),
      ],
      providers: [
        UserService,
        {
          provide: getModelToken(User),
          useValue: mockUser,
        },
        {
          provide: getModelToken(AccessUser),
          useValue: mockAccessUser,
        },
        {
          provide: FileService,
          useValue: mockFileService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterEach(async () => {
    // Free DB connection for next test
    await module.close();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findOne', () => {
    describe('User Matched', () => {
      let user: User;
      beforeEach(async () => {
        user = new User();
        jest.spyOn(mockUser, 'findOne').mockReturnValue(Promise.resolve(user));
      });
      it('should return user', async () => {
        expect(await userService.findOne(1)).toEqual(user);
      });
    });
    describe('User not matched', () => {
      beforeEach(() => {
        jest.spyOn(mockUser, 'findOne').mockReturnValue(undefined);
      });
      it('should return undefined', async () => {
        expect(await userService.findOne(1)).toBe(undefined);
      });
    });
  });

  describe('findAll', () => {
    describe('Have user', () => {
      let user: User;
      beforeEach(async () => {
        user = new User();
        jest
          .spyOn(mockUser, 'findAll')
          .mockReturnValue(Promise.resolve([user]));
      });
      it('should return array user', async () => {
        expect(await userService.findAll()).toEqual([user]);
      });
    });
    describe('empty array user', () => {
      beforeEach(() => {
        jest.spyOn(mockUser, 'findAll').mockReturnValue(Promise.resolve([]));
      });
      it('should return []', async () => {
        expect(await userService.findAll()).toEqual([]);
      });
    });
  });

  describe('findAndCount', () => {
    describe('Have user', () => {
      let user: User;
      beforeEach(async () => {
        user = new User();
        jest
          .spyOn(mockUser, 'findAndCountAll')
          .mockReturnValue(Promise.resolve({ rows: [user], count: 1 }));
      });
      it('should return array user', async () => {
        expect(await userService.findAndCount({})).toEqual({
          rows: [user],
          count: 1,
        });
      });
    });
    describe('empty array user', () => {
      beforeEach(() => {
        jest
          .spyOn(mockUser, 'findAndCountAll')
          .mockReturnValue(Promise.resolve({ rows: [], count: 0 }));
      });
      it('should return []', async () => {
        expect(await userService.findAndCount({})).toEqual({
          rows: [],
          count: 0,
        });
      });
    });
  });

  describe('findOneByEmail', () => {
    describe('User Matched', () => {
      let user: User;
      beforeEach(async () => {
        user = new User();
        jest.spyOn(mockUser, 'findOne').mockReturnValue(Promise.resolve(user));
      });
      it('should return user', async () => {
        expect(await userService.findOneByEmail('test@gmail.com')).toEqual(
          user,
        );
      });
    });
    describe('User not matched', () => {
      beforeEach(() => {
        jest.spyOn(mockUser, 'findOne').mockReturnValue(undefined);
      });
      it('should return undefined', async () => {
        expect(await userService.findOneByEmail('test@gmail.com')).toBe(
          undefined,
        );
      });
    });
  });

  describe('findOneByFaceBookId', () => {
    describe('User Matched', () => {
      let user: User;
      beforeEach(async () => {
        user = new User();
        jest.spyOn(mockUser, 'findOne').mockReturnValue(Promise.resolve(user));
      });
      it('should return user', async () => {
        expect(await userService.findOneByFaceBookId('1234569865')).toEqual(
          user,
        );
      });
    });
    describe('User not matched', () => {
      beforeEach(() => {
        jest.spyOn(mockUser, 'findOne').mockReturnValue(undefined);
      });
      it('should return undefined', async () => {
        expect(await userService.findOneByFaceBookId('1234569885')).toBe(
          undefined,
        );
      });
    });
  });

  describe('remove', () => {
    describe('user exists', () => {
      let user: User;
      beforeEach(async () => {
        user = new User();
        user.id = 2;
        user.name = 'test test';
        user.email = 'hash';
        user.destroy = jest.fn();
        jest
          .spyOn(userService, 'findOne')
          .mockReturnValue(Promise.resolve(user));
      });
      it('should destroy', async () => {
        const id = '2';
        expect(await userService.remove(id));
        expect(user.destroy).toHaveBeenCalledTimes(1);
        expect(user.destroy).toHaveBeenCalledWith();
        expect(userService.findOne).toHaveBeenCalledTimes(1);
        expect(userService.findOne).toHaveBeenCalledWith(+id);
      });
    });

    describe('user not exists', () => {
      beforeEach(async () => {
        jest.spyOn(userService, 'findOne').mockReturnValue(null);
      });
      it('should not destroy', async () => {
        const id = '2';
        expect(await userService.remove(id));
        expect(userService.findOne).toHaveBeenCalledTimes(1);
        expect(userService.findOne).toHaveBeenCalledWith(+id);
      });
    });
  });

  describe('update', () => {
    describe('user exists', () => {
      let user: User;
      beforeEach(async () => {
        user = new User();
        user.id = 2;
        user.name = 'test test';
        user.email = 'test@gmail.com';
        user.update = jest.fn((dto) => {
          return {
            ...user,
            ...dto,
          } as unknown as Promise<User>;
        });
        jest
          .spyOn(userService, 'findOne')
          .mockReturnValue(Promise.resolve(user));
        jest.spyOn(userService, 'findOneByEmail').mockReturnValue(null);
      });
      it('should return user', async () => {
        const dto = {
          name: 'test tesssst',
        };
        const id = 2;
        expect(await userService.update(id, dto)).toEqual({
          ...user,
          ...dto,
        });
        expect(user.update).toHaveBeenCalledTimes(1);
        expect(user.update).toHaveBeenCalledWith(dto);
        expect(userService.findOne).toHaveBeenCalledTimes(1);
        expect(userService.findOne).toHaveBeenCalledWith(id);
      });
    });

    describe('user not exists', () => {
      beforeEach(async () => {
        jest.spyOn(userService, 'findOne').mockReturnValue(null);
        jest.spyOn(userService, 'findOneByEmail').mockReturnValue(null);
      });
      it('should return null', async () => {
        const dto = {
          name: 'test tessssst',
        };
        const id = 2;
        expect(await userService.update(id, dto)).toEqual(null);
        expect(userService.findOne).toHaveBeenCalledTimes(1);
        expect(userService.findOne).toHaveBeenCalledWith(id);
      });
    });

    describe('email user exists', () => {
      let user: User;
      beforeEach(async () => {
        user = new User();
        user.id = Date.now();
        user.name = 'test test';
        user.email = 'test@gmail.com';
        user.update = jest.fn((dto) => {
          return {
            ...user,
            ...dto,
          } as unknown as Promise<User>;
        });
        jest
          .spyOn(userService, 'findOne')
          .mockReturnValue(Promise.resolve(user));
        jest
          .spyOn(userService, 'findOneByEmail')
          .mockImplementation((email) => {
            return { ...user, email: email } as unknown as Promise<User>;
          });
      });
      it('should throw error email exists', async () => {
        const dto = {
          email: 'test1@gmail.com',
        };
        const id = 2;
        await expect(() => userService.update(id, dto)).rejects.toThrow(
          'Bad Request Exception',
        );
      });
    });

    describe('user exists update have password', () => {
      let user: User;
      beforeEach(async () => {
        user = new User();
        user.id = 2;
        user.name = 'test test';
        user.email = 'test@gmail.com';
        user.password = 'test_hash';
        user.update = jest.fn((dto) => {
          return {
            ...user,
            ...dto,
          } as unknown as Promise<User>;
        });
        jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'hash');
        jest
          .spyOn(userService, 'findOne')
          .mockReturnValue(Promise.resolve(user));
        jest.spyOn(userService, 'findOneByEmail').mockReturnValue(null);
      });
      it('should return user', async () => {
        const dto = {
          name: 'test tesssst',
          password: 'test',
        };
        const id = 2;
        expect(await userService.update(id, dto)).toEqual({
          ...user,
          ...dto,
          password: 'hash',
        });
        expect(user.update).toHaveBeenCalledTimes(1);
        expect(user.update).toHaveBeenCalledWith(dto);
        expect(userService.findOne).toHaveBeenCalledTimes(1);
        expect(userService.findOne).toHaveBeenCalledWith(id);
      });
    });
  });
});
