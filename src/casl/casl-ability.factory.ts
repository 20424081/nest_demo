import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Role } from '../role/entities/role.entity';
import { Action } from './enums/action.enum';
import { User } from '../user/entities/user.entity';
import { AccessUser } from '../access-user/entities/access-user.entity';

type Subjects =
  | InferSubjects<typeof User>
  | InferSubjects<typeof Role>
  | InferSubjects<typeof AccessUser>
  | 'all';

export type AppAbility = Ability<[Action, Subjects]>;
@Injectable()
export class CaslAbilityFactory {
  createForUser(user: any) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);
    if (user) {
      if (user.role && user.role === 'admin') {
        can(Action.Manage, 'all');
        cannot(Action.Delete, User, { id: user.id });
      } else {
        can(Action.Read, User);
        can(Action.Update, User, { id: user.id });
      }
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
