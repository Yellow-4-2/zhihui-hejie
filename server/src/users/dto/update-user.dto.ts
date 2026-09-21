import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// Swagger 版 PartialType：字段全部变可选，同时被 class-validator 和 Swagger 识别
export class UpdateUserDto extends PartialType(CreateUserDto) {}
