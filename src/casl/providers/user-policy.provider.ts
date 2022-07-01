import { Provider } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { DeleteUserHandler } from '../policies/user.policy.handler';
import { CreateUserHandler } from '../policies/user.policy.handler';
import { ReadUserHandler } from '../policies/user.policy.handler';
import { UpdateUserHandler } from '../policies/user.policy.handler';

export const CreateUserPolicyProvider: Provider = CreateUserHandler;

export const DeleteUserPolicyProvider: Provider = {
  provide: DeleteUserHandler,
  inject: [REQUEST],
  useFactory: (request: Request) => {
    return new DeleteUserHandler(request.user_info);
  },
};

export const ReadUserPolicyProvider: Provider = ReadUserHandler;

export const UpdateUserPolicyProvider: Provider = {
  provide: UpdateUserHandler,
  inject: [REQUEST],
  useFactory: (request: Request) => {
    console.log(1);
    return new UpdateUserHandler(request.user_info);
  },
};

export const userPolicyProviders: Provider[] = [
  CreateUserPolicyProvider,
  ReadUserPolicyProvider,
  UpdateUserPolicyProvider,
  DeleteUserPolicyProvider,
];
