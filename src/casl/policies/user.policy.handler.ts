import { Type } from '@nestjs/common';

import { User } from '../../user/entities/user.entity';
import { AppAbility } from '../casl-ability.factory';
import { Action } from '../enums/action.enum';

import { PolicyHandler } from './policy-handler.interface';

export class CreateUserHandler implements PolicyHandler {
  handle(ability: AppAbility): boolean {
    return ability.can(Action.Create, User);
  }
}

export class DeleteUserHandler implements PolicyHandler {
  constructor(private user: User) {}
  handle(ability: AppAbility): boolean {
    return ability.can(Action.Delete, this.user);
  }
}

export class ReadUserHandler implements PolicyHandler {
  handle(ability: AppAbility): boolean {
    return ability.can(Action.Read, User);
  }
}

export class UpdateUserHandler implements PolicyHandler {
  constructor(private user: User) {}
  handle(ability: AppAbility): boolean {
    return ability.can(Action.Update, this.user);
  }
}

export const userPolicies: Type<PolicyHandler>[] = [
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  ReadUserHandler,
];
