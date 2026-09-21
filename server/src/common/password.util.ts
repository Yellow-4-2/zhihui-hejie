import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

// 使用 Node 内置 scrypt 做密码哈希，避免 bcrypt 在 Windows 上的原生编译问题
// 存储格式：salt:derivedKey（均为 hex）

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const derivedKey = scryptSync(password, salt, 64);
  const storedKey = Buffer.from(key, 'hex');
  // 长度不同时 timingSafeEqual 会抛错，先做长度判断
  return (
    storedKey.length === derivedKey.length &&
    timingSafeEqual(storedKey, derivedKey)
  );
}
