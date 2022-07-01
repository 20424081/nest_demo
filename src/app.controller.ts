import { Controller, Get, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AppService } from './app.service';

@Controller()
@UseGuards(ThrottlerGuard)
@Throttle(5, 30)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getWellcome(): string {
    return this.appService.getWellcome();
  }
}
