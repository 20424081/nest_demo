import { Provider } from '@nestjs/common';

import { userPolicyProviders } from './user-policy.provider';

export const aclProviders: Provider[] = [...userPolicyProviders];
