import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserEntity } from './user.entity';

@Module({
  imports: [
    // sqlite 连接：数据库文件固定在 server 根目录，演示项目开启 synchronize 自动建表
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: join(__dirname, '..', '..', 'data.sqlite'),
      synchronize: true,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
