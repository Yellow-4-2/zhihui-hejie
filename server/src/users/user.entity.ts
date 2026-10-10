import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../common/role.enum';

/** 用户表实体：sqlite 持久化，重启不丢 */
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  /** 邮箱作为登录账号，全库唯一 */
  @Column({ unique: true })
  email: string;

  /** 哈希存储，绝不对外返回 */
  @Column()
  password: string;

  @Column({ type: 'varchar' })
  role: Role;

  /** 企业角色关联的企业ID，其他角色为空 */
  @Column({ type: 'varchar', nullable: true })
  enterpriseId?: string;
}
