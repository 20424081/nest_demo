import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiImageFile } from '../file/decorator/api-file.decorator';
import { ParseFile } from '../file/parse-file.pipe';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtPayloadDto } from '..//auth/dto/jwt-payload.dto';
import { ConfigService } from '@nestjs/config';
// import { GetUrl } from './decorator/current-url.decorator';
import { CheckPolicies } from '../casl/decorator/check-policies.decorator';
import {
  CreateUserHandler,
  DeleteUserHandler,
  ReadUserHandler,
  UpdateUserHandler,
} from '../casl/policies';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { PoliciesGuard } from '../casl/policies.guard';
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  // API create User
  @Post()
  @UseGuards(PoliciesGuard)
  @CheckPolicies(CreateUserHandler)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // API Get All User
  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies(ReadUserHandler)
  async findAll(@Query() filterUserDto: FilterUserDto) {
    return this.userService.findAndCount(filterUserDto);
  }

  // API get One User
  @Get(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(ReadUserHandler)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  // APi Update User By ID
  @Patch(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(UpdateUserHandler)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(+id, updateUserDto);
  }

  // API Delete By ID
  @Delete(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(DeleteUserHandler)
  async remove(@Param('id') id: string) {
    return await this.userService.remove(id);
  }

  // API upload avatar
  // @Post('upload-avatar')
  // @ApiImageFile('avatar', true)
  // uploadAvatar(
  //   @GetUrl() url: string,
  //   @GetUser() user: JwtPayloadDto,
  //   @UploadedFile(ParseFile) file: Express.Multer.File,
  // ) {
  //   return this.userService.update(user.id, {
  //     avatarURL: `${url}${this.configService.get('path_file')}/${
  //       file.filename
  //     }`,
  //   } as UpdateUserDto);
  // }

  @Post('upload-avatar')
  @ApiImageFile('avatar', true)
  uploadAvatar(
    @GetUser() user: JwtPayloadDto,
    @UploadedFile(ParseFile) file: Express.Multer.File,
  ) {
    return this.userService.updateAvatar(user.id, file);
  }
}
