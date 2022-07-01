import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';
import { AccessUserService } from '../../access-user/access-user.service';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly accessUserService: AccessUserService,
    private readonly configService: ConfigService,
  ) {
    super();
  }
  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (info instanceof TokenExpiredError) {
      const req = context.switchToHttp().getRequest();
      const { refresh_token } = req.body;
      try {
        const user = this.jwtService.decode(refresh_token, {
          secret: this.configService.get('refresh_secret'),
        } as JwtVerifyOptions);
        if (user && typeof user === 'object' && user.accessUserId) {
          this.accessUserService.remove(user.accessUserId);
        }
      } catch (error) {}
      throw new UnauthorizedException('Invalid Refresh Token!');
    }

    return super.handleRequest(err, user, info, context, status);
  }
}
