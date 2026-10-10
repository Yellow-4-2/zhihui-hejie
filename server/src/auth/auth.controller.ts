import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginVo } from './vo/login.vo';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { ParseIntPipe } from '@nestjs/common';

@ApiTags('认证授权')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '登录（邮箱+密码），返回 JWT' })
  login(@Body() dto: LoginDto): Promise<LoginVo & { user: unknown }> {
    return this.authService.login(dto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前登录用户信息（需登录）' })
  profile(@CurrentUser('sub', ParseIntPipe) userId: number) {
    return this.authService.profile(userId);
  }
}
