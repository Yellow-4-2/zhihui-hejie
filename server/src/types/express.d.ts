// 扩展 Express Request：JWT 验签后挂载的用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: number;
        email: string;
        role: string;
        name: string;
      };
    }
  }
}

export {};
