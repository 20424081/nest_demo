import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AccessUserService } from '../access-user/access-user.service';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { BadRequestException } from '@nestjs/common';
import { AccessUser } from '../access-user/entities/access-user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import mockedUserService from '../utils/mocks/user.service.mock';
import mockRedisCacheService from '../utils/mocks/redis-cache.service.mock';
import mockMailService from '../utils/mocks/mail.service.mock';
import mockedAccessUserService from '../utils/mocks/access-user.service.mock';
import mockJwtService from '../utils/mocks/jwt.service.mock';
jest.mock('bcrypt');
describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let redisCacheService: RedisCacheService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: RedisCacheService,
          useValue: mockRedisCacheService,
        },
        {
          provide: UserService,
          useValue: mockedUserService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: AccessUserService,
          useValue: mockedAccessUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
      imports: [ConfigModule],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    redisCacheService = module.get<RedisCacheService>(RedisCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should return object user', async () => {
      const dto = {
        email: 'test@gmail.com',
        password: 'Trongle@98',
        name: 'Trong le',
        address: '',
      };
      expect(await service.register(dto)).toEqual({
        id: expect.any(Number),
        email: dto.email,
        name: dto.name,
        password: expect.any(String),
        address: dto.address,
        facebookId: null,
        facebookAccessToken: null,
        facebookRefreshToken: null,
        avatarURL: null,
        isActive: true,
        roleId: null,
      });
      expect(mockedUserService.create).toHaveBeenCalledTimes(1);
      expect(mockedUserService.create).toHaveBeenCalledWith(dto);
    });

    it('should return error bad request', async () => {
      const dto = {
        email: 'test@gmail.com',
        password: '',
        name: 'Trong le',
        address: '',
      };
      jest.spyOn(userService, 'create').mockImplementation(() => {
        throw new BadRequestException();
      });
      await expect(service.register(dto)).rejects.toThrow('Bad Request');
      expect(mockedUserService.create).toHaveBeenCalledTimes(2);
      expect(mockedUserService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should return object token', async () => {
      const dto = {
        email: 'test@gmail.com',
        password: 'Trongle@98',
        device_token: 'test',
      };
      const user = {
        id: Date.now(),
        email: dto.email,
        name: 'Trong le',
        password:
          '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
        address: '',
        facebookId: null,
        facebookAccessToken: null,
        facebookRefreshToken: null,
        avatarURL: null,
        isActive: true,
        roleId: null,
      };
      const ip = '172.0.0.1';
      jest
        .spyOn(service, 'getRefreshTokenAndAccessToken')
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .mockImplementation((user, accessUserId) => {
          return {
            access_token: 'access_token',
            refresh_token: 'refresh_token',
          } as unknown as Promise<any>;
        });
      expect(await service.login(user, ip, dto.device_token)).toEqual({
        refresh_token: expect.any(String),
        access_token: expect.any(String),
      });
      expect(mockedAccessUserService.createOrExist).toHaveBeenCalledTimes(1);
      expect(mockedAccessUserService.createOrExist).toHaveBeenCalledWith({
        userId: user.id,
        refreshToken: null,
        iPAddress: ip,
        deviceToken: dto.device_token,
      });
      expect(service.getRefreshTokenAndAccessToken).toHaveBeenCalledTimes(1);
      expect(service.getRefreshTokenAndAccessToken).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should return user', async () => {
      const user = {
        id: 1,
        accessUserId: 1,
        email: 'tronglevan98@gmail.com',
        name: 'Trong le',
      };
      const dto = {
        old_password: 'Trongle@98',
        new_password: 'Trongle@988',
        confirm_password: 'Trongle@988',
      };
      jest
        .spyOn(service, 'validateUser')
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .mockImplementation((email, old_password) => {
          return {
            id: 1,
            email: email,
            name: 'Trong le',
            password:
              '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
            address: '',
            facebookId: null,
            facebookAccessToken: null,
            facebookRefreshToken: null,
            avatarURL: null,
            isActive: true,
            roleId: null,
          } as unknown as Promise<User>;
        });

      jest
        .spyOn(service, 'changePassAndClearAccess')
        .mockImplementation((userId) => {
          return {
            id: userId,
            email: 'tronglevan98@gmail.com',
            name: 'Trong le',
            password:
              '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVzcccc',
            address: '',
            facebookId: null,
            facebookAccessToken: null,
            facebookRefreshToken: null,
            avatarURL: null,
            isActive: true,
            roleId: null,
          } as unknown as Promise<User>;
        });
      expect(await service.changePassword(user, dto)).toHaveProperty(
        'email',
        'tronglevan98@gmail.com',
      );
    });

    it('should throw bad request', async () => {
      const user = {
        id: 1,
        accessUserId: 1,
        email: 'tronglevan98@gmail.com',
        name: 'Trong le',
      };
      const dto = {
        old_password: 'Trongle@98',
        new_password: 'Trongle@988',
        confirm_password: 'Trongle@988',
      };
      jest.spyOn(service, 'validateUser').mockImplementation(() => undefined);
      expect(() => service.changePassword(user, dto)).rejects.toThrow(
        'Bad Request Exception',
      );
    });
  });

  describe('forgotPassword', () => {
    it('should return email', async () => {
      const dto = {
        email: 'tronglevan98@gmail.com',
      };
      jest.spyOn(service, 'genCode').mockImplementation(async () => '111111');
      expect(await service.forgotPassword(dto)).toEqual({ email: dto.email });
      expect(userService.findOneByEmail).toHaveBeenCalledTimes(1);
      expect(userService.findOneByEmail).toHaveBeenCalledWith(dto.email);
      expect(service.genCode).toHaveBeenCalledTimes(1);
      expect(service.genCode).toHaveBeenCalled();
    });

    it('should throw bad request', async () => {
      const dto = {
        email: 'tronglevan98@gmail.com',
      };
      jest
        .spyOn(userService, 'findOneByEmail')
        .mockImplementation(async () => undefined);
      expect(() => service.forgotPassword(dto)).rejects.toThrow(
        'Bad Request Exception',
      );
      expect(userService.findOneByEmail).toHaveBeenCalledTimes(2);
      expect(userService.findOneByEmail).toHaveBeenCalledWith(dto.email);
    });
  });

  describe('checkCode', () => {
    it('should return email and code', async () => {
      const dto = {
        email: 'tronglevan98@gmail.com',
        code: '111111',
      };
      jest
        .spyOn(userService, 'findOneByEmail')
        .mockImplementation(async (email) => {
          return {
            id: Date.now(),
            email: email,
            name: 'Trong le',
            password:
              '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
            address: '',
            facebookId: null,
            facebookAccessToken: null,
            facebookRefreshToken: null,
            avatarURL: null,
            isActive: true,
            roleId: null,
          } as User;
        });
      jest.spyOn(service, 'getAndUpdateCode').mockImplementation(async () => {
        return { code: 'abcxyz', time_try: 0 };
      });
      jest
        .spyOn(redisCacheService, 'genHashSHA1')
        .mockImplementation(async () => 'abcxyz');
      expect(await service.checkCode(dto)).toEqual({
        email: dto.email,
        code: 'abcxyz',
      });
    });

    it('should throw error bad request with incorrect code', async () => {
      const dto = {
        email: 'tronglevan98@gmail.com',
        code: '111111',
      };
      jest
        .spyOn(userService, 'findOneByEmail')
        .mockImplementation(async (email) => {
          return {
            id: Date.now(),
            email: email,
            name: 'Trong le',
            password:
              '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
            address: '',
            facebookId: null,
            facebookAccessToken: null,
            facebookRefreshToken: null,
            avatarURL: null,
            isActive: true,
            roleId: null,
          } as User;
        });
      jest.spyOn(service, 'getAndUpdateCode').mockImplementation(async () => {
        return { code: 'degsss', time_try: 0 };
      });
      jest
        .spyOn(redisCacheService, 'genHashSHA1')
        .mockImplementation(async () => 'abcxyz');
      jest.spyOn(service, 'validateUser').mockImplementation(() => undefined);
      expect(() => service.checkCode(dto)).rejects.toThrow(
        'Bad Request Exception',
      );
    });

    it('should throw error bad request with getAndUpdateCode undefine', async () => {
      const dto = {
        email: 'tronglevan98@gmail.com',
        code: '111111',
      };
      jest
        .spyOn(userService, 'findOneByEmail')
        .mockImplementation(async (email) => {
          return {
            id: Date.now(),
            email: email,
            name: 'Trong le',
            password:
              '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
            address: '',
            facebookId: null,
            facebookAccessToken: null,
            facebookRefreshToken: null,
            avatarURL: null,
            isActive: true,
            roleId: null,
          } as User;
        });
      jest
        .spyOn(service, 'getAndUpdateCode')
        .mockImplementation(async () => undefined);
      jest
        .spyOn(redisCacheService, 'genHashSHA1')
        .mockImplementation(async () => 'abcxyz');
      jest.spyOn(service, 'validateUser').mockImplementation(() => undefined);
      expect(() => service.checkCode(dto)).rejects.toThrow(
        'Bad Request Exception',
      );
    });

    it('should throw error bad request with getAndUpdateCode have time_try > 3', async () => {
      const dto = {
        email: 'tronglevan98@gmail.com',
        code: '111111',
      };
      jest
        .spyOn(userService, 'findOneByEmail')
        .mockImplementation(async (email) => {
          return {
            id: Date.now(),
            email: email,
            name: 'Trong le',
            password:
              '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
            address: '',
            facebookId: null,
            facebookAccessToken: null,
            facebookRefreshToken: null,
            avatarURL: null,
            isActive: true,
            roleId: null,
          } as User;
        });
      jest.spyOn(service, 'getAndUpdateCode').mockImplementation(async () => {
        return { code: 'abcxyz', time_try: 4 };
      });
      jest
        .spyOn(redisCacheService, 'genHashSHA1')
        .mockImplementation(async () => 'abcxyz');
      jest.spyOn(service, 'validateUser').mockImplementation(() => undefined);
      expect(() => service.checkCode(dto)).rejects.toThrow(
        'Bad Request Exception',
      );
    });

    it('should throw error bad request with user undefine', async () => {
      const dto = {
        email: 'tronglevan98@gmail.com',
        code: '111111',
      };
      jest
        .spyOn(userService, 'findOneByEmail')
        .mockImplementation(async () => undefined);
      jest.spyOn(service, 'getAndUpdateCode').mockImplementation(async () => {
        return { code: 'abcxyz', time_try: 0 };
      });
      jest
        .spyOn(redisCacheService, 'genHashSHA1')
        .mockImplementation(async () => 'abcxyz');
      expect(() => service.checkCode(dto)).rejects.toThrow(
        'Bad Request Exception',
      );
    });
  });

  describe('changePasswordForgot', () => {
    it('should return user', async () => {
      const dto = {
        email: 'test@gmail.com',
        code: 'abcxyz',
        new_password: 'Trongle@98',
        confirm_password: 'Trongle@98',
      };
      jest
        .spyOn(userService, 'findOneByEmail')
        .mockImplementation(async (email) => {
          return {
            id: Date.now(),
            email: email,
            name: 'Trong le',
            password:
              '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
            address: '',
            facebookId: null,
            facebookAccessToken: null,
            facebookRefreshToken: null,
            avatarURL: null,
            isActive: true,
            roleId: null,
          } as User;
        });
      jest
        .spyOn(service, 'changePassAndClearAccess')
        .mockImplementation((userId) => {
          return {
            id: userId,
            email: 'tronglevan98@gmail.com',
            name: 'Trong le',
            password:
              '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVzcccc',
            address: '',
            facebookId: null,
            facebookAccessToken: null,
            facebookRefreshToken: null,
            avatarURL: null,
            isActive: true,
            roleId: null,
          } as unknown as Promise<User>;
        });
      jest.spyOn(service, 'getAndDelCode').mockImplementation(async () => {
        return { code: 'abcxyz', time_try: 0 };
      });
      expect(await service.changePasswordForgot(dto)).toHaveProperty(
        'email',
        'tronglevan98@gmail.com',
      );
      expect(mockedUserService.findOneByEmail).toHaveBeenCalledWith(dto.email);
      expect(service.changePassAndClearAccess).toHaveBeenCalled();
    });
    it('should throw error bad request with findOneByEmail undefine', async () => {
      const dto = {
        email: 'test@gmail.com',
        code: 'abcxyz',
        new_password: 'Trongle@98',
        confirm_password: 'Trongle@98',
      };
      jest
        .spyOn(userService, 'findOneByEmail')
        .mockImplementation(async () => undefined);
      expect(() => service.changePasswordForgot(dto)).rejects.toThrow(
        'Bad Request Exception',
      );
      expect(mockedUserService.findOneByEmail).toHaveBeenCalledWith(dto.email);
    });

    it('should throw error bad request with getAndDelCode undefine', async () => {
      const dto = {
        email: 'test@gmail.com',
        code: 'abcxyz',
        new_password: 'Trongle@98',
        confirm_password: 'Trongle@98',
      };
      jest
        .spyOn(userService, 'findOneByEmail')
        .mockImplementation(async (email) => {
          return {
            id: Date.now(),
            email: email,
            name: 'Trong le',
            password:
              '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
            address: '',
            facebookId: null,
            facebookAccessToken: null,
            facebookRefreshToken: null,
            avatarURL: null,
            isActive: true,
            roleId: null,
          } as User;
        });
      jest
        .spyOn(service, 'getAndDelCode')
        .mockImplementation(async () => undefined);
      await expect(() => service.changePasswordForgot(dto)).rejects.toThrow(
        'Bad Request Exception',
      );
      expect(mockedUserService.findOneByEmail).toHaveBeenCalledWith(dto.email);
      expect(service.getAndDelCode).toHaveBeenCalled();
    });

    it('should throw error bad request with incorrect code', async () => {
      const dto = {
        email: 'test@gmail.com',
        code: 'addddd',
        new_password: 'Trongle@98',
        confirm_password: 'Trongle@98',
      };
      jest
        .spyOn(userService, 'findOneByEmail')
        .mockImplementation(async (email) => {
          return {
            id: Date.now(),
            email: email,
            name: 'Trong le',
            password:
              '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
            address: '',
            facebookId: null,
            facebookAccessToken: null,
            facebookRefreshToken: null,
            avatarURL: null,
            isActive: true,
            roleId: null,
          } as User;
        });
      jest
        .spyOn(service, 'changePassAndClearAccess')
        .mockImplementation((userId) => {
          return {
            id: userId,
            email: 'tronglevan98@gmail.com',
            name: 'Trong le',
            password:
              '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVzcccc',
            address: '',
            facebookId: null,
            facebookAccessToken: null,
            facebookRefreshToken: null,
            avatarURL: null,
            isActive: true,
            roleId: null,
          } as unknown as Promise<User>;
        });
      jest.spyOn(service, 'getAndDelCode').mockImplementation(async () => {
        return { code: 'abcxyz', time_try: 0 };
      });
      await expect(() => service.changePasswordForgot(dto)).rejects.toThrow(
        'Bad Request Exception',
      );
      expect(mockedUserService.findOneByEmail).toHaveBeenCalledWith(dto.email);
      expect(service.getAndDelCode).toHaveBeenCalled();
    });
  });

  describe('changePassAndClearAccess', () => {
    it('should return user', async () => {
      const dto = {
        id: 1,
        email: 'test@gmail.com',
        new_password: 'Trongle@98',
      };
      expect(
        await service.changePassAndClearAccess(dto.id, dto.new_password),
      ).toHaveProperty('id', 1);
      expect(mockedUserService.update).toHaveBeenCalledTimes(1);
      expect(mockedAccessUserService.removeWithUserId).toHaveBeenCalledTimes(1);
      expect(mockedUserService.update).toHaveBeenCalledWith(dto.id, {
        password: dto.new_password,
      });
      expect(mockedAccessUserService.removeWithUserId).toHaveBeenCalledWith(
        dto.id,
      );
    });
  });

  describe('getAndUpdateCode', () => {
    it('should return code', async () => {
      const key = 'key';
      expect(await service.getAndUpdateCode(key)).toHaveProperty(
        'code',
        'abcxyz',
      );
      expect(redisCacheService.get).toHaveBeenCalledTimes(1);
      expect(redisCacheService.set).toHaveBeenCalledTimes(1);
      expect(redisCacheService.get).toHaveBeenCalledWith(key);
    });

    it('should return undefine when get is object', async () => {
      const key = 'key';
      jest.spyOn(redisCacheService, 'get').mockImplementation(async () => {
        return { code: 'aaaa' };
      });
      await expect(await service.getAndUpdateCode(key)).toBe(undefined);
      expect(redisCacheService.get).toHaveBeenCalledTimes(2);
    });

    it('should return undefine when get string not json stringify', async () => {
      const key = 'key';
      jest
        .spyOn(redisCacheService, 'get')
        .mockImplementation(async () => 'rrrrrrrrrrrr');
      await expect(await service.getAndUpdateCode(key)).toBe(undefined);
      expect(redisCacheService.get).toHaveBeenCalledTimes(3);
    });

    it('should return undefine when get is number', async () => {
      const key = 'key';
      jest.spyOn(redisCacheService, 'get').mockImplementation(async () => 1);
      await expect(await service.getAndUpdateCode(key)).toBe(undefined);
      expect(redisCacheService.get).toHaveBeenCalledTimes(4);
    });
    it('should return undefine when get is undefine', async () => {
      const key = 'key';
      jest
        .spyOn(redisCacheService, 'get')
        .mockImplementation(async () => undefined);
      await expect(await service.getAndUpdateCode(key)).toBe(undefined);
      expect(redisCacheService.get).toHaveBeenCalledTimes(5);
    });
  });

  describe('getAndDelCode', () => {
    it('should return code', async () => {
      const key = 'key';
      jest.spyOn(redisCacheService, 'get').mockImplementation(async () => {
        return JSON.stringify({ code: 'abcxyz', time_try: 1 });
      });
      expect(await service.getAndDelCode(key)).toHaveProperty('code', 'abcxyz');
      expect(redisCacheService.get).toHaveBeenCalledTimes(6);
      expect(redisCacheService.del).toHaveBeenCalledTimes(1);
      expect(redisCacheService.get).toHaveBeenCalledWith(key);
    });

    it('should return undefine when get is object', async () => {
      const key = 'key';
      jest.spyOn(redisCacheService, 'get').mockImplementation(async () => {
        return { code: 'aaaa' };
      });
      await expect(await service.getAndDelCode(key)).toBe(undefined);
      expect(redisCacheService.get).toHaveBeenCalledTimes(7);
    });

    it('should return undefine when get string not json stringify', async () => {
      const key = 'key';
      jest
        .spyOn(redisCacheService, 'get')
        .mockImplementation(async () => 'rrrrrrrrrrrr');
      await expect(await service.getAndDelCode(key)).toBe(undefined);
      expect(redisCacheService.get).toHaveBeenCalledTimes(8);
    });

    it('should return number when get is number', async () => {
      const key = 'key';
      jest.spyOn(redisCacheService, 'get').mockImplementation(async () => 1);
      await expect(await service.getAndDelCode(key)).toBe(1);
      expect(redisCacheService.get).toHaveBeenCalledTimes(9);
      expect(redisCacheService.del).toHaveBeenCalledTimes(2);
    });
    it('should return undefine when get is undefine', async () => {
      const key = 'key';
      jest
        .spyOn(redisCacheService, 'get')
        .mockImplementation(async () => undefined);
      await expect(await service.getAndDelCode(key)).toBe(undefined);
      expect(redisCacheService.get).toHaveBeenCalledTimes(10);
    });
  });

  describe('genCode', () => {
    it('should return code', async () => {
      const user = {
        id: Date.now(),
        email: 'test@gmail.com',
        name: 'Trong le',
        password:
          '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
        address: '',
        facebookId: null,
        facebookAccessToken: null,
        facebookRefreshToken: null,
        avatarURL: null,
        isActive: true,
        roleId: null,
      } as User;
      expect(await service.genCode(user)).toHaveLength(6);
      expect(redisCacheService.set).toHaveBeenCalledTimes(2);
    });
  });

  describe('getRefreshToken', () => {
    it('should return refreshToken', async () => {
      const payload = {
        id: 1,
        accessUserId: 1,
        email: 'test@gmail.com',
        name: 'Trong le',
        role: null,
      };
      jest.spyOn(bcrypt, 'hashSync').mockImplementation(() => 'hash');
      expect(await service.getRefreshToken(payload)).toBe('token');
      expect(mockedAccessUserService.update).toHaveBeenCalledWith(
        payload.accessUserId,
        { refreshToken: 'hash' },
      );
    });
  });

  describe('getAccessToken', () => {
    it('should return accessToken', async () => {
      const payload = {
        id: 1,
        accessUserId: 1,
        email: 'test@gmail.com',
        name: 'Trong le',
        role: null,
      };
      jest.spyOn(bcrypt, 'hashSync').mockImplementation(() => 'hash');
      expect(await service.getRefreshToken(payload)).toBe('token');
      expect(mockedAccessUserService.update).toHaveBeenCalledWith(
        payload.accessUserId,
        { refreshToken: 'hash' },
      );
    });
  });

  describe('getRefreshTokenAndAccessToken', () => {
    it('should return RefreshToken And AccessToken', async () => {
      const user = {
        id: 1,
        email: 'test.gmail.com',
        name: 'Trong le',
        password:
          '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
        address: '',
        facebookId: null,
        facebookAccessToken: null,
        facebookRefreshToken: null,
        avatarURL: null,
        isActive: true,
        roleId: null,
      } as User;
      const accessUserId = 1;
      jest.spyOn(bcrypt, 'hashSync').mockImplementation(() => 'hash');
      jest
        .spyOn(service, 'getRefreshToken')
        .mockImplementation(async () => 'refresh_token');
      jest
        .spyOn(service, 'getAccessToken')
        .mockImplementation(async () => 'access_token');

      await expect(
        await service.getRefreshTokenAndAccessToken(user, accessUserId),
      ).toEqual({
        refresh_token: 'refresh_token',
        access_token: 'access_token',
      });
      expect(service.getRefreshToken).toHaveBeenCalled();
      expect(service.getAccessToken).toHaveBeenCalled();
    });
  });

  describe('getUserMatchesRefreshToken', () => {
    it('should return access user', async () => {
      const user = {
        id: 1,
        email: 'test.gmail.com',
        name: 'Trong le',
        password:
          '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
        address: '',
        facebookId: null,
        facebookAccessToken: null,
        facebookRefreshToken: null,
        avatarURL: null,
        isActive: true,
        roleId: null,
      } as User;
      const refreshToken = 'refresh_token';
      const accessUser = {
        id: 1,
        userId: user.id,
        refreshToken: 'hash',
        iPAddress: '172.0.0.1',
        deviceToken: 'string',
      };
      jest.spyOn(mockedAccessUserService, 'findOne').mockImplementation(() => {
        return accessUser as AccessUser;
      });
      jest.spyOn(bcrypt, 'compareSync').mockImplementation(() => true);
      expect(
        await service.getUserMatchesRefreshToken(refreshToken, accessUser.id),
      ).toEqual(accessUser);
      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        refreshToken,
        accessUser.refreshToken,
      );
      expect(mockedAccessUserService.findOne).toHaveBeenCalled();
    });

    it('should return unauthorize with compare refresh token fasle', async () => {
      const user = {
        id: 1,
        email: 'test.gmail.com',
        name: 'Trong le',
        password:
          '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
        address: '',
        facebookId: null,
        facebookAccessToken: null,
        facebookRefreshToken: null,
        avatarURL: null,
        isActive: true,
        roleId: null,
      } as User;
      const refreshToken = 'refresh_token';
      const accessUser = {
        id: 1,
        userId: user.id,
        refreshToken: 'hash',
        iPAddress: '172.0.0.1',
        deviceToken: 'string',
      };
      jest
        .spyOn(mockedAccessUserService, 'findOne')
        .mockImplementation((id) => {
          return { id: id, ...accessUser } as AccessUser;
        });
      jest.spyOn(bcrypt, 'compareSync').mockImplementation(() => false);
      await expect(() =>
        service.getUserMatchesRefreshToken(refreshToken, accessUser.id),
      ).rejects.toThrow('Unauthorized');
      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        refreshToken,
        accessUser.refreshToken,
      );
      expect(mockedAccessUserService.findOne).toHaveBeenCalled();
    });

    it('should return unauthorize with access user undefine', async () => {
      const user = {
        id: 1,
        email: 'test.gmail.com',
        name: 'Trong le',
        password:
          '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
        address: '',
        facebookId: null,
        facebookAccessToken: null,
        facebookRefreshToken: null,
        avatarURL: null,
        isActive: true,
        roleId: null,
      } as User;
      const refreshToken = 'refresh_token';
      const accessUser = {
        id: 1,
        userId: user.id,
        refreshToken: 'hash',
        iPAddress: '172.0.0.1',
        deviceToken: 'string',
      };
      jest
        .spyOn(mockedAccessUserService, 'findOne')
        .mockImplementation(() => undefined);
      jest.spyOn(bcrypt, 'compareSync').mockImplementation(() => true);
      await expect(() =>
        service.getUserMatchesRefreshToken(refreshToken, accessUser.id),
      ).rejects.toThrow('Unauthorized');
      expect(mockedAccessUserService.findOne).toHaveBeenCalled();
    });

    it('should return unauthorize with access user undefine and compire refreshToken false', async () => {
      const user = {
        id: 1,
        email: 'test.gmail.com',
        name: 'Trong le',
        password:
          '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
        address: '',
        facebookId: null,
        facebookAccessToken: null,
        facebookRefreshToken: null,
        avatarURL: null,
        isActive: true,
        roleId: null,
      } as User;
      const refreshToken = 'refresh_token';
      const accessUser = {
        id: 1,
        userId: user.id,
        refreshToken: 'hash',
        iPAddress: '172.0.0.1',
        deviceToken: 'string',
      };
      jest
        .spyOn(mockedAccessUserService, 'findOne')
        .mockImplementation(() => undefined);
      jest.spyOn(bcrypt, 'compareSync').mockImplementation(() => false);
      await expect(() =>
        service.getUserMatchesRefreshToken(refreshToken, accessUser.id),
      ).rejects.toThrow('Unauthorized');
      expect(mockedAccessUserService.findOne).toHaveBeenCalled();
    });
  });

  describe('createOrExist', () => {
    it('should return user with user exists', async () => {
      const user = {
        id: 1,
        email: 'test.gmail.com',
        name: 'Trong le',
        password:
          '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
        address: '',
        facebookId: '111111',
        facebookAccessToken: null,
        facebookRefreshToken: null,
        avatarURL: null,
        isActive: true,
        roleId: null,
      };
      jest
        .spyOn(userService, 'findOneByFaceBookId')
        .mockImplementation((facebookId) => {
          return {
            facebookId: facebookId,
            ...user,
          } as unknown as Promise<User>;
        });
      jest.spyOn(userService, 'update').mockImplementation(async (id, dto) => {
        return {
          id,
          ...user,
          ...dto,
        } as unknown as Promise<User>;
      });
      const dto = {
        email: 'test.gmail.com',
        name: 'Trong leeeee',
        facebookId: '111111',
        facebookAccessToken: 'token',
        facebookRefreshToken: 'token',
        avatarURL: 'http://avatar....',
      } as unknown as CreateUserDto;
      expect(await service.createOrExist(dto)).toEqual({
        ...user,
        ...dto,
      });
      expect(mockedUserService.findOneByFaceBookId).toHaveBeenCalledTimes(1);
      expect(mockedUserService.findOneByFaceBookId).toHaveBeenCalledWith(
        dto.facebookId,
      );
      expect(mockedUserService.update).toHaveBeenCalledTimes(2);
      expect(mockedUserService.update).toHaveBeenCalledWith(user.id, dto);
    });

    it('should return user with user not exists', async () => {
      jest
        .spyOn(userService, 'findOneByFaceBookId')
        .mockImplementation(() => undefined);
      const dto = {
        email: 'test.gmail.com',
        name: 'Trong leeeee',
        facebookId: '111111',
        facebookAccessToken: 'token',
        facebookRefreshToken: 'token',
        avatarURL: 'http://avatar....',
      } as unknown as CreateUserDto;
      jest.spyOn(userService, 'create').mockImplementation((dto) => {
        return {
          id: Date.now(),
          password: null,
          facebookId: null,
          facebookAccessToken: null,
          facebookRefreshToken: null,
          avatarURL: null,
          isActive: true,
          roleId: null,
          ...dto,
        } as unknown as Promise<User>;
      });
      expect(await service.createOrExist(dto)).toEqual({
        id: expect.any(Number),
        ...dto,
        password: null,
        isActive: true,
        roleId: null,
      });
      expect(mockedUserService.findOneByFaceBookId).toHaveBeenCalledTimes(2);
      expect(mockedUserService.findOneByFaceBookId).toHaveBeenCalledWith(
        dto.facebookId,
      );
      expect(mockedUserService.create).toHaveBeenCalledWith(dto);
    });
  });
});
