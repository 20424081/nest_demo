import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import mockedUserService from '../utils/mocks/user.service.mock';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { PoliciesGuard } from '../casl/policies.guard';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import mockCaslAbilityFactory from '../utils/mocks/casl-ability-factory.mock';
import mockPoliciesGuard from '../utils/mocks/policies-guard.mock';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let configService: ConfigService;
  let caslAbilityFactory: CaslAbilityFactory;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        ConfigService,
        {
          provide: PoliciesGuard,
          useValue: mockPoliciesGuard,
        },
        {
          provide: CaslAbilityFactory,
          useValue: mockCaslAbilityFactory,
        },
      ],
      imports: [],
    })
      .overrideProvider(UserService)
      .useValue(mockedUserService)
      .compile();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userService = module.get<UserService>(UserService);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configService = module.get<ConfigService>(ConfigService);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    caslAbilityFactory = module.get<CaslAbilityFactory>(CaslAbilityFactory);
    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto = {
        email: 'tronglevan98@gmail.com',
        name: 'Trong le',
        password: expect.any(String),
        address: null,
        facebookId: null,
        facebookAccessToken: null,
        facebookRefreshToken: null,
        avatarURL: null,
        isActive: true,
        roleId: null,
      } as User;
      expect(await controller.create(dto)).toEqual({
        id: expect.any(Number),
        ...dto,
      });
      expect(mockedUserService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of user', async () => {
      const result = {
        rows: [
          {
            id: 1,
            email: 'tronglevan98@gmail.com',
            name: 'Trong le',
            address: '',
            facebookId: '',
            avatarURL: '',
            isActive: true,
          } as User,
        ],
        count: 1,
      };
      expect(await controller.findAll({})).toEqual(result);
      expect(mockedUserService.findAndCount).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return user', async () => {
      const result = {
        id: 1,
        email: 'test@gmail.com',
        name: 'Trong le',
        password: expect.any(String),
        address: '',
        facebookId: null,
        facebookAccessToken: null,
        facebookRefreshToken: null,
        avatarURL: null,
        isActive: true,
        roleId: null,
      } as User;
      const id = '1';
      expect(await controller.findOne(id)).toEqual(result);
      expect(mockedUserService.findOne).toHaveBeenCalledWith(+id);
    });
  });

  describe('update', () => {
    let user: User;
    beforeEach(async () => {
      user = {
        id: 1,
        email: 'test@gmail.com',
        name: 'Trong le',
        password:
          '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
        address: '',
        isActive: true,
      } as User;
      jest.spyOn(mockedUserService, 'findOne').mockImplementation((id) => {
        return {
          id: id,
          ...user,
        } as unknown as Promise<User>;
      });
      jest.spyOn(mockedUserService, 'update').mockImplementation((id, dto) => {
        return {
          id: id,
          ...user,
          ...dto,
        } as unknown as Promise<User>;
      });
    });
    it('should update', async () => {
      const dto = {
        name: 'Trong leeeeee',
      };
      const id = '1';
      expect(await controller.update(id, dto)).toEqual({
        id: +id,
        ...user,
        ...dto,
      });
      expect(mockedUserService.update).toHaveBeenCalledTimes(1);
      expect(mockedUserService.update).toHaveBeenCalledWith(+id, dto);
    });
  });

  describe('remove', () => {
    beforeEach(async () => {
      jest.spyOn(mockedUserService, 'remove').mockImplementation();
    });
    it('should delete', async () => {
      const id = '1';
      expect(await controller.remove(id)).toBeUndefined();
      expect(mockedUserService.remove).toHaveBeenCalledTimes(1);
      expect(mockedUserService.remove).toHaveBeenCalledWith(id);
    });
  });
});
