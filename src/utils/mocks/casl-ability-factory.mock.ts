import { User } from '../../user/entities/user.entity';

const mockCaslAbilityFactory = {
  createForUser: jest.fn((user) => {
    return {
      h: false,
      g: 'manage',
      $: 'all',
      A: [
        { action: 'manage', subject: 'all' },
        {
          action: 'delete',
          subject: User,
          conditions: { id: user.id },
          inverted: true,
        },
      ],
    };
  }),
};
export default mockCaslAbilityFactory;
