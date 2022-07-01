import { User as UserEntity } from '../../src/user/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      user_info?: UserEntity;
    }
  }
}
