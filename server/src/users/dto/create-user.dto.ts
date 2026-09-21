import {
  IsString,
  IsEmail,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../common/role.enum';

export class CreateUserDto {
  @ApiProperty({ example: '张三', description: '姓名' })
  @IsString()
  @MinLength(2, { message: '姓名至少2个字符' })
  name: string;

  @ApiProperty({ example: 'zhangsan@test.com', description: '邮箱（即登录账号）' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ example: '123456', description: '密码（至少6位）' })
  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  password: string;

  @ApiProperty({
    enum: Role,
    example: Role.CONSUMER,
    description: '角色：consumer 消费者 / enterprise 入驻企业 / committee_m 消保委移动 / committee_pc 消保委PC',
  })
  @IsEnum(Role, { message: '角色取值非法' })
  role: Role;

  @ApiPropertyOptional({
    example: 'E001',
    description: '仅 role=enterprise 时必填，关联的入驻企业ID',
  })
  @IsOptional()
  @IsString()
  enterpriseId?: string;
}
