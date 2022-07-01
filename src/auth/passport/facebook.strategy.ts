import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private authService: AuthService,
    protected readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get('facebook_app_id'),
      clientSecret: configService.get('facebook_app_secret'),
      callbackURL: configService.get('facebook_callback_url'),
      scope: 'email',
      profileFields: [
        'email',
        'name',
        'displayName',
        'photos',
        'id',
        'birthday',
      ],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { emails, id, displayName, photos } = profile;
    const user = await this.authService.createOrExist({
      email: emails[0].value,
      name: displayName,
      facebookId: id,
      facebookAccessToken: accessToken,
      facebookRefreshToken: refreshToken,
      avatarURL: photos[0].value,
    } as unknown as CreateUserDto);
    if (!user) {
      throw new BadRequestException();
    }
    const payload = {
      user,
      accessToken,
    };
    done(null, payload);
  }
}
