import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../common/role.enum';
import { hashPassword } from '../common/password.util';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string; // 哈希存储，绝不对外返回
  role: Role;
  enterpriseId?: string;
}

/** 对外暴露的安全用户结构（无密码） */
export type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UsersService implements OnModuleInit {
  // 内存数组模拟数据库：重启后数据重置
  private users: User[] = [];
  private idSeq = 1;

  /** 预置账号：四种角色各一个，密码统一 123456，方便直接登录体验 */
  onModuleInit() {
    const seeds: Array<Omit<User, 'id' | 'password'> & { password: string }> = [
      { name: '消费者小王', email: 'consumer@test.com', password: '123456', role: Role.CONSUMER },
      { name: '某品牌企业', email: 'enterprise@test.com', password: '123456', role: Role.ENTERPRISE, enterpriseId: 'E001' },
      { name: '消保委调解员', email: 'committee-m@test.com', password: '123456', role: Role.COMMITTEE_M },
      { name: '消保委管理员', email: 'committee-pc@test.com', password: '123456', role: Role.COMMITTEE_PC },
    ];
    for (const seed of seeds) {
      const { password, ...rest } = seed;
      this.users.push({ id: this.idSeq++, ...rest, password: hashPassword(password) });
    }
  }

  create(dto: CreateUserDto): SafeUser {
    if (this.users.some((u) => u.email === dto.email)) {
      throw new ConflictException('该邮箱已被注册');
    }
    this.validateEnterpriseLink(dto.role, dto.enterpriseId);

    const user: User = {
      id: this.idSeq++,
      name: dto.name,
      email: dto.email,
      role: dto.role,
      enterpriseId: dto.enterpriseId,
      password: hashPassword(dto.password),
    };
    this.users.push(user);
    return this.sanitize(user);
  }

  findAll(keyword?: string): SafeUser[] {
    const list = keyword
      ? this.users.filter(
          (u) => u.name.includes(keyword) || u.email.includes(keyword),
        )
      : this.users;
    return list.map((u) => this.sanitize(u));
  }

  findOne(id: number): SafeUser {
    return this.sanitize(this.getById(id));
  }

  /** 供 Auth 模块登录使用：返回含密码哈希的完整记录 */
  findByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email);
  }

  update(id: number, dto: UpdateUserDto): SafeUser {
    const user = this.getById(id);

    // 邮箱变更时检查唯一
    if (dto.email && dto.email !== user.email) {
      if (this.users.some((u) => u.email === dto.email)) {
        throw new ConflictException('该邮箱已被其他用户使用');
      }
    }

    const nextRole = dto.role ?? user.role;
    let nextEnterpriseId =
      dto.enterpriseId !== undefined ? dto.enterpriseId : user.enterpriseId;
    // 角色不再是企业时，企业关联自动失效（前端 JSON 无法显式传「清空」，由后端按领域规则处理）
    if (nextRole !== Role.ENTERPRISE) {
      nextEnterpriseId = undefined;
    }
    this.validateEnterpriseLink(nextRole, nextEnterpriseId);

    if (dto.password) {
      user.password = hashPassword(dto.password);
    }
    // 只拷贝「实际传入且非 undefined」的字段，避免补丁式更新把未传字段冲成 undefined
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        (user as unknown as Record<string, unknown>)[key] = value;
      }
    }
    user.role = nextRole;
    user.enterpriseId = nextEnterpriseId;
    return this.sanitize(user);
  }

  remove(id: number): { id: number } {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) throw new NotFoundException('用户不存在');
    this.users.splice(index, 1);
    return { id };
  }

  private getById(id: number): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  /** 跨字段校验：企业角色必须关联企业，非企业角色不能带企业ID */
  private validateEnterpriseLink(role: Role, enterpriseId?: string) {
    if (role === Role.ENTERPRISE && !enterpriseId) {
      throw new BadRequestException('企业角色必须填写关联企业ID');
    }
    if (role !== Role.ENTERPRISE && enterpriseId) {
      throw new BadRequestException('仅企业角色可以关联企业ID');
    }
  }

  private sanitize(user: User): SafeUser {
    const { password, ...rest } = user;
    return rest;
  }
}
