import { Global, Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';
import { policies } from './policies';
import { aclProviders } from './providers';

@Global()
@Module({
  providers: [CaslAbilityFactory, ...aclProviders],
  exports: [CaslAbilityFactory, ...policies],
})
export class CaslModule {}
