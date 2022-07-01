import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import dbTestConnect from '../utils/db-test-connect';
import { RoleService } from './role.service';

describe('RoleService', () => {
  let service: RoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot(dbTestConnect as SequelizeModuleOptions),
      ],
      providers: [RoleService],
    }).compile();

    service = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
