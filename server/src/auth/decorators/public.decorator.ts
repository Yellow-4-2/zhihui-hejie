import { SetMetadata } from '@nestjs/common';

// 标记公开接口，全局 JWT 守卫看到该标记会跳过鉴权
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
