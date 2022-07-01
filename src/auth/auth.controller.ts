import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { JwtRefreshGuard } from './passport/jwt-refresh-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { IpAddress } from './decorator/ip-address.decorator';
import { GetUser } from './decorator/get-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { CheckCodeDto } from './dto/check-code.dto';
import { ChangePasswordForGotDto } from './dto/change-password-forgot.dto';
import { FacebookAuthGuard } from './passport/facebook-auth.guard';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { User } from '../user/entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // API Register
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return await this.authService.register(registerDto);
  }

  // API Login
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @IpAddress() ipAddress: string,
    @GetUser() user: any,
    @Body() loginDto: LoginDto,
  ): Promise<any> {
    return this.authService.login(user, ipAddress, loginDto.device_token);
  }

  // API Refresh Token
  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  async refresh(@GetUser() user: any, @Body() refreshToken: RefreshTokenDto) {
    return this.authService.refresh(user, refreshToken);
  }

  // API login facebook
  @UseGuards(FacebookAuthGuard)
  @Get('facebook')
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  // API callback login facebook
  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookLoginCallback(
    @GetUser() user: any,
    @IpAddress() ipAddress: string,
    @Res() res: Response,
  ): Promise<any> {
    return this.authService.facebookLoginCallback(res, ipAddress, user);
  }
  // API Change Password
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @GetUser() user: any,
    @Body() changepasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user, changepasswordDto);
  }

  // API Forgot Password
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  // API Change Password forgot
  @Post('change-password-forgot')
  async changePasswordForgot(
    @Body() changePasswordForGotDto: ChangePasswordForGotDto,
  ) {
    return this.authService.changePasswordForgot(changePasswordForGotDto);
  }

  // API Check Code
  @Throttle(6, 60)
  @Post('check-code')
  async checkCode(@Body() checkCodeDto: CheckCodeDto) {
    return await this.authService.checkCode(checkCodeDto);
  }
}
