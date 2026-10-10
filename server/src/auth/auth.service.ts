import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, type SafeUser } from '../users/users.service';
import { verifyPassword } from '../common/password.util';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; user: SafeUser }> {
    const record = await this.usersService.findByEmail(dto.email);
    // 账号不存在 / 密码错误统一提示，避免暴露「账号是否存在」
    if (!record || !verifyPassword(dto.password, record.password)) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const { password, ...user } = record;
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    return { accessToken, user };
  }

  /** JWT 有效时返回当前登录用户完整信息 */
  async profile(userId: number): Promise<SafeUser> {
    return this.usersService.findOne(userId);
  }
}
