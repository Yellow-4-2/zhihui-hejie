import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './user.entity';
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
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  /** 空表时播种预置账号（四种角色各一个，密码统一 123456）；已有数据则跳过，保证删除结果重启不丢 */
  async onModuleInit() {
    if ((await this.repo.count()) > 0) return;
    const seeds: Array<Omit<User, 'id'> & { password: string }> = [
      { name: '消费者小王', email: 'consumer@test.com', password: '123456', role: Role.CONSUMER },
      { name: '某品牌企业', email: 'enterprise@test.com', password: '123456', role: Role.ENTERPRISE, enterpriseId: 'e1' },
      { name: '消保委调解员', email: 'committee-m@test.com', password: '123456', role: Role.COMMITTEE_M },
      { name: '消保委管理员', email: 'committee-pc@test.com', password: '123456', role: Role.COMMITTEE_PC },
    ];
    for (const seed of seeds) {
      const { password, ...rest } = seed;
      await this.repo.save({ ...rest, password: hashPassword(password) });
    }
  }

  async create(dto: CreateUserDto): Promise<SafeUser> {
    if (await this.repo.findOne({ where: { email: dto.email } })) {
      throw new ConflictException('该邮箱已被注册');
    }
    this.validateEnterpriseLink(dto.role, dto.enterpriseId);

    const saved = await this.repo.save({
      name: dto.name,
      email: dto.email,
      role: dto.role,
      enterpriseId: dto.enterpriseId,
      password: hashPassword(dto.password),
    });
    return this.sanitize(saved);
  }

  async findAll(keyword?: string): Promise<SafeUser[]> {
    const qb = this.repo.createQueryBuilder('u');
    if (keyword) {
      qb.where('u.name LIKE :kw OR u.email LIKE :kw', { kw: `%${keyword}%` });
    }
    const list = await qb.orderBy('u.id', 'ASC').getMany();
    return list.map((u) => this.sanitize(u));
  }

  async findOne(id: number): Promise<SafeUser> {
    return this.sanitize(await this.getById(id));
  }

  /** 供 Auth 模块登录使用：返回含密码哈希的完整记录 */
  async findByEmail(email: string): Promise<User | undefined> {
    const found = await this.repo.findOne({ where: { email } });
    return found ?? undefined;
  }

  async update(id: number, dto: UpdateUserDto): Promise<SafeUser> {
    const user = await this.getById(id);

    // 邮箱变更时检查唯一
    if (dto.email && dto.email !== user.email) {
      if (await this.repo.findOne({ where: { email: dto.email } })) {
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
    await this.repo.save(user);
    return this.sanitize(user);
  }

  async remove(id: number): Promise<{ id: number }> {
    const user = await this.getById(id);
    await this.repo.remove(user);
    return { id };
  }

  private async getById(id: number): Promise<UserEntity> {
    const user = await this.repo.findOne({ where: { id } });
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

  private sanitize(user: UserEntity): SafeUser {
    const { password, ...rest } = user;
    return rest;
  }
}
