import { AccessUser } from '../../access-user/entities/access-user.entity';

const mockedAccessUserService = {
  createOrExist: jest.fn((dto) => {
    return {
      id: Date.now(),
      ...dto,
    };
  }),
  update: jest.fn((accessUserId, dto) => {
    return {
      id: accessUserId,
      ...dto,
    } as AccessUser;
  }),
  removeWithUserId: jest.fn(),
  findOne: jest.fn(),
};

export default mockedAccessUserService;
