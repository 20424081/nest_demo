import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailService } from '../mail/mail.service';
import { AccessUserService } from '../access-user/access-user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { AccessUser } from '../access-user/entities/access-user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  const mockConfigService = {
    get(key: string) {
      switch (key) {
        case 'refresh_secret':
          return 'lkjdslknv2mn====asd=+';
        case 'secret':
          return 'saldflk1;lk23kljdaklj21k-=da==ck2lkj1lk=';
      }
    },
  };
  const mockRedisCacheService = {};
  const mockUserService = {
    findOneByEmail: jest.fn((email) => {
      return {
        id: Date.now(),
        email: email,
        name: 'Trong le',
        password: 'hash',
        address: '',
        isActive: true,
        roleId: null,
      } as User;
    }),
  };
  const mockMailService = {
    sendMail: jest.fn(),
  };
  const mockAccessUserService = {
    createOrExist: jest.fn((dto) => {
      return {
        id: 1,
        ...dto,
      } as AccessUser;
    }),
    update: jest.fn((id, dto) => {
      return {
        id,
        ...dto,
      };
    }),
  };
  const mockJwtService = {
    sign: () => '',
  };
  const mockAuthService = {
    login: jest.fn(() => {
      return {
        refresh_token: 'string',
        access_token: 'string',
      };
    }),

    register: jest.fn((dto) => {
      return {
        id: Date.now(),
        isActive: true,
        ...dto,
        createdAt: '',
        updatedAt: '',
      };
    }),

    checkCode: jest.fn((dto) => {
      return {
        email: dto.email,
        code: '',
      };
    }),

    forgotPassword: jest.fn((dto) => {
      return { email: dto.email };
    }),

    changePasswordForgot: jest.fn((dto) => {
      return {
        id: Date.now(),
        email: dto.email,
        name: '',
      };
    }),

    genCode: jest.fn(() => {
      return '111111';
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RedisCacheService,
          useValue: mockRedisCacheService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: AccessUserService,
          useValue: mockAccessUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register', async () => {
      const dto = {
        email: 'test@gmail.com',
        password: 'Trongle@98',
        name: 'Trong le',
        address: '',
      };
      expect(await controller.register(dto)).toEqual({
        isActive: true,
        id: expect.any(Number),
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
        ...dto,
      });
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should login', async () => {
      const user = {
        id: 1,
        email: 'test@gmail.com',
        name: 'Trong le',
        address: '',
      };

      const dto = {
        username: 'test@gmail.com',
        password: 'Trongle@98',
        device_token: '',
      };
      const ip = '172.0.0.1';
      expect(await controller.login(ip, user, dto)).toEqual({
        refresh_token: expect.any(String),
        access_token: expect.any(String),
      });
      expect(mockAuthService.login).toHaveBeenCalledWith(
        user,
        ip,
        dto.device_token,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should return object email', async () => {
      const dto = {
        email: 'test@gmail.com',
      };
      expect(await controller.forgotPassword(dto)).toEqual({
        email: dto.email,
      });
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(dto);
    });
  });

  describe('checkCode', () => {
    it('should return object email and code', async () => {
      const dto = {
        email: 'test@gmail.com',
        code: '111111',
      };
      expect(await controller.checkCode(dto)).toEqual({
        email: dto.email,
        code: expect.any(String),
      });
      expect(mockAuthService.checkCode).toHaveBeenCalledWith(dto);
    });
  });

  describe('changePasswordForgot', () => {
    it('should return object user', async () => {
      const dto = {
        email: 'test@gmail.com',
        code: 'hash',
        new_password: 'Trongle@98',
        confirm_password: 'Trongle@98',
      };
      expect(await controller.changePasswordForgot(dto)).toHaveProperty(
        'email',
        dto.email,
      );
      expect(mockAuthService.changePasswordForgot).toHaveBeenCalledWith(dto);
    });
  });
});
