import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { AccessUserService } from '../access-user/access-user.service';
import { UpdateAccessUserDto } from '../access-user/dto/update-access-user.dto';
import { CreateAccessUserDto } from '../access-user/dto/create-access-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { CheckCodeDto } from './dto/check-code.dto';
import { ChangePasswordForGotDto } from './dto/change-password-forgot.dto';
import { AccessUser } from '../access-user/entities/access-user.entity';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { constants } from '../constants';
@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private redisCacheService: RedisCacheService,
    private userService: UserService,
    private mailService: MailService,
    private accessUserService: AccessUserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.userService.findOneByEmail(email);
    if (
      user &&
      user.password &&
      bcrypt.compareSync(pass, user.password) !== false
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // const { password, ...result } = user;
      return user;
    }
    return null;
  }

  // Handle Register
  async register(registerDto: RegisterDto): Promise<any> {
    return await this.userService.create(registerDto as CreateUserDto);
  }

  // Handle Login
  async login(user: any, ipAddress: string, deviceToken: string): Promise<any> {
    const access_user = await this.accessUserService.createOrExist({
      userId: user.id,
      refreshToken: null,
      iPAddress: ipAddress,
      deviceToken: deviceToken,
    } as CreateAccessUserDto);
    return this.getRefreshTokenAndAccessToken(user, access_user.id);
  }

  // Handle Refresh Token
  async refresh(user: any, refreshTokenDto: RefreshTokenDto): Promise<any> {
    const accessUser = await this.getUserMatchesRefreshToken(
      refreshTokenDto.refresh_token,
      user.accessUserId,
    );
    if (!accessUser) {
      throw new UnauthorizedException();
    }
    return this.getRefreshTokenAndAccessToken(user, accessUser.id);
  }

  async facebookLoginCallback(
    res: Response,
    ipAddress: string,
    _user: any,
  ): Promise<any> {
    const { user } = _user;
    const accessUser = await this.accessUserService.createOrExist({
      userId: user.id,
      refreshToken: null,
      iPAddress: ipAddress,
      deviceToken: null,
    } as CreateAccessUserDto);
    const token = await this.getRefreshTokenAndAccessToken(user, accessUser.id);
    await res.cookie('access_token', token.access_token);
    await res.cookie('refresh_token', token.refresh_token);
    return res.status(HttpStatus.OK).json(user);
  }
  // Handle Change Password
  async changePassword(
    user: any,
    changepasswordDto: ChangePasswordDto,
  ): Promise<any> {
    const user_info = await this.validateUser(
      user.email,
      changepasswordDto.old_password,
    );

    if (!user_info) {
      throw new BadRequestException(['Invalid old password']);
    }
    return await this.changePassAndClearAccess(
      user.id,
      changepasswordDto.new_password,
    );
  }

  // Handle Forgot Password
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<any> {
    const user = await this.userService.findOneByEmail(forgotPasswordDto.email);
    if (!user) {
      throw new BadRequestException(['Email not exists']);
    }
    const code = await this.genCode(user);
    // send mail
    this.mailService.sendMail(user.email, 'Forgot password', 'sendcode', {
      name: user.name,
      email: user.email,
      code: code,
    });
    return { email: user.email };
  }

  // Handle Check Code
  async checkCode(checkCodeDto: CheckCodeDto): Promise<any> {
    const user = await this.userService.findOneByEmail(checkCodeDto.email);
    if (!user) {
      throw new BadRequestException(['Invalid value!!!']);
    }
    const codeCheck = await this.getAndUpdateCode(`code:${user.id}`);
    const hashCode = await this.redisCacheService.genHashSHA1(
      checkCodeDto.code,
    );
    if (!codeCheck || hashCode !== codeCheck.code || codeCheck.time_try > 3) {
      throw new BadRequestException(['Invalid value!!!']);
    }
    return { email: user.email, code: codeCheck.code };
  }

  // Handle Change Password Forgot
  async changePasswordForgot(
    changePasswordForGotDto: ChangePasswordForGotDto,
  ): Promise<any> {
    const user = await this.userService.findOneByEmail(
      changePasswordForGotDto.email,
    );
    if (!user) {
      throw new BadRequestException(['Email not exists!']);
    }
    const codeCheck = await this.getAndDelCode(`code:${user.id}`);
    if (!codeCheck || codeCheck.code !== changePasswordForGotDto.code) {
      throw new BadRequestException(['Invalid Code!']);
    }
    return await this.changePassAndClearAccess(
      user.id,
      changePasswordForGotDto.new_password,
    );
  }

  // Action Change Password and Clear All Access Users
  async changePassAndClearAccess(
    userId: number,
    new_password: string,
  ): Promise<User> {
    const result = await Promise.all([
      this.userService.update(userId, {
        password: new_password,
      } as UpdateUserDto),
      this.accessUserService.removeWithUserId(userId),
    ]);
    return result[0];
  }

  // Action Get Cache Was Cached and Update Time Try
  async getAndUpdateCode(key: string): Promise<any> {
    try {
      const codeCheck = await JSON.parse(await this.redisCacheService.get(key));
      if (codeCheck) {
        codeCheck.time_try += 1;
        await this.redisCacheService.set(key, 300, JSON.stringify(codeCheck));
      }
      return codeCheck;
    } catch (error) {
      return undefined;
    }
  }

  // Action Get Code Was Cached and Delete Code
  async getAndDelCode(key: string): Promise<any> {
    try {
      const codeCheck = await JSON.parse(await this.redisCacheService.get(key));
      await this.redisCacheService.del(key);
      return codeCheck;
    } catch (error) {
      return undefined;
    }
  }

  // Action Generate Code And Set Cache
  async genCode(user: User): Promise<string> {
    const code = Math.floor(Math.random() * 899999 + 100000).toString();
    await this.redisCacheService.set(
      `code:${user.id}`,
      constants.code_expire,
      JSON.stringify({
        code: await this.redisCacheService.genHashSHA1(code),
        time_try: 0,
      }),
    );
    return code;
  }

  // Action Create Refresh Token
  async getRefreshToken(payload: JwtPayloadDto): Promise<string> {
    const refreshToken = await this.jwtService.sign(
      { ...payload },
      {
        secret: this.configService.get('refresh_secret'),
        expiresIn: constants.refresh_token_expire,
      },
    );
    const hashRefreshToken = bcrypt.hashSync(refreshToken, 10);
    await this.accessUserService.update(payload.accessUserId, {
      refreshToken: hashRefreshToken,
    } as UpdateAccessUserDto);
    return refreshToken;
  }

  // Action Create Access Token
  async getAccessToken(payload: JwtPayloadDto): Promise<string> {
    const accessToken = await this.jwtService.sign({ ...payload });
    return accessToken;
  }

  // Action Get Access Token And Refresh Token
  async getRefreshTokenAndAccessToken(
    user: User,
    accessUserId: number,
  ): Promise<any> {
    const payload = new JwtPayloadDto();
    payload.id = user.id;
    payload.email = user.email;
    payload.name = user.name;
    payload.accessUserId = accessUserId;
    payload.role = user.role?.roleName;
    const refreshToken = this.getRefreshToken(payload);
    const accessToken = this.getAccessToken(payload);
    const result = await Promise.all([refreshToken, accessToken]);
    return {
      refresh_token: result[0],
      access_token: result[1],
    };
  }

  // Action check mactches refresh token and return access user was checl
  async getUserMatchesRefreshToken(
    refreshToken: string,
    accessUserId: number,
  ): Promise<AccessUser> {
    const accessUser = await this.accessUserService.findOne(accessUserId);
    if (
      accessUser &&
      bcrypt.compareSync(refreshToken, accessUser.refreshToken) === true
    ) {
      return accessUser;
    }
    throw new UnauthorizedException();
  }

  async createOrExist(user: CreateUserDto): Promise<User> {
    const user_info = await this.userService.findOneByFaceBookId(
      user.facebookId,
    );
    if (user_info) {
      return await this.userService.update(user_info.id, user);
    }
    return await this.userService.create(user);
  }
}
