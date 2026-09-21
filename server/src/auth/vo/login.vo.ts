import { ApiProperty } from '@nestjs/swagger';

export class LoginVo {
  @ApiProperty({ description: 'JWT 访问令牌，后续请求放 Header: Authorization Bearer <token>' })
  accessToken: string;
}
