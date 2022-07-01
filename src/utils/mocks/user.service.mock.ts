import { User } from '../../user/entities/user.entity';

const mockedUserService = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findAndCount: jest.fn((dto) => {
    return {
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
  }),
  remove: jest.fn(),
  create: jest.fn((dto) => {
    return {
      id: Date.now(),
      ...dto,
      password: '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
      facebookId: null,
      facebookAccessToken: null,
      facebookRefreshToken: null,
      avatarURL: null,
      isActive: true,
      roleId: null,
    } as unknown as Promise<User>;
  }),

  findOne: jest.fn((id) => {
    return {
      id: id,
      email: 'test@gmail.com',
      name: 'Trong le',
      password: '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
      address: '',
      facebookId: null,
      facebookAccessToken: null,
      facebookRefreshToken: null,
      avatarURL: null,
      isActive: true,
      roleId: null,
    } as unknown as Promise<User>;
  }),

  findOneByEmail: jest.fn((email) => {
    return {
      id: Date.now(),
      email: email,
      name: 'Trong le',
      password: '$2b$12$trwIwrcMJdUf3DZfoQvmxuCZ8fIKJNgpW113G6Vxzqp6fdqqVz8fm',
      address: '',
      facebookId: null,
      facebookAccessToken: null,
      facebookRefreshToken: null,
      avatarURL: null,
      isActive: true,
      roleId: null,
    } as User;
  }),
  update: jest.fn((userId, dto) => {
    return {
      id: userId,
      ...dto,
    } as Promise<User>;
  }),
  findOneByFaceBookId: jest.fn(),
};

export default mockedUserService;
