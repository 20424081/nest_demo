import { AccessUser } from '../access-user/entities/access-user.entity';
import { Role } from '../role/entities/role.entity';
import { User } from '../user/entities/user.entity';

const dbTestConnect = {
  dialect: 'mysql',
  storage: ':memory:',
  logging: false,
  models: [User, AccessUser, Role],
};

export default dbTestConnect;
