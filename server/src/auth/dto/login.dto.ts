import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'consumer@test.com', description: '邮箱（登录账号）' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ example: '123456', description: '密码' })
  @IsString()
  @MinLength(1, { message: '请输入密码' })
  password: string;
}
