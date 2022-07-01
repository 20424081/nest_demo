import { Type } from '@nestjs/common';

import { PolicyHandler } from './policy-handler.interface';

import { userPolicies } from './user.policy.handler';

export * from './user.policy.handler';

export const policies: Type<PolicyHandler>[] = [...userPolicies];
